import type { ShowroomEntry } from '../../types'
import { formatShowroomHeading } from '../../lib/showrooms'

type ShowroomHeadingProps = {
  item: ShowroomEntry
}

/** Разбор «[слово]» → серые скобки + Warm Black слово; approved — plain. */
function BracketLabel({ text }: { text: string }) {
  const match = text.match(/^\[(.*)\]$/)
  if (!match) {
    return <span>{text}</span>
  }
  return (
    <>
      <span className="showrooms-page__bracket">[</span>
      <span className="showrooms-page__bracket-word">{match[1]}</span>
      <span className="showrooms-page__bracket">]</span>
    </>
  )
}

export function ShowroomHeading({ item }: ShowroomHeadingProps) {
  if (item.status === 'approved') {
    return (
      <h3 className="showrooms-page__row-title">
        {formatShowroomHeading(item)}
      </h3>
    )
  }

  return (
    <h3 className="showrooms-page__row-title">
      <BracketLabel text={item.name} />
      <span className="showrooms-page__bracket-word"> · </span>
      <BracketLabel text={item.city} />
    </h3>
  )
}
