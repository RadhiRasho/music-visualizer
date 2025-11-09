export type VisualizerShape = "circular" | "bars" | "waveform";

export type FrequencyRange = "full" | "bass" | "mids" | "highs";

export interface ColorScheme {
	primary: string;
	secondary: string;
	name: string;
	group: "Classic" | "Exotic" | "Legendary";
}

export const COLOR_PRESETS: ColorScheme[] = [
	// Classic
	{ group: "Classic", name: "White", primary: "#ffffff", secondary: "#ffffff" },
	{
		group: "Classic",
		name: "Electric Blue",
		primary: "#00d4ff",
		secondary: "#0080ff",
	},
	{
		group: "Classic",
		name: "Neon Pink",
		primary: "#ff006e",
		secondary: "#ff66b3",
	},
	{
		group: "Classic",
		name: "Cyber Purple",
		primary: "#b744ff",
		secondary: "#7b2cbf",
	},
	{
		group: "Classic",
		name: "Toxic Green",
		primary: "#39ff14",
		secondary: "#00ff00",
	},
	{ group: "Classic", name: "Fire", primary: "#ff4500", secondary: "#ffa500" },
	{ group: "Classic", name: "Ocean", primary: "#00ffff", secondary: "#1e90ff" },
	{
		group: "Classic",
		name: "Sunset",
		primary: "#ff6b35",
		secondary: "#f7931e",
	},
	// Exotic
	{
		group: "Exotic",
		name: "Vaporwave",
		primary: "#ff71ce",
		secondary: "#01cdfe",
	},
	{ group: "Exotic", name: "Matrix", primary: "#00ff41", secondary: "#008f11" },
	{
		group: "Exotic",
		name: "Lava Lamp",
		primary: "#ff00ff",
		secondary: "#ffff00",
	},
	{ group: "Exotic", name: "Aurora", primary: "#00ff9f", secondary: "#00b4d8" },
	{
		group: "Exotic",
		name: "Cyberpunk",
		primary: "#fcee09",
		secondary: "#ff0080",
	},
	{
		group: "Exotic",
		name: "Midnight",
		primary: "#9d4edd",
		secondary: "#3c096c",
	},
	{
		group: "Exotic",
		name: "Radioactive",
		primary: "#ccff00",
		secondary: "#ff006e",
	},
	{
		group: "Exotic",
		name: "Synthwave",
		primary: "#f72585",
		secondary: "#4361ee",
	},
	{
		group: "Exotic",
		name: "Holographic",
		primary: "#7209b7",
		secondary: "#4cc9f0",
	},
	{ group: "Exotic", name: "Plasma", primary: "#ff006e", secondary: "#8338ec" },
	{
		group: "Exotic",
		name: "Neon Jungle",
		primary: "#06ffa5",
		secondary: "#fffb00",
	},
	{
		group: "Exotic",
		name: "Deep Space",
		primary: "#4895ef",
		secondary: "#560bad",
	},
	{
		group: "Exotic",
		name: "Retro Wave",
		primary: "#f72585",
		secondary: "#b5179e",
	},
	{
		group: "Exotic",
		name: "Toxic Waste",
		primary: "#d4ff00",
		secondary: "#7209b7",
	},
	// Legendary
	{
		group: "Legendary",
		name: "Blade Runner",
		primary: "#ff6e00",
		secondary: "#00ffff",
	}, // Orange & cyan neon
	{
		group: "Legendary",
		name: "Tron Legacy",
		primary: "#00d9ff",
		secondary: "#1a1a1a",
	}, // Iconic blue grid
	{
		group: "Legendary",
		name: "Star Wars",
		primary: "#ffe81f",
		secondary: "#000000",
	}, // Gold & black opening crawl
	{
		group: "Legendary",
		name: "Lightsaber Duel",
		primary: "#0000ff",
		secondary: "#ff0000",
	}, // Blue vs Red sabers
	{
		group: "Legendary",
		name: "Stranger Things",
		primary: "#ed1c24",
		secondary: "#000000",
	}, // Red title sequence
	{
		group: "Legendary",
		name: "Dune Spice",
		primary: "#ff6b00",
		secondary: "#0047ab",
	}, // Spice orange & blue eyes
	{
		group: "Legendary",
		name: "Black Panther",
		primary: "#a020f0",
		secondary: "#00ffff",
	}, // Purple vibranium
	{
		group: "Legendary",
		name: "Avatar Pandora",
		primary: "#00ff00",
		secondary: "#0080ff",
	}, // Bioluminescent forest
	{
		group: "Legendary",
		name: "Guardians Galaxy",
		primary: "#ff6ec7",
		secondary: "#8a2be2",
	}, // Awesome Mix vibes
	{
		group: "Legendary",
		name: "Evangelion",
		primary: "#00ff00",
		secondary: "#9400d3",
	}, // Robots and angels
	{
		group: "Legendary",
		name: "Drive",
		primary: "#ff1493",
		secondary: "#ff4500",
	}, // Hot pink neon nights
	{
		group: "Legendary",
		name: "Mad Max Fury",
		primary: "#ff4500",
		secondary: "#ffa500",
	}, // Fire & desert fury
];

export interface VisualizerConfig {
	shape: VisualizerShape;
	// Color config
	colorScheme: ColorScheme;
	// Common config (applies to all visualizer shapes)
	fadeAmount: number; // Trail fade amount (0-1)
	smoothing: boolean; // Enable frequency smoothing
	// Circular specific config
	circularConfig?: {
		poles: number; // Number of bass poles (1 or 10)
		baseRadiusMin: number; // Min radius as percentage (0-1)
		baseRadiusMax: number; // Max radius as percentage (0-1)
		maxBarHeight: number; // Max bar height as percentage (0-1)
		barCount: number; // Number of bars around circle
		rotationOffset: number; // Rotation in degrees
		bassResponseCircle: boolean; // Circle pulses with bass
		autoRotate: boolean; // Auto-rotate the visualizer
		rotationSpeed: number; // Rotation speed in degrees per frame (0.1-0.6)
		jaggedCircle: boolean; // Make outer circle jagged and responsive to bass
	};
	// Bars specific config
	barsConfig?: {
		poles: number; // Number of visualization poles (1-4: bottom, top, left, right)
		barCount: number; // Number of bars per side (1-256)
		barLength: number; // Max bar length as percentage of distance to center (0-1)
		reactiveFade: boolean; // Bars pulse brighter/dimmer based on overall audio energy
		gradient: boolean; // Enable color gradients on bars (performance impact: reduce bar count if FPS drops)
		bassPulse: boolean; // Bars extend outward on bass hits for dramatic effect
		mirrorMode: boolean; // Mirror bars symmetrically from edges inward instead of bass at center
		frequencyRange: FrequencyRange; // Which frequency range to visualize (full, bass, mids, highs)
	};
}

export const DEFAULT_CONFIG: VisualizerConfig = {
	barsConfig: {
		barCount: 256,
		barLength: 0.75,
		bassPulse: false,
		frequencyRange: "full",
		gradient: false,
		mirrorMode: false,
		poles: 2,
		reactiveFade: false,
	},
	circularConfig: {
		autoRotate: false,
		barCount: 360,
		baseRadiusMax: 0.25,
		baseRadiusMin: 0.1,
		bassResponseCircle: true,
		jaggedCircle: false,
		maxBarHeight: 0.35,
		poles: 2,
		rotationOffset: 130,
		rotationSpeed: 0.1,
	},
	colorScheme: COLOR_PRESETS[0], // Default to white
	fadeAmount: 0.5,
	shape: "circular",
	smoothing: true,
};
