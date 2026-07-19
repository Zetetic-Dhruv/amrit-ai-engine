import { SCENES, TOTAL_DURATION } from '../data/timeline'
import './controls.css'

/** Thin, unobtrusive progress indicator with quiet scene ticks. */
export function ProgressBar({
  progress,
  visible,
}: {
  progress: number // 0..1
  visible: boolean
}) {
  return (
    <div className={`progress${visible ? ' progress--visible' : ''}`}>
      <div className="progress__track">
        <div className="progress__fill" style={{ transform: `scaleX(${progress})` }} />
        {SCENES.slice(1).map((s) => (
          <span
            key={s.id}
            className="progress__tick"
            style={{ left: `${(s.start / TOTAL_DURATION) * 100}%` }}
          />
        ))}
      </div>
    </div>
  )
}
