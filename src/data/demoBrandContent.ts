import type { BrandAuthor, BrandCatalog } from '../types'

/**
 * Демо-данные блоков «Авторы» и «Каталоги» на странице бренда.
 * Подключаются только при VITE_DEMO_DATA=true (см. brands.ts и README);
 * чтобы убрать демо — выключить переменную или удалить этот файл.
 * Имена авторов не выдумываем: «ФИО», по 1 автору и 4 каталога на бренд, ссылки «#».
 */

type DemoBrandContent = {
  authors: BrandAuthor[]
  catalogs: BrandCatalog[]
}

/** Временные фото (кадры проекта без логотипов); подойдут под 3:4 с кропом */
const AUTHOR_PHOTOS = [
  '/images/interior-03.png',
  '/images/partners.jpg',
  '/images/interior-01.png',
]

/** Временные обложки каталогов (кадры проекта без логотипов) */
const COVERS = [
  '/images/interior-01.png',
  '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
  '/images/interior-03.png',
  '/images/hero.jpg',
  '/images/partners.jpg',
  '/placeholders/product-02.jpg',
  '/placeholders/product-10.jpg',
]

const CATALOG_TITLES = [
  'Каталог {B}',
  'Коллекция {B}',
  '{B}: диваны',
  '{B}: столы',
]

const BRANDS: { slug: string; name: string }[] = [
  { slug: 'visionnaire', name: 'Visionnaire' },
  { slug: 'molteni', name: 'Molteni&C' },
  { slug: 'baxter', name: 'Baxter' },
  { slug: 'bonaldo', name: 'Bonaldo' },
]

export const demoBrandContent: Record<string, DemoBrandContent> =
  Object.fromEntries(
    BRANDS.map(({ slug, name }, index) => [
      slug,
      {
        authors: AUTHOR_PHOTOS.slice(0, 1).map((photo) => ({
          name: 'ФИО',
          role: 'Дизайнер',
          bio: 'Текст об авторе: образование, ключевые проекты, подход к дизайну. Здесь будет рассказ о том, как автор работает с брендом.',
          photo,
          // TODO: когда появится фильтр по автору — вести на него
          link: `/catalog?brand=${slug}`,
          demo: true,
        })),
        catalogs: CATALOG_TITLES.map((title, j) => ({
          title: title.replace('{B}', name),
          format: 'PDF',
          url: '#',
          // временные обложки; соседние не повторяются
          cover: COVERS[(index + j) % COVERS.length],
          demo: true,
        })),
      },
    ]),
  )
