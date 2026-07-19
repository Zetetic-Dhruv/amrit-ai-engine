import { Fragment, type ReactNode } from 'react'

/**
 * Renders a string where **double-asterisk** spans become amber.
 * Keeps the "amber is meaningful" rule editable from the content file.
 */
export function RichText({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span key={i} className="amber">
              {part.slice(2, -2)}
            </span>
          )
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}
