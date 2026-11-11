/**
 * CDP screenshots: /showrooms/ @ 1920 и 390.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-12'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PAGE = 'http://127.0.0.1:5173/showrooms/'

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

async function measure(session) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const imgs = [
        ...document.querySelectorAll('.showrooms-page__hero-img, .showrooms-page__row-crop img, .ff-banner__img'),
      ].map((img) => img.getAttribute('src')).filter(Boolean);
      const body = document.body?.innerText || '';
      const forbidden = /Астана|Алматы|Горячая|Записаться на визит|Коммерческое предложение|карта/i;
      return {
        h1: document.querySelector('#showrooms-hero-title')?.textContent?.trim(),
        rows: document.querySelectorAll('.showrooms-page__row').length,
        openDetails: document.querySelector('.showrooms-page__row.is-open .showrooms-page__row-details-text')?.textContent?.trim() || null,
        visitTitle: document.querySelector('#showrooms-visit .ff-banner__title')?.textContent?.trim() || null,
        visitHref: document.querySelector('#showrooms-visit a.ui-btn')?.getAttribute('href') || null,
        imgs,
        imgDupes: imgs.filter((s, i) => imgs.indexOf(s) !== i),
        forbiddenHits: forbidden.test(body) ? body.match(forbidden) : null,
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function shoot(width, height, label) {
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
  await session.call('Page.navigate', { url: PAGE })
  await sleep(3500)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(800)

  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(900)
  await shot(session, join(outDir, `showrooms-hero-${label}.png`))

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.showrooms-page__rows')?.scrollIntoView({block:'center'})`,
  })
  await sleep(700)
  await shot(session, join(outDir, `showrooms-rows-${label}.png`))

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.showrooms-page__row button')?.click()`,
  })
  await sleep(500)
  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.showrooms-page__row')?.scrollIntoView({block:'center'})`,
  })
  await sleep(400)
  await shot(session, join(outDir, `showrooms-details-${label}.png`))

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('#showrooms-visit')?.scrollIntoView({block:'center'})`,
  })
  await sleep(900)
  await shot(session, join(outDir, `showrooms-visit-${label}.png`))

  const meta = await measure(session)
  writeFileSync(join(outDir, `showrooms-meta-${label}.json`), JSON.stringify(meta, null, 2))
  console.log('meta', label, meta)
  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(390, 844, '390')
console.log('done', outDir)
