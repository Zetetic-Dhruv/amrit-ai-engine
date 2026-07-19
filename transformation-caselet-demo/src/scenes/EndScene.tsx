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

      {/* Closing brand wordmark. */}
      <div className="en-logo">
        <span className="en-logo__word">Zetesis Labs</span>
      </div>
    </section>
  )
}
