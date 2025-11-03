import { useEffect, useRef } from "react";
import type { VisualizerConfig } from "../../types/visualizer";

interface CircularVisualizerProps {
    analyserRef: React.RefObject<AnalyserNode | null>;
    dataArrayRef: React.RefObject<Uint8Array | null>;
    config: VisualizerConfig;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function CircularVisualizer({
    analyserRef,
    dataArrayRef,
    config,
    canvasRef,
}: CircularVisualizerProps) {
    const animationIdRef = useRef<number | null>(null);
    const rotationRef = useRef<number>(0);
    const circularConfig = config.circularConfig ?? {
        autoRotate: false,
        barCount: 360,
        baseRadiusMax: 0.25,
        baseRadiusMin: 0.1,
        bassResponseCircle: true,
        maxBarHeight: 0.35,
        poles: 2,
        rotationOffset: 130,
        rotationSpeed: 0.1,
    };

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

            // Update rotation if auto-rotate is enabled
            if (circularConfig.autoRotate) {
                rotationRef.current += circularConfig.rotationSpeed;
            }

            // Read frequency data
            // @ts-expect-error Uint8Array typing mismatch in TS DOM lib
            analyser.getByteFrequencyData(dataArray);

            // Check if there's any audio signal
            const hasSignal = dataArray.some((value) => value > 0);

            // Clear or fade background
            if (hasSignal) {
                ctx.fillStyle = `rgba(0,0,0,${config.fadeAmount})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = "rgba(0,0,0,1)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Circle visualization setup
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Calculate bass strength for both outer and inner circles
            const bassRange = Math.floor(bufferLength * 0.1);
            let bassSum = 0;
            for (let i = 0; i < bassRange; i++) {
                bassSum += dataArray[i];
            }
            const bassIntensity = bassSum / (bassRange * 255);

            // Calculate outer circle radius
            let baseRadius: number;
            if (circularConfig.bassResponseCircle) {
                const minRadius =
                    Math.min(canvas.width, canvas.height) * circularConfig.baseRadiusMin;
                const maxRadius =
                    Math.min(canvas.width, canvas.height) * circularConfig.baseRadiusMax;
                baseRadius = minRadius + bassIntensity * (maxRadius - minRadius);
            } else {
                baseRadius =
                    Math.min(canvas.width, canvas.height) *
                    ((circularConfig.baseRadiusMin + circularConfig.baseRadiusMax) / 2);
            }

            const barCount = circularConfig.barCount;
            const angleStep = (Math.PI * 2) / barCount;

            // Draw center circle (outer ring)
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 0, 1)";
            ctx.fill();

            // Convert hex color to rgba
            const hexToRgba = (hex: string, alpha: number) => {
                const r = Number.parseInt(hex.slice(1, 3), 16);
                const g = Number.parseInt(hex.slice(3, 5), 16);
                const b = Number.parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };

            ctx.strokeStyle = hexToRgba(config.colorScheme.primary, 0.3);
            ctx.lineWidth = 2;
            ctx.stroke();

            // === FANCY INNER CIRCLE VISUALIZATION ===

            // Calculate dynamic inner circle size based on bass (can exceed base radius on heavy bass)
            const innerCircleRadius = baseRadius * 0.6 * (0.15 + bassIntensity * 1.8);

            // 1. Outer glow layer (large, soft)
            const outerGlow = ctx.createRadialGradient(
                centerX,
                centerY,
                0,
                centerX,
                centerY,
                innerCircleRadius * 1.5
            );
            outerGlow.addColorStop(0, hexToRgba(config.colorScheme.secondary, 0.3));
            outerGlow.addColorStop(0.4, hexToRgba(config.colorScheme.secondary, 0.15));
            outerGlow.addColorStop(1, hexToRgba(config.colorScheme.secondary, 0));

            ctx.beginPath();
            ctx.arc(centerX, centerY, innerCircleRadius * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = outerGlow;
            ctx.fill();

            // 2. Main gradient circle with enhanced glow
            const mainGradient = ctx.createRadialGradient(
                centerX,
                centerY,
                0,
                centerX,
                centerY,
                innerCircleRadius
            );
            mainGradient.addColorStop(0, hexToRgba(config.colorScheme.secondary, 0.95));
            mainGradient.addColorStop(0.3, hexToRgba(config.colorScheme.secondary, 0.8));
            mainGradient.addColorStop(0.7, hexToRgba(config.colorScheme.secondary, 0.5));
            mainGradient.addColorStop(1, hexToRgba(config.colorScheme.secondary, 0.1));

            ctx.beginPath();
            ctx.arc(centerX, centerY, innerCircleRadius, 0, Math.PI * 2);
            ctx.fillStyle = mainGradient;
            ctx.fill();

            // 3. Pulsing ring effect (mid-layer)
            const pulseRadius = innerCircleRadius * 0.7;
            ctx.beginPath();
            ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = hexToRgba(config.colorScheme.primary, 0.4 + bassIntensity * 0.4);
            ctx.lineWidth = 3;
            ctx.stroke();

            // 4. Inner core with bright center
            const coreGradient = ctx.createRadialGradient(
                centerX,
                centerY,
                0,
                centerX,
                centerY,
                innerCircleRadius * 0.4
            );
            coreGradient.addColorStop(0, hexToRgba(config.colorScheme.primary, 1));
            coreGradient.addColorStop(0.5, hexToRgba(config.colorScheme.primary, 0.6));
            coreGradient.addColorStop(1, hexToRgba(config.colorScheme.secondary, 0.3));

            ctx.beginPath();
            ctx.arc(centerX, centerY, innerCircleRadius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = coreGradient;
            ctx.fill();

            // 5. Rotating energy rings (based on rotation if auto-rotate is on)
            const currentRotation = circularConfig.autoRotate ? rotationRef.current : 0;
            const ringCount = 6;
            for (let i = 0; i < ringCount; i++) {
                const angle = (currentRotation * 2 + (i * Math.PI * 2) / ringCount) % (Math.PI * 2);
                const ringRadius = innerCircleRadius * 0.5;
                const x = centerX + Math.cos(angle) * ringRadius * 0.6;
                const y = centerY + Math.sin(angle) * ringRadius * 0.6;

                const dotGradient = ctx.createRadialGradient(x, y, 0, x, y, 4);
                dotGradient.addColorStop(0, hexToRgba(config.colorScheme.primary, 0.8));
                dotGradient.addColorStop(1, hexToRgba(config.colorScheme.primary, 0));

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = dotGradient;
                ctx.fill();
            }

            // 6. Outer border with glow
            ctx.beginPath();
            ctx.arc(centerX, centerY, innerCircleRadius, 0, Math.PI * 2);
            ctx.strokeStyle = hexToRgba(config.colorScheme.primary, 0.8);
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = hexToRgba(config.colorScheme.primary, 0.6);
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow

            // Frequency distribution based on number of poles
            const poles = circularConfig.poles;
            const segmentsPerPole = barCount / poles;

            for (let i = 0; i < barCount; i++) {
                // Calculate which segment we're in based on number of poles
                const positionInSegment = i % segmentsPerPole;
                const halfSegment = segmentsPerPole / 2;

                let normalizedPosition: number;
                if (positionInSegment < halfSegment) {
                    // First half of segment: bass to highs
                    normalizedPosition = positionInSegment / halfSegment;
                } else {
                    // Second half of segment: highs back to bass
                    normalizedPosition =
                        (segmentsPerPole - positionInSegment) / halfSegment;
                }

                // Apply exponential scaling for better frequency spread
                const logScale = normalizedPosition ** 1.5;
                const dataIndex = Math.floor(logScale * (bufferLength * 0.7));

                // Create wave effect by sampling neighboring frequencies
                let smoothIntensity: number;
                if (config.smoothing) {
                    const prevIndex = Math.max(0, dataIndex - 1);
                    const nextIndex = Math.min(bufferLength - 1, dataIndex + 1);
                    smoothIntensity =
                        (dataArray[prevIndex] +
                            dataArray[dataIndex] * 2 +
                            dataArray[nextIndex]) /
                        (4 * 255);
                } else {
                    smoothIntensity = dataArray[dataIndex] / 255;
                }

                // Dynamic bar height with wave spread
                const maxBarHeight =
                    Math.min(canvas.width, canvas.height) * circularConfig.maxBarHeight;
                const barHeight = smoothIntensity * maxBarHeight;

                // Calculate angle and position with rotation offset
                const staticRotation = (circularConfig.rotationOffset * Math.PI) / 180;
                const dynamicRotation = (rotationRef.current * Math.PI) / 180;
                const angle = i * angleStep + staticRotation + dynamicRotation;
                const startX = centerX + Math.cos(angle) * baseRadius;
                const startY = centerY + Math.sin(angle) * baseRadius;
                const endX = centerX + Math.cos(angle) * (baseRadius + barHeight);
                const endY = centerY + Math.sin(angle) * (baseRadius + barHeight);

                // Draw bar with gradient effect
                const gradient = ctx.createLinearGradient(startX, startY, endX, endY);

                // Convert hex colors to rgba
                const hexToRgba = (hex: string, alpha: number) => {
                    const r = Number.parseInt(hex.slice(1, 3), 16);
                    const g = Number.parseInt(hex.slice(3, 5), 16);
                    const b = Number.parseInt(hex.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };

                gradient.addColorStop(
                    0,
                    hexToRgba(config.colorScheme.primary, smoothIntensity * 0.6),
                );
                gradient.addColorStop(
                    1,
                    hexToRgba(config.colorScheme.secondary, smoothIntensity * 0.9),
                );

                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 3;
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }

            animationIdRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [analyserRef, dataArrayRef, config, circularConfig, canvasRef]);

    return null; // Rendering is done on the canvas passed via ref
}
