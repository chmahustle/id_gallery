/**
 * CDP screenshots: /interiors/ + /interiors/gostinaya/ @ 1920 и 390.
 * Запуск (Windows node + Chrome --remote-debugging-port=9222):
 *   node scripts/shot-interiors-11-cdp-win.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-11'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const LIST = 'http://127.0.0.1:5173/interiors/'
const DETAIL = 'http://127.0.0.1:5173/interiors/gostinaya/'

async function openTarget(url) {
  const list = await fetch('http://127.0.0.1:9222/json/list').then((r) => r.json())
  for (const t of list) {
    if (t.type === 'page' && t.id) {
      await fetch(`http://127.0.0.1:9222/json/close/${t.id}`).catch(() => null)
    }
  }
  return fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent(url)}`, {
    method: 'PUT',
  }).then((r) => r.json())
}

class Session {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl)
    this.n = 0
    this.map = new Map()
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(String(ev.data))
      if (msg.id && this.map.has(msg.id)) {
        const { res, rej } = this.map.get(msg.id)
        this.map.delete(msg.id)
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result)
      }
    }
  }
  ready() {
    return new Promise((res, rej) => {
      this.ws.onopen = () => res()
      this.ws.onerror = (e) => rej(e)
    })
  }
  call(method, params = {}) {
    const id = ++this.n
    return new Promise((res, rej) => {
      this.map.set(id, { res, rej })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  close() {
    this.ws.close()
  }
}

async function shot(session, path) {
  const { data } = await session.call('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  })
  writeFileSync(path, Buffer.from(data, 'base64'))
  console.log('wrote', path)
}

async function scrollInto(session, selector) {
  await session.call('Runtime.evaluate', {
    expression: `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center'})`,
  })
  await sleep(600)
}

async function measureList(session) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const imgs = [...document.querySelectorAll('.interiors-page__hero-crop img, .interiors-page__row-crop img')]
        .map((img) => img.getAttribute('src'))
        .filter(Boolean);
      const forbidden = /проект|реализ|клиент|люкс|эксклюзив/i;
      const text = document.body?.innerText || '';
      return {
        h1: document.querySelector('#interiors-hero-title')?.textContent?.trim() || null,
        lead: document.querySelector('.interiors-page__lead')?.textContent?.trim() || null,
        introLabel: document.querySelector('#interiors-intro-label')?.textContent?.trim() || null,
        rows: document.querySelectorAll('.interiors-page__row').length,
        imgs,
        imgDupes: imgs.filter((s, i) => imgs.indexOf(s) !== i),
        forbiddenHits: forbidden.test(text) ? text.match(forbidden) : null,
        navInteriors: [...document.querySelectorAll('a')].some((a) =>
          a.textContent?.includes('Интерьеры') && (a.getAttribute('href') || '').includes('/interiors')
        ),
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function measureDetail(session) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const cards = document.querySelectorAll('.interiors-page__models-grid .product-grid__card').length;
      return {
        h1: document.querySelector('#interior-detail-title')?.textContent?.trim() || null,
        modelsTitle: document.querySelector('#interior-models-title')?.textContent?.trim() || null,
        cards,
        backHref: document.querySelector('.interiors-page__back a')?.getAttribute('href') || null,
        cta: document.querySelector('.interiors-page__models-grid .product-grid__cta')?.textContent?.trim() || null,
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function shootList(width, height, label) {
  const target = await openTarget('about:blank')
  const session = new Session(target.webSocketDebuggerUrl)
  await session.ready()
  await session.call('Page.enable')
  await session.call('Runtime.enable')
  await session.call('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  })
  await session.call('Page.navigate', { url: LIST })
  await sleep(3500)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(800)

  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(1200)
  await shot(session, join(outDir, `interiors-hero-${label}.png`))

  await scrollInto(session, '.interiors-page__intro')
  await shot(session, join(outDir, `interiors-intro-${label}.png`))

  await scrollInto(session, '.interiors-page__rows')
  await shot(session, join(outDir, `interiors-rows-${label}.png`))

  const meta = await measureList(session)
  writeFileSync(join(outDir, `interiors-meta-${label}.json`), JSON.stringify(meta, null, 2))
  console.log('list', label, meta)
  session.close()
}

async function shootDetail(width, height, label) {
  const target = await openTarget('about:blank')
  const session = new Session(target.webSocketDebuggerUrl)
  await session.ready()
  await session.call('Page.enable')
  await session.call('Runtime.enable')
  await session.call('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  })
  await session.call('Page.navigate', { url: DETAIL })
  await sleep(3500)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(800)

  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(1200)
  await shot(session, join(outDir, `interior-detail-hero-${label}.png`))

  await scrollInto(session, '.interiors-page__models')
  await shot(session, join(outDir, `interior-detail-models-${label}.png`))

  const meta = await measureDetail(session)
  writeFileSync(
    join(outDir, `interior-detail-meta-${label}.json`),
    JSON.stringify(meta, null, 2),
  )
  console.log('detail', label, meta)
  session.close()
}

await shootList(1920, 1080, '1920')
await shootList(390, 844, '390')
await shootDetail(1920, 1080, '1920')
await shootDetail(390, 844, '390')
console.log('done', outDir)
