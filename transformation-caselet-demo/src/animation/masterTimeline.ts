/* ============================================================
   MASTER TIMELINE
   ------------------------------------------------------------
   Builds ONE deterministic GSAP timeline for the whole film.
   All scenes live in the DOM at once (stacked); the timeline
   reveals, animates, and hides each in its window. Because the
   timeline is a single paused instance, it can be played,
   paused, restarted, scrubbed, and jumped-to by label — the
   same sequence every time.

   `root` is the `.camera` element that wraps the scenes, so a
   subtle camera push can scale it without disturbing the
   fit-to-viewport scaling applied to the outer stage.
   ============================================================ */

import { gsap } from 'gsap'
import { SCENES, sceneById } from '../data/timeline'
import { ground as G, board as B } from '../data/caseData'
import { makeQ, EASE, DUR, type Q } from './transitions'

/* Stage-coordinate constants shared with the CSS layout. */
const COL_LEFT: Record<string, number> = {
  facts: 190,
  opinions: 725,
  gaps: 1260,
}
const FRAG_PAD = 25
const SLOT_TOP = 250
const SLOT_STEP = 76

/* Deterministic scatter for the detached fragments (the hover field). */
const SCATTER: Array<[number, number]> = [
  [620, 360],
  [1120, 380],
  [700, 590],
  [1150, 600],
  [560, 470],
  [1000, 330],
  [840, 560],
  [1180, 470],
  [660, 410],
]

/* BOARD final ranked slot Y by rank (1 = top). */
const RANK_Y: Record<number, number> = { 1: 190, 2: 500, 3: 690, 4: 880 }
const LIST_X = 240

/* BOARD initial "loose" positions, keyed by option id. */
const LOOSE: Record<string, { x: number; y: number; r: number }> = {
  perf: { x: 300, y: 330, r: -3 },
  culture: { x: 900, y: 210, r: 2 },
  reorg: { x: 520, y: 560, r: -1.5 },
  strategy: { x: 800, y: 780, r: 3 },
}

export function buildMasterTimeline(root: HTMLElement): gsap.core.Timeline {
  const q = makeQ(root)
  const tl = gsap.timeline({ paused: true })

  setInitialStates(root, q)

  // Register scene labels so the controls can jump precisely.
  SCENES.forEach((s) => tl.addLabel(s.id, s.start))

  buildOpening(tl, q, sceneById('opening').start)
  buildGround(tl, q, sceneById('ground').start)
  buildBoard(tl, q, sceneById('board').start)
  buildLock(tl, q, root, sceneById('lock').start)
  buildEnd(tl, q, sceneById('end').start)

  // Pin the final duration so the end card holds on the last frame.
  tl.set({}, {}, sceneById('end').end)

  return tl
}

/* ---------------------------------------------------------------
   INITIAL STATES  — set synchronously so the very first frame and
   any backward seek resolve to clean, hidden starting positions.
   --------------------------------------------------------------- */
function setInitialStates(root: HTMLElement, q: Q) {
  // Reset any fit transform residue on the camera.
  gsap.set(root, { scale: 1, transformOrigin: 'center center' })

  // All scenes hidden; the timeline reveals each at its start.
  gsap.set(q('.scene'), { autoAlpha: 0 })

  // Opening
  gsap.set(q('.op-line'), { autoAlpha: 0, y: 30 })
  gsap.set(q('.op-rule__main'), { autoAlpha: 0, y: 30 })
  gsap.set(q('.op-rule__sub'), { autoAlpha: 0, y: 20 })

  // Ground
  gsap.set(q('.gr-statement'), { autoAlpha: 0, y: 44, scale: 0.98 })
  gsap.set(q('.gr-stmt-line'), { autoAlpha: 0, y: 16 })
  gsap.set(q('.gr-col-slot'), { autoAlpha: 0, y: 32 })
  gsap.set(q('.gr-problem__label'), { autoAlpha: 0, y: 18 })
  gsap.set(q('.gr-problem__before'), { autoAlpha: 0, y: 18 })
  gsap.set(q('.gr-problem__after'), { autoAlpha: 0, y: 22 })
  gsap.set(q('.gr-flag'), { autoAlpha: 0, y: 22 })
  // Fragments start scattered in the hover field.
  G.fragments.forEach((f, i) => {
    const [x, y] = SCATTER[i % SCATTER.length]
    gsap.set(q(`.gr-frag[data-frag="${f.id}"]`), {
      autoAlpha: 0,
      x,
      y,
      scale: 0.9,
    })
  })

  // Board
  gsap.set(q('.bd-heading .scene-heading__label'), { autoAlpha: 0, y: 18 })
  gsap.set(q('.bd-heading .scene-heading__sub'), { autoAlpha: 0, y: 18 })
  gsap.set(q('.bd-beat'), { autoAlpha: 0, y: 22 })
  B.options.forEach((o) => {
    const l = LOOSE[o.id]
    gsap.set(q(`.option-card[data-option="${o.id}"]`), {
      autoAlpha: 0,
      x: l.x,
      y: l.y - 40,
      rotation: l.r,
    })
  })
  gsap.set(q('.option-card__reason'), { height: 0, autoAlpha: 0, marginTop: 0 })
  gsap.set(q('.option-card__meta'), { autoAlpha: 0, y: 10 })

  // Lock
  gsap.set(q('.lk-winner'), { autoAlpha: 0, y: 30 })
  gsap.set(q('.lk-bracket'), { autoAlpha: 0, scale: 0.4 })
  gsap.set(q('.lk-pay .lk-q'), { autoAlpha: 0, y: 22 })
  gsap.set(q('.lk-node'), { autoAlpha: 0, y: 26 })
  gsap.set(q('.lk-asym__col--left'), { autoAlpha: 0, y: 26 })
  gsap.set(q('.lk-asym__col--right'), { autoAlpha: 0, y: 26 })
  gsap.set(q('.lk-asym__divider'), { autoAlpha: 0, scaleY: 0 })
  gsap.set(q('.lk-tripwire__tag'), { autoAlpha: 0, y: 16 })
  gsap.set(q('.tripwire__line'), { scaleX: 0 })
  gsap.set(q('.tripwire__dot'), { autoAlpha: 0, scale: 0 })
  gsap.set(q('.tripwire__flag'), { autoAlpha: 0, y: 12 })
  gsap.set(q('.lk-held__label'), { autoAlpha: 0, y: 14 })
  gsap.set(q('.lk-held__item'), { autoAlpha: 0, y: 14 })
  gsap.set(q('.lk-lockline'), { autoAlpha: 0, y: 24 })

  // End
  gsap.set(q('.en-headline'), { autoAlpha: 0, y: 30 })
  gsap.set(q('.en-decision'), { autoAlpha: 0, y: 18 })
  gsap.set(q('.en-closing-wrap'), { autoAlpha: 0, y: 26 })
  // End — brand mark: stroke primed as an undrawn line, word/dot hidden.
  gsap.set(q('.en-logo__word'), { autoAlpha: 0, y: 16 })
  gsap.set(q('.en-logo__dot'), { autoAlpha: 0, scale: 0 })
  const stroke = q('.en-logo__stroke')[0] as unknown as SVGPathElement | undefined
  if (stroke && stroke.getTotalLength) {
    const len = stroke.getTotalLength()
    gsap.set(stroke, { strokeDasharray: len, strokeDashoffset: len })
  }
}

/* Reveal / hide a whole scene container. */
function showScene(tl: gsap.core.Timeline, q: Q, id: string, at: number) {
  tl.set(q(`.scene--${id}`), { autoAlpha: 1 }, at)
}
function hideScene(
  tl: gsap.core.Timeline,
  q: Q,
  id: string,
  at: number,
  y = -18
) {
  tl.to(
    q(`.scene--${id}`),
    { autoAlpha: 0, y, duration: 0.5, ease: EASE.out },
    at
  )
}

/* =================================================================
   SCENE 0 · OPENING
   ================================================================= */
function buildOpening(tl: gsap.core.Timeline, q: Q, s: number) {
  showScene(tl, q, 'opening', s)

  // Context lines snap in one at a time.
  tl.to(q('[data-op-line="0"]'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.snap }, s + 0.6)
  tl.to(q('[data-op-line="1"]'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.snap }, s + 1.7)
  tl.to(q('[data-op-line="2"]'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.snap }, s + 2.8)

  // Clear the context, snap the rule forward.
  tl.to(q('.op-line'), { autoAlpha: 0, y: -30, duration: DUR.base, ease: EASE.out, stagger: 0.06 }, s + 4.7)

  tl.to(q('.op-rule__main'), { autoAlpha: 1, y: 0, duration: DUR.slide, ease: EASE.settle }, s + 5.3)
  tl.to(q('.op-rule__sub'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 5.9)

  // Compress toward GROUND.
  tl.to(q('.op-rule'), { autoAlpha: 0, scale: 0.96, duration: DUR.base, ease: EASE.out }, s + 8.4)
}

/* =================================================================
   SCENE 1 · GROUND  — separate facts, opinions, gaps; rewrite problem
   ================================================================= */
function buildGround(tl: gsap.core.Timeline, q: Q, s: number) {
  showScene(tl, q, 'ground', s)

  // Phase A — the raw statement.
  tl.to(q('.gr-statement'), { autoAlpha: 1, y: 0, scale: 1, duration: DUR.slide, ease: EASE.settle }, s + 0.2)
  tl.to(q('.gr-stmt-line'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide, stagger: 0.18 }, s + 0.5)

  // Phase B — statement recedes, fragments detach into the field.
  tl.to(q('.gr-statement'), { autoAlpha: 0, scale: 0.96, y: -16, duration: DUR.base, ease: EASE.out }, s + 3.4)
  tl.to(q('.gr-frag'), { autoAlpha: 1, scale: 1, duration: DUR.base, ease: EASE.slide, stagger: 0.05 }, s + 3.6)

  // Phase C — zones draw in, fragments sort themselves.
  tl.to(q('.gr-col-slot'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide, stagger: 0.14 }, s + 4.4)

  const counters: Record<string, number> = { facts: 0, opinions: 0, gaps: 0 }
  G.fragments.forEach((f) => {
    const idx = counters[f.zone]++
    const x = COL_LEFT[f.zone] + FRAG_PAD
    const y = SLOT_TOP + idx * SLOT_STEP
    if (f.focal) return // the focal fragment lands last (below)
    const start = s + 5.0 + idx * 0.12 + (f.zone === 'gaps' ? 0.5 : 0)
    tl.to(
      q(`.gr-frag[data-frag="${f.id}"]`),
      { x, y, duration: DUR.slide, ease: EASE.settle },
      start
    )
  })

  // Focal moment — "Fix strategy first" drops into OPINIONS just after the
  // others settle (a beat, not a long pause), then gains its amber underline.
  const focal = G.fragments.find((f) => f.focal)!
  const fx = COL_LEFT[focal.zone] + FRAG_PAD
  tl.to(
    q(`.gr-frag[data-frag="${focal.id}"]`),
    { x: fx, y: SLOT_TOP, duration: DUR.settle, ease: EASE.settle },
    s + 6.3
  )
  tl.to(
    q(`.gr-frag[data-frag="${focal.id}"] [data-frag-underline]`),
    { scaleX: 1, duration: DUR.base, ease: EASE.snap },
    s + 7.1
  )
  tl.to(
    q(`.gr-frag[data-frag="${focal.id}"]`),
    { borderColor: 'var(--amber)', duration: DUR.quick },
    s + 7.1
  )

  // Phase D — rewrite the problem.
  tl.to(q('.gr-problem__label'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 9.6)
  tl.to(q('.gr-problem__before'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 10.0)
  tl.to(q('.gr-problem__strike'), { scaleX: 1, duration: DUR.base, ease: EASE.snap }, s + 11.4)
  tl.to(q('.gr-problem__before'), { autoAlpha: 0, y: -22, duration: DUR.base, ease: EASE.out }, s + 12.1)
  tl.to(q('.gr-problem__after'), { autoAlpha: 1, y: 0, duration: DUR.slide, ease: EASE.settle }, s + 12.3)

  // Phase E — quiet source flag.
  tl.to(q('.gr-flag'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 14.2)

  // Collapse GROUND toward BOARD.
  hideScene(tl, q, 'ground', s + 22.5)
}

/* =================================================================
   SCENE 2 · BOARD  — four options, magnetic evidence-driven ranking
   ================================================================= */
function buildBoard(tl: gsap.core.Timeline, q: Q, s: number) {
  showScene(tl, q, 'board', s)

  tl.to(q('.bd-heading .scene-heading__label'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 0.3)
  tl.to(q('.bd-heading .scene-heading__sub'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 0.55)

  // Four cards drop into a loose, unresolved layout.
  B.options.forEach((o, i) => {
    tl.to(
      q(`.option-card[data-option="${o.id}"]`),
      { autoAlpha: 1, y: LOOSE[o.id].y, duration: DUR.base, ease: EASE.snap },
      s + 0.7 + i * 0.14
    )
  })

  // Ranking — the flashy campaign teases the top, then evidence pulls
  // everything into place. Motion order tells the story.
  const settle = (id: string, rank: number, at: number) =>
    tl.to(
      q(`.option-card[data-option="${id}"]`),
      { x: LIST_X, y: RANK_Y[rank], rotation: 0, duration: DUR.settle, ease: EASE.settle },
      at
    )

  // Culture campaign rises first (looks appealing)…
  tl.to(q('.option-card[data-option="culture"]'), { x: LIST_X, y: 150, rotation: 0, duration: DUR.slide, ease: EASE.settle }, s + 3.5)
  // …its evidence-against ticks expand (a friction marker)…
  tl.to(q('.option-card[data-option="culture"] .tick'), { scaleX: 1.18, transformOrigin: 'left center', duration: 0.4, ease: EASE.snap, stagger: 0.05 }, s + 4.6)
  // …then it sinks to the bottom.
  settle('culture', 4, s + 5.4)
  settle('strategy', 2, s + 6.2)
  settle('reorg', 3, s + 6.9)
  settle('perf', 1, s + 7.8)

  // Winner emphasis — restrained, no explosion.
  tl.to(q('.option-card[data-option="perf"]'), { scale: 1.03, duration: DUR.settle, ease: EASE.settle }, s + 8.6)
  tl.to(q('.option-card[data-option="perf"]'), { borderColor: 'var(--amber)', boxShadow: '0 22px 70px rgba(255,179,0,0.14)', duration: DUR.base }, s + 8.8)
  tl.to(q('.option-card[data-option="perf"] .option-card__reason'), { height: 'auto', autoAlpha: 1, marginTop: 18, duration: DUR.base, ease: EASE.slide }, s + 9.2)
  tl.to(q('.option-card[data-option="perf"] .option-card__meta'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 9.8)

  // Three textual beats, one line at a time.
  tl.to(q('[data-beat="0"]'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 11.4)
  tl.to(q('[data-beat="1"]'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 12.7)
  tl.to(q('[data-beat="2"]'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 14.0)

  // Isolate the winner; the others recede.
  const losers = B.options.filter((o) => !('winner' in o && o.winner))
  losers.forEach((o) => {
    tl.to(q(`.option-card[data-option="${o.id}"]`), { autoAlpha: 0.32, scale: 0.97, x: LIST_X - 12, duration: DUR.slide, ease: EASE.move }, s + 16.4)
  })

  hideScene(tl, q, 'board', s + 24.4)
}

/* =================================================================
   SCENE 3 · LOCK  — responsibility, reversibility, recoverability
   ================================================================= */
function buildLock(tl: gsap.core.Timeline, q: Q, camera: HTMLElement, s: number) {
  showScene(tl, q, 'lock', s)

  // Selected recommendation centered.
  tl.to(q('.lk-winner'), { autoAlpha: 1, y: 0, duration: DUR.slide, ease: EASE.settle }, s + 0.3)

  // Who pays?
  tl.to(q('.lk-pay .lk-q'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 2.0)
  tl.to(q('.lk-node'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.snap, stagger: 0.18 }, s + 2.8)
  tl.to(q('.lk-pay'), { autoAlpha: 0, y: -20, duration: DUR.base, ease: EASE.out }, s + 4.8)

  // Reversible for us (calm) vs recoverable for them (amber).
  tl.to(q('.lk-asym__col--left'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 5.2)
  tl.to(q('.lk-asym__divider'), { autoAlpha: 1, scaleY: 1, duration: DUR.base, ease: EASE.settle }, s + 6.4)
  tl.to(q('.lk-asym__col--right'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 6.8)

  // The weight of the scene: darken everything but the NO.
  tl.to(q('.lk-dimmable'), { autoAlpha: 0.35, duration: DUR.base, ease: EASE.move }, s + 7.6)
  tl.to(camera, { scale: 1.02, duration: 1.2, ease: EASE.settle }, s + 7.6)
  tl.to(q('.lk-dimmable'), { autoAlpha: 1, duration: DUR.base, ease: EASE.move }, s + 9.8)
  tl.to(camera, { scale: 1, duration: 1.0, ease: EASE.settle }, s + 9.8)

  // Six-month tripwire.
  tl.to(q('.lk-tripwire__tag'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 10.4)
  tl.to(q('.tripwire__line'), { scaleX: 1, duration: DUR.slide, ease: EASE.settle }, s + 10.6)
  tl.to(q('.tripwire__dot'), { autoAlpha: 1, scale: 1, duration: DUR.base, ease: EASE.snap }, s + 11.6)
  tl.to(q('.tripwire__flag'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 11.9)

  // Held constant — model assumptions.
  tl.to(q('.lk-held__label'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 13.0)
  tl.to(q('.lk-held__item'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide, stagger: 0.12 }, s + 13.3)

  // Lock the recommendation — brackets snap around the card.
  tl.to(q('.lk-bracket'), { autoAlpha: 1, scale: 1, duration: DUR.base, ease: EASE.snap, stagger: 0.05 }, s + 14.6)

  // Clear the analysis entirely; the closing lines stand alone with the
  // locked card. (lk-pay is already hidden — leave it out.)
  tl.to([...q('.lk-asym'), ...q('.lk-tripwire'), ...q('.lk-held')], { autoAlpha: 0, duration: DUR.base, ease: EASE.out }, s + 15.4)
  tl.to(q('[data-lockline="0"]'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide }, s + 15.6)
  tl.to(q('[data-lockline="1"]'), { autoAlpha: 1, y: 0, duration: DUR.slide, ease: EASE.settle }, s + 16.7)

  hideScene(tl, q, 'lock', s + 19.6)
}

/* =================================================================
   SCENE 4 · END CARD
   ================================================================= */
function buildEnd(tl: gsap.core.Timeline, q: Q, s: number) {
  showScene(tl, q, 'end', s)

  tl.to(q('.en-headline'), { autoAlpha: 1, y: 0, duration: DUR.slide, ease: EASE.settle }, s + 0.3)

  // The five human calls list in…
  tl.to(q('.en-decision'), { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.slide, stagger: 0.16 }, s + 1.0)
  // …then compress into a single compact mark and clear.
  tl.to(q('.en-decision'), { autoAlpha: 0, y: -26, scale: 0.82, duration: DUR.base, ease: EASE.out, stagger: 0.04 }, s + 2.9)

  // Closing message rises in beneath the headline.
  tl.to(q('.en-closing-wrap'), { autoAlpha: 1, y: 0, duration: DUR.slide, ease: EASE.settle }, s + 3.5)

  // Clear the closing lines, then resolve to the brand mark.
  tl.to([...q('.en-headline'), ...q('.en-closing-wrap')], { autoAlpha: 0, y: -30, duration: DUR.base, ease: EASE.out }, s + 6.4)
  // The calligraphic stroke draws itself in.
  tl.to(q('.en-logo__stroke'), { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, s + 6.9)
  tl.to(q('.en-logo__dot'), { autoAlpha: 1, scale: 1, duration: DUR.base, ease: EASE.snap }, s + 8.0)
  tl.to(q('.en-logo__word'), { autoAlpha: 1, y: 0, duration: DUR.slide, ease: EASE.settle }, s + 8.2)
  // Final frame holds on the brand mark until the timeline ends.
}
