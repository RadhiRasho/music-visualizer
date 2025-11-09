import { BadgeInfoIcon, HelpCircleIcon } from "lucide-react";
import type { VisualizerConfig } from "@/types/visualizer";
import { Alert, AlertDescription } from "../ui/alert";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function BarSettings({
    config,
    onChange,
}: {
    config: VisualizerConfig;
    onChange: (config: VisualizerConfig) => void;
}) {
    const barsConfig = config.barsConfig ?? {
        barCount: 128,
        barLength: 0.9,
        bassPulse: true,
        gradient: true,
        mirrorMode: false,
        poles: 4,
        reactiveFade: false,
    };

    const updateBarsConfig = (updates: Partial<typeof barsConfig>) => {
        onChange({
            ...config,
            barsConfig: {
                ...barsConfig,
                ...updates,
            },
        });
    };
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="bars-poles"
                >
                    Poles: {barsConfig.poles}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Number of visualization sections (1-4: bottom, top, left, right)</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="w-full"
                    id="bars-poles"
                    max={4}
                    min={1}
                    onValueChange={(value) => updateBarsConfig({ poles: value[0] })}
                    step={1}
                    value={[barsConfig.poles]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="bars-count"
                >
                    Bar Count: {barsConfig.barCount}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Number of frequency bars per side (32 to 256)</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="w-full"
                    id="bars-count"
                    max={256}
                    min={32}
                    onValueChange={(value) => updateBarsConfig({ barCount: value[0] })}
                    step={8}
                    value={[barsConfig.barCount]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="bar-length"
                >
                    Bar Length: {(barsConfig.barLength * 100).toFixed(0)}%
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>How far bars extend toward center at max amplitude</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="w-full"
                    id="bar-length"
                    max={1}
                    min={0.1}
                    onValueChange={(value) => updateBarsConfig({ barLength: value[0] })}
                    step={0.05}
                    value={[barsConfig.barLength]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="bars-fade-amount"
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
                    id="bars-fade-amount"
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

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <Label
                        className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center justify-between"
                        htmlFor="reactive-fade"
                    >
                        <span className="flex items-center gap-1">
                            Reactive Fade
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Trail amount pulses with bass</p>
                                </TooltipContent>
                            </Tooltip>
                        </span>
                        <Switch
                            checked={barsConfig.reactiveFade}
                            id="reactive-fade"
                            onCheckedChange={(checked) =>
                                updateBarsConfig({ reactiveFade: checked })
                            }
                        />
                    </Label>
                </div>

                <div className="flex flex-col gap-1">
                    <Label
                        className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center justify-between"
                        htmlFor="gradient-bars"
                    >
                        <span className="flex items-center gap-1">
                            Gradient
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Color gradient on bars (impacts performance)</p>
                                </TooltipContent>
                            </Tooltip>
                        </span>
                        <Switch
                            checked={barsConfig.gradient}
                            id="gradient-bars"
                            onCheckedChange={(checked) =>
                                updateBarsConfig({ gradient: checked })
                            }
                        />
                    </Label>
                </div>

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
                                    <p>Bars extend outward on bass hits</p>
                                </TooltipContent>
                            </Tooltip>
                        </span>
                        <Switch
                            checked={barsConfig.bassPulse}
                            id="bass-pulse"
                            onCheckedChange={(checked) =>
                                updateBarsConfig({ bassPulse: checked })
                            }
                        />
                    </Label>
                </div>

                <div className="flex flex-col gap-1">
                    <Label
                        className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center justify-between"
                        htmlFor="mirror-mode"
                    >
                        <span className="flex items-center gap-1">
                            Mirror Mode
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Symmetric bars from edges inward</p>
                                </TooltipContent>
                            </Tooltip>
                        </span>
                        <Switch
                            checked={barsConfig.mirrorMode}
                            id="mirror-mode"
                            onCheckedChange={(checked) =>
                                updateBarsConfig({ mirrorMode: checked })
                            }
                        />
                    </Label>
                </div>
            </div>

            {/* Performance Warning */}
            {barsConfig.gradient && barsConfig.barCount > 128 && (
                <Alert className="bg-yellow-500/10 border-yellow-500/30 text-yellow-200">
                    <BadgeInfoIcon />
                    <AlertDescription className="text-xs">
                        Performance Impact: Gradients with high bar count may reduce FPS.
                        Try lowering bar count to 64-96 for better performance.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
