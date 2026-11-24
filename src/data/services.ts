/**
 * Страница «Подбор и комплектация» (/services/podbor). Тексты — из
 * утверждённого макета; фото — кадры демо, заменить при наполнении.
 */

export type ServiceStep = {
  num: string
  title: string
  text: string
  image: string
}

export type ServiceDirectionCard = {
  title: string
  text: string
  image: string
}

export const podbor = {
  slug: 'podbor',
  title: 'Подбор и комплектация',
  heroImage: '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
  intro: 'Мебель, свет и отделочные материалы для вашего интерьера.',
  primaryCta: 'Обсудить проект',

  aboutTitle: 'От идеи к согласованному решению',
  aboutText:
    'Поможем выбрать отдельные предметы или собрать интерьер целиком. Начнём с вашей задачи и определим состав работы.',
  directions: [
    {
      title: 'Мебель и комплектация',
      text: 'Подбор предметов, сочетаний и согласованного состава поставки.',
      image: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
    },
    {
      title: 'Свет и материалы',
      text: 'Светильники, обои, краски, напольные покрытия и стеновые панели.',
      image: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
    },
  ] satisfies ServiceDirectionCard[],

  stepsTitle: 'Как мы работаем',
  /* крупные кадры попеременно слева и справа (пояснение 2 макета) */
  steps: [
    {
      num: '01',
      title: 'Знакомство',
      text: 'Обсуждаем помещение, пожелания и сроки.',
      image: '/images/interior-02.png',
    },
    {
      num: '02',
      title: 'Подбор',
      text: 'Предлагаем предметы, материалы и варианты сочетаний.',
      image: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
    },
    {
      num: '03',
      title: 'Согласование',
      text: 'Уточняем исполнения и состав предложения.',
      image: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
    },
  ] satisfies ServiceStep[],

  resultTitle: 'Что вы получаете',
  resultText:
    'Подборку предметов или согласованный перечень для комплектации. Состав результата определяем на первой встрече.',
  nextTitle: 'Ваш следующий шаг',
  nextText: 'Выберите нужные направления и расскажите о задаче.',

  interiorsTitle: 'Интерьеры и сочетания',
  interiorsText: 'Как предметы и материалы работают вместе в готовых пространствах.',
  interiorsImage: '/images/brand-molteni.jpg',
  interiorsLink: 'Смотреть интерьеры',

  /** Одна форма с сохранением услуги: окно запроса «Подбор и комплектация» */
  requestHref: '/request/?type=offer&topic=podbor',
} as const
