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
  /* сравнение отложено до сопоставимых данных исполнений; демо — показать заказчику */
  showCompare: import.meta.env.DEV || demoData,
  showNewsletter: false,
  /* «Карьера» в подвале и меню: демо — показать заказчику */
  showCareer: import.meta.env.DEV || demoData,
  /* библиотека «Каталоги и материалы»: демо — показать заказчику */
  showMaterialsLibrary: import.meta.env.DEV || demoData,
  showAftercare: false,
  showBrandCollections: false,
  /* true только в Vite DEV; в production-сборке всегда false */
  showProductPlaceholders: import.meta.env.DEV,
  /* true только в Vite DEV; RELEASE=1 + PROD → check:content падает */
  showShowroomPlaceholders: import.meta.env.DEV || demoData,
  showContactPlaceholders: import.meta.env.DEV || demoData,
  showContactForm: import.meta.env.DEV || demoData,
  /* показ заказчику: иконка кабинета и /account видны; вход пока заглушка */
  showAccount: true,
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
