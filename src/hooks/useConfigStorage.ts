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
				const defaultCircular = DEFAULT_CONFIG.circularConfig;

				// Build a complete config from stored values with defaults as fallback
				return {
					circularConfig: {
						autoRotate:
							parsed.circularConfig?.autoRotate ??
							defaultCircular?.autoRotate ??
							false,
						barCount:
							parsed.circularConfig?.barCount ??
							defaultCircular?.barCount ??
							360,
						baseRadiusMax:
							parsed.circularConfig?.baseRadiusMax ??
							defaultCircular?.baseRadiusMax ??
							0.25,
						baseRadiusMin:
							parsed.circularConfig?.baseRadiusMin ??
							defaultCircular?.baseRadiusMin ??
							0.1,
						bassResponseCircle:
							parsed.circularConfig?.bassResponseCircle ??
							defaultCircular?.bassResponseCircle ??
							true,
						maxBarHeight:
							parsed.circularConfig?.maxBarHeight ??
							defaultCircular?.maxBarHeight ??
							0.35,
						poles: parsed.circularConfig?.poles ?? defaultCircular?.poles ?? 2,
						rotationOffset:
							parsed.circularConfig?.rotationOffset ??
							defaultCircular?.rotationOffset ??
							130,
						rotationSpeed:
							parsed.circularConfig?.rotationSpeed ??
							defaultCircular?.rotationSpeed ??
							0.1,
					},
					colorScheme: parsed.colorScheme ?? DEFAULT_CONFIG.colorScheme,
					fadeAmount: parsed.fadeAmount ?? DEFAULT_CONFIG.fadeAmount,
					shape: parsed.shape ?? DEFAULT_CONFIG.shape,
					smoothing: parsed.smoothing ?? DEFAULT_CONFIG.smoothing,
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
