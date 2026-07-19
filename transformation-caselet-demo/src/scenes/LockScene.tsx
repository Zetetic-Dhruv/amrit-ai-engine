import { lock } from '../data/caseData'
import { TimelineMarker } from '../components/TimelineMarker'
import { RichText } from '../components/RichText'
import './scenes.css'

export function LockScene() {
  return (
    <section className="scene scene--lock" data-scene="lock">
      {/* Selected recommendation, centered, with locking brackets */}
      <div className="lk-winner lk-dimmable" data-anim>
        <span className="lk-bracket lk-bracket--tl" data-lock-bracket />
        <span className="lk-bracket lk-bracket--tr" data-lock-bracket />
        <span className="lk-bracket lk-bracket--bl" data-lock-bracket />
        <span className="lk-bracket lk-bracket--br" data-lock-bracket />
        <div className="lk-winner__label category-label" data-anim>
          Working recommendation
        </div>
        <h2 className="lk-winner__title" data-anim>
          {lock.title}
        </h2>
        <p className="lk-winner__reason" data-anim>
          {lock.reason}
        </p>
      </div>

      {/* Who pays — consequence nodes */}
      <div className="lk-pay">
        <p className="lk-q" data-anim data-pay-q>
          {lock.payQuestion}
        </p>
        <div className="lk-nodes">
          {lock.payNodes.map((n, i) => (
            <div className="lk-node" data-anim data-node={i} key={i}>
              {n}
            </div>
          ))}
        </div>
      </div>

      {/* Reversible for us / Recoverable for them */}
      <div className="lk-asym">
        <div className="lk-asym__col lk-asym__col--left lk-dimmable" data-anim>
          <p className="lk-asym__q">{lock.undoQuestion}</p>
          <p className="lk-asym__value lk-asym__value--calm">
            {lock.undoAnswer}
          </p>
          <p className="lk-asym__sub">{lock.undoSub}</p>
        </div>

        <div className="lk-asym__divider lk-dimmable" data-anim />

        <div className="lk-asym__col lk-asym__col--right" data-anim>
          <p className="lk-asym__q">{lock.recoverQuestion}</p>
          <p className="lk-asym__value lk-asym__value--amber">
            {lock.recoverAnswer}
          </p>
          <p className="lk-asym__sub lk-asym__sub--focal">{lock.recoverSub}</p>
        </div>
      </div>

      {/* Six-month monitoring tripwire */}
      <div className="lk-tripwire lk-dimmable">
        <div className="lk-tripwire__tag category-label" data-anim>
          {lock.tripwireLabel}
        </div>
        <TimelineMarker
          start={lock.tripwireStart}
          end={lock.tripwireEnd}
          marker={lock.tripwireMarker}
          sub={lock.tripwireSub}
        />
      </div>

      {/* Held constant — model assumptions */}
      <div className="lk-held lk-dimmable" data-anim>
        <div className="lk-held__label category-label">
          {lock.heldConstantLabel}
        </div>
        <ul className="lk-held__list">
          {lock.heldConstant.map((h, i) => (
            <li className="lk-held__item" data-held={i} key={i}>
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* Final lock lines */}
      <div className="lk-locklines" data-anim>
        <p className="lk-lockline" data-lockline={0}>
          {lock.lockLineA}
        </p>
        <p className="lk-lockline lk-lockline--strong" data-lockline={1}>
          <RichText text={lock.lockLineB} />
        </p>
      </div>
    </section>
  )
}
