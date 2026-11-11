import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../tmp/brands-stage9')
mkdirSync(outDir, { recursive: true })

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173/brands'

async function shot(width, height, label) {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {}),
  })
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 90000 })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForSelector('.brands-page__head h1', { timeout: 30000 })
  await page.waitForTimeout(600)

  const headPath = join(outDir, `brands-head-${label}.png`)
  await page.locator('.brands-page').screenshot({ path: headPath })

  const banners = page.locator('.brands-banners .ff-banner')
  const count = await banners.count()
  for (let i = 0; i < count; i++) {
    const el = banners.nth(i)
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(350)
    await el.screenshot({
      path: join(outDir, `brands-banner-${i + 1}-${label}.png`),
    })
  }

  await page.screenshot({
    path: join(outDir, `brands-full-${label}.png`),
    fullPage: true,
  })

  const titles = await page.evaluate(() =>
    [...document.querySelectorAll('.brands-banners .ff-banner__title')].map(
      (el) => ({
        text: el.textContent?.trim(),
        color: getComputedStyle(el).color,
      }),
    ),
  )

  await browser.close()
  console.log(label, { banners: count, titles, headPath })
}

await shot(1920, 1080, '1920')
await shot(390, 844, '390')
console.log('done →', outDir)
