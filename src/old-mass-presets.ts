const BASE_FILL_COLOR = "#040404"; // Almost black, glossy

export const MASS_PRESETS = [
  {
    name: "ferro-core",
    seed: 1.17,
    baseScale: 0.8,
    lobeCountBias: 5.0, // Sharp spikes
    edgeRoughness: 0.05, // Smooth surface between spikes
    driftSpeed: 0.8,
    agitationStrength: 0.45, // Strong pull
    directionalBias: 0.0,
    backgroundColor: "#585500", // Olive
    fillColor: BASE_FILL_COLOR
  },
  {
    name: "heavy-sludge",
    seed: 4.81,
    baseScale: 0.85,
    lobeCountBias: 2.0, // Wide, heavy blobs
    edgeRoughness: 0.15, // Slightly bumpy
    driftSpeed: 0.4, // Slow moving
    agitationStrength: 0.3, // Medium pull
    directionalBias: 0.0,
    backgroundColor: "#1e1e1e", // Dark gray
    fillColor: BASE_FILL_COLOR
  },
  {
    name: "active-symbiote",
    seed: 7.33,
    baseScale: 0.75,
    lobeCountBias: 3.5, // Medium spikes
    edgeRoughness: 0.1,
    driftSpeed: 1.2, // Fast moving
    agitationStrength: 0.5, // Very strong pull
    directionalBias: 0.0,
    backgroundColor: "#2a1b3d", // Deep purple
    fillColor: BASE_FILL_COLOR
  },
  {
    name: "suspended-oil",
    seed: 10.42,
    baseScale: 0.82,
    lobeCountBias: 2.5, // Smooth blobs
    edgeRoughness: 0.02, // Very smooth surface
    driftSpeed: 0.6,
    agitationStrength: 0.25, // Subtle pull
    directionalBias: 0.0,
    backgroundColor: "#002b36", // Deep teal
    fillColor: BASE_FILL_COLOR
  }
];
