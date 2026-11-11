#!/usr/bin/env node
/**
 * Fails if forbidden content strings appear in src / public names,
 * or if src contains external image URLs (hotlinks).
 * Skips: forbidden list files, comment-only lines, // content-ok
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FORBIDDEN_CONTENT_STRINGS } from '../src/data/forbidden-strings.mjs'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const srcRoot = join(root, 'src')
const publicRoot = join(root, 'public')

const SKIP_FILES = new Set([
  'forbidden-strings.ts',
  'forbidden-strings.mjs',
  'check-content.mjs',
  /* DEV-only демо для ?preview= — не продакшен-копирайт */
  'productDevPreview.ts',
])

const EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.md', '.json'])

/** «Смотреть модели» — только данные, CategoryCard и /dev/ui */
const CTA_SEE_MODELS = 'Смотреть модели'
const CTA_SEE_MODELS_ALLOW = [
  join(srcRoot, 'data', 'categories.ts'),
  join(srcRoot, 'components', 'catalog', 'CategoryCard.tsx'),
  join(srcRoot, 'components', 'catalog', 'CategoryCard.css'),
  join(srcRoot, 'pages', 'DevUi.tsx'),
  join(srcRoot, 'features', 'brands', 'BrandPage.tsx'),
  join(srcRoot, 'pages', 'ProductPage.jsx'),
]

/** Внешние хотлинки картинок: src / background url() / поля image* на http(s) */
const EXTERNAL_IMAGE_RE =
  /(?:src\s*=\s*["']https?:\/\/[^"']+["'])|(?:url\(\s*['"]?https?:\/\/[^'")\s]+\.(?:jpe?g|png|webp|gif|svg|avif))|(?:(?:srcSet|image|heroImage|logo|backgroundImage|background)\s*[:=]\s*['"]https?:\/\/)/i

const FOREIGN_BRAND_NEEDLES = [
  'Cavalli',
  'Ferre',
  'Ferré',
  'Gianfranco',
  'Etro',
  'ETRO',
  'Giorgio',
  'Luceplan',
  'Venicem',
  'Nemo',
]

const FOREIGN_BRAND_FILE_RE = /cavalli|ferr[eé]|gianfranco|\betro\b|giorgio/i

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

function stripComments(line) {
  if (/^\s*\/\//.test(line)) return ''
  if (/^\s*\/\*/.test(line) || /^\s*\*/.test(line)) return ''
  return line.replace(/\/\/.*$/, '')
}

function isContentOk(line) {
  return /\/\/\s*content-ok\b/.test(line) || /\/\*\s*content-ok\b/.test(line)
}

const hits = []

const files = walk(srcRoot).filter((f) => {
  const base = basename(f)
  if (SKIP_FILES.has(base)) return false
  const ext = base.includes('.') ? `.${base.split('.').pop()}` : ''
  return EXT.has(ext)
})

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  const rel = relative(root, file)
  const allowSeeModels = CTA_SEE_MODELS_ALLOW.includes(file)
  lines.forEach((line, index) => {
    if (isContentOk(line)) return
    // Чужие бренды — и в коде, и в комментариях
    for (const needle of FOREIGN_BRAND_NEEDLES) {
      if (line.includes(needle)) {
        hits.push({
          file: rel,
          line: index + 1,
          needle,
          text: line.trim().slice(0, 160),
        })
      }
    }
    const code = stripComments(line)
    if (!code.trim()) return
    for (const needle of FORBIDDEN_CONTENT_STRINGS) {
      if (FOREIGN_BRAND_NEEDLES.includes(needle)) continue
      if (code.includes(needle)) {
        hits.push({
          file: rel,
          line: index + 1,
          needle,
          text: line.trim().slice(0, 160),
        })
      }
    }
    if (!allowSeeModels && code.includes(CTA_SEE_MODELS)) {
      hits.push({
        file: rel,
        line: index + 1,
        needle: CTA_SEE_MODELS,
        text: line.trim().slice(0, 160),
      })
    }
    if (EXTERNAL_IMAGE_RE.test(code)) {
      hits.push({
        file: rel,
        line: index + 1,
        needle: 'external-image-url',
        text: line.trim().slice(0, 160),
      })
    }
  })
}

for (const file of walk(publicRoot)) {
  const name = basename(file)
  if (FOREIGN_BRAND_FILE_RE.test(name)) {
    hits.push({
      file: relative(root, file),
      line: 0,
      needle: 'foreign-brand-filename',
      text: name,
    })
  }
}

/** Кастомные классы кнопок вне ui/Button — этап 2b (не путать с ui-btn) */
const CUSTOM_BTN_CLASS_RE =
  /(?:partners-btn|about-btn|brands-btn|news-btn|contacts-btn|product-page__btn|promo__cta|footer__subscribe-btn|contact-form__submit|catalog-drawer__apply|catalog-drawer__reset|(?<![-\w])btn--|(?:class(?:Name)?\s*=\s*["']btn(?:\s|"|')))/

const BTN_CHECK_SKIP = new Set([
  'Button.tsx',
  'Button.css',
  'check-content.mjs',
  'forbidden-strings.mjs',
  'forbidden-strings.ts',
])

for (const file of walk(srcRoot)) {
  const base = basename(file)
  if (BTN_CHECK_SKIP.has(base)) continue
  const ext = base.includes('.') ? `.${base.split('.').pop()}` : ''
  if (!EXT.has(ext)) continue
  const text = readFileSync(file, 'utf8')
  const lines = text.split(/\r?\n/)
  const rel = relative(root, file)
  lines.forEach((line, index) => {
    if (isContentOk(line)) return
    if (line.includes('ui-btn')) return
    if (CUSTOM_BTN_CLASS_RE.test(line)) {
      hits.push({
        file: rel,
        line: index + 1,
        needle: 'custom-btn-class',
        text: line.trim().slice(0, 160),
      })
    }
  })
}

if (hits.length) {
  console.error('check:content failed — forbidden strings found:\n')
  for (const hit of hits) {
    console.error(`  ${hit.file}:${hit.line}  [${hit.needle}]  ${hit.text}`)
  }
  console.error(`\n${hits.length} hit(s). See src/data/forbidden-strings.ts`)
  process.exit(1)
}

/**
 * RELEASE=1 + production:
 * - showProductPlaceholders не должен быть литералом true (иначе демо-характеристики
 *   вроде BX-0211 / «Кожа, массив дерева» попадают в рендер).
 * - демо-значения не должны быть захардкожены в ProductPage (только data/products.ts).
 */
if (process.env.NODE_ENV === 'production' && process.env.RELEASE === '1') {
  const flagsPath = join(srcRoot, 'data', 'featureFlags.ts')
  const flagsText = readFileSync(flagsPath, 'utf8')
  if (/showProductPlaceholders\s*:\s*true\b/.test(flagsText)) {
    console.error(
      'check:content failed: showProductPlaceholders: true при NODE_ENV=production и RELEASE=1 — демо-характеристики (BX-0211 и др.) попадали бы в рендер',
    )
    process.exit(1)
  }
  if (/showShowroomPlaceholders\s*:\s*true\b/.test(flagsText)) {
    console.error(
      'check:content failed: showShowroomPlaceholders: true при NODE_ENV=production и RELEASE=1 — демо-ряды шоурумов попадали бы в рендер',
    )
    process.exit(1)
  }
  if (/showContactPlaceholders\s*:\s*true\b/.test(flagsText)) {
    console.error(
      'check:content failed: showContactPlaceholders: true при NODE_ENV=production и RELEASE=1 — плейсхолдеры контактов попадали бы в рендер',
    )
    process.exit(1)
  }
  if (/showContactForm\s*:\s*true\b/.test(flagsText)) {
    console.error(
      'check:content failed: showContactForm: true при NODE_ENV=production и RELEASE=1 — форма без утверждённого endpoint',
    )
    process.exit(1)
  }
  if (/showAccount\s*:\s*true\b/.test(flagsText)) {
    console.error(
      'check:content failed: showAccount: true при NODE_ENV=production и RELEASE=1 — кабинет без утверждённого сервиса авторизации',
    )
    process.exit(1)
  }
  if (/showRequestForms\s*:\s*true\b/.test(flagsText)) {
    console.error(
      'check:content failed: showRequestForms: true при NODE_ENV=production и RELEASE=1 — заявки без утверждённого приёма',
    )
    process.exit(1)
  }

  const productPagePath = join(srcRoot, 'pages', 'ProductPage.jsx')
  const productPageText = readFileSync(productPagePath, 'utf8')
  const demoNeedles = [
    'BX-0211',
    '240 × 105 × 80',
    'Кожа, массив дерева',
    'Образец A, Образец B',
  ]
  for (const needle of demoNeedles) {
    if (productPageText.includes(needle)) {
      console.error(
        `check:content failed: демо-характеристика «${needle}» захардкожена в ProductPage.jsx (должна быть только в data/products.ts за флагом showProductPlaceholders)`,
      )
      process.exit(1)
    }
  }
  if (!productPageText.includes('showProductPlaceholders')) {
    console.error(
      'check:content failed: ProductPage.jsx не проверяет showProductPlaceholders перед демо-блоками',
    )
    process.exit(1)
  }
}

console.log('check:content ok')
