# Card 5 — Event-Shaped Reactivity Implementation Plan

**Date:** 2026-04-12
**Target:** `src/music-mass-controller.ts`
**Design:** `docs/plans/2026-04-12-card5-event-reactivity-design.md`

Each task is one atomic edit. No git steps. No test steps.

## Task 1 — Rewrite `AudioAnalyzer`

**Before:** bin-level detectors (`bass`, `treble`, `onset` as mean loudness, `bassHit`/`trebleHit`/`snareHit` from envelope-follower), plus `squelch`/`centroid`/`prominence`/`hnr`/`vibration`.

**After:** a single detector bank where every field is either an event envelope (instant attack, 0.85 decay) or an event-spike scalar. Fields:

- `onset: number` — full-spectrum flux peak-hold envelope (renamed role; was loudness).
- `bassHit: number` — low-band (0–4 bins) flux peak-hold.
- `trebleHit: number` — high-band (116–347 bins) flux peak-hold.
- `snareHit: number` — Card-7 dual-band flux × notKick peak-hold.
- `similarityDrop: number` — `max(0, 0.92 - similarity)` normalized against rolling spectrum average, peak-hold envelope.
- `pitchDelta: number` — already event-shaped; unchanged HPS-based detector.
- `flux: number` — raw full-spectrum flux (used only to advance `morphTime`).

Delete all other public analyzer fields. Drop `squelch`/`centroid`/`prominence`/`hnr`/`vibration`/`bass`/`treble`/`bassAvg`/`trebleAvg`/`snareAvg`. Remove the envelope-follower-based spike detector entirely — replaced by flux-based envelopes.

Envelope shape (applied to each detector output):
```ts
if (raw > env) env = raw;              // instant attack
else env = env * 0.85 + raw * 0.15;    // slow multiplicative decay
```

Snare detector mirrors Card 7 exactly: body band 8–18 (×flux), crack band 185–371 (×flux), notKick gate `1 - lowE/totalE`, same normalization constants.

## Task 2 — Rewrite `createMassMaterial`

### Uniforms — delete
`uBass`, `uTreble`, `uBassHit`, `uTrebleHit`, `uSnareHit` (renamed below), `uSquelch`, `uCentroid`, `uSimilarity`, `uTubeBlend`, `uSquiggleBlend`, `uFlowState`, `uProminence`, `uVibration`, `uFlux`.

### Uniforms — keep/add
- `uTime`, `uEnergy`, `uPointer`, `uPresence`, `uSeed`, `uBaseScale`, `uLobeCountBias`, `uEdgeRoughness`, `uDriftSpeed`, `uAgitationStrength`, `uDirectionalBias`, `uBlobColor`, `uVantablack`, `uJarvis` — unchanged.
- `uBassHit` → kept name, now driven by bass-flux envelope.
- `uTrebleHit` → kept name, now driven by treble-flux envelope.
- `uSnareHit` → kept name, now driven by Card-7 dual-band envelope.
- `uOnset` → kept name, now driven by full-spectrum flux envelope.
- `uPitchDelta`, `uMorphTime` — unchanged.
- `uBend`, `uBendDir1`, `uBendDir2`, `uBendFreq` — kept (bend is now flux-spike triggered).
- `uSplit`, `uSplitAxis` — kept (split is now similarity-drop triggered).

### Vertex shader — delete
- Squelch twist (`twistAngle`, `twistMat`, `twistedNormal`).
- `sharpness *= clamp(1.0 + (uProminence - 1.0) * 0.15, …)` — prominence scaling.
- `mix(pull, smoothstep(…), uFlowState)` — flowstate path.
- `uCentroid` term in `fluidNoise` frequency → replace with constant `1.2`.
- `uOnset` baked into `currentAgitation` and `uEdgeRoughness` multiplier — replace with constants (agitation based only on `uEnergy`).
- `growlNoise` / `uVibration` — deleted.
- Tube blend block.
- Squiggle blend block.
- The `sharpness - uBassHit * 3.0` term (bass sharpness fatten) — replaced by keeping bassThrob only.

### Vertex shader — keep (rewired)
- `warpedNormal` noise warp.
- Attractor pulls `m1..m5`.
- `fluidNoise` at fixed frequency.
- `bassThrob` driven by `uBassHit` (now flux envelope).
- `trebleSpikes` driven by `uTrebleHit` (now flux envelope).
- `snareGoop` driven by `uSnareHit` (now flux envelope).
- Onset expansion driven by `uOnset` (now flux envelope).
- Pointer magnet.
- Mitosis / split block (driven by `uSplit`).
- PitchDelta Y-stretch.
- Bend block.

### Fragment shader — delete
All music-color blocks: `intensity`/`smoothedIntensity`, `bassColor`, `trebleColor`, `snareColor`, `onsetColor`, similarity glitch, flowSheen.

### Fragment shader — keep
Base lighting (diffuse1, diffuse2, rim, specular1), Vantablack mix, Jarvis block.

## Task 3 — Rewrite `MusicMassController`

**Delete:**
- `tubeSpring`, `squiggleSpring`.
- `activeEffect`, `effectTimeRemaining`, `effectList`.
- Mutex cycler block in `animate`.
- Audio-uniform masking block.
- `uFlowState`, `uTubeBlend`, `uSquiggleBlend`, `uFlux`, `uSquelch`, `uCentroid`, `uSimilarity`, `uProminence`, `uVibration` uniform writes.

**Keep:**
- `activeSpring`, `energySpring`, `pointerXSpring`, `pointerYSpring`.
- `bendSpring`, `splitSpring` — but now driven by event triggers, not mutex.
- `morphTime` accumulation (still uses `flux`).
- All public API methods (`setActive`, `setPointer`, `resetPointer`, `setPreset`, `setVantablack`, `setJarvis`, `setEnergy`, `enableAudio`, `destroy`).

**Add:**
- Event-trigger logic for `bend` and `split`:
  - `bend`: when `onset` envelope crosses a high threshold (`> 0.6`) and `bendSpring.value < 0.1`, re-seed `uBendDir1`/`uBendDir2`/`uBendFreq` and `setTarget(1.0)`; otherwise `setTarget(0)` to let spring return to rest.
  - `split`: when `similarityDrop > 0.15` and `splitSpring.value < 0.1`, re-seed `uSplitAxis` and `setTarget(1.0)`; otherwise `setTarget(0)`.
- Cooldown: track `lastBendTime`, `lastSplitTime`; gate retriggers with minimum 0.8s apart to prevent rapid re-firing. This is event-hygiene, not a clock-disqualified rotator — the trigger still requires the audio event.

**Animate loop structure:**
1. `updateAudio()` — runs detector bank.
2. Spring updates for active/energy/pointer/bend/split.
3. Event-trigger evaluation for bend/split (may set spring targets).
4. Write uniforms: `uOnset`, `uBassHit`, `uTrebleHit`, `uSnareHit`, `uPitchDelta`, `uBend`, `uSplit`, `uMorphTime`, `uTime`, `uEnergy`, `uPresence`, `uPointer`.
5. Render.

## Task 4 — `npm run lint`

## Task 5 — `npm run build`
