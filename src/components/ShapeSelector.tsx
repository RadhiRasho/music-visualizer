import { BarChart3Icon, CircleIcon, WavesIcon } from "lucide-react";
import type { VisualizerConfig } from "../types/visualizer";
import { Label } from "./ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

interface ShapeSelectorProps {
    value: VisualizerConfig["shape"];
    onChange: (shape: VisualizerConfig["shape"]) => void;
}

export function ShapeSelector({ value, onChange }: ShapeSelectorProps) {
    return (
        <div className="flex flex-col gap-2">
            <Label
                className="text-xs font-semibold text-white/80 uppercase tracking-wide"
                htmlFor="shape"
            >
                Visualizer Shape
            </Label>
            <Select
                onValueChange={(val) => onChange(val as VisualizerConfig["shape"])}
                value={value}
            >
                <SelectTrigger
                    className="w-full bg-white/10 border-white/30 text-white"
                    id="shape"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="bg-black/95 border-white/30 text-white z-100"
                    position="popper"
                    sideOffset={5}
                >
                    <SelectItem value="circular">
                        <span className="flex items-center gap-2">
                            <CircleIcon className="w-4 h-4" />
                            Circular
                        </span>
                    </SelectItem>
                    <SelectItem value="bars">
                        <span className="flex items-center gap-2">
                            <BarChart3Icon className="w-4 h-4" />
                            Bars
                        </span>
                    </SelectItem>
                    <SelectItem disabled value="waveform">
                        <span className="flex items-center gap-2">
                            <WavesIcon className="w-4 h-4" />
                            Waveform (Coming Soon)
                        </span>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
