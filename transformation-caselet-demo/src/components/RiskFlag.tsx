import { Flag } from 'lucide-react'
import './components.css'

/**
 * A quiet analytical flag — not a dramatic error state.
 * Used in GROUND for the source-bias warning.
 */
export function RiskFlag({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="risk-flag" data-anim>
      <span className="risk-flag__icon">
        <Flag size={18} strokeWidth={2} />
      </span>
      <div className="risk-flag__body">
        <div className="risk-flag__title">{title}</div>
        <div className="risk-flag__sub">{sub}</div>
      </div>
    </div>
  )
}
