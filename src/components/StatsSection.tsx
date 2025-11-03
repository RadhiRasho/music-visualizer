import { useEffect, useState } from "react";
import type { VisualizerConfig } from "../types/visualizer";

interface StatsSectionProps {
    analyserRef: React.RefObject<AnalyserNode | null>;
    dataArrayRef: React.RefObject<Uint8Array | null>;
    config: VisualizerConfig;
    isListening: boolean;
}

export function StatsSection({
    analyserRef,
    dataArrayRef,
    config,
    isListening,
}: StatsSectionProps) {
    const [fps, setFps] = useState(0);
    const [avgFrequency, setAvgFrequency] = useState(0);
    const [peakFrequency, setPeakFrequency] = useState(0);
    const [bassLevel, setBassLevel] = useState(0);

    useEffect(() => {
        if (!isListening) {
            setFps(0);
            setAvgFrequency(0);
            setPeakFrequency(0);
            setBassLevel(0);
            return;
        }

        let frameCount = 0;
        let lastTime = performance.now();
        let animationId: number;

        const updateStats = () => {
            if (!analyserRef.current || !dataArrayRef.current) {
                animationId = requestAnimationFrame(updateStats);
                return;
            }

            const dataArray = dataArrayRef.current;
            const analyser = analyserRef.current;
            const bufferLength = analyser.frequencyBinCount;

            // Get frequency data
            // @ts-expect-error Uint8Array typing mismatch in TS DOM lib
            analyser.getByteFrequencyData(dataArray);

            // Calculate stats
            let sum = 0;
            let peak = 0;
            let bassSum = 0;
            const bassRange = Math.floor(bufferLength * 0.1);

            for (let i = 0; i < bufferLength; i++) {
                const value = dataArray[i];
                sum += value;
                if (value > peak) peak = value;
                if (i < bassRange) bassSum += value;
            }

            setAvgFrequency(Math.round(sum / bufferLength));
            setPeakFrequency(peak);
            setBassLevel(Math.round(bassSum / bassRange));

            // Calculate FPS
            frameCount++;
            const currentTime = performance.now();
            if (currentTime >= lastTime + 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = currentTime;
            }

            animationId = requestAnimationFrame(updateStats);
        };

        updateStats();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [analyserRef, dataArrayRef, isListening]);

    return (
        <div className="space-y-4">
            <div className="space-y-3 font-mono text-xs">
                {/* Performance Stats */}
                <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">
                        Performance
                    </div>

                    <div className="flex justify-between">
                        <span className="text-white/60">FPS:</span>
                        <span className="text-green-400 font-semibold">{fps}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-white/60">Avg Freq:</span>
                        <span className="text-cyan-400">{avgFrequency}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-white/60">Peak Freq:</span>
                        <span className="text-pink-400">{peakFrequency}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-white/60">Bass:</span>
                        <span className="text-purple-400">{bassLevel}</span>
                    </div>
                </div>

                {/* Configuration Stats */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">
                        Configuration
                    </div>

                    <div className="flex justify-between">
                        <span className="text-white/60">Shape:</span>
                        <span className="text-orange-400 capitalize">{config.shape}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-white/60">FFT Size:</span>
                        <span className="text-yellow-400">{analyserRef.current?.fftSize || 0}</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-white/60">Smoothing:</span>
                        <span className="text-blue-400">{config.smoothing ? 'ON' : 'OFF'}</span>
                    </div>

                    {config.shape === "circular" && (
                        <>
                            <div className="flex justify-between">
                                <span className="text-white/60">Poles:</span>
                                <span className="text-lime-400">{config.circularConfig?.poles}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-white/60">Bars:</span>
                                <span className="text-amber-400">{config.circularConfig?.barCount}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-white/60">Auto-Rotate:</span>
                                <span className="text-indigo-400">{config.autoRotate ? 'ON' : 'OFF'}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
