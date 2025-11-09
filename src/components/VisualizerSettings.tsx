import type { VisualizerConfig } from "../types/visualizer";
import { ColorSchemeSelector } from "./ColorSchemeSelector";
import { ShapeSelector } from "./ShapeSelector";
import BarSettings from "./settings/BarSettings";
import CircularSettings from "./settings/CircularSettings";

interface VisualizerSettingsProps {
    config: VisualizerConfig;
    onChange: (config: VisualizerConfig) => void;
}

export function VisualizerSettings({
    config,
    onChange,
}: VisualizerSettingsProps) {

    return (
        <div className="space-y-4">
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
                <CircularSettings config={config} onChange={onChange} />
            )}

            {/* Bars specific settings */}
            {config.shape === "bars" && (
                <BarSettings config={config} onChange={onChange} />
            )}
        </div>
    );
}
