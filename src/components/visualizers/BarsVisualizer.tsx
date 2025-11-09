import { useEffect, useRef } from "react";
import type { VisualizerConfig } from "../../types/visualizer";

interface BarsVisualizerProps {
    analyserRef: React.RefObject<AnalyserNode | null>;
    dataArrayRef: React.RefObject<Uint8Array | null>;
    config: VisualizerConfig;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

function hexToRgba(hex: string, alpha = 1): string {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    return {
        b: Number.parseInt(hex.slice(5, 7), 16),
        g: Number.parseInt(hex.slice(3, 5), 16),
        r: Number.parseInt(hex.slice(1, 3), 16),
    };
}

export function BarsVisualizer({
    analyserRef,
    dataArrayRef,
    config,
    canvasRef,
}: BarsVisualizerProps) {
    const animationIdRef = useRef<number | null>(null);
    const barsConfig = config.barsConfig ?? {
        barCount: 128,
        barLength: 0.9,
        bassPulse: true,
        frequencyRange: "full" as const,
        gradient: true,
        mirrorMode: false,
        poles: 4,
        reactiveFade: false,
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

            // Read frequency data
            // @ts-expect-error Uint8Array typing mismatch in TS DOM lib
            analyser.getByteFrequencyData(dataArray);

            // Calculate bass level for bass pulse effects
            const bassEnd = Math.floor(bufferLength * 0.1);
            let bassSum = 0;
            for (let i = 0; i < bassEnd; i++) {
                bassSum += dataArray[i];
            }
            const bassLevel = bassSum / bassEnd / 255;

            // Calculate overall audio energy for reactive brightness
            let totalEnergy = 0;
            for (let i = 0; i < bufferLength; i++) {
                totalEnergy += dataArray[i];
            }
            const energyLevel = totalEnergy / bufferLength / 255;

            // Apply trail effect
            ctx.fillStyle = hexToRgba("#000000", config.fadeAmount);
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barCount = Math.min(bufferLength, barsConfig.barCount);

            // Pre-calculate colors once
            const primaryColor = hexToRgb(config.colorScheme.primary);
            const secondaryColor = hexToRgb(config.colorScheme.secondary);

            // Pre-calculate color strings for performance (use with globalAlpha)
            const primaryRgb = `rgb(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b})`;
            const secondaryRgb = `rgb(${secondaryColor.r}, ${secondaryColor.g}, ${secondaryColor.b})`;

            // Center of the screen
            const screenCenterX = canvas.width / 2;
            const screenCenterY = canvas.height / 2;

            // Bar width calculation - use consistent width for all poles
            // Use the smaller dimension to ensure bars fit on all sides
            const minDimension = Math.min(screenCenterX, screenCenterY);
            const barWidth = Math.max(2, (minDimension / barCount) * 1.05);

            const poles = barsConfig.poles;

            // Draw bars on four sides (bottom, top, left, right)
            for (let side = 0; side < Math.min(poles, 4); side++) {
                for (let i = 0; i < barCount; i++) {
                    // Calculate position along the edge
                    // Center the distribution: bass at center, mid/treble spread outward
                    const offset = (i / (barCount - 1) - 0.5) * 2.1;
                    let barX = 0;
                    let barY = 0;

                    switch (side) {
                        case 0: // Bottom edge
                            barX = screenCenterX - offset * screenCenterX;
                            barY = canvas.height;
                            break;
                        case 1: // Top edge
                            barX = screenCenterX + offset * screenCenterX;
                            barY = 0;
                            break;
                        case 2: // Left edge
                            barX = 0;
                            barY = screenCenterY + offset * screenCenterY;
                            break;
                        case 3: // Right edge
                            barX = canvas.width;
                            barY = screenCenterY - offset * screenCenterY;
                            break;
                    }

                    // Determine frequency range to sample from
                    let rangeStart = 0;
                    let rangeEnd = bufferLength;
                    switch (barsConfig.frequencyRange) {
                        case "bass":
                            rangeStart = 0;
                            rangeEnd = Math.floor(bufferLength * 0.15); // 0-15% (roughly 0-250Hz)
                            break;
                        case "mids":
                            rangeStart = Math.floor(bufferLength * 0.15);
                            rangeEnd = Math.floor(bufferLength * 0.5); // 15-50% (roughly 250-2000Hz)
                            break;
                        case "highs":
                            rangeStart = Math.floor(bufferLength * 0.5);
                            rangeEnd = bufferLength; // 50-100% (roughly 2000Hz+)
                            break;
                        case "full":
                        default:
                            rangeStart = 0;
                            rangeEnd = bufferLength;
                            break;
                    }
                    const rangeSize = rangeEnd - rangeStart;

                    // Sample from frequency data - mirror mode or centered distribution
                    let dataIndex: number;
                    if (barsConfig.mirrorMode) {
                        // Mirror mode: symmetric from edges inward (0 at edges, high at center)
                        const mirrorPosition = Math.abs(i / barCount - 0.5) * 2;
                        dataIndex =
                            rangeStart + Math.floor(mirrorPosition * rangeSize * 0.7);
                    } else {
                        // Centered mode: bass at center, highs spread outward (current behavior)
                        const distanceFromCenter = Math.abs(i - barCount / 2);
                        dataIndex =
                            rangeStart +
                            Math.floor((distanceFromCenter * 2 * rangeSize) / barCount);
                    }
                    const value = dataArray[Math.min(dataIndex, bufferLength - 1)];
                    const normalizedHeight = value / 255;

                    // More aggressive culling for performance (skip bars < 3%)
                    if (normalizedHeight < 0.03) continue;

                    // Calculate bar length (shooting toward center)
                    const dx = screenCenterX - barX;
                    const dy = screenCenterY - barY;
                    const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
                    const minLength = distanceToCenter * 0.05;
                    let maxLength = distanceToCenter * barsConfig.barLength;

                    // Bass pulse effect: extend bars outward on heavy bass
                    if (barsConfig.bassPulse) {
                        maxLength += distanceToCenter * bassLevel * 0.2; // Up to 20% extension on max bass
                    }

                    const barLength =
                        minLength + normalizedHeight * (maxLength - minLength);

                    // Calculate angle pointing towards screen center (reuse dx, dy)
                    const angle = Math.atan2(dy, dx);

                    // Calculate end point of the bar
                    const endX = barX + Math.cos(angle) * barLength;
                    const endY = barY + Math.sin(angle) * barLength;

                    // Use globalAlpha for performance (avoid alpha in color strings)
                    let alpha = Math.min(0.9, normalizedHeight * 0.8 + bassLevel * 0.2);

                    // Reactive brightness: boost opacity when music is loud
                    if (barsConfig.reactiveFade) {
                        const brightnessBoost = energyLevel * 0.6; // Up to 60% brighter on loud music
                        alpha = Math.min(1.0, alpha + brightnessBoost);
                    }

                    ctx.globalAlpha = alpha;

                    // Conditional gradient rendering based on user preference
                    if (barsConfig.gradient) {
                        // Create gradient - smooth color transition (performance cost)
                        const gradient = ctx.createLinearGradient(barX, barY, endX, endY);
                        gradient.addColorStop(0, primaryRgb);
                        gradient.addColorStop(1, secondaryRgb);
                        ctx.strokeStyle = gradient;
                    } else {
                        // Solid color blended by intensity - much faster than gradients
                        // Blend from primary (low intensity) to secondary (high intensity)
                        const r = Math.round(
                            primaryColor.r +
                            (secondaryColor.r - primaryColor.r) * normalizedHeight,
                        );
                        const g = Math.round(
                            primaryColor.g +
                            (secondaryColor.g - primaryColor.g) * normalizedHeight,
                        );
                        const b = Math.round(
                            primaryColor.b +
                            (secondaryColor.b - primaryColor.b) * normalizedHeight,
                        );
                        ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                    }

                    // Draw as stroke (fast rendering)
                    ctx.lineWidth = barWidth;
                    ctx.beginPath();
                    ctx.moveTo(barX, barY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }

            // Reset globalAlpha to default
            ctx.globalAlpha = 1.0;

            animationIdRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, [
        analyserRef,
        dataArrayRef,
        config,
        canvasRef,
        barsConfig.barCount,
        barsConfig.barLength,
        barsConfig.poles,
        barsConfig.reactiveFade,
        barsConfig.gradient,
        barsConfig.bassPulse,
        barsConfig.mirrorMode,
        barsConfig.frequencyRange,
    ]);

    return null;
}
