import { HelpCircleIcon } from "lucide-react";
import type { VisualizerConfig } from "@/types/visualizer";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
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
        poles: 8,
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
        </div>
    );
}
