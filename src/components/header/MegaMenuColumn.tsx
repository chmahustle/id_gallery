import { type CSSProperties } from 'react'
import { featureFlags } from '../../data/featureFlags'
import type { NavLink, NavSection } from '../../types'
import AppLink from '../AppLink'

type MegaMenuColumnProps = {
  section: NavSection
  onNavigate?: () => void
  accordion?: boolean
  open?: boolean
  onToggle?: () => void
  index?: number
}

function visibleOnly(links: NavLink[]) {
  return links.filter((link) => !link.flag || featureFlags[link.flag] === true)
}

export function MegaMenuColumn({
  section,
  onNavigate,
  accordion = false,
  open = true,
  onToggle,
  index = 0,
}: MegaMenuColumnProps) {
  const panelId = `mega-col-${section.title.replace(/\s+/g, '-').toLowerCase()}`
  const links = visibleOnly(section.links)

  const titleNode = section.href ? (
    <AppLink
      to={section.href}
      className="menu__col-title menu__col-title--link"
      onClick={onNavigate}
    >
      {section.title}
    </AppLink>
  ) : (
    <p className="menu__col-title">{section.title}</p>
  )

  /* фото в колонке — только если есть реальное изображение */
  const media = section.image ? (
    <span className="menu__col-media">
      <img
        className="menu__col-photo"
        src={section.image}
        alt=""
        width={277}
        height={190}
      />
    </span>
  ) : null

  const renderLinks = (items: NavLink[], key: string) => (
    <ul className="menu__col-links">
      {items.map((link) => (
        <li key={`${key}-${link.href}-${link.label}`}>
          <AppLink to={link.href} onClick={onNavigate}>
            {link.label}
          </AppLink>
        </li>
      ))}
    </ul>
  )

  const linkList = (
    <>
      {renderLinks(links, section.title)}
      {section.subgroups?.map((group) => (
        <div className="menu__subgroup" key={group.title}>
          <p className="menu__subgroup-title">{group.title}</p>
          {renderLinks(visibleOnly(group.links), group.title)}
        </div>
      ))}
    </>
  )

  if (accordion) {
    return (
      <div
        className={`menu__col menu__col--accordion ${open ? 'is-open' : ''}`}
      >
        <button
          type="button"
          className="menu__acc-trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{section.title}</span>
          <span className="menu__acc-mark" aria-hidden="true">
            {open ? '−' : '+'}
          </span>
        </button>
        <div
          id={panelId}
          className="menu__acc-panel"
          role="region"
          aria-hidden={!open}
        >
          <div className="menu__acc-panel-inner">
            {media}
            {linkList}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="menu__col"
      style={{ ['--menu-col-i' as string]: index } as CSSProperties}
    >
      {media}
      {titleNode}
      {linkList}
    </div>
  )
}
