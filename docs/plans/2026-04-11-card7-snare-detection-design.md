# Card 7 — Snare Detection Design

**Date:** 2026-04-11
**Status:** Implemented in `src/card7-controller.ts`

## Goal

Add a second continuous audio-reactive pipe `uSnare` to Card 7, alongside the existing `uOnset`. Onset runs continuously as a beat/transient detector on the full mix. Snare fires proportionally on hits that match a snare's physical signature, enabling the shader to run sub-animations keyed to snare events while onset keeps ambient reactivity going.

## Locked decisions

1. Keep `uOnset` exactly as-is — continuous spectral flux with asymmetric peak-hold decay over the full mix. Default `smoothingTimeConstant = 0.8`.
2. Add `uSnare` as a second continuous 0..1 value with the same peak-hold envelope. Not a discrete trigger.
3. Selectivity: all snares fire proportionally — subtle backbeats produce low values, emphasized hits produce high values. Shader decides any threshold logic.
4. Live DSP only. No MIDI, no stems, no offline analysis.
5. Snare analyser uses `smoothingTimeConstant = 0` so flux isn't blunted.

## Approach — Dual-band flux × notKick gate

Uses three features computed from a dedicated `AnalyserNode` tapped off the same media source as the onset analyser:

- **Body flux** — positive spectral flux in bins 8–18 (~172–409 Hz), covering the snare shell fundamental.
- **Crack flux** — positive spectral flux in bins 185–371 (~3983–7988 Hz), covering the wire noise.
- **notKick gate** — `1 - lowBandEnergy / totalEnergy` where low band is bins 0–6 (<150 Hz). Suppresses frames where sub-150 Hz energy dominates.

Combined as a product:

```
rawSnare = min(bodyFlux/4, 1) * min(crackFlux/12, 1) * notKick
```

Product (logical-AND shape) means any single factor near zero kills the output. A kick fails the notKick gate. A hi-hat fails the body-flux test. A tonal vocal fails both flux tests. Only events with simultaneous mid-band and high-band transients, without kick-dominated low-end, produce non-trivial output.

Then same peak-hold as onset:

```
if (rawSnare > snare) snare = rawSnare         // instant attack
else snare = snare * 0.85 + rawSnare * 0.15    // slow decay
```

## Bin math (fftSize=2048, sr=44.1kHz → Δ ≈ 21.53 Hz/bin)

| Band | Bin range | Frequency range | Purpose |
|------|-----------|-----------------|---------|
| LOW (reject) | 0–6 | 0–150 Hz | Kick territory — gates output down when dominant |
| BODY | 8–18 | 172–409 Hz | Snare shell fundamental (target ~180–400 Hz) |
| CRACK | 185–371 | 3983–7988 Hz | Snare wire noise (target ~4–8 kHz) |

## Architecture

Two `AnalyserNode`s tapped off the same `MediaElementAudioSourceNode`:

```
audioElement → source ─┬─ analyser       (sTC=0.8) → getByteFrequencyData → onset flux
                       ├─ snareAnalyser  (sTC=0)   → getByteFrequencyData → dual-band flux
                       └─ destination (only through analyser path)
```

Snare analyser does not route to the audio output — it's an analysis-only tap. This keeps onset's current visual behavior untouched while snare gets sharper, unsmoothed FFT data.

## Shader wiring

New uniform `uSnare: { value: 0.0 }` added to the shader material. Vertex shader declares `uniform float uSnare;` and applies a placeholder displacement:

```glsl
r += uSnare * 0.15;
```

This is deliberately a placeholder. The actual sub-animation behavior (ripple, swell, spike, color shift, whatever) is to be defined in a follow-up iteration. For now this value being non-zero proves the pipeline works and lets the shader author see the signal responding to snares.

## Known limitations / accepted false positives

- Claps and rim-shots will fire. Acoustically near-snares — musically fine.
- Sibilance (vocal "s"/"ts") can slip through if intense enough. Mitigation if needed: add a centroid upper-bound gate (centroid > 4kHz → suppress).
- Toms between 200–300 Hz can leak through. Mitigation: raise BODY_LO from 8 to 10.
- Normalization divisors (`/4`, `/12`) are initial guesses — tune by listening.

## Tuning knobs

| Variable | Current | Effect |
|----------|---------|--------|
| `BODY_LO`, `BODY_HI` | 8, 19 | Body frequency range |
| `CRACK_LO`, `CRACK_HI` | 185, 372 | Crack frequency range |
| `LOW_HI` | 7 | Kick reject cutoff |
| `bodyFlux / 4.0` | 4 | Body normalization; lower = more sensitive |
| `crackFlux / 12.0` | 12 | Crack normalization; lower = more sensitive |
| Peak-hold decay | 0.85 | Shared with onset |

## Verification

- `npx tsc --noEmit` passes.
- Implementation matches the locked decisions point-for-point.
- Dev server running — manual verification by clicking Play on Card 7 pending.

## Files changed

- `src/card7-controller.ts` — all changes

## References

- Battenberg (2012) — sub-band flux for drum classification
- Dixon (2006) — onset detection revisited (peak-hold envelope pattern)
- Truth-finder verification report confirming smoothingTimeConstant=0.8 blunts flux
