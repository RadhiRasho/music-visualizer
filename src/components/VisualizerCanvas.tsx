import { useEffect, useRef } from "react";
import type { VisualizerConfig } from "../types/visualizer";
import { CircularVisualizer } from "./visualizers/CircularVisualizer";

interface VisualizerCanvasProps {
    analyserRef: React.RefObject<AnalyserNode | null>;
    dataArrayRef: React.RefObject<Uint8Array | null>;
    isListening: boolean;
    config: VisualizerConfig;
}

export function VisualizerCanvas({
    analyserRef,
    dataArrayRef,
    isListening,
    config,
}: VisualizerCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            // Set canvas size to full window
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Handle resize
            const handleResize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };

            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);

    return (
        <>
            <canvas className="absolute inset-0 w-full h-full" ref={canvasRef} />
            {isListening && config.shape === "circular" && (
                <CircularVisualizer
                    analyserRef={analyserRef}
                    canvasRef={canvasRef}
                    config={config}
                    dataArrayRef={dataArrayRef}
                />
            )}
        </>
    );
}
