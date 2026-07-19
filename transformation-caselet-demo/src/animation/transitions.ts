/* ============================================================
   MOTION VOCABULARY
   Shared easings, durations, and helpers so every scene moves
   with the same analytical, "inevitable" feeling.
   ============================================================ */

import { gsap } from 'gsap'

/** Scoped selector: returns HTMLElement[] for a selector under root. */
export type Q = (selector: string) => HTMLElement[]

export const makeQ = (root: HTMLElement): Q => {
  const sel = gsap.utils.selector(root)
  return (s: string) => sel(s) as HTMLElement[]
}

/** Easing — fast in, controlled settle. Never bouncy. */
export const EASE = {
  snap: 'power4.out',
  slide: 'power3.out',
  settle: 'expo.out',
  move: 'power2.inOut',
  out: 'power2.in',
} as const

/** Durations (seconds) — kept short; motion, not fades. */
export const DUR = {
  quick: 0.4,
  base: 0.6,
  slide: 0.8,
  settle: 1.0,
  hold: 0.6,
} as const
