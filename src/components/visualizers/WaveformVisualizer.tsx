import { useEffect, useRef } from "react";
import { DEFAULT_CONFIG, type VisualizerConfig } from "../../types/visualizer";

interface WaveformVisualizerProps {
    analyserRef: React.RefObject<AnalyserNode | null>;
    dataArrayRef: React.RefObject<Uint8Array | null>;
    config: VisualizerConfig;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    return {
        b: Number.parseInt(hex.slice(5, 7), 16),
        g: Number.parseInt(hex.slice(3, 5), 16),
        r: Number.parseInt(hex.slice(1, 3), 16),
    };
}

export function WaveformVisualizer({
    analyserRef,
    dataArrayRef,
    config,
    canvasRef,
}: WaveformVisualizerProps) {
    const animationIdRef = useRef<number | null>(null);
    const waveformConfig =
        config.waveformConfig ??
        (DEFAULT_CONFIG.waveformConfig as NonNullable<
            VisualizerConfig["waveformConfig"]
        >);

    // Store multiple waveform lines for the 3D contour effect
    const waveformHistoryRef = useRef<number[][]>([]);
    // Track frames for slower ripple removal when sound stops
    const fadeFrameCounterRef = useRef<number>(0);

    useEffect(() => {
        const draw = () => {
            if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current)
                return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const analyser = analyserRef.current;
            const dataArray = dataArrayRef.current;
            const bufferLength = analyser.frequencyBinCount;

            // Use time-domain data for waveform
            // @ts-expect-error Uint8Array typing mismatch in TS DOM lib
            analyser.getByteTimeDomainData(dataArray);

            // Check if there's any audio signal (deviation from 128 = silence baseline)
            let signalEnergy = 0;
            for (let i = 0; i < bufferLength; i++) {
                const deviation = Math.abs(dataArray[i] - 128);
                signalEnergy += deviation;
            }
            const hasSignal = signalEnergy / bufferLength > 1; // Threshold for actual audio

            // Apply trail effect
            ctx.fillStyle = `rgba(0, 0, 0, ${config.fadeAmount})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Get colors
            const primaryColor = hexToRgb(config.colorScheme.primary);
            const secondaryColor = hexToRgb(config.colorScheme.secondary);

            // Get frequency data for bass detection (need separate call)
            const frequencyData = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(frequencyData);

            // Calculate bass level from frequency data (low frequencies only)
            const bassEnd = Math.floor(bufferLength * 0.1);
            let bassSum = 0;
            for (let i = 0; i < bassEnd; i++) {
                bassSum += frequencyData[i];
            }
            const bassLevel = bassSum / bassEnd / 255;

            // Only add new ripples when there's significant bass
            const bassThreshold = waveformConfig.bassThreshold; // Use configurable threshold
            if (bassLevel > bassThreshold && hasSignal) {
                // Sample the waveform data at regular intervals
                const sampleCount = waveformConfig.linePoints;
                const currentWaveform: number[] = [];

                for (let i = 0; i < sampleCount; i++) {
                    const index = Math.floor((i / sampleCount) * bufferLength);
                    currentWaveform.push(dataArray[index]);
                }

                // Add current waveform to history
                waveformHistoryRef.current.push(currentWaveform);

                // Keep only the last N waveforms based on lineCount
                if (waveformHistoryRef.current.length > waveformConfig.lineCount) {
                    waveformHistoryRef.current.shift();
                }
                // Reset fade counter when creating new ripples
                fadeFrameCounterRef.current = 0;
            } else if (waveformHistoryRef.current.length > 0) {
                // When no bass/sound, gradually remove old ripples (they "travel away")
                // Only remove every 3 frames for smoother fadeout
                fadeFrameCounterRef.current++;
                if (fadeFrameCounterRef.current >= 3) {
                    waveformHistoryRef.current.shift();
                    fadeFrameCounterRef.current = 0;
                }
            }

            // Center of the canvas (where the "stone" drops)
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            // Smaller main coverage area (60% of screen)
            const mainRadius = Math.sqrt(centerX * centerX + centerY * centerY) * 0.6;
            // But allow ripples to extend beyond and fade out
            // Apply size scaling based on bass level for audio-reactive sizing
            const sizeMultiplier = 1 + bassLevel * waveformConfig.sizeScaling;
            const maxRadius =
                Math.sqrt(centerX * centerX + centerY * centerY) * 1.2 * sizeMultiplier;

            // Convert view angle from degrees to radians for 3D transformation
            // 0° = top, 90° = right, 180° = bottom, 270° = left, 315° = bottom-right to top-left
            const angleRadians = (waveformConfig.viewAngle * Math.PI) / 180;

            // Apply 3D perspective transformation
            // Save the current state before transforming
            ctx.save();

            // Move to center for rotation
            ctx.translate(centerX, centerY);

            // Apply perspective skew: compress Y axis to create depth effect
            // and rotate to the specified viewing angle
            ctx.rotate(-angleRadians);
            // Apply camera tilt (horizontal perspective) and depth compression (vertical perspective)
            // cameraTilt < 0.5 = tilted left, > 0.5 = tilted right, 0.5 = centered
            const tiltScale = 0.5 + (waveformConfig.cameraTilt - 0.5) * 1.5; // Map 0.1-1.0 to ~0.35-1.25
            ctx.scale(tiltScale, waveformConfig.depthCompression);

            // Move back from center
            ctx.translate(-centerX, -centerY);

            // Draw ripples from center outward (newest = smallest/center, oldest = largest/outer)
            for (
                let rippleIndex = 0;
                rippleIndex < waveformHistoryRef.current.length;
                rippleIndex++
            ) {
                const waveform = waveformHistoryRef.current[rippleIndex];
                // Reverse progress: 1 = oldest (outer), 0 = newest (center)
                const progress =
                    1 - rippleIndex / Math.max(1, waveformHistoryRef.current.length - 1);

                // Base radius: ripples expand beyond the main area, affected by ripple speed
                const baseRadius = progress * maxRadius * waveformConfig.rippleSpeed;

                // 3D effect: ripples closer to center (newer) are lower, outer (older) are higher/elevated
                // This creates the illusion of waves rising as they travel outward
                const elevationFactor = progress; // 0 = low/center, 1 = high/outer
                const lineThickness = waveformConfig.lineWidth * (1 + elevationFactor * 3); // Much thicker as they rise

                // Color calculation based on colorMode setting
                let r: number, g: number, b: number;

                if (waveformConfig.colorMode === "solid") {
                    // Solid mode: use primary color only
                    r = primaryColor.r;
                    g = primaryColor.g;
                    b = primaryColor.b;
                } else if (waveformConfig.colorMode === "frequency") {
                    // Frequency-reactive mode: map frequency data to RGB
                    // Bass (low frequencies) → Red
                    // Mids (middle frequencies) → Green
                    // Treble (high frequencies) → Blue
                    const bassEnd = Math.floor(bufferLength * 0.1);
                    const midsEnd = Math.floor(bufferLength * 0.5);
                    const bassSum = dataArray.slice(0, bassEnd).reduce((a, b) => a + b, 0);
                    const midsSum = dataArray
                        .slice(bassEnd, midsEnd)
                        .reduce((a, b) => a + b, 0);
                    const trebleSum = dataArray.slice(midsEnd).reduce((a, b) => a + b, 0);

                    const bassIntensity = bassSum / bassEnd / 255;
                    const midsIntensity = midsSum / (midsEnd - bassEnd) / 255;
                    const trebleIntensity = trebleSum / (bufferLength - midsEnd) / 255;

                    r = Math.round(bassIntensity * 255);
                    g = Math.round(midsIntensity * 255);
                    b = Math.round(trebleIntensity * 255);
                } else {
                    // Gradient mode (default): interpolate from primary to secondary
                    r = Math.round(
                        primaryColor.r + (secondaryColor.r - primaryColor.r) * (1 - progress),
                    );
                    g = Math.round(
                        primaryColor.g + (secondaryColor.g - primaryColor.g) * (1 - progress),
                    );
                    b = Math.round(
                        primaryColor.b + (secondaryColor.b - primaryColor.b) * (1 - progress),
                    );
                }

                // Stronger brightness variation with elevation (simulating light hitting raised surfaces)
                const elevationBrightness = 0.4 + elevationFactor * 0.6;

                // Fade out ripples that extend beyond the main radius
                let alpha = 0.9 * progress * elevationBrightness;
                if (baseRadius > mainRadius) {
                    // Calculate how far beyond main radius (0 = at edge, 1 = at max)
                    const beyondProgress =
                        (baseRadius - mainRadius) / (maxRadius - mainRadius);
                    // Fade out exponentially as ripples go beyond main area
                    alpha *= (1 - beyondProgress) ** 2;
                }

                // Optimized shadow: only draw for every other ripple and only if elevated enough
                const shouldDrawShadow = elevationFactor > 0.3 && rippleIndex % 2 === 0;
                if (shouldDrawShadow) {
                    const shadowOffset = elevationFactor * 4;

                    // Simple shadow without blur (much faster)
                    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.4 * elevationFactor})`;
                    ctx.lineWidth = lineThickness * 1.2;
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";

                    ctx.beginPath();
                    for (let i = 0; i <= waveform.length; i++) {
                        const angle = (i / waveform.length) * Math.PI * 2;
                        const amplitude = (waveform[i % waveform.length] - 128) / 128;
                        const radiusOffset =
                            amplitude *
                            waveformConfig.amplitudeScale *
                            waveformConfig.lineSpacing *
                            5;
                        const radius = baseRadius + radiusOffset;

                        const x = centerX + Math.cos(angle) * radius + shadowOffset;
                        const y = centerY + Math.sin(angle) * radius + shadowOffset;

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    ctx.stroke();
                }

                // Draw main ripple with 3D lighting
                ctx.strokeStyle = `rgba(${r * elevationBrightness}, ${g * elevationBrightness}, ${b * elevationBrightness}, ${alpha})`;
                ctx.lineWidth = lineThickness;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                ctx.beginPath();

                // Draw circular ripple with waveform distortion
                for (let i = 0; i <= waveform.length; i++) {
                    const angle = (i / waveform.length) * Math.PI * 2;

                    // Get amplitude from waveform data
                    const amplitude = (waveform[i % waveform.length] - 128) / 128; // -1 to 1

                    // Modulate radius based on waveform amplitude
                    const radiusOffset =
                        amplitude *
                        waveformConfig.amplitudeScale *
                        waveformConfig.lineSpacing *
                        5;
                    const radius = baseRadius + radiusOffset;

                    // Calculate x, y coordinates on the circle
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.closePath();
                ctx.stroke();

                // Optimized highlight: only draw for highly elevated ripples and skip some for performance
                const shouldDrawHighlight = elevationFactor > 0.5 && rippleIndex % 3 === 0;
                if (shouldDrawHighlight) {
                    // Simple highlight without blur
                    const highlightIntensity = elevationFactor * 0.4;

                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * highlightIntensity})`;
                    ctx.lineWidth = lineThickness * 0.3;
                    ctx.lineCap = "round";
                    ctx.beginPath();

                    // Draw highlight offset towards light source (top-left)
                    for (let i = 0; i <= waveform.length; i++) {
                        const angle = (i / waveform.length) * Math.PI * 2;
                        const amplitude = (waveform[i % waveform.length] - 128) / 128;
                        const radiusOffset =
                            amplitude *
                            waveformConfig.amplitudeScale *
                            waveformConfig.lineSpacing *
                            5;
                        const radius = baseRadius + radiusOffset;

                        const x = centerX + Math.cos(angle) * radius - 1.5;
                        const y = centerY + Math.sin(angle) * radius - 1.5;

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    ctx.stroke();
                }

                // Optional: Fill between consecutive ripples
                if (
                    waveformConfig.fillContours &&
                    rippleIndex < waveformHistoryRef.current.length - 1
                ) {
                    const nextWaveform = waveformHistoryRef.current[rippleIndex + 1];
                    const nextProgress =
                        1 -
                        (rippleIndex + 1) /
                        Math.max(1, waveformHistoryRef.current.length - 1);
                    const nextBaseRadius = nextProgress * maxRadius;

                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.1})`;
                    ctx.beginPath();

                    // Draw outer ripple
                    for (let i = 0; i <= waveform.length; i++) {
                        const angle = (i / waveform.length) * Math.PI * 2;
                        const amplitude = (waveform[i % waveform.length] - 128) / 128;
                        const radiusOffset =
                            amplitude *
                            waveformConfig.amplitudeScale *
                            waveformConfig.lineSpacing *
                            5;
                        const radius = baseRadius + radiusOffset;
                        const x = centerX + Math.cos(angle) * radius;
                        const y = centerY + Math.sin(angle) * radius;

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }

                    // Draw inner ripple in reverse
                    for (let i = nextWaveform.length; i >= 0; i--) {
                        const angle = (i / nextWaveform.length) * Math.PI * 2;
                        const amplitude =
                            (nextWaveform[i % nextWaveform.length] - 128) / 128;
                        const radiusOffset =
                            amplitude *
                            waveformConfig.amplitudeScale *
                            waveformConfig.lineSpacing *
                            5;
                        const radius = nextBaseRadius + radiusOffset;
                        const x = centerX + Math.cos(angle) * radius;
                        const y = centerY + Math.sin(angle) * radius;

                        ctx.lineTo(x, y);
                    }

                    ctx.closePath();
                    ctx.fill();
                }
            }

            // Restore the context after drawing ripples
            ctx.restore();

            // Apply the same 3D perspective transformation for the speaker
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(-angleRadians); // Same rotation angle as ripples
            ctx.scale(1, 0.5); // Same vertical compression
            ctx.translate(-centerX, -centerY);

            // Draw pulsing speaker/source in the center
            const speakerBaseRadius = maxRadius * 0.08;
            const speakerPulseRadius = speakerBaseRadius * (1 + bassLevel * 0.5);

            // Draw speaker pattern based on user selection
            switch (waveformConfig.speakerPattern) {
                case "rings": {
                    // Original concentric rings pattern
                    const speakerRings = 5;

                    // Draw outer shadow for depth (behind the speaker)
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = `rgba(0, 0, 0, 0.5)`;
                    ctx.shadowOffsetX = 5;
                    ctx.shadowOffsetY = 5;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, speakerPulseRadius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;

                    for (let ring = 0; ring < speakerRings; ring++) {
                        const ringProgress = ring / speakerRings;
                        const depthOffset = ringProgress * 10 * (1 + bassLevel * 2);
                        const perspectiveScale = 1 + ringProgress * 0.15 * (1 + bassLevel);
                        const bassExpansion = bassLevel * ringProgress * 0.3;
                        const ringRadius =
                            speakerPulseRadius *
                            (0.2 + ringProgress * 0.8) *
                            (1 + bassExpansion) *
                            perspectiveScale;
                        const depthBrightness = 0.4 + ringProgress * 0.6;
                        const ringAlpha = (0.9 - ringProgress * 0.3) * depthBrightness;
                        const ringThickness =
                            waveformConfig.lineWidth * (1.5 + ringProgress * 1);

                        if (ring < speakerRings - 2) {
                            ctx.shadowBlur = 6 * (1 - ringProgress);
                            ctx.shadowColor = `rgba(0, 0, 0, ${0.6 * (1 - ringProgress)})`;
                            ctx.shadowOffsetX = -depthOffset * 0.3;
                            ctx.shadowOffsetY = -depthOffset * 0.3;
                        }

                        ctx.strokeStyle = `rgba(${primaryColor.r * depthBrightness}, ${primaryColor.g * depthBrightness}, ${primaryColor.b * depthBrightness}, ${ringAlpha})`;
                        ctx.lineWidth = ringThickness;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
                        ctx.stroke();

                        ctx.shadowBlur = 0;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;

                        if (ring >= speakerRings - 2) {
                            ctx.shadowBlur = 20 * (1 + bassLevel * 2);
                            ctx.shadowColor = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${0.8 * ringProgress})`;
                            ctx.stroke();
                            ctx.shadowBlur = 0;
                        }

                        if (ring === 0) {
                            const coneGradient = ctx.createRadialGradient(
                                centerX,
                                centerY,
                                0,
                                centerX,
                                centerY,
                                ringRadius,
                            );
                            coneGradient.addColorStop(0, `rgba(0, 0, 0, 0.9)`);
                            coneGradient.addColorStop(
                                0.5,
                                `rgba(${primaryColor.r * 0.2}, ${primaryColor.g * 0.2}, ${primaryColor.b * 0.2}, 0.8)`,
                            );
                            coneGradient.addColorStop(
                                1,
                                `rgba(${primaryColor.r * 0.4}, ${primaryColor.g * 0.4}, ${primaryColor.b * 0.4}, 0.6)`,
                            );
                            ctx.fillStyle = coneGradient;
                            ctx.fill();
                        }

                        if (ring >= speakerRings - 2) {
                            const highlightGradient = ctx.createRadialGradient(
                                centerX - ringRadius * 0.3,
                                centerY - ringRadius * 0.3,
                                0,
                                centerX,
                                centerY,
                                ringRadius * 0.5,
                            );
                            const highlightIntensity = ringProgress * (1 + bassLevel * 0.5);
                            highlightGradient.addColorStop(
                                0,
                                `rgba(255, 255, 255, ${0.4 * highlightIntensity})`,
                            );
                            highlightGradient.addColorStop(
                                0.4,
                                `rgba(255, 255, 255, ${0.15 * highlightIntensity})`,
                            );
                            highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                            ctx.fillStyle = highlightGradient;
                            ctx.fill();
                        }
                    }
                    break;
                }

                case "radial": {
                    // Radial lines emanating from center (like sun rays)
                    const lineCount = 16;
                    const innerRadius = speakerPulseRadius * 0.3;
                    const outerRadius = speakerPulseRadius;

                    for (let i = 0; i < lineCount; i++) {
                        const angle = (i / lineCount) * Math.PI * 2;
                        const lineWidth =
                            waveformConfig.lineWidth * (1 + bassLevel * 2) * (1 + (i % 3) * 0.3);

                        // Alternate line lengths for visual interest
                        const lengthMultiplier = i % 2 === 0 ? 1 : 0.7;

                        ctx.beginPath();
                        ctx.moveTo(
                            centerX + Math.cos(angle) * innerRadius,
                            centerY + Math.sin(angle) * innerRadius,
                        );
                        ctx.lineTo(
                            centerX + Math.cos(angle) * outerRadius * lengthMultiplier,
                            centerY + Math.sin(angle) * outerRadius * lengthMultiplier,
                        );

                        const gradient = ctx.createLinearGradient(
                            centerX + Math.cos(angle) * innerRadius,
                            centerY + Math.sin(angle) * innerRadius,
                            centerX + Math.cos(angle) * outerRadius,
                            centerY + Math.sin(angle) * outerRadius,
                        );
                        gradient.addColorStop(
                            0,
                            `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.9)`,
                        );
                        gradient.addColorStop(
                            1,
                            `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0)`,
                        );
                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = lineWidth;
                        ctx.stroke();
                    }

                    // Central circle
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.8)`;
                    ctx.fill();
                    ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 1)`;
                    ctx.lineWidth = waveformConfig.lineWidth * 2;
                    ctx.stroke();
                    break;
                }

                case "pulse": {
                    // Single expanding circle pulse
                    const pulseRings = 3;

                    for (let i = 0; i < pulseRings; i++) {
                        const ringProgress = i / pulseRings;
                        const pulseRadius = speakerPulseRadius * (0.5 + ringProgress * 0.8);
                        const alpha = (1 - ringProgress) * 0.8;

                        ctx.beginPath();
                        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${alpha})`;
                        ctx.lineWidth = waveformConfig.lineWidth * (3 - ringProgress * 2);
                        ctx.stroke();

                        // Add glow
                        ctx.shadowBlur = 15 * (1 - ringProgress);
                        ctx.shadowColor = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${alpha})`;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }

                    // Filled center
                    const centerGradient = ctx.createRadialGradient(
                        centerX,
                        centerY,
                        0,
                        centerX,
                        centerY,
                        speakerPulseRadius * 0.5,
                    );
                    centerGradient.addColorStop(
                        0,
                        `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 1)`,
                    );
                    centerGradient.addColorStop(
                        0.7,
                        `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.5)`,
                    );
                    centerGradient.addColorStop(
                        1,
                        `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0)`,
                    );
                    ctx.fillStyle = centerGradient;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, speakerPulseRadius * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                }

                case "star": {
                    // Geometric star pattern
                    const points = 8;
                    const innerRadius = speakerPulseRadius * 0.4;
                    const outerRadius = speakerPulseRadius;

                    // Draw star shape
                    ctx.beginPath();
                    for (let i = 0; i < points * 2; i++) {
                        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                        const x = centerX + Math.cos(angle) * radius;
                        const y = centerY + Math.sin(angle) * radius;

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();

                    // Fill with gradient
                    const starGradient = ctx.createRadialGradient(
                        centerX,
                        centerY,
                        0,
                        centerX,
                        centerY,
                        outerRadius,
                    );
                    starGradient.addColorStop(
                        0,
                        `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 1)`,
                    );
                    starGradient.addColorStop(
                        0.6,
                        `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.7)`,
                    );
                    starGradient.addColorStop(
                        1,
                        `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.3)`,
                    );
                    ctx.fillStyle = starGradient;
                    ctx.fill();

                    // Outline with glow
                    ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 1)`;
                    ctx.lineWidth = waveformConfig.lineWidth * (1 + bassLevel * 2);
                    ctx.shadowBlur = 20 * (1 + bassLevel);
                    ctx.shadowColor = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.8)`;
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    // Inner circle
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, innerRadius * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, 0.9)`;
                    ctx.fill();
                    break;
                }
            }

            // Restore context after drawing speaker
            ctx.restore();

            animationIdRef.current = requestAnimationFrame(draw);
        };

        // Start the animation loop
        animationIdRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [analyserRef, dataArrayRef, config, waveformConfig, canvasRef]);

    return null;
}
