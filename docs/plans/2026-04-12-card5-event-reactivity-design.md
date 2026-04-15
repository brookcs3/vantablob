# Card 5 — Event-Shaped Reactivity

**Date:** 2026-04-12
**Status:** Design approved, pre-implementation
**Target:** `src/music-mass-controller.ts`

## Goal

Card 5's shader should feel alive when something happens and quiet when nothing happens. React to musical *change*, not to what frequency band is currently loud.

```
music change happens → detector spikes → envelope blooms → shape reacts → decay → silence again
```

Not *"what frequency is loud right now"* — *"did something meaningfully happen?"*

## Governing rules

The system must obey these. Any mechanism that violates them is disqualified.

**Meta-principle.** A reactive system must be silent in the absence of stimulus and expressive in its presence.

1. **Silence-baseline rule.** If a signal does not naturally return near zero when nothing meaningful is happening, it cannot define scene state.
2. **Duty-cycle rule.** If a signal is active for the majority of the runtime, it cannot drive expressive contrast. High duty cycle disqualifies a signal from punctuation.
3. **Content-vs-change rule.** Content (how much energy is in band X) is nearly always non-zero in music. Drive expression from *change* (flux, derivatives, transitions), not from *content* (band energy, level, sustained pitch). Change naturally self-silences.
4. **Clock-disqualification rule.** If a transition would fire with the audio muted, it is not reactivity. Timers, mutex rotators, random-duration windows — all decoration.
5. **Layer-separation rule.** Sustained signals belong to the ambient layer (mood, slow drift). Transient signals belong to the punctuation layer (discrete moments). Mixing them destroys both.
6. **Envelope-asymmetry rule.** Event-driven signals require fast attack and slow decay. Symmetric envelopes track level, not events.
7. **Self-silencing rule.** A detector must be always armed but usually silent. "Always armed" is correct. "Always firing" is a broken detector.

**Offline validity test (cheaper than code):** play the song silently in your head and ask — would this signal's trace reveal where the interesting moments are? If it follows the overall loudness curve, it is a level meter and belongs to ambient, not to expression.

## Rejected approaches (with the rule that kills each)

- **Frequency-bin-driven color** — rule 3. Bins are always occupied somewhere in the song.
- **Level-driven glow** — rule 1. Never returns to silence.
- **Timer/mutex effect cycler** — rule 4. Would fire with the audio muted.
- **`uOnset` as currently implemented** — rule 7. It's `mean of all bins`, a loudness meter, not an onset detector.
- **`uVibration`, `uSquelch`, `uProminence`, `uCentroid` as driven into shape terms** — rule 2. High duty cycle through any music.

## Valid drivers

Self-silencing event detectors only:

- **Spectral flux** with asymmetric peak-hold (Card 7's envelope shape) — impact / motion.
- **Similarity drops** — section changes, cuts. Silent through steady grooves.
- **Band-specific flux** (not band-specific level) with peak-hold — e.g. Card 7's snare detector (body flux × crack flux × notKick). Still self-silencing because flux is change, not content.
- **Pitch motion** (pitchDelta) — already event-shaped. Fires on slides, silent on held notes.

## Resolved open questions

### 1. Does color stay, and if so what drives it?

**Color stays, driven only from the punctuation layer.** Color becomes momentary — rises from baseline on event envelopes, returns to baseline between events. No color term may be driven by band content or by continuous level. (Rules 3, 5, 7.)

Every current music-color term (`bassColor`, `trebleColor`, `snareColor`, `onsetColor`, similarity glitch) is deleted. Replacements — if any — hook into the same event envelopes that drive shape.

No music-driven ambient-layer tinting in this cut. If an ambient color drift is wanted later, it is a deliberate separate feature, not a side effect of the driver architecture.

### 2. Which shape terms survive?

Applying the rules to each current displacement term:

**Kept, but rewired to event envelopes:**

- **snareGoop** → driven by Card-7-style dual-band flux × notKick envelope. (Currently `uSnareHit`, which is bin-derived — rule 3 violation. Replace the driver.)
- **bassThrob** → driven by low-band flux with peak-hold envelope. (Currently `uBassHit`, bin-derived level-spike — rule 3.)
- **trebleSpikes** → driven by high-band flux with peak-hold envelope. (Currently `uTrebleHit`, bin-derived.)
- **onset expansion** → driven by full-spectrum flux with peak-hold. Rename the uniform. (Currently `uOnset` = loudness — rule 7.)
- **pitchDelta Y-stretch** → kept as-is, already event-shaped.
- **bend** → triggered by flux spike above a high threshold. (Currently driven by the mutex cycler — rule 4.)
- **split** → triggered by similarity drop. (Currently driven by the mutex cycler — rule 4.)

**Deleted:**

- `uVibration` growl noise — rule 2 (level-driven, active through any loud passage).
- `uSquelch` twist of the sampled normal — rule 2.
- `uCentroid` modulation of `fluidNoise` frequency — rule 2 (ambient-layer signal leaking into shape).
- `uProminence` sharpness scaling — rule 2.
- `uFlowState` — already dead (pinned to 0), formally removed.
- Tube choreography (`uTubeBlend`) — sustained pose. Rule 5 violation (ambient driving punctuation slot). Delete.
- Squiggle choreography (`uSquiggleBlend`) — same reason. Delete.
- Mutex cycler (`activeEffect`, `effectTimeRemaining`, `effectList`, cycler branch in `animate`) — rule 4. Delete.
- Audio-uniform masking block (lines 911–918) — unnecessary once the cycler is gone.

**Kept as-is (non-music, unaffected):**

- Pointer magnet — user input, self-silencing by nature.
- 5 attractor-vector pulls (`m1..m5`) — time-driven ambient motion, not a music reaction. Keeps the blob alive visually when the music is silent.
- `fluidNoise` baseline texture.
- Vantablack and Jarvis fragment modes.
- Base lighting (diffuse/rim/specular).
- SpringValue physics between envelope output and visual (preserved role; still the correct mass/inertia model).
- Logarithmic intensity mapping where amplitudes need perceptual shaping.

## Detector architecture

Every audio-reactive uniform is fed from a detector with this shape:

```
raw feature  →  asymmetric peak-hold envelope  →  SpringValue  →  uniform
              (instant attack, slow decay)      (mass/inertia)
```

Peak-hold envelope (Card 7's pattern):

```ts
if (raw > envelope) envelope = raw;              // instant attack
else envelope = envelope * DECAY + raw * (1 - DECAY);  // slow decay, e.g. DECAY = 0.85
```

This guarantees the self-silencing rule at the source of every signal.

## What this replaces

- Mutex cycler → removed entirely.
- Bin-driven hits (`uBassHit`, `uTrebleHit`, `uSnareHit`) → replaced by band-flux envelopes.
- `uOnset` as loudness → replaced by full-spectrum flux envelope. Likely renamed.
- `uFlowState`, tube/squiggle choreography, vibration/squelch/prominence/centroid-in-shape → deleted.
- Fragment shader music-color block → deleted. Optional replacement hooks into event envelopes.

## Success criteria

The card passes the **offline validity test** applied to the live visual:

- During a steady section of the song, the blob is mostly at rest — slow ambient motion from attractor pulls, no music-driven deformation.
- On a kick, there is a visible bass-throb that blooms and decays.
- On a snare, there is a visible snare-goop protrusion that blooms and decays.
- On a section change / drop, a bend or split fires as a discrete event, then releases.
- Two passes of the same quiet region look the same. Two passes of the same busy region look the same.
- At no point during the song is the blob continuously lit in a single color because a band is loud.

## Out of scope

- Card 7 changes (it already uses this architecture).
- Variant 6 (Player Piano timeline) changes.
- Any new card.
- Adding a deliberate ambient music-driven layer (deferred — if wanted, a separate design).
- Tempo / beat detection (not in the current detector palette).
