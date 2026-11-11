/**
 * /account/ — docs/content-brief.md §17.
 * Hero и баннер «Для профессионалов» — разные sourceId, ≥2400px.
 */

export const accountPageCopy = {
  heroTitle: 'Личный кабинет',
  heroLead: 'Войдите в аккаунт или создайте новый.',
  loginTitle: 'Вход',
  registerTitle: 'Регистрация',
  registerLead:
    'Создайте аккаунт, чтобы пользоваться личным кабинетом ID Gallery.',
  fieldName: 'Имя',
  fieldEmail: 'Электронная почта',
  fieldPassword: 'Пароль',
  loginSubmit: 'Войти',
  registerSubmit: 'Зарегистрироваться',
  proTitle: 'Для профессионалов',
  proText:
    'Дизайнеры и архитекторы могут отдельно подать заявку на профессиональные условия.',
  proCta: 'Подать заявку',
  proHref: '/contact/?topic=trade',
  errorRequired: 'Заполните поле',
  errorEmail: 'Некорректный email',
  errorPasswordShort: 'Минимум 8 символов',
} as const

export type AccountTab = 'login' | 'register'

/** Hero ≥2400px */
export const accountListHero = {
  image: '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
  objectPosition: '50% 45%',
} as const

/** Баннер — другой sourceId */
export const accountProBanner = {
  image: '/images/brand-baxter.jpg',
  objectPosition: '50% 42%',
} as const

export function parseAccountTab(raw: string | null): AccountTab {
  return raw === 'register' ? 'register' : 'login'
}

export function isValidEmail(value: string): boolean {
  const v = value.trim()
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}
