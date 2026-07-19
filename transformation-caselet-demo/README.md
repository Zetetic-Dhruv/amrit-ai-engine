# Transformation Caselet — Animated Product Demo

A cinematic, self-running, browser-based product demo built to be
screen-recorded as a launch video. It dramatizes one idea:

> **Messy human reasoning becomes structured, visible, and decision-ready.**

The film runs **~83 seconds**, plays automatically start-to-finish, and is a
fixed **16:9 (1920×1080)** motion-graphics composition — not a website, not a
dashboard, not a slide deck.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173  — plays automatically
```

Production build / preview:

```bash
npm run build    # type-checks, then builds to dist/
npm run preview  # serves the production build
```

No backend. No paid APIs. No external accounts. Everything runs locally.
The font is a system stack (Geist/Inter → system-ui fallback), so there are
no runtime font downloads.

---

## The visual concept

Five sections, each a single deterministic beat of the same analysis. Amber is
the **only** meaningful accent — it appears only when the viewer must notice a
reclassification, a rewritten problem, the winning intervention, a
non-recoverable consequence, a tripwire, or a closing phrase.

| # | Scene | ~Time | What it shows |
|---|-------|-------|----------------|
| 0 | **Opening** | 0–9s | Kinetic context; `No hindsight` locks in amber. |
| 1 | **GROUND** | 9–32s | The client's reply detaches into fragments and **sorts** into `FACTS / OPINIONS / GAPS`; "Fix strategy first" drops into Opinions (amber underline); the problem is **rewritten** in amber; a quiet source-bias flag. |
| 2 | **BOARD** | 32–57s | Four interventions drop in loose, then **reorder** by *least evidence against*. "Change the performance system first" rises to the top with a restrained amber border. |
| 3 | **LOCK** | 57–77s | Who pays · **Reversible for us: YES** vs **Recoverable for them: NO** (amber) · a six-month tripwire · held-constant assumptions · the card locks. |
| 4 | **End card** | 77–83s | "Five decisions **stayed human**. Everything else happened while you watched." |

Motion is built on snaps, slides, sorting, masking, and locking — never slow
fades as the primary move. Objects enter through movement. Easing is fast and
controlled (`power3/4.out`, `expo.out`). The case is **frozen at the moment of
decision**: no outcome, no hindsight, no claim that the intervention succeeded.

---

## Playback controls

The control bar is hidden during playback and appears on mouse movement.

| Action | Mouse | Key |
|--------|-------|-----|
| Play / Pause | ▶ / ⏸ | `Space` |
| Restart | ⟲ | `R` |
| Jump to GROUND / BOARD / LOCK | chips | `1` / `2` / `3` |
| Fullscreen | ⤢ | `F` |
| Mute / unmute (narration) | 🔈 | — |
| Recording mode | 🎬 | — (exit with `Esc`) |
| Hide / show controls | — | `H` |

**Recording mode** restarts from the top, hides all controls, hides the mouse
cursor after two seconds, and keeps the 16:9 stage clean for capture.

A thin amber progress bar with quiet scene ticks sits along the bottom edge.

---

## Editing guide

Everything you'd normally want to change lives in a small number of files.

### 1. Wording (non-technical friendly)

**`src/data/caseData.ts`** — the single content file. Every on-screen phrase is
here, grouped by scene, in plain language. Change the text and save; the layout
adapts. Wrap any word in `**double asterisks**` to render it in amber
(e.g. `'The **culture** will not let us **execute any strategy**.'`).

> Keep lines short — the composition is tuned for brevity. Don't change the
> logic of the case, invent outcomes, or add hindsight.

### 2. Timing

**`src/data/timeline.ts`** — the authoritative timing map. Each scene has an
absolute `start`/`end` in seconds. Changing a number shifts the whole
composition and keeps the jump controls and progress ticks in sync. The
per-beat offsets within a scene live in **`src/animation/masterTimeline.ts`**
(each tween is positioned at `sceneStart + offset`, clearly commented).

### 3. Colors

**`src/styles/tokens.css`** — all design tokens (surfaces, borders, text,
amber, type scale). Re-skinning the whole film is a matter of editing these CSS
variables. Amber is `--amber` / `--amber-soft` / `--amber-critical`.

### 4. Scene order

Reorder the scene entries in `src/data/timeline.ts` (and adjust their
start/end), and the component order in `src/App.tsx`. Because all scenes are
stacked in the DOM and driven by one labelled GSAP timeline, the order is
data-driven.

---

## Adding a narration MP3

The visuals are timed to read correctly **without** audio. To add a voiceover:

1. Record against `src/data/timeline.ts` — each scene lists its intended
   `narration` and exact timing.
2. Drop the file at `src/audio/narration.mp3`.
3. In **`src/audio/narration.ts`**, import it and set `NARRATION_SRC`:
   ```ts
   import narrationMp3 from './narration.mp3'
   export const NARRATION_SRC = narrationMp3
   ```
4. The audio element is kept in lock-step with the master timeline
   (play/pause/seek/restart all drive it). Use the 🔈 control to mute/unmute.

No speech is synthesized — you supply the file.

---

## Recording at 1920×1080

1. Use a Chromium-based browser sized so the stage renders at 1:1 (a 1920×1080
   display, or fullscreen with `F`). The stage always scales to fit while
   preserving 16:9, letterboxing on pure black.
2. Click 🎬 **Recording mode** (or press it, then `Esc` to leave). It restarts
   from the top, hides the controls, and hides the cursor.
3. Record the tab/region at **1920×1080, 60 fps**. The whole film is one clean
   take (~83s); the **final frame holds** on the end card indefinitely, so you
   have ample tail to trim.

Tip: for a frame-perfect capture, run `npm run build && npm run preview` and
record the production build.

---

## Project structure

```
src/
  components/        Reusable UI: OptionCard, CategoryColumn, RiskFlag,
                     TimelineMarker, SceneHeading, Controls, ProgressBar, RichText
  scenes/            OpeningScene, GroundScene, BoardScene, LockScene, EndScene
  animation/
    masterTimeline.ts  One deterministic GSAP timeline (labels per scene)
    transitions.ts     Shared easings, durations, selector helper
  data/
    caseData.ts        ← EDIT TEXT HERE
    timeline.ts        ← EDIT TIMING HERE
  audio/
    narration.ts       Optional MP3 hook (off by default)
  styles/
    tokens.css         ← EDIT COLORS / TYPE HERE
    global.css         Reset, fixed-stage + camera layout
  App.tsx              Stage, transport, keyboard, recording mode, fit-scaling
  main.tsx
```

### How the animation works

All five scenes render into the DOM at once, stacked and absolutely positioned
inside a fixed 1920×1080 `.stage`. A single **paused** GSAP timeline
(`buildMasterTimeline`) reveals, animates, and hides each scene in its window,
using `gsap.set` for initial states and `.to()` tweens so the sequence is
identical on every play and safe to scrub or jump-to by label. The `.stage` is
scaled to fit the viewport; a subtle "camera push" scales an inner `.camera`
wrapper so it never fights the fit transform.

---

## Notes

- Deterministic: the same visual sequence plays every time; no randomness, no
  scroll-driven or interaction-gated progression.
- The browser console stays clean (no errors/warnings).
- Content stays frozen at the decision — the tool supports judgment, it does
  not replace it, and never claims the intervention "worked."
