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

function lerpColor(
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number },
    t: number,
    alpha: number,
): string {
    const r = Math.round(color1.r + (color2.r - color1.r) * t);
    const g = Math.round(color1.g + (color2.g - color1.g) * t);
    const b = Math.round(color1.b + (color2.b - color1.b) * t);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
        poles: 8,
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

            // Apply trail effect with fade
            ctx.fillStyle = hexToRgba("#000000", config.fadeAmount);
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barCount = Math.min(bufferLength, barsConfig.barCount);

            // Pre-calculate colors once
            const primaryColor = hexToRgb(config.colorScheme.primary);
            const secondaryColor = hexToRgb(config.colorScheme.secondary);

            // Center of the screen
            const screenCenterX = canvas.width / 2;
            const screenCenterY = canvas.height / 2;

            // Bar width calculation (use smaller dimension for consistent width)
            const barWidthHorizontal = Math.max(2, (screenCenterX / barCount) * 1.05);
            const barWidthVertical = Math.max(2, (screenCenterY / barCount) * 1.05);
            const barWidthDiagonal = Math.max(2, (Math.min(screenCenterX, screenCenterY) / barCount) * 1.05);

            // Draw bars on all four sides + 4 corners (8 total)
            for (let side = 0; side < 8; side++) {
                const barWidth = side < 4
                    ? ((side === 0 || side === 2) ? barWidthHorizontal : barWidthVertical)
                    : barWidthDiagonal;

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
                        case 1: // Left edge
                            barX = 0;
                            barY = screenCenterY + offset * screenCenterY;
                            break;
                        case 2: // Top edge
                            barX = screenCenterX + offset * screenCenterX;
                            barY = 0;
                            break;
                        case 3: // Right edge
                            barX = canvas.width;
                            barY = screenCenterY - offset * screenCenterY;
                            break;
                        case 4: // Bottom-left corner
                            barX = offset * screenCenterX;
                            barY = canvas.height;
                            break;
                        case 5: // Top-left corner
                            barX = offset * screenCenterX;
                            barY = 0;
                            break;
                        case 6: // Top-right corner
                            barX = canvas.width;
                            barY = offset * screenCenterY;
                            break;
                        case 7: // Bottom-right corner
                            barX = canvas.width;
                            barY = canvas.height - offset * screenCenterY;
                            break;
                    }

                    // Sample from frequency data with centered distribution
                    const distanceFromCenter = Math.abs(i - barCount / 2);
                    const dataIndex = Math.floor(
                        (distanceFromCenter * 2 * bufferLength) / barCount,
                    );
                    const value = dataArray[Math.min(dataIndex, bufferLength - 1)];
                    const normalizedHeight = value / 255;

                    // Skip bars with no amplitude for performance
                    if (normalizedHeight < 0.01) continue;

                    // Calculate bar length (shooting toward center)
                    const distanceToCenter = Math.sqrt(
                        (screenCenterX - barX) ** 2 + (screenCenterY - barY) ** 2,
                    );
                    const minLength = distanceToCenter * 0.05;
                    const maxLength = distanceToCenter * barsConfig.barLength;
                    const barLength =
                        minLength + normalizedHeight * (maxLength - minLength);

                    // Calculate angle pointing towards screen center
                    const angle = Math.atan2(screenCenterY - barY, screenCenterX - barX);

                    // Create gradient from base (primary) to tip (secondary) along bar length
                    const alpha = normalizedHeight * 0.8;
                    const gradient = ctx.createLinearGradient(0, 0, barLength, 0);

                    // Calculate threshold position (10% of max possible length)
                    const thresholdLength = maxLength * 0.1;

                    // Base is always primary color
                    gradient.addColorStop(0, lerpColor(primaryColor, primaryColor, 0, alpha));

                    // If bar reaches threshold, add transition
                    if (barLength > thresholdLength) {
                        // Add primary color at threshold position
                        const thresholdStop = thresholdLength / barLength;
                        gradient.addColorStop(thresholdStop, lerpColor(primaryColor, primaryColor, 0, alpha));

                        // Blend to secondary at tip
                        const blendAmount = (barLength - thresholdLength) / (maxLength - thresholdLength);
                        gradient.addColorStop(1, lerpColor(primaryColor, secondaryColor, blendAmount, alpha));
                    } else {
                        // Bar doesn't reach threshold, stays primary
                        gradient.addColorStop(1, lerpColor(primaryColor, primaryColor, 0, alpha));
                    }

                    // Draw bar as a rectangle pointing towards center
                    ctx.save();
                    ctx.translate(barX, barY);
                    ctx.rotate(angle);
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, -barWidth / 2, barLength, barWidth);
                    ctx.restore();
                }
            }

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
    ]);

    return null;
}
