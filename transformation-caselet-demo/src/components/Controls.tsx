import {
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Volume2,
  VolumeX,
  Clapperboard,
} from 'lucide-react'
import type { SceneId } from '../data/timeline'
import './controls.css'

export interface ControlsProps {
  isPlaying: boolean
  muted: boolean
  recording: boolean
  visible: boolean
  activeScene: SceneId
  jumpTargets: { id: SceneId; label: string }[]
  onPlayPause: () => void
  onRestart: () => void
  onJump: (id: SceneId) => void
  onFullscreen: () => void
  onToggleMute: () => void
  onToggleRecording: () => void
}

export function Controls(props: ControlsProps) {
  const {
    isPlaying,
    muted,
    recording,
    visible,
    activeScene,
    jumpTargets,
    onPlayPause,
    onRestart,
    onJump,
    onFullscreen,
    onToggleMute,
    onToggleRecording,
  } = props

  return (
    <div className={`controls${visible ? ' controls--visible' : ''}`}>
      <div className="controls__group">
        <button className="ctl" onClick={onPlayPause} title={isPlaying ? 'Pause (Space)' : 'Play (Space)'} aria-label="Play or pause">
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button className="ctl" onClick={onRestart} title="Restart (R)" aria-label="Restart">
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="controls__group controls__jumps">
        {jumpTargets.map((t, i) => (
          <button
            key={t.id}
            className={`ctl ctl--jump${activeScene === t.id ? ' is-active' : ''}`}
            onClick={() => onJump(t.id)}
            title={`Jump to ${t.label} (${i + 1})`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="controls__group">
        <button className="ctl" onClick={onToggleMute} title="Mute / unmute" aria-label="Mute or unmute">
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button
          className={`ctl${recording ? ' is-active' : ''}`}
          onClick={onToggleRecording}
          title="Recording mode — hides controls & cursor (toggle from keyboard: H hides controls)"
          aria-label="Toggle recording mode"
        >
          <Clapperboard size={18} />
        </button>
        <button className="ctl" onClick={onFullscreen} title="Fullscreen (F)" aria-label="Fullscreen">
          <Maximize size={18} />
        </button>
      </div>
    </div>
  )
}
