import { HelpCircleIcon } from "lucide-react";
import { DEFAULT_CONFIG, type VisualizerConfig } from "../../types/visualizer";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function CircularSettings({
    config,
    onChange,
}: {
    config: VisualizerConfig;
    onChange: (config: VisualizerConfig) => void;
}) {
    const circularConfig = config.circularConfig ?? (DEFAULT_CONFIG.circularConfig as NonNullable<VisualizerConfig["circularConfig"]>);

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
        <>
            {/* Toggles in compact grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <Label
                        className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center justify-between"
                        htmlFor="bass-pulse"
                    >
                        <span className="flex items-center gap-1">
                            Bass Pulse
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Circle size responds to bass frequencies</p>
                                </TooltipContent>
                            </Tooltip>
                        </span>
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
                </div>

                <div className="flex flex-col gap-1">
                    <Label
                        className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center justify-between"
                        htmlFor="smoothing"
                    >
                        <span>Smoothing</span>
                        <Switch
                            checked={config.smoothing}
                            id="smoothing"
                            onCheckedChange={(checked) =>
                                onChange({ ...config, smoothing: checked })
                            }
                        />
                    </Label>
                </div>

                <div className="flex flex-col gap-1">
                    <Label
                        className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center justify-between"
                        htmlFor="auto-rotate"
                    >
                        <span className="flex items-center gap-1">
                            Auto-Rotate
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Continuously rotate the visualizer</p>
                                </TooltipContent>
                            </Tooltip>
                        </span>
                        <Switch
                            checked={circularConfig.autoRotate}
                            id="auto-rotate"
                            onCheckedChange={(checked) =>
                                updateCircularConfig({ autoRotate: checked })
                            }
                        />
                    </Label>
                </div>

                <div className="flex flex-col gap-1">
                    <Label
                        className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center justify-between"
                        htmlFor="jagged-circle"
                    >
                        <span className="flex items-center gap-1">
                            Jagged Circle
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Make outer circle jagged and responsive to frequencies</p>
                                </TooltipContent>
                            </Tooltip>
                        </span>
                        <Switch
                            checked={circularConfig.jaggedCircle}
                            id="jagged-circle"
                            onCheckedChange={(checked) =>
                                updateCircularConfig({ jaggedCircle: checked })
                            }
                        />
                    </Label>
                </div>
            </div>

            {/* Sliders in compact layout */}
            <div className="space-y-3">
                <div className="flex flex-col gap-1">
                    <Label
                        className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                        htmlFor="poles"
                    >
                        Bass Poles: {circularConfig.poles}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Number of bass anchor points (1 to 10)</p>
                            </TooltipContent>
                        </Tooltip>
                    </Label>
                    <Slider
                        className="w-full"
                        id="poles"
                        max={10}
                        min={1}
                        onValueChange={(value) => updateCircularConfig({ poles: value[0] })}
                        step={1}
                        value={[circularConfig.poles]}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <Label
                        className="text-xs font-semibold text-white/80 uppercase tracking-wide"
                        htmlFor="bar-height"
                    >
                        Bar Height: {Math.round(circularConfig.maxBarHeight * 100)}%
                    </Label>
                    <Slider
                        className="w-full"
                        id="bar-height"
                        max={1}
                        min={0.01}
                        onValueChange={(value) =>
                            updateCircularConfig({
                                maxBarHeight: value[0],
                            })
                        }
                        step={0.01}
                        value={[circularConfig.maxBarHeight]}
                    />
                </div>

                {!config.circularConfig?.autoRotate && (
                    <div className="flex flex-col gap-1">
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
                )}

                {circularConfig.autoRotate && (
                    <div className="flex flex-col gap-1">
                        <Label
                            className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                            htmlFor="rotation-speed"
                        >
                            Rotation Speed: {circularConfig.rotationSpeed.toFixed(1)}
                            °/frame
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Adjust rotation speed (0.1 = slow, 0.6 = fast)</p>
                                </TooltipContent>
                            </Tooltip>
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
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <Label
                        className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                        htmlFor="fade-amount"
                    >
                        Trail Effect:{" "}
                        {config.fadeAmount === 1
                            ? "None"
                            : `${(config.fadeAmount * 100).toFixed(0)}%`}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Lower = more trails/blur, 100% = no trails (crisp)</p>
                            </TooltipContent>
                        </Tooltip>
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
                </div>
            </div>
        </>
    );
}
