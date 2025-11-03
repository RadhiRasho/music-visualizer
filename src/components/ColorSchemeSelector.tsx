import { ClapperboardIcon } from "lucide-react";
import { COLOR_PRESETS, type ColorScheme } from "../types/visualizer";
import { Label } from "./ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

interface ColorSchemeSelectorProps {
    value: ColorScheme;
    onChange: (scheme: ColorScheme) => void;
}

export function ColorSchemeSelector({ value, onChange }: ColorSchemeSelectorProps) {
    // Group colors by their group property
    const groupedColors = COLOR_PRESETS.reduce(
        (acc, preset) => {
            if (!acc[preset.group]) {
                acc[preset.group] = [];
            }
            acc[preset.group].push(preset);
            return acc;
        },
        {} as Record<string, typeof COLOR_PRESETS>,
    );

    return (
        <div className="flex flex-col gap-2">
            <Label
                className="text-xs font-semibold text-white/80 uppercase tracking-wide"
                htmlFor="color"
            >
                Color Scheme
            </Label>
            <Select
                onValueChange={(val) => {
                    const scheme = COLOR_PRESETS.find((p) => p.name === val);
                    if (scheme) {
                        onChange(scheme);
                    }
                }}
                value={value.name}
            >
                <SelectTrigger
                    className="w-full bg-white/10 border-white/30 text-white"
                    id="color"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent
                    className="bg-black/95 border-white/30 text-white z-100"
                    position="popper"
                    sideOffset={5}
                >
                    {Object.entries(groupedColors).map(([groupName, presets]) => (
                        <SelectGroup key={groupName}>
                            <SelectLabel className="flex gap-2">
                                {groupName === "Legendary" ? <ClapperboardIcon size={16} /> : ""}
                                {groupName}
                            </SelectLabel>
                            {presets.map((preset) => (
                                <SelectItem key={preset.name} value={preset.name}>
                                    <span className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div
                                                className="w-4 h-4 rounded-sm border border-white/20"
                                                style={{ backgroundColor: preset.primary }}
                                            />
                                            <div
                                                className="w-4 h-4 rounded-sm border border-white/20"
                                                style={{ backgroundColor: preset.secondary }}
                                            />
                                        </div>
                                        {preset.name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
