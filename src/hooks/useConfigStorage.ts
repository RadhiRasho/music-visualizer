import { useEffect, useState } from "react";
import { DEFAULT_CONFIG, type VisualizerConfig } from "../types/visualizer";

const STORAGE_KEY = "music-visualizer-config";

/**
 * Custom hook to manage visualizer config with sessionStorage persistence
 */
export function useConfigStorage() {
	const [config, setConfig] = useState<VisualizerConfig>(() => {
		// Try to load from sessionStorage on initial mount
		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as Partial<VisualizerConfig>;

				// Build a complete config from stored values with defaults as fallback
				return {
					barsConfig: {
						...(DEFAULT_CONFIG.barsConfig as NonNullable<
							VisualizerConfig["barsConfig"]
						>),
						...parsed.barsConfig,
					},
					circularConfig: {
						...(DEFAULT_CONFIG.circularConfig as NonNullable<
							VisualizerConfig["circularConfig"]
						>),
						...parsed.circularConfig,
					},
					colorScheme: parsed.colorScheme ?? DEFAULT_CONFIG.colorScheme,
					fadeAmount: parsed.fadeAmount ?? DEFAULT_CONFIG.fadeAmount,
					shape: parsed.shape ?? DEFAULT_CONFIG.shape,
					smoothing: parsed.smoothing ?? DEFAULT_CONFIG.smoothing,
					waveformConfig: {
						...(DEFAULT_CONFIG.waveformConfig as NonNullable<
							VisualizerConfig["waveformConfig"]
						>),
						...parsed.waveformConfig,
					},
				};
			}
		} catch (error) {
			console.error("Failed to load config from sessionStorage:", error);
		}
		return DEFAULT_CONFIG;
	});

	// Save to sessionStorage whenever config changes
	useEffect(() => {
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
		} catch (error) {
			console.error("Failed to save config to sessionStorage:", error);
		}
	}, [config]);

	return [config, setConfig] as const;
}
