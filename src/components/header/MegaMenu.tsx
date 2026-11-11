import { navigation } from '../../data/navigation'
import AppLink from '../AppLink'
import { MegaMenuColumn } from './MegaMenuColumn'

type UtilityLink = { label: string; href: string }

type MegaMenuProps = {
  id: string
  open: boolean
  accordion: boolean
  openSection: string | null
  utilityLinks?: UtilityLink[]
  onToggleSection: (title: string) => void
  onClose: () => void
  onNavigate: () => void
  onMouseEnterPanel: () => void
  onMouseLeavePanel: () => void
}

export function MegaMenu({
  id,
  open,
  accordion,
  openSection,
  utilityLinks = [],
  onToggleSection,
  onClose,
  onNavigate,
  onMouseEnterPanel,
  onMouseLeavePanel,
}: MegaMenuProps) {
  return (
    <>
      <button
        type="button"
        className={`menu-backdrop ${open ? 'is-open' : ''} ${
          accordion ? 'menu-backdrop--mobile' : 'menu-backdrop--desktop'
        }`}
        aria-label="Закрыть меню"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      <div
        className={[
          'menu-clip',
          open ? 'is-open' : '',
          accordion ? 'menu-clip--mobile' : 'menu-clip--desktop',
        ]
          .filter(Boolean)
          .join(' ')}
        inert={!open ? true : undefined}
        onMouseEnter={onMouseEnterPanel}
        onMouseLeave={onMouseLeavePanel}
      >
        <div
          id={id}
          className={[
            'menu',
            open ? 'is-open' : '',
            accordion ? 'menu--mobile' : 'menu--desktop',
          ]
            .filter(Boolean)
            .join(' ')}
          role="dialog"
          aria-modal="true"
          aria-label="Главное меню"
        >
          <div className="menu__shell">
            <div
              className={
                accordion
                  ? 'menu__columns menu__columns--accordion'
                  : 'menu__columns'
              }
            >
              {navigation.map((section, index) => (
                <MegaMenuColumn
                  key={section.title}
                  section={section}
                  index={index}
                  accordion={accordion}
                  open={!accordion || openSection === section.title}
                  onToggle={() => onToggleSection(section.title)}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {accordion && utilityLinks.length > 0 ? (
              <nav className="menu__mobile-utils" aria-label="Дополнительно">
                {utilityLinks.map((item) => (
                  <AppLink
                    key={item.href}
                    to={item.href}
                    className="menu__mobile-util"
                    onClick={onNavigate}
                  >
                    {item.label}
                  </AppLink>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
