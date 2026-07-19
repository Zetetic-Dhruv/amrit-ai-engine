import { opening } from '../data/caseData'
import './scenes.css'

/** Deterministic scatter positions for the quiet ambient words. */
const WORD_POS = [
  { top: '18%', left: '12%' },
  { top: '26%', left: '78%' },
  { top: '70%', left: '16%' },
  { top: '76%', left: '72%' },
  { top: '40%', left: '6%' },
  { top: '58%', left: '88%' },
  { top: '15%', left: '52%' },
  { top: '82%', left: '44%' },
]

export function OpeningScene() {
  return (
    <section className="scene scene--opening" data-scene="opening">
      {/* Quiet drifting fragments behind the type */}
      <div className="op-words" aria-hidden>
        {opening.ambientWords.map((w, i) => (
          <span
            key={w}
            className="op-word"
            data-anim
            style={WORD_POS[i % WORD_POS.length]}
          >
            {w}
          </span>
        ))}
      </div>

      <div className="op-center">
        <div className="op-eyebrow eyebrow" data-anim>
          {opening.eyebrow}
        </div>

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
