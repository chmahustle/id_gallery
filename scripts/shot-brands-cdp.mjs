import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../tmp/brands-stage9')
mkdirSync(outDir, { recursive: true })

const wslIp = execSync("hostname -I | awk '{print $1}'").toString().trim()
const CDP = process.env.CDP_URL || 'http://127.0.0.1:9222'

const browser = await chromium.connectOverCDP(CDP)
const context = browser.contexts()[0] || (await browser.newContext())
const page = context.pages()[0] || (await context.newPage())

async function openBrands() {
  const urls = [
    'http://127.0.0.1:5173/brands',
    'http://localhost:5173/brands',
    `http://${wslIp}:5173/brands`,
  ]
  for (const url of urls) {
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 })
      if (res && res.ok()) {
        console.log('opened', url)
        return
      }
      console.log('status', url, res?.status())
    } catch (e) {
      console.log('fail', url, String(e.message).slice(0, 100))
    }
  }
  throw new Error('could not open /brands')
}

async function shoot(width, height, label) {
  await page.setViewportSize({ width, height })
  await openBrands()
  await page.evaluate(() => document.fonts.ready)
  await page.waitForSelector('.brands-page__head h1', { timeout: 20000 })
  await page.waitForTimeout(500)

  await page
    .locator('.brands-page')
    .screenshot({ path: join(outDir, `brands-head-${label}.png`) })

  const banners = page.locator('.brands-banners .ff-banner')
  const count = await banners.count()
  for (let i = 0; i < count; i++) {
    const el = banners.nth(i)
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
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
  console.log(label, { count, titles })
}

await shoot(1920, 1080, '1920')
await shoot(390, 844, '390')
await browser.close()
console.log('done →', outDir)
