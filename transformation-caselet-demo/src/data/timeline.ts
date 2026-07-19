/* ============================================================
   TIMELINE MAP  —  the authoritative timing document.
   ------------------------------------------------------------
   Each scene has an absolute start/end (in seconds) on the
   master GSAP timeline. The animation code (animation/*) reads
   these boundaries, so changing a number here shifts the whole
   composition and keeps the jump controls in sync.

   `narration` is the intended voiceover for each scene — used
   only as documentation and as the anchor for a future audio
   track (see AUDIO in the README). The visuals are timed to
   read correctly WITHOUT narration.
   ============================================================ */

export type SceneId = 'opening' | 'ground' | 'board' | 'lock' | 'end'

export interface SceneMeta {
  id: SceneId
  name: string
  start: number // seconds, absolute on master timeline
  end: number // seconds
  narration: string
  visualAction: string
  onScreen: string
}

export const SCENES: SceneMeta[] = [
  {
    id: 'opening',
    name: 'Opening context',
    start: 0,
    end: 9,
    narration:
      'A 130,000-person technology company is falling behind. A new CEO has taken over. The client believes the problem is strategy. One rule: no hindsight. Score the decision as if you are in the room today.',
    visualAction:
      'Eyebrow label; three context lines snap in; quiet word-fragments drift; "No hindsight" locks in amber; context compresses toward GROUND.',
    onScreen:
      'TRANSFORMATION CASELET · three context lines · No hindsight · Score the decision as if you are in the room today.',
  },
  {
    id: 'ground',
    name: 'Ground',
    start: 9,
    end: 32,
    narration:
      'It split the client’s reply into facts, opinions, and gaps. It moved the client’s instinct into "opinion," and rewrote the real problem: the culture will not let us execute any strategy. And it flagged the source — most of this comes from new leadership.',
    visualAction:
      'Statement card; phrases detach and hover; three zones appear; fragments sort into Facts / Opinions / Gaps; "Fix strategy first" lands in Opinions with an amber underline; problem statement rewrites in amber; a quiet source flag pings.',
    onScreen:
      'FACTS · OPINIONS · GAPS · CLIENT’S PROBLEM → "The culture will not let us execute any strategy." · Check your sources.',
  },
  {
    id: 'board',
    name: 'Board',
    start: 32,
    end: 57,
    narration:
      'Four options, ranked by least evidence against. It did not pick the flashiest option, and it did not pick the client’s option. It picked the root cause: change the performance system first.',
    visualAction:
      'Four cards drop in loose; heading BOARD; cards reorder like magnetic ranking; the culture campaign sinks; "Change the performance system first" rises to the top, gains a restrained amber border and reveals its reasoning; three beat-lines.',
    onScreen:
      'BOARD · Evidence against · Change the performance system first — HIGH CONFIDENCE · Root cause · Reversible.',
  },
  {
    id: 'lock',
    name: 'Lock',
    start: 57,
    end: 77,
    narration:
      'Who pays if this fails — the CPO’s credibility, and the top performers. Can we undo it? Yes. Can they recover? No. We can undo the decision. We cannot undo teaching people that leadership blinked.',
    visualAction:
      'Winner centered; consequence nodes; "Can we undo it? YES" calm; "Can they recover? NO" in amber; two-column asymmetry; six-month tripwire timeline with an amber marker; held-constant assumptions; the card locks.',
    onScreen:
      'Who pays? · Reversible for us: YES · Recoverable for them: NO · Watch top talent — first six months · We cannot undo teaching people that leadership blinked.',
  },
  {
    id: 'end',
    name: 'End card',
    start: 77,
    end: 88,
    narration:
      'Five decisions stayed human. Everything else happened while you watched.',
    visualAction:
      'Interface clears through movement; "Five decisions stayed human"; the five calls stack into a compact mark; closing line; then the Zetesis Labs brand mark draws itself in and the final frame holds.',
    onScreen:
      'Five decisions stayed human. Everything else happened while you watched. · Zetesis Labs',
  },
]

/** Total runtime of the composition, in seconds. */
export const TOTAL_DURATION = SCENES[SCENES.length - 1].end

/** Convenience lookup by id. */
export const sceneById = (id: SceneId): SceneMeta =>
  SCENES.find((s) => s.id === id)!

/** Scenes exposed as jump targets in the controls (GROUND / BOARD / LOCK). */
export const JUMP_TARGETS: SceneId[] = ['ground', 'board', 'lock']
