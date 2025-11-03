import type { VisualizerConfig } from "../types/visualizer";
import { ColorSchemeSelector } from "./ColorSchemeSelector";
import { ShapeSelector } from "./ShapeSelector";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";

interface VisualizerSettingsProps {
    config: VisualizerConfig;
    onChange: (config: VisualizerConfig) => void;
}

export function VisualizerSettings({
    config,
    onChange,
}: VisualizerSettingsProps) {
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

    const updateCircularConfig = (updates: Partial<typeof circularConfig>) => {
        onChange({
            ...config,
            circularConfig: {
                ...circularConfig,
                ...updates,
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="flex-1">
                    <ColorSchemeSelector
                        onChange={(colorScheme) => onChange({ ...config, colorScheme })}
                        value={config.colorScheme}
                    />
                </div>
                <div className="flex-1">
                    <ShapeSelector
                        onChange={(shape) => onChange({ ...config, shape })}
                        value={config.shape}
                    />
                </div>
            </div>

            {/* Circular specific settings */}
            {config.shape === "circular" && (
                <>
                    <div className="flex flex-col gap-2">
                        <Label
                            className="text-xs font-semibold text-white/80 uppercase tracking-wide"
                            htmlFor="poles"
                        >
                            Bass Poles: {circularConfig.poles}
                        </Label>
                        <Slider
                            className="w-full"
                            id="poles"
                            max={10}
                            min={1}
                            onValueChange={(value) =>
                                updateCircularConfig({ poles: value[0] })
                            }
                            step={1}
                            value={[circularConfig.poles]}
                        />
                        <p className="text-xs text-white/60">
                            Number of bass anchor points (1 to 10)
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label
                            className="text-xs font-semibold text-white/80 uppercase tracking-wide"
                            htmlFor="rotation"
                        >
                            Rotation: {circularConfig.rotationOffset}°
                        </Label>
                        <Slider
                            className="w-full"
                            id="rotation"
                            max={359}
                            min={0}
                            onValueChange={(value) =>
                                updateCircularConfig({
                                    rotationOffset: value[0],
                                })
                            }
                            step={1}
                            value={[circularConfig.rotationOffset]}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label
                            className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center justify-between"
                            htmlFor="bass-pulse"
                        >
                            <span>Bass Pulse Effect</span>
                            <Switch
                                checked={circularConfig.bassResponseCircle}
                                id="bass-pulse"
                                onCheckedChange={(checked) =>
                                    updateCircularConfig({
                                        bassResponseCircle: checked,
                                    })
                                }
                            />
                        </Label>
                        <p className="text-xs text-white/60">
                            Circle size responds to bass
                        </p>
                    </div>                    <div className="flex flex-col gap-2">
                        <Label
                            className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center justify-between"
                            htmlFor="smoothing"
                        >
                            <span>Frequency Smoothing</span>
                            <Switch
                                checked={config.smoothing}
                                id="smoothing"
                                onCheckedChange={(checked) =>
                                    onChange({ ...config, smoothing: checked })
                                }
                            />
                        </Label>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label
                            className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center justify-between"
                            htmlFor="auto-rotate"
                        >
                            <span>Auto-Rotate</span>
                            <Switch
                                checked={circularConfig.autoRotate}
                                id="auto-rotate"
                                onCheckedChange={(checked) =>
                                    updateCircularConfig({ autoRotate: checked })
                                }
                            />
                        </Label>
                        <p className="text-xs text-white/60">
                            Continuously rotate the visualizer
                        </p>
                    </div>

                    {circularConfig.autoRotate && (
                        <div className="flex flex-col gap-2">
                            <Label
                                className="text-xs font-semibold text-white/80 uppercase tracking-wide"
                                htmlFor="rotation-speed"
                            >
                                Rotation Speed: {circularConfig.rotationSpeed.toFixed(1)}°/frame
                            </Label>
                            <Slider
                                className="w-full"
                                id="rotation-speed"
                                max={0.6}
                                min={0.1}
                                onValueChange={(value) =>
                                    updateCircularConfig({
                                        rotationSpeed: value[0],
                                    })
                                }
                                step={0.1}
                                value={[circularConfig.rotationSpeed]}
                            />
                            <p className="text-xs text-white/60">
                                Adjust rotation speed (0.1 = slow, 0.6 = fast)
                            </p>
                        </div>
                    )}                    <div className="flex flex-col gap-2">
                        <Label
                            className="text-xs font-semibold text-white/80 uppercase tracking-wide"
                            htmlFor="fade-amount"
                        >
                            Trail Effect:{" "}
                            {config.fadeAmount === 1
                                ? "None"
                                : `${(config.fadeAmount * 100).toFixed(0)}%`}
                        </Label>
                        <Slider
                            className="w-full"
                            id="fade-amount"
                            max={1}
                            min={0.01}
                            onValueChange={(value) =>
                                onChange({
                                    ...config,
                                    fadeAmount: value[0],
                                })
                            }
                            step={0.01}
                            value={[config.fadeAmount]}
                        />
                        <p className="text-xs text-white/60">
                            Lower = more trails/blur, 100% = no trails (crisp)
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
