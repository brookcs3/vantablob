# AI Handoff & Architecture Document

Welcome, future AI Agent or Developer. This document explains the history, architecture, and philosophy of this project to help you jump in without breaking existing paradigms.

## The Stack
*   **Framework:** React 18 + Vite
*   **Styling:** Tailwind CSS
*   **3D / WebGL:** Three.js (Vanilla TS classes wrapped in React `useEffect` hooks)
*   **Audio:** Web Audio API (`AudioContext`, `AnalyserNode`)
*   **Deployment:** Google Cloud Run (via AI Studio Build)

## Project History & Genesis
This project began as a visual exploration of a 3D "blob" using Simplex noise in a custom GLSL shader. The goal was to create something that felt like ferrofluid, sludge, or an alien artifact. 

As the project evolved, we added audio reactivity. The initial approach was **Naive Reactive DSP**: we took the raw amplitude of specific frequency bands (e.g., 1-3kHz) and directly mapped it to the blob's displacement. 
**The Problem:** This resulted in a jittery, robotic animation. Vocals and guitars constantly triggered the "snare" band, making the blob vibrate endlessly rather than reacting to percussive hits.

**The Pivot (The "Player Piano" Method):**
To achieve AAA-game-level expressive animation (Anticipation, Squash & Stretch, Secondary Motion), we decoupled the audio detection from the animation. We introduced a dual-mode system in Variant 6 (`AdvancedAudioMassController`):
1.  **Live DSP Mode:** Uses real-time FFT analysis for dynamic, unpredictable audio.
2.  **Timeline Mode (Player Piano):** Reads a pre-authored JSON file (`/public/data/c6/timeline.json`) containing exact timestamps for kicks, snares, and intensity curves. 

## Architectural Philosophy
When modifying this codebase, adhere to these principles:

1.  **Decoupling via Physics:** Never map an audio input directly to a visual transform frame-by-frame. Always use the `SpringValue` class to apply a "force" to a target. This ensures the blob has mass, inertia, and natural decay.
2.  **Logarithmic Intensity:** Human perception of sound and visual impact is logarithmic. When reading intensity values from the JSON timeline (0.0 to 1.0), we apply a logarithmic curve (e.g., `Math.log10(1 + 9 * rawInt)`) to prevent extreme, jarring visual snaps.
3.  **Preserve the Carousel:** The user wants to keep the history of the blob intact. Do not delete older variants (Card 1 through 5). Build new features into new controllers or carefully extend Variant 6.
4.  **Data Separation:** Timeline data is stored in `/public/data/c{card_index}/timeline.json`. This allows the app to scale infinitely with new songs and cards without bloating the JavaScript bundle.

## Debugging Tips
*   If the audio isn't playing, ensure the user has interacted with the DOM first (browser autoplay policies require a click before `AudioContext` can start).
*   If the shader breaks, check the GLSL string in `createMassMaterial()`. The `snoise` function is heavily relied upon for all vertex displacement.
*   The DSP Debug overlay in `App.tsx` is your best friend for verifying that the 4 pipes (Kick, Snare, Custom, Intensity) are receiving data.
