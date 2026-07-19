import { opening } from '../data/caseData'
import './scenes.css'

export function OpeningScene() {
  return (
    <section className="scene scene--opening" data-scene="opening">
      <div className="op-center">
        <div className="op-lines">
          {opening.lines.map((line, i) => (
            <p className="op-line" data-anim data-op-line={i} key={i}>
              {line}
            </p>
          ))}
        </div>

        <div className="op-rule">
          <p className="op-rule__main" data-anim>
            <span className="amber">{opening.rule}</span>
          </p>
          <p className="op-rule__sub" data-anim>
            {opening.ruleSub}
          </p>
        </div>
      </div>
    </section>
  )
}
