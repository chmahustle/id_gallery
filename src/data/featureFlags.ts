import type { FeatureFlags } from '../types'

/* демо-стенд: VITE_DEMO_DATA показывает заглушки шоурумов и контактов и в сборке */
const demoData = ['true', '1'].includes(
  String(import.meta.env?.VITE_DEMO_DATA ?? '').toLowerCase(),
)

export const featureFlags: FeatureFlags = {
  showNews: false,
  showShowrooms: true,
  showInteriors: true,
  showProjects: false,
  showSelections: false,
  showCommerce: false,
  showNewsletter: false,
  showCareer: false,
  showMaterialsLibrary: false,
  showAftercare: false,
  showBrandCollections: false,
  /* true только в Vite DEV; в production-сборке всегда false */
  showProductPlaceholders: import.meta.env.DEV,
  /* true только в Vite DEV; RELEASE=1 + PROD → check:content падает */
  showShowroomPlaceholders: import.meta.env.DEV || demoData,
  showContactPlaceholders: import.meta.env.DEV || demoData,
  showContactForm: import.meta.env.DEV || demoData,
  /* личный кабинет скрыт до появления функции */
  showAccount: false,
  showRequestForms: import.meta.env.DEV,
}

if (import.meta.env.PROD && featureFlags.showProductPlaceholders) {
  console.warn(
    '[ID Gallery] showProductPlaceholders=true в production — отключите перед релизом.',
  )
}

if (import.meta.env.PROD && featureFlags.showShowroomPlaceholders) {
  console.warn(
    '[ID Gallery] showShowroomPlaceholders=true в production — отключите перед релизом.',
  )
}

if (import.meta.env.PROD && featureFlags.showContactPlaceholders) {
  console.warn(
    '[ID Gallery] showContactPlaceholders=true в production — отключите перед релизом.',
  )
}

if (import.meta.env.PROD && featureFlags.showContactForm) {
  console.warn(
    '[ID Gallery] showContactForm=true в production — нужен утверждённый endpoint.',
  )
}

if (import.meta.env.PROD && featureFlags.showAccount) {
  console.warn(
    '[ID Gallery] showAccount=true в production — нужен утверждённый сервис авторизации.',
  )
}

if (import.meta.env.PROD && featureFlags.showRequestForms) {
  console.warn(
    '[ID Gallery] showRequestForms=true в production — нужен утверждённый приём заявок.',
  )
}
