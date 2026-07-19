import { board } from '../data/caseData'
import { OptionCard } from '../components/OptionCard'
import { SceneHeading } from '../components/SceneHeading'
import './scenes.css'

export function BoardScene() {
  return (
    <section className="scene scene--board" data-scene="board">
      <div className="bd-heading" data-anim>
        <SceneHeading label={board.heading} sub={board.question} />
      </div>

      <div className="bd-cards">
        {board.options.map((o) => (
          <OptionCard
            key={o.id}
            id={o.id}
            title={o.title}
            against={o.against}
            level={o.level}
            reason={o.reason}
            winner={'winner' in o && o.winner}
            status={'winner' in o && o.winner ? board.winnerStatus : undefined}
            pills={'winner' in o && o.winner ? board.winnerPills : []}
          />
        ))}
      </div>

      <div className="bd-beats">
        {board.beats.map((b, i) => (
          <p className="bd-beat" data-anim data-beat={i} key={i}>
            {b}
          </p>
        ))}
      </div>
    </section>
  )
}
