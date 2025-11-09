import { HelpCircleIcon } from "lucide-react";
import type {
    ColorMode,
    SpeakerPattern,
    VisualizerConfig,
} from "@/types/visualizer";
import { DEFAULT_CONFIG } from "@/types/visualizer";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function WaveformSettings({
    config,
    onChange,
}: {
    config: VisualizerConfig;
    onChange: (config: VisualizerConfig) => void;
}) {
    const waveformConfig =
        config.waveformConfig ??
        (DEFAULT_CONFIG.waveformConfig as NonNullable<
            VisualizerConfig["waveformConfig"]
        >);

    const updateWaveformConfig = (updates: Partial<typeof waveformConfig>) => {
        onChange({
            ...config,
            waveformConfig: {
                ...waveformConfig,
                ...updates,
            },
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-line-count"
                >
                    Ripple Count: {waveformConfig.lineCount}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Number of concentric ripples (like rings in water)</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-line-count"
                    max={100}
                    min={20}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ lineCount: value })
                    }
                    step={5}
                    value={[waveformConfig.lineCount]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-line-points"
                >
                    Ripple Smoothness: {waveformConfig.linePoints}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Circle detail points (higher = smoother ripples but slower)</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-line-points"
                    max={512}
                    min={64}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ linePoints: value })
                    }
                    step={16}
                    value={[waveformConfig.linePoints]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-line-spacing"
                >
                    Wave Intensity: {waveformConfig.lineSpacing}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>How much audio waves distort the ripples</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-line-spacing"
                    max={20}
                    min={3}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ lineSpacing: value })
                    }
                    step={1}
                    value={[waveformConfig.lineSpacing]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-line-width"
                >
                    Ripple Width: {waveformConfig.lineWidth}px
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Thickness of each ripple line</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-line-width"
                    max={5}
                    min={1}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ lineWidth: value })
                    }
                    step={0.5}
                    value={[waveformConfig.lineWidth]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-amplitude"
                >
                    Wave Height: {waveformConfig.amplitudeScale.toFixed(2)}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>How much the ripples distort from perfect circles</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-amplitude"
                    max={2}
                    min={0.1}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ amplitudeScale: value })
                    }
                    step={0.1}
                    value={[waveformConfig.amplitudeScale]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-angle"
                >
                    View Angle: {waveformConfig.viewAngle.toFixed(0)}°
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>
                                Adjust the 3D viewing perspective angle (0° = top view, 315° =
                                diagonal)
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-angle"
                    max={360}
                    min={0}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ viewAngle: value })
                    }
                    step={5}
                    value={[waveformConfig.viewAngle]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-tilt"
                >
                    Camera Tilt: {waveformConfig.cameraTilt.toFixed(2)}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Vertical viewing angle (lower = more tilted/dramatic)</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-tilt"
                    max={1.0}
                    min={0.1}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ cameraTilt: value })
                    }
                    step={0.05}
                    value={[waveformConfig.cameraTilt]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-depth"
                >
                    Depth Compression: {waveformConfig.depthCompression.toFixed(2)}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>
                                How compressed the vertical axis is (lower = flatter/more 3D)
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-depth"
                    max={1.0}
                    min={0.1}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ depthCompression: value })
                    }
                    step={0.05}
                    value={[waveformConfig.depthCompression]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-speed"
                >
                    Ripple Speed: {waveformConfig.rippleSpeed.toFixed(2)}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>How fast ripples expand outward</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-speed"
                    max={3.0}
                    min={0.5}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ rippleSpeed: value })
                    }
                    step={0.1}
                    value={[waveformConfig.rippleSpeed]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-threshold"
                >
                    Bass Sensitivity: {waveformConfig.bassThreshold.toFixed(2)}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>
                                Minimum bass level to create ripples (lower = more sensitive)
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-threshold"
                    max={0.5}
                    min={0.05}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ bassThreshold: value })
                    }
                    step={0.01}
                    value={[waveformConfig.bassThreshold]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-size"
                >
                    Size Scaling: {waveformConfig.sizeScaling.toFixed(2)}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Scale ripples based on audio intensity (0 = fixed size)</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Slider
                    className="py-2"
                    id="waveform-size"
                    max={2.0}
                    min={0}
                    onValueChange={([value]) =>
                        updateWaveformConfig({ sizeScaling: value })
                    }
                    step={0.1}
                    value={[waveformConfig.sizeScaling]}
                />
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-color-mode"
                >
                    Color Mode
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>How ripples are colored</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Select
                    onValueChange={(value: ColorMode) =>
                        updateWaveformConfig({ colorMode: value })
                    }
                    value={waveformConfig.colorMode}
                >
                    <SelectTrigger className="w-full" id="waveform-color-mode">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gradient">Gradient (Center to Edge)</SelectItem>
                        <SelectItem value="frequency">Frequency Reactive</SelectItem>
                        <SelectItem value="solid">Solid Color</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-speaker"
                >
                    Speaker Pattern
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Design of the speaker/source in the center</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Select
                    onValueChange={(value: SpeakerPattern) =>
                        updateWaveformConfig({ speakerPattern: value })
                    }
                    value={waveformConfig.speakerPattern}
                >
                    <SelectTrigger className="w-full" id="waveform-speaker">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rings">Concentric Rings</SelectItem>
                        <SelectItem value="radial">Radial Lines</SelectItem>
                        <SelectItem value="pulse">Pulsing Circle</SelectItem>
                        <SelectItem value="star">Star Pattern</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between">
                <Label
                    className="text-xs font-semibold text-white/80 uppercase tracking-wide flex items-center gap-1"
                    htmlFor="waveform-fill"
                >
                    Fill Ripples
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircleIcon className="w-3 h-3 text-white/40 hover:text-white/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Fill space between ripples for solid water effect</p>
                        </TooltipContent>
                    </Tooltip>
                </Label>
                <Switch
                    checked={waveformConfig.fillContours}
                    id="waveform-fill"
                    onCheckedChange={(checked) =>
                        updateWaveformConfig({ fillContours: checked })
                    }
                />
            </div>
        </div>
    );
}
