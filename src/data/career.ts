/**
 * /career/ — «Карьера». Вакансии — только утверждённые; без них страница
 * говорит «Сейчас открытых вакансий нет», общий отклик доступен всегда.
 * Получателя карьерных обращений назначает команда (сервер).
 */
export type Vacancy = {
  slug: string
  title: string
  /** Город или формат работы, если известен */
  place?: string
  /** Обязанности и требования, абзацами */
  text: string[]
  demo?: boolean
}

export const careerCopy = {
  title: 'Карьера',
  lead: 'Мы ищем людей, которым близки интерьер, дизайн и внимание к деталям.',
  heroLink: 'Открытые вакансии',
  whyTitle: 'Работа в ID Gallery',
  vacanciesTitle: 'Открытые вакансии',
  noVacancies: 'Сейчас открытых вакансий нет.',
  apply: 'Откликнуться',
  formTitle: 'Расскажите о себе',
  formLead:
    'Напишите, чем вы занимаетесь и чем хотели бы заниматься в ID Gallery. Отклик доступен и без открытой вакансии.',
  vacancyTopic: 'Вакансия',
  fieldName: 'Имя',
  fieldContact: 'Телефон или электронная почта',
  fieldAbout: 'О себе',
  fieldLink: 'Ссылка на резюме или портфолио',
  submit: 'Отправить отклик',
  errorRequired: 'Заполните поле',
} as const

/** Кадр сверху ≥2400px */
export const careerHero = {
  image: '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
  objectPosition: '50% 60%',
} as const

/** Фото рядом с формой отклика */
export const careerFormImage = {
  image: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
  objectPosition: '50% 55%',
} as const

/**
 * «Работа в ID Gallery»: три направления галереи. Тексты — из уже
 * опубликованных разделов (бренды, шоурумы, услуги), без новых обещаний.
 */
export const careerWhy = [
  {
    title: 'Мировые фабрики',
    text: 'Visionnaire, Molteni&C, Baxter и Bonaldo — коллекции ведущих фабрик в одной галерее.',
    image: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
  },
  {
    title: 'Шоурумы',
    text: 'Пространства, где клиенты знакомятся с мебелью, материалами и образцами отделки.',
    image: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
  },
  {
    title: 'Интерьерные проекты',
    text: 'Подбор и комплектация интерьеров вместе с дизайнерами и архитекторами.',
    image: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
  },
] as const

/** Утверждённые вакансии; пока нет — пусто */
const approvedVacancies: Vacancy[] = []

const demoEnabled = ['true', '1'].includes(String(import.meta.env?.VITE_DEMO_DATA ?? ''))

/* demoCareer.ts опционален (VITE_DEMO_DATA); в Node-скриптах без Vite — пусто */
let demoModules: Record<string, { demoVacancies: Vacancy[] }> = {}
try {
  demoModules = import.meta.glob('./demoCareer.ts', { eager: true })
} catch {
  demoModules = {}
}

export const vacancies: Vacancy[] = approvedVacancies.length
  ? approvedVacancies
  : demoEnabled
    ? Object.values(demoModules).flatMap((module) => module.demoVacancies)
    : []

/** Вакансии из админки (career.vacancies): заменяют демо и вакансии из кода */
export function applyVacancies(list: unknown) {
  if (!Array.isArray(list)) return
  const rows: Vacancy[] = list
    .filter((item) => item && typeof item.title === 'string' && item.title.trim())
    .filter((item) => item.published !== false)
    .map((item, index) => ({
      slug: typeof item.slug === 'string' && item.slug ? item.slug : `vacancy-${index + 1}`,
      title: item.title.trim(),
      ...(typeof item.place === 'string' && item.place.trim() ? { place: item.place.trim() } : {}),
      text: (Array.isArray(item.text) ? item.text : String(item.text || '').split(/\n\s*\n/))
        .map((p: unknown) => String(p).trim())
        .filter(Boolean),
    }))
  vacancies.splice(0, vacancies.length, ...rows)
}
