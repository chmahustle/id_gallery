import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CategoryCard } from '../components/catalog/CategoryCard'
import {
  Breadcrumbs,
  Button,
  Container,
  Field,
  Heading,
  Input,
  Label,
  Section,
  TextLink,
} from '../components/ui'
import { categories } from '../data/categories'

type Measure = {
  height: string
  fontSize: string
  padding: string
}

function MeasuredButton({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [m, setM] = useState<Measure | null>(null)

  useEffect(() => {
    const el = wrapRef.current?.querySelector('.ui-btn') as HTMLElement | null
    if (!el) return
    const cs = getComputedStyle(el)
    setM({
      height: cs.height,
      fontSize: cs.fontSize,
      padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
    })
  }, [])

  return (
    <div ref={wrapRef} className="flex flex-col gap-2">
      {children}
      <p className="font-body text-caption font-light text-text-muted">
        {label}
        {m
          ? ` — height ${m.height}, font-size ${m.fontSize}, padding ${m.padding}`
          : ''}
      </p>
    </div>
  )
}

export function DevUi() {
  const [email, setEmail] = useState('')
  const [showError, setShowError] = useState(false)
  const sampleCategory = categories[0]

  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      <Container className="py-12">
        <Heading level={1}>UI kit</Heading>
        <p className="mt-3 max-w-2xl font-body text-body-lg font-light text-text-secondary">
          Страница только для разработки: токены и состояния компонентов.
        </p>

        <Section compact>
          <Heading level={2}>CategoryCard</Heading>
          <p className="mt-2 max-w-xl font-body text-sm font-light text-text-secondary">
            Не подключать на продакшен-страницы до решения заказчика.
          </p>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {sampleCategory ? (
              <>
                <CategoryCard category={sampleCategory} />
                <CategoryCard
                  category={sampleCategory}
                  image="/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg"
                />
              </>
            ) : null}
          </div>
        </Section>

        <Section compact>
          <Heading level={2}>Breadcrumbs</Heading>
          <div className="mt-4">
            <Breadcrumbs
              items={[
                { label: 'Главная', to: '/' },
                { label: 'Каталог', to: '/catalog' },
                { label: 'Диван Tresor' },
              ]}
            />
          </div>
        </Section>

        <Section compact>
          <Heading level={2}>Heading</Heading>
          <div className="mt-4 space-y-3">
            <Heading level={1}>Заголовок H1</Heading>
            <Heading level={2}>Заголовок H2</Heading>
            <Heading level={3}>Заголовок H3</Heading>
            <Heading level={2} as="p">
              H2-стиль на теге p
            </Heading>
          </div>
        </Section>

        <Section compact>
          <Heading level={2}>Label / TextLink</Heading>
          <div className="mt-4 flex flex-col gap-3">
            <Label>Подпись поля</Label>
            <TextLink to="/catalog" arrow>
              В каталог
            </TextLink>
            <TextLink href="https://example.com" arrow>
              Внешняя ссылка
            </TextLink>
          </div>
        </Section>

        <Section compact>
          <Heading level={2}>Button — светлый фон</Heading>
          <div className="mt-4 flex flex-wrap items-start gap-6">
            <MeasuredButton label="primary">
              <Button variant="primary">Primary</Button>
            </MeasuredButton>
            <MeasuredButton label="primary + arrow">
              <Button variant="primary" withArrow>
                Primary
              </Button>
            </MeasuredButton>
            <MeasuredButton label="secondary">
              <Button variant="secondary">Secondary</Button>
            </MeasuredButton>
            <MeasuredButton label="secondary + arrow">
              <Button variant="secondary" withArrow>
                Secondary
              </Button>
            </MeasuredButton>
            <MeasuredButton label="link">
              <Button variant="link" as="link" to="/catalog">
                Link
              </Button>
            </MeasuredButton>
            <MeasuredButton label="link subtle">
              <Button variant="link" subtle as="link" to="/catalog">
                Link subtle
              </Button>
            </MeasuredButton>
            <MeasuredButton label="disabled">
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </MeasuredButton>
            <MeasuredButton label="as anchor">
              <Button as="a" href="#field" variant="secondary">
                As anchor
              </Button>
            </MeasuredButton>
          </div>
          <p className="mt-4 font-body text-sm font-light text-text-secondary">
            Hover / focus / active — проверить в браузере (focus-visible: Tab).
          </p>
        </Section>

        <Section compact>
          <Heading level={2}>Button — тёмный фон</Heading>
          <div className="mt-4 bg-ink p-8 text-ivory">
            <div className="flex flex-wrap items-start gap-6">
              <MeasuredButton label="inverse">
                <Button variant="inverse">Inverse</Button>
              </MeasuredButton>
              <MeasuredButton label="inverse + arrow">
                <Button variant="inverse" withArrow>
                  Inverse
                </Button>
              </MeasuredButton>
              <MeasuredButton label="primary on dark">
                <Button variant="primary">Primary</Button>
              </MeasuredButton>
              <MeasuredButton label="link on dark">
                <Button variant="link" as="a" href="#field">
                  Link
                </Button>
              </MeasuredButton>
              <MeasuredButton label="disabled inverse">
                <Button variant="inverse" disabled>
                  Disabled
                </Button>
              </MeasuredButton>
            </div>
          </div>
        </Section>

        <Section compact id="field">
          <Heading level={2}>Field / Input</Heading>
          <div className="mt-4 grid max-w-md gap-6">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="name@studio.kz"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="С ошибкой"
              name="email-error"
              type="email"
              value="bad"
              error={showError ? 'Укажите корректный e-mail' : undefined}
              onChange={() => setShowError(true)}
            />
            <Field
              multiline
              label="Сообщение"
              name="message"
              placeholder="Текст обращения"
              hint="Без нативных браузерных подсказок — только наши тексты."
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowError(true)}
            >
              Показать ошибку
            </Button>
          </div>
        </Section>

        <Section compact>
          <Heading level={2}>Цвета</Heading>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(
              [
                ['ivory', 'bg-ivory'],
                ['ink', 'bg-ink'],
                ['olive', 'bg-olive'],
                ['cream', 'bg-cream'],
                ['champagne', 'bg-champagne'],
              ] as const
            ).map(([name, swatch]) => (
              <div key={name} className="border border-border-subtle p-3">
                <div className={`mb-2 h-12 w-full ${swatch}`} />
                <p className="font-display text-label uppercase tracking-label">
                  {name}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </Container>
    </div>
  )
}

export default DevUi
