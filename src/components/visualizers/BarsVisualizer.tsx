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

export function BarsVisualizer({
    analyserRef,
    dataArrayRef,
    config,
    canvasRef,
}: BarsVisualizerProps) {
    const animationIdRef = useRef<number | null>(null);
    const barsConfig = config.barsConfig ?? {
        barCount: 128,
        poles: 1,
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

            const poles = barsConfig.poles;

            // Calculate bar properties - use configured bar count
            const barCount = Math.min(bufferLength, barsConfig.barCount);

            // Center of the screen
            const screenCenterX = canvas.width / 2;
            const screenCenterY = canvas.height / 2;

            // Draw bars for each pole (8 total: 4 corners + 4 midsections)
            for (let poleIndex = 0; poleIndex < Math.min(poles, 8); poleIndex++) {
                // Draw bars in each pole's section
                for (let i = 0; i < barCount; i++) {
                    // Calculate position along the edge for this bar
                    let barX = 0;
                    let barY = 0;

                    // Center the distribution: bass at pole center, mid/treble spread outward
                    // Map i from 0-barCount to -1.05 to +1.05 for slight overlap at boundaries
                    const offset = (i / (barCount - 1) - 0.5) * 2.1; switch (poleIndex) {
                        case 0: // Top-left corner (pole at 0%)
                            barX = offset * screenCenterX;
                            barY = 0;
                            break;
                        case 1: // Top edge midsection (pole at 50%)
                            barX = screenCenterX + offset * screenCenterX;
                            barY = 0;
                            break;
                        case 2: // Top-right corner (pole at 0% of right edge)
                            barX = canvas.width;
                            barY = offset * screenCenterY;
                            break;
                        case 3: // Right edge midsection (pole at 50%)
                            barX = canvas.width;
                            barY = screenCenterY + offset * screenCenterY;
                            break;
                        case 4: // Bottom-right corner (pole at 100% of bottom edge)
                            barX = canvas.width - offset * screenCenterX;
                            barY = canvas.height;
                            break;
                        case 5: // Bottom edge midsection (pole at 50%)
                            barX = screenCenterX - offset * screenCenterX;
                            barY = canvas.height;
                            break;
                        case 6: // Bottom-left corner (pole at 100% of left edge)
                            barX = 0;
                            barY = canvas.height - offset * screenCenterY;
                            break;
                        case 7: // Left edge midsection (pole at 50%)
                            barX = 0;
                            barY = screenCenterY - offset * screenCenterY;
                            break;
                    }

                    // Calculate angle pointing towards screen center
                    const angle = Math.atan2(screenCenterY - barY, screenCenterX - barX);

                    // Sample from frequency data with centered distribution
                    // Map bar index to frequency: center bars = bass, edge bars = treble
                    const distanceFromCenter = Math.abs(i - barCount / 2);
                    const dataIndex = Math.floor((distanceFromCenter * 2 * bufferLength) / barCount);
                    const value = dataArray[Math.min(dataIndex, bufferLength - 1)];
                    const normalizedHeight = value / 255;

                    // Calculate bar length
                    const distanceToCenter = Math.sqrt(
                        (screenCenterX - barX) ** 2 + (screenCenterY - barY) ** 2,
                    );
                    const minLength = distanceToCenter * 0.05;
                    const maxLength = distanceToCenter * 0.95;
                    const barLength =
                        minLength + normalizedHeight * (maxLength - minLength);

                    // Calculate bar width based on edge dimensions with slight overlap
                    // For horizontal edges (top/bottom), use width; for vertical edges (left/right), use height
                    const edgeLength = (poleIndex % 4 === 0 || poleIndex % 4 === 1)
                        ? screenCenterX  // Top or bottom edges
                        : screenCenterY; // Left or right edges
                    const barWidth = Math.max(2, (edgeLength / barCount) * 1.05); // 1.05 for slight overlap

                    // Create gradient from bar base to tip (in local coordinate space)
                    const gradient = ctx.createLinearGradient(
                        0,
                        0,
                        barLength,
                        0,
                    );
                    gradient.addColorStop(
                        0,
                        hexToRgba(config.colorScheme.primary, normalizedHeight * 0.6),
                    );
                    gradient.addColorStop(
                        1,
                        hexToRgba(config.colorScheme.secondary, normalizedHeight * 0.9),
                    );

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
        barsConfig.poles,
        barsConfig.barCount,
    ]);

    return null;
}
