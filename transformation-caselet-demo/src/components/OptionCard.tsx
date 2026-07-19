import './components.css'

type Level = 'low' | 'moderate' | 'high'

/** How many friction ticks are filled for each evidence-against level. */
const TICKS: Record<Level, number> = { low: 1, moderate: 2, high: 3 }

/**
 * A BOARD recommendation card.
 * The reasoning line is present but hidden (data-reason) until the
 * timeline unrolls it. Amber is applied to the winner via a class the
 * timeline adds — never on ordinary cards.
 */
export function OptionCard({
  id,
  title,
  against,
  level,
  reason,
  winner = false,
  status,
  pills = [],
}: {
  id: string
  title: string
  against: string
  level: Level
  reason: string
  winner?: boolean
  status?: string
  pills?: readonly string[]
}) {
  const filled = TICKS[level]
  return (
    <div
      className={`option-card${winner ? ' option-card--winner' : ''}`}
      data-option={id}
      data-anim
    >
      <div className="option-card__top">
        <h3 className="option-card__title">{title}</h3>
      </div>

      <div className="option-card__evidence">
        <span className="option-card__evidence-label category-label">
          Evidence against
        </span>
        <span className="option-card__ticks" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`tick${i < filled ? ' tick--on' : ''}`}
            />
          ))}
        </span>
        <span className="option-card__against">{against}</span>
      </div>

      {/* Progressive reveal target */}
      <div className="option-card__reason" data-reason>
        {reason}
      </div>

      {(status || pills.length > 0) && (
        <div className="option-card__meta" data-meta>
          {status && <span className="option-card__status">{status}</span>}
          <span className="option-card__pills">
            {pills.map((p) => (
              <span className="pill" key={p}>
                {p}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  )
}
