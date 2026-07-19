/* ============================================================
   NARRATION HOOK  (optional — audio is NOT required to run)
   ------------------------------------------------------------
   The film is timed to read correctly with NO audio. When you
   are ready to add a voiceover, drop an MP3 at:

       src/audio/narration.mp3

   …then set NARRATION_SRC below and pass the master timeline to
   attachNarration(). The audio element is kept in lock-step with
   the timeline: play/pause/seek/restart on the timeline drive the
   audio, so a single voiceover track stays in sync with the
   visuals. No speech is synthesized; you supply the file.

   Recommended: record narration against src/data/timeline.ts,
   where each scene lists its intended narration and timing.
   ============================================================ */

/** Set to an imported MP3 to enable narration, e.g.:
 *    import narrationMp3 from './narration.mp3'
 *    export const NARRATION_SRC = narrationMp3
 *  Leave null to run silently. */
export const NARRATION_SRC: string | null = null

export interface Narration {
  audio: HTMLAudioElement | null
  setMuted: (m: boolean) => void
  /** Keep the track aligned to the timeline. Call on play/pause/seek
   *  and on each timeline update. `playing` mirrors timeline state. */
  sync: (time: number, playing: boolean) => void
  dispose: () => void
}

/**
 * Binds an <audio> element that the App keeps in lock-step with the
 * master timeline. Safe no-op when NARRATION_SRC is null.
 */
export function attachNarration(): Narration {
  if (!NARRATION_SRC) {
    return { audio: null, setMuted: () => {}, sync: () => {}, dispose: () => {} }
  }

  const audio = new Audio(NARRATION_SRC)
  audio.preload = 'auto'

  return {
    audio,
    setMuted: (m: boolean) => {
      audio.muted = m
    },
    sync: (time: number, playing: boolean) => {
      if (Math.abs(audio.currentTime - time) > 0.12) audio.currentTime = time
      if (playing && audio.paused) void audio.play().catch(() => {})
      if (!playing && !audio.paused) audio.pause()
    },
    dispose: () => audio.pause(),
  }
}
