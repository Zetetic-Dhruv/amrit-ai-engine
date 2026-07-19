import './components.css'

/** A destination zone in GROUND: FACTS / OPINIONS / GAPS. */
export function CategoryColumn({ id, label }: { id: string; label: string }) {
  return (
    <div className="category-column" data-zone={id} data-anim>
      <div className="category-column__head">
        <span className="category-column__label category-label">{label}</span>
        <span className="category-column__rule" />
      </div>
      {/* Fragments are portalled here visually by the timeline (absolute
          positioning), so the column itself only draws the frame. */}
      <div className="category-column__body" data-zone-body={id} />
    </div>
  )
}
