#!/usr/bin/env node
/**
 * Проверка изображений:
 * - heroImage на /brands/ уникальны; файлы существуют;
 * - нет внешних http(s) URL в brands/products;
 * - пути images/image из src/data/products.ts существуют на диске
 *   (пустая строка / отсутствие — допустимо → Placeholder);
 * - на каждой /product/{slug}/ в блоке «Другие модели» нет двух одинаковых
 *   непустых card-image;
 * - на /interiors/ hero + 3 подборки — уникальные локальные пути;
 * - на /showrooms/ hero + ряды + баннер «Посещение» — уникальные пути и sourceId;
 * - на /trade/ hero + 2 карточки + баннер — уникальные sourceId;
 * - на /about/ hero + «Наш подход» — уникальные sourceId;
 * - на /contact/ hero — локальный путь, warn < 2400px;
 * - на /request/ aside — локальный путь;
 * - на /account/ hero + баннер — уникальные sourceId;
 * - warn: hero-ширина < 2400px; обычные < 1600px (не fail).
 *
 * Запуск: node --import tsx scripts/check-images.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { products } from '../src/data/products.ts'
import {
  interiors,
  interiorsListHero,
} from '../src/data/interiors.ts'
import {
  showrooms,
  showroomsListHero,
  showroomsVisitBanner,
} from '../src/data/showrooms.ts'
import {
  tradeCards,
  tradeCoopBanner,
  tradeListHero,
} from '../src/data/trade.ts'
import {
  aboutApproach,
  aboutListHero,
} from '../src/data/about.ts'
import {
  contactAsideImage,
  contactListHero,
} from '../src/data/contact-page.ts'
import { requestAsideImage } from '../src/data/request-page.ts'
import {
  accountListHero,
  accountProBanner,
} from '../src/data/account-page.ts'
import {
  getRelatedProducts,
  productCardImageSrc,
  withUniqueRelatedImages,
} from '../src/lib/catalog.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const brandsFile = join(root, 'src/data/brands.ts')
const productsFile = join(root, 'src/data/products.ts')
const brandsText = readFileSync(brandsFile, 'utf8')
const productsText = readFileSync(productsFile, 'utf8')
const manifest = JSON.parse(
  readFileSync(join(root, 'public/images/manifest.json'), 'utf8'),
)

const errors = []
const warnings = []

const HERO_MIN_W = 2400
const REGULAR_MIN_W = 1600

/** web path `/images/x.jpg` → sourceId из manifest */
const sourceIdByWebPath = new Map()
for (const entry of manifest.files || []) {
  if (!entry?.file || !entry.sourceId) continue
  const web = `/${String(entry.file).replace(/^public\//, '')}`
  sourceIdByWebPath.set(web, entry.sourceId)
  // placeholders/images without public/ prefix variants
  if (String(entry.file).startsWith('public/')) {
    sourceIdByWebPath.set(
      `/${String(entry.file).slice('public/'.length)}`,
      entry.sourceId,
    )
  }
}

function resolveSourceId(src) {
  if (!src) return null
  return sourceIdByWebPath.get(src) || null
}

function checkUniqueSourceIds(paths, pageLabel) {
  const seen = new Map()
  for (const src of paths) {
    const sid = resolveSourceId(src)
    if (!sid) {
      warnings.push(`no sourceId in manifest for ${pageLabel}: ${src}`)
      continue
    }
    if (seen.has(sid)) {
      errors.push(
        `duplicate sourceId «${sid}» on ${pageLabel}: ${seen.get(sid)} and ${src}`,
      )
    } else {
      seen.set(sid, src)
    }
  }
}

/** Ширина JPEG / PNG / WEBP без внешних зависимостей */
function readImageWidth(diskPath) {
  if (!existsSync(diskPath)) return null
  const buf = readFileSync(diskPath)
  if (buf.length < 24) return null
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) {
        i += 1
        continue
      }
      const marker = buf[i + 1]
      if (
        marker === 0xc0 ||
        marker === 0xc1 ||
        marker === 0xc2 ||
        marker === 0xc3 ||
        marker === 0xc5 ||
        marker === 0xc6 ||
        marker === 0xc7 ||
        marker === 0xc9 ||
        marker === 0xca ||
        marker === 0xcb ||
        marker === 0xcd ||
        marker === 0xce ||
        marker === 0xcf
      ) {
        return buf.readUInt16BE(i + 7)
      }
      const len = buf.readUInt16BE(i + 2)
      i += 2 + len
    }
    return null
  }
  if (buf.toString('ascii', 1, 4) === 'PNG') {
    return buf.readUInt32BE(16)
  }
  if (
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunk = buf.toString('ascii', 12, 16)
    if (chunk === 'VP8 ') return buf.readUInt16LE(26) & 0x3fff
    if (chunk === 'VP8L') {
      const b = buf.readUInt32LE(21)
      return (b & 0x3fff) + 1
    }
    if (chunk === 'VP8X') {
      return 1 + buf[24] + (buf[25] << 8) + (buf[26] << 16)
    }
  }
  return null
}

function diskForSrc(src) {
  if (!src || !src.startsWith('/')) return null
  return join(root, 'public', src.replace(/^\//, ''))
}

function warnResolution(src, kind) {
  const disk = diskForSrc(src)
  if (!disk) return
  const width = readImageWidth(disk)
  if (width == null) return
  const min = kind === 'hero' ? HERO_MIN_W : REGULAR_MIN_W
  if (width < min) {
    warnings.push(
      `${kind} image width ${width}px < ${min}px: ${src}`,
    )
  }
}

function checkLocalPath(src, label) {
  if (!src || src === "''" || src === '""') return
  if (/^https?:\/\//i.test(src)) {
    errors.push(`external ${label} URL forbidden: ${src}`)
    return
  }
  if (!src.startsWith('/')) return
  const disk = join(root, 'public', src.replace(/^\//, ''))
  if (!existsSync(disk)) {
    errors.push(`${label} file missing: ${src}`)
  }
}

const heroImages = [...brandsText.matchAll(/heroImage:\s*'([^']+)'/g)].map(
  (m) => m[1],
)
const brandImages = [...brandsText.matchAll(/\bimage:\s*'([^']+)'/g)].map(
  (m) => m[1],
)

const seen = new Map()
for (const src of heroImages) {
  if (seen.has(src)) {
    errors.push(`duplicate heroImage on /brands/ page: ${src}`)
  } else {
    seen.set(src, true)
  }
  checkLocalPath(src, 'heroImage')
  warnResolution(src, 'hero')
}

for (const src of brandImages) {
  checkLocalPath(src, 'brand image')
  warnResolution(src, 'regular')
}

/** Все строковые пути /placeholders/… и /images/… в products.ts */
const productPaths = [
  ...productsText.matchAll(/'(\/(?:placeholders|images)\/[^']+)'/g),
].map((m) => m[1])

for (const src of productPaths) {
  checkLocalPath(src, 'product image')
  warnResolution(src, 'regular')
}

for (const product of products) {
  const relatedRaw = getRelatedProducts(product)
  const rawPaths = relatedRaw
    .map((item) => productCardImageSrc(item))
    .filter(Boolean)
  const rawSeen = new Set()
  for (const src of rawPaths) {
    if (rawSeen.has(src)) {
      errors.push(
        `duplicate related card image on /product/${product.slug}/ (data): ${src}`,
      )
    }
    rawSeen.add(src)
  }

  const related = withUniqueRelatedImages(relatedRaw)
  const displayPaths = related
    .map((item) => productCardImageSrc(item))
    .filter(Boolean)
  const displaySeen = new Set()
  for (const src of displayPaths) {
    if (displaySeen.has(src)) {
      errors.push(
        `duplicate related card image on /product/${product.slug}/ (render): ${src}`,
      )
    }
    displaySeen.add(src)
  }
}

/** /interiors/ — hero списка + изображения подборок без повторов */
const interiorsPageImages = [
  interiorsListHero.image,
  ...interiors.map((item) => item.image),
].filter(Boolean)
const interiorsSeen = new Set()
for (const src of interiorsPageImages) {
  if (interiorsSeen.has(src)) {
    errors.push(`duplicate image on /interiors/ page: ${src}`)
  } else {
    interiorsSeen.add(src)
  }
  checkLocalPath(src, 'interiors image')
}

warnResolution(interiorsListHero.image, 'hero')
for (const item of interiors) {
  warnResolution(item.image, 'regular')
}

/** /showrooms/ — hero + ряды + баннер: уникальные пути и sourceId */
const showroomsPageImages = [
  showroomsListHero.image,
  ...showrooms.map((item) => item.image),
  showroomsVisitBanner.image,
].filter(Boolean)
const showroomsSeen = new Set()
for (const src of showroomsPageImages) {
  if (showroomsSeen.has(src)) {
    errors.push(`duplicate image on /showrooms/ page: ${src}`)
  } else {
    showroomsSeen.add(src)
  }
  checkLocalPath(src, 'showrooms image')
}
checkUniqueSourceIds(showroomsPageImages, '/showrooms/')

warnResolution(showroomsListHero.image, 'hero')
warnResolution(showroomsVisitBanner.image, 'hero')
for (const item of showrooms) {
  warnResolution(item.image, 'regular')
}

/** /trade/ — hero + карточки + баннер «Сотрудничество» */
const tradePageImages = [
  tradeListHero.image,
  ...tradeCards.map((card) => card.image),
  tradeCoopBanner.image,
].filter(Boolean)
const tradeSeen = new Set()
for (const src of tradePageImages) {
  if (tradeSeen.has(src)) {
    errors.push(`duplicate image on /trade/ page: ${src}`)
  } else {
    tradeSeen.add(src)
  }
  checkLocalPath(src, 'trade image')
}
checkUniqueSourceIds(tradePageImages, '/trade/')

warnResolution(tradeListHero.image, 'hero')
warnResolution(tradeCoopBanner.image, 'hero')
for (const card of tradeCards) {
  warnResolution(card.image, 'regular')
}

/** /about/ — hero + «Наш подход» */
const aboutPageImages = [aboutListHero.image, aboutApproach.image].filter(
  Boolean,
)
const aboutSeen = new Set()
for (const src of aboutPageImages) {
  if (aboutSeen.has(src)) {
    errors.push(`duplicate image on /about/ page: ${src}`)
  } else {
    aboutSeen.add(src)
  }
  checkLocalPath(src, 'about image')
}
checkUniqueSourceIds(aboutPageImages, '/about/')

warnResolution(aboutListHero.image, 'hero')
warnResolution(aboutApproach.image, 'regular')

/** /contact/ — hero + aside */
const contactPageImages = [contactListHero.image, contactAsideImage.image].filter(
  Boolean,
)
const contactSeen = new Set()
for (const src of contactPageImages) {
  if (contactSeen.has(src)) {
    errors.push(`duplicate image on /contact/ page: ${src}`)
  } else {
    contactSeen.add(src)
  }
  checkLocalPath(src, 'contact image')
}
checkUniqueSourceIds(contactPageImages, '/contact/')
warnResolution(contactListHero.image, 'hero')
warnResolution(contactAsideImage.image, 'regular')

/** /request/ — aside */
if (requestAsideImage.image) {
  checkLocalPath(requestAsideImage.image, 'request image')
  warnResolution(requestAsideImage.image, 'regular')
}

/** /account/ — hero + pro banner */
const accountPageImages = [accountListHero.image, accountProBanner.image].filter(
  Boolean,
)
const accountSeen = new Set()
for (const src of accountPageImages) {
  if (accountSeen.has(src)) {
    errors.push(`duplicate image on /account/ page: ${src}`)
  } else {
    accountSeen.add(src)
  }
  checkLocalPath(src, 'account image')
}
checkUniqueSourceIds(accountPageImages, '/account/')
warnResolution(accountListHero.image, 'hero')
warnResolution(accountProBanner.image, 'hero')

if (warnings.length) {
  console.warn('check:images warnings:\n')
  for (const w of warnings) console.warn(`  ${w}`)
}

if (errors.length) {
  console.error('check:images failed:\n')
  for (const err of errors) console.error(`  ${err}`)
  process.exit(1)
}

const requestPageImages = [requestAsideImage.image].filter(Boolean)

console.log(
  `check:images ok (${heroImages.length} heroImage, ${productPaths.length} product paths, related uniqueness checked, ${interiorsPageImages.length} interiors paths, ${showroomsPageImages.length} showrooms paths, ${tradePageImages.length} trade paths, ${aboutPageImages.length} about paths, ${contactPageImages.length} contact paths, ${requestPageImages.length} request paths, ${accountPageImages.length} account paths, ${warnings.length} warnings)`,
)
