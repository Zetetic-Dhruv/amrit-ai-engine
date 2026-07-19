import './components.css'

/** Small editorial heading used at the top of BOARD / LOCK moments. */
export function SceneHeading({
  label,
  sub,
  className = '',
}: {
  label: string
  sub?: string
  className?: string
}) {
  return (
    <div className={`scene-heading ${className}`}>
      <div className="scene-heading__label category-label" data-anim>
        {label}
      </div>
      {sub && (
        <div className="scene-heading__sub" data-anim>
          {sub}
        </div>
      )}
    </div>
  )
}
