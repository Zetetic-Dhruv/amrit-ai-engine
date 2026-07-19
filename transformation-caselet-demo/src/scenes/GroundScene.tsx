import { ground } from '../data/caseData'
import { CategoryColumn } from '../components/CategoryColumn'
import { RiskFlag } from '../components/RiskFlag'
import { RichText } from '../components/RichText'
import './scenes.css'

export function GroundScene() {
  return (
    <section className="scene scene--ground" data-scene="ground">
      {/* Phase A — the client's raw statement */}
      <div className="gr-statement" data-anim>
        <div className="gr-statement__tag category-label" data-anim>
          Client’s reply
        </div>
        {ground.statement.map((line, i) => (
          <p className="gr-stmt-line" data-stmt-line={i} key={i}>
            {line}
          </p>
        ))}
      </div>

      {/* Phase C — destination zones */}
      <div className="gr-columns">
        {ground.zones.map((z) => (
          <div className="gr-col-slot" data-col-slot={z.id} key={z.id}>
            <CategoryColumn id={z.id} label={z.label} />
          </div>
        ))}
      </div>

      {/* Phase B — the detached fragments (positioned by the timeline) */}
      <div className="gr-field" aria-hidden>
        {ground.fragments.map((f) => (
          <div
            className={`gr-frag${f.focal ? ' gr-frag--focal' : ''}`}
            data-frag={f.id}
            data-zone={f.zone}
            key={f.id}
          >
            {f.text}
            <span className="gr-frag__underline" data-frag-underline />
          </div>
        ))}
      </div>

      {/* Phase D — the rewritten problem */}
      <div className="gr-problem" data-anim>
        <div className="gr-problem__label category-label">
          {ground.problemLabel}
        </div>
        <div className="gr-problem__before" data-problem-before>
          <span className="gr-problem__before-text">{ground.problemBefore}</span>
          <span className="gr-problem__strike" data-problem-strike />
        </div>
        <div className="gr-problem__after" data-problem-after>
          <RichText text={ground.problemAfter} />
        </div>
      </div>

      {/* Phase E — quiet source flag */}
      <div className="gr-flag">
        <RiskFlag title={ground.flagTitle} sub={ground.flagSub} />
      </div>
    </section>
  )
}
