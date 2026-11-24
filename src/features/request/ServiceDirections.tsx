import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import {
  keepDirections,
  type ServiceAudience,
  serviceDirections,
  serviceDirectionsCopy as copy,
} from '../../data/request-page'
import './ServiceDirections.css'

type Props = {
  audience: ServiceAudience
  value: string[]
  onChange: (next: string[]) => void
  /** Переключатель аудитории: в записи есть, в запросе специалиста — нет */
  onAudienceChange?: (next: ServiceAudience) => void
}

/**
 * «Что вам нужно?» — общий блок запроса и записи, несколько пунктов.
 * Свёрнут в поле с выбранным; по нажатию раскрывается шторка со списком.
 */
export function ServiceDirections({ audience, value, onChange, onAudienceChange }: Props) {
  const baseId = useId()
  const [open, setOpen] = useState(false)
  const group = serviceDirections[audience]
  const panelId = `${baseId}-panel`
  const labelId = `${baseId}-label`

  function toggle(label: string) {
    const next = value.includes(label) ? value.filter((item) => item !== label) : [...value, label]
    onChange(keepDirections(audience, next))
  }

  return (
    <div className={['service-directions', open ? 'is-open' : ''].filter(Boolean).join(' ')}>
      <span id={labelId} className="service-directions__legend">
        {copy.legend}
      </span>

      <button
        type="button"
        className={['service-directions__trigger', value.length ? 'has-value' : '']
          .filter(Boolean)
          .join(' ')}
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby={`${labelId} ${baseId}-value`}
        onClick={() => setOpen((current) => !current)}
      >
        <span id={`${baseId}-value`} className="service-directions__value">
          {value.length ? value.join(', ') : copy.placeholder}
        </span>
        <ChevronDown
          className="service-directions__chevron"
          size={18}
          strokeWidth={1.25}
          aria-hidden="true"
        />
      </button>

      {/* шторка: высота анимируется через grid-template-rows 0fr → 1fr */}
      <div id={panelId} className="service-directions__drawer" inert={!open || undefined}>
        <div className="service-directions__inner">
          <fieldset className="service-directions__body" aria-labelledby={labelId}>
            {onAudienceChange ? (
              <div className="service-directions__audience">
                {(Object.keys(serviceDirections) as ServiceAudience[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={audience === key}
                    className={audience === key ? 'is-active' : undefined}
                    onClick={() => onAudienceChange(key)}
                  >
                    {serviceDirections[key].title}
                  </button>
                ))}
              </div>
            ) : null}

            <p className="service-directions__hint">{copy.hint}</p>

            <ul className="service-directions__list">
              {group.items.map((item) => (
                <li key={item.label}>
                  <label className="service-directions__item">
                    <input
                      type="checkbox"
                      checked={value.includes(item.label)}
                      onChange={() => toggle(item.label)}
                    />
                    <span className="service-directions__text">
                      <span className="service-directions__label">{item.label}</span>
                      <span className="service-directions__desc">{item.hint}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
      </div>
    </div>
  )
}
