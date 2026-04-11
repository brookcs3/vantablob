# Codebase Catalog

This document catalogs the primary files, classes, and functions in the `src` directory to help developers and AI agents navigate the project.

## Core Application

### `src/App.tsx`
The main React entry point and UI overlay.
*   **State Management:** Manages the current variant (`cardIndex`), preset index, and global toggles (`isVantablack`, `isJarvis`, `useTimeline`).
*   **Components:** Contains wrapper components for each blob variant (e.g., `MorphingBlob`, `AdvancedAudioMorphingBlob`). These wrappers handle React `useEffect` lifecycles to instantiate and destroy the vanilla TypeScript Three.js controllers.
*   **UI Overlay:** Renders the carousel controls (left/right arrows), the bottom control panel (Pulse, Vantablack, Quad/Oil, Mode Toggle), and the DSP Debug overlay for Variant 6.

## Controllers (Three.js / WebGL)

### `src/advanced-audio-mass-controller.ts` (Variant 6 - Current Focus)
The most advanced iteration of the blob. It features a dual-mode audio engine (Live DSP vs. Timeline) and expressive physics.
*   **`SpringValue` (Class):** A custom physics class implementing Hooke's Law. Used to smooth out inputs (energy, pointer position) so the blob reacts with weight and inertia rather than jittering.
*   **`createMassMaterial()`:** Generates the custom `THREE.ShaderMaterial`. Contains complex GLSL for Simplex noise, vertex displacement (Squash/Stretch/Spikes), and fragment shading (Vantablack, Jarvis/Oil iridescence).
*   **`AdvancedAudioMassController` (Class):**
    *   `constructor()`: Sets up the Three.js scene, camera, renderer, and springs.
    *   `loadTimelineData()`: Fetches the JSON timeline from `/data/c6/timeline.json`.
    *   `enableAudio()`: Initializes the Web Audio API, `AnalyserNode` (for Live mode), and starts `ms.mp3`.
    *   `updateAudio()`: The core logic loop. If `useTimeline` is true, it reads the JSON and applies logarithmic smoothing. If false, it performs FFT frequency binning to detect kicks (60-120Hz), snares (1-3kHz), and spectral flux (onset).
    *   `animate()`: The render loop. Updates uniforms, applies kick-driven scale zooming, and renders the scene.

### Legacy Controllers
These controllers represent the evolutionary history of the blob. They are preserved for the carousel variants.
*   **`src/morphing-mass-controller.ts` (Variant 1):** The baseline ferrofluid/sludge blob.
*   **`src/gimbal-mass-controller.ts` (Variant 3):** Adds a 3-axis aerotrim gimbal effect.
*   **`src/historic-mass-controller.ts` (Variant 4):** A saw-blade spin variant.
*   **`src/music-mass-controller.ts` (Variant 5):** The first attempt at audio reactivity.
*   **`src/old-morphing-mass-controller.ts` (Variant 2):** An older iteration of the base morphing mass.

## Data & Configuration

### `src/mass-presets.ts` & `src/old-mass-presets.ts`
Contains configuration objects that define the visual characteristics of the blob (seed, baseScale, lobeCountBias, edgeRoughness, driftSpeed, colors).

### `public/data/c6/timeline.json`
The "Player Piano" data file. Contains pre-authored timestamps and intensities for `kick`, `snare`, `custom`, and an `intensityCurve`.
