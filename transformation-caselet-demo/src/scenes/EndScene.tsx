import { end } from '../data/caseData'
import './scenes.css'

export function EndScene() {
  return (
    <section className="scene scene--end" data-scene="end">
      <h2 className="en-headline" data-anim>
        Five decisions <span className="amber">stayed human.</span>
      </h2>

      {/* The five human calls — briefly listed, then compressed away */}
      <ul className="en-decisions">
        {end.decisions.map((d, i) => (
          <li className="en-decision" data-decision={i} key={i}>
            <span className="en-decision__dot" />
            {d}
          </li>
        ))}
      </ul>

      <div className="en-closing-wrap" data-anim>
        <p className="en-closing">{end.closing}</p>
        <p className="en-sub">{end.closingSub}</p>
      </div>

      {/* Closing brand mark — a calligraphic stroke that draws itself in,
          then the wordmark. */}
      <div className="en-logo">
        <svg
          className="en-logo__mark"
          viewBox="0 0 172 104"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="en-logo__stroke"
            d="M12,70 C34,40 60,34 63,55 C65,71 44,72 44,55 C44,31 79,33 100,38 C126,44 146,45 162,35 C140,55 118,60 120,76 C122,91 143,88 160,78"
          />
          <circle className="en-logo__dot" cx="70" cy="20" r="4.5" />
        </svg>
        <span className="en-logo__word">Zetesis Labs</span>
      </div>
    </section>
  )
}
