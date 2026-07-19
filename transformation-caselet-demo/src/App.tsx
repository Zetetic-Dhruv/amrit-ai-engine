import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

import { OpeningScene } from './scenes/OpeningScene'
import { GroundScene } from './scenes/GroundScene'
import { BoardScene } from './scenes/BoardScene'
import { LockScene } from './scenes/LockScene'
import { EndScene } from './scenes/EndScene'

import { Controls } from './components/Controls'
import { ProgressBar } from './components/ProgressBar'

import { buildMasterTimeline } from './animation/masterTimeline'
import { attachNarration, type Narration } from './audio/narration'
import { SCENES, TOTAL_DURATION, JUMP_TARGETS, type SceneId } from './data/timeline'

const JUMP_META = JUMP_TARGETS.map((id) => ({
  id,
  label: SCENES.find((s) => s.id === id)!.name.toUpperCase(),
}))

/** Which scene a given time belongs to. */
function sceneAt(time: number): SceneId {
  for (const s of SCENES) if (time >= s.start && time < s.end) return s.id
  return SCENES[SCENES.length - 1].id
}

export default function App() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const narrationRef = useRef<Narration | null>(null)

  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [activeScene, setActiveScene] = useState<SceneId>('opening')

  const [muted, setMuted] = useState(true)
  const [recording, setRecording] = useState(false)
  const [hideLock, setHideLock] = useState(false)
  const [activity, setActivity] = useState(true)
  const [recHint, setRecHint] = useState(false)

  const controlsVisible = !recording && !hideLock && activity

  /* ---- Build the master timeline once ---- */
  useLayoutEffect(() => {
    const camera = cameraRef.current!
    const ctx = gsap.context(() => {
      const tl = buildMasterTimeline(camera)
      tlRef.current = tl
      narrationRef.current = attachNarration()
      narrationRef.current.setMuted(true)

      tl.eventCallback('onUpdate', () => {
        const t = tl.time()
        setProgress(t / TOTAL_DURATION)
        setActiveScene(sceneAt(t))
        narrationRef.current?.sync(t, tl.isActive())
      })
      tl.eventCallback('onComplete', () => setIsPlaying(false))

      // Dev-only handle for frame-accurate inspection / QA.
      if (import.meta.env.DEV) {
        ;(window as unknown as { __tl?: gsap.core.Timeline }).__tl = tl
      }

      tl.play()
    }, camera)

    return () => {
      narrationRef.current?.dispose()
      ctx.revert()
    }
  }, [])

  /* ---- Fit the fixed 1920×1080 stage into the viewport ---- */
  useLayoutEffect(() => {
    const fit = () => {
      const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
      if (stageRef.current) stageRef.current.style.transform = `scale(${scale})`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  /* ---- Transport ---- */
  const play = useCallback(() => {
    const tl = tlRef.current
    if (!tl) return
    if (tl.progress() >= 1) tl.restart()
    else tl.play()
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    const tl = tlRef.current
    if (!tl) return
    tl.pause()
    narrationRef.current?.sync(tl.time(), false)
    setIsPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, play, pause])

  const restart = useCallback(() => {
    tlRef.current?.restart()
    setIsPlaying(true)
  }, [])

  const jump = useCallback((id: SceneId) => {
    tlRef.current?.play(id)
    setIsPlaying(true)
  }, [])

  const fullscreen = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m
      narrationRef.current?.setMuted(next)
      return next
    })
  }, [])

  const toggleRecording = useCallback(() => {
    setRecording((r) => {
      const next = !r
      if (next) {
        tlRef.current?.restart()
        setIsPlaying(true)
        setRecHint(true)
        window.setTimeout(() => setRecHint(false), 3200)
      }
      return next
    })
  }, [])

  /* ---- Keyboard ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'r':
        case 'R':
          restart()
          break
        case 'f':
        case 'F':
          fullscreen()
          break
        case '1':
          jump('ground')
          break
        case '2':
          jump('board')
          break
        case '3':
          jump('lock')
          break
        case 'h':
        case 'H':
          setHideLock((v) => !v)
          break
        case 'Escape':
          if (recording) setRecording(false)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, restart, fullscreen, jump, recording])

  /* ---- Controls auto-show on activity (when not recording) ---- */
  useEffect(() => {
    let timer: number | undefined
    const onMove = () => {
      setActivity(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setActivity(false), 2600)
    }
    const el = viewportRef.current
    el?.addEventListener('mousemove', onMove)
    // auto-hide shortly after load
    timer = window.setTimeout(() => setActivity(false), 2600)
    return () => {
      el?.removeEventListener('mousemove', onMove)
      window.clearTimeout(timer)
    }
  }, [])

  /* ---- Recording mode: hide cursor after 2s of stillness ---- */
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    if (!recording) {
      el.classList.remove('cursor-hidden')
      return
    }
    let timer: number | undefined
    const hide = () => el.classList.add('cursor-hidden')
    const onMove = () => {
      el.classList.remove('cursor-hidden')
      window.clearTimeout(timer)
      timer = window.setTimeout(hide, 2000)
    }
    el.addEventListener('mousemove', onMove)
    timer = window.setTimeout(hide, 2000)
    return () => {
      el.removeEventListener('mousemove', onMove)
      window.clearTimeout(timer)
      el.classList.remove('cursor-hidden')
    }
  }, [recording])

  return (
    <div className="viewport" ref={viewportRef}>
      <div className="stage" ref={stageRef}>
        <div className="camera" ref={cameraRef}>
          <OpeningScene />
          <GroundScene />
          <BoardScene />
          <LockScene />
          <EndScene />
        </div>

        <ProgressBar progress={progress} visible={controlsVisible} />

        <div className={`rec-hint${recHint ? ' rec-hint--show' : ''}`}>
          Recording mode · press Esc to exit
        </div>

        <Controls
          isPlaying={isPlaying}
          muted={muted}
          recording={recording}
          visible={controlsVisible}
          activeScene={activeScene}
          jumpTargets={JUMP_META}
          onPlayPause={togglePlay}
          onRestart={restart}
          onJump={jump}
          onFullscreen={fullscreen}
          onToggleMute={toggleMute}
          onToggleRecording={toggleRecording}
        />
      </div>
    </div>
  )
}
