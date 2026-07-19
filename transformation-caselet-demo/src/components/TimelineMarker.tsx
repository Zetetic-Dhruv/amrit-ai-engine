import './components.css'

/**
 * The six-month monitoring tripwire in LOCK.
 * A clean horizontal timeline with a single amber marker.
 */
export function TimelineMarker({
  start,
  end,
  marker,
  sub,
}: {
  start: string
  end: string
  marker: string
  sub: string
}) {
  return (
    <div className="tripwire" data-anim>
      <div className="tripwire__track">
        <span className="tripwire__label tripwire__label--start">{start}</span>
        <span className="tripwire__line" data-tripwire-line />
        <span className="tripwire__dot" data-tripwire-dot>
          <span className="tripwire__flag">
            <span className="tripwire__marker">{marker}</span>
            <span className="tripwire__sub">{sub}</span>
          </span>
        </span>
        <span className="tripwire__label tripwire__label--end">{end}</span>
      </div>
    </div>
  )
}
