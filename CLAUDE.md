# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start Vite dev server (localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint
```

No test framework is configured. There is no `npm test` command.

## What This Is

A WebGL/Three.js audio-reactive 3D blob visualizer built with React + Vite + Tailwind CSS. The blob morphs using Simplex noise in custom GLSL shaders and reacts to audio input. Deployed to Google Cloud Run via AI Studio; CNAME points to `cameronbrooks.1oa.cc`.

## Architecture

### Dual-Mode Audio Engine (Variant 6)

The app has two audio modes, toggled via `useTimeline` on `AdvancedAudioMassController`:

1. **Live DSP** — Real-time FFT analysis via Web Audio API `AnalyserNode`. Bins frequencies into kick (60-120Hz), snare (1-3kHz), and spectral flux (onset detection).
2. **Timeline ("Player Piano")** — Reads pre-authored JSON from `/public/data/c{N}/timeline.json` with exact timestamps for kicks, snares, custom events, and an intensity curve. Uses bookmark indices to walk the sorted arrays efficiently.

Both modes output to the same 4 pipes: `kick`, `snare`, `custom`, `intensity`. These are passed as shader uniforms (`uKick`, `uSnare`, `uCustom`, `uIntensity`).

### Controller Pattern

Each blob variant is a standalone vanilla TypeScript class (not a React component) that owns its own Three.js scene, camera, renderer, and animation loop. React wrappers in `App.tsx` instantiate them inside `useEffect`, wire up pointer events, and call `destroy()` on cleanup.

- `src/advanced-audio-mass-controller.ts` — **Variant 6**, current focus. Dual-mode audio, SpringValue physics, 4-pipe shader uniforms.
- `src/morphing-mass-controller.ts` — Variant 1, baseline ferrofluid/sludge.
- `src/old-morphing-mass-controller.ts` — Variant 2, older morph iteration.
- `src/gimbal-mass-controller.ts` — Variant 3, 3-axis aerotrim gimbal.
- `src/historic-mass-controller.ts` — Variant 4, saw-blade spin.
- `src/music-mass-controller.ts` — Variant 5, first audio reactivity attempt.

### SpringValue Physics

All inputs (energy, pointer position, audio values) go through `SpringValue` — a Hooke's Law spring that applies force toward a target with configurable stiffness/damping. Never map audio directly to visual transforms; always apply force to a spring target.

### GLSL Shaders

Shaders live as inline template literals inside each controller's `createMassMaterial()` function. The vertex shader displaces an `IcosahedronGeometry(0.68, 128)` using layered Simplex noise with different frequencies per audio pipe:
- Kick: low-frequency large protrusions (`baseNormal * 1.5`)
- Snare: high-frequency sharp ripples (`baseNormal * 8.0`)
- Custom: mid-frequency spiky agitation (`baseNormal * 4.0`)

Fragment shader handles Vantablack mode (mix to black), and Jarvis/Oil mode (oil-slick iridescence + quad-blue fresnel).

### Logarithmic Intensity

Timeline intensities (0.0–1.0) are mapped through `Math.log10(1 + 9 * rawInt)` before use. This prevents jarring visual snaps from linear values.

## Key Constraints

- **Preserve the carousel.** Variants 1–5 are intentionally kept. Build new features into Variant 6 or new controllers.
- **Confirm before coding.** Per `AGENTS.md`: propose architecture changes, wait for explicit user approval, then implement.
- **Browser autoplay policy.** Audio requires a user click before `AudioContext` can start — the "Play ms.mp3" button handles this.
- **Timeline data is separate.** Stored in `/public/data/c{card_index}/timeline.json`, not in the JS bundle.

## Environment

Requires a `GEMINI_API_KEY` in `.env.local` if using Gemini API features. The `@` path alias resolves to the project root.
