export interface MassPreset {
  name: string;
  fillColor: string;
  backgroundColor: string;
  baseScale: number;
  lobeCountBias: number;
  edgeRoughness: number;
  driftSpeed: number;
  agitationStrength: number;
  directionalBias: number;
  seed: number;
}

export const MASS_PRESETS: MassPreset[] = [
  {
    name: "Sludge",
    fillColor: "#000000",
    backgroundColor: "#585500", // Olive
    baseScale: 1.2,
    lobeCountBias: 3.0,
    edgeRoughness: 0.4,
    driftSpeed: 0.2,
    agitationStrength: 0.5,
    directionalBias: 0.0,
    seed: 12.34
  },
  {
    name: "Ferrofluid",
    fillColor: "#000000",
    backgroundColor: "#1e1e1e", // Dark gray
    baseScale: 1.0,
    lobeCountBias: 6.0,
    edgeRoughness: 0.8,
    driftSpeed: 0.4,
    agitationStrength: 0.8,
    directionalBias: 0.2,
    seed: 56.78
  },
  {
    name: "Void",
    fillColor: "#000000",
    backgroundColor: "#2a1b3d", // Deep purple
    baseScale: 1.5,
    lobeCountBias: 2.0,
    edgeRoughness: 0.2,
    driftSpeed: 0.1,
    agitationStrength: 0.3,
    directionalBias: 0.0,
    seed: 90.12
  },
  {
    name: "Abyss",
    fillColor: "#000000",
    backgroundColor: "#002b36", // Deep teal
    baseScale: 0.8,
    lobeCountBias: 8.0,
    edgeRoughness: 1.0,
    driftSpeed: 0.6,
    agitationStrength: 1.0,
    directionalBias: 0.5,
    seed: 34.56
  }
];
