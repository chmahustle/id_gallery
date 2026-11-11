/**
 * CDP screenshots: /trade/ @ 1920 и 390.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-13'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PAGE = 'http://127.0.0.1:5173/trade/'

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
      const imgs = [...document.querySelectorAll(
        '.trade-page__hero-img, .trade-page__card-crop img, #trade-coop .ff-banner__img'
      )].map((img) => img.getAttribute('src')).filter(Boolean);
      const body = document.body?.innerText || '';
      const forbidden = /Cavalli|Ferré|ETRO|Giorgio|Luceplan|Venicem|Nemo|Астане|Алматы|Обновления|Предпоказ|limited edition|Девелопер|Стать партнёром|Обсудить проект/i;
      return {
        h1: document.querySelector('#trade-hero-title')?.textContent?.trim(),
        cards: [...document.querySelectorAll('.trade-page__card-title')].map((el) => el.textContent?.trim()),
        coop: document.querySelector('#trade-coop .ff-banner__title')?.textContent?.trim(),
        coopHref: document.querySelector('#trade-coop a.ui-btn')?.getAttribute('href'),
        imgs,
        imgDupes: imgs.filter((s, i) => imgs.indexOf(s) !== i),
        forbiddenHits: forbidden.test(body) ? body.match(forbidden) : null,
        crumbs: Boolean(document.querySelector('.page-crumbs')),
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
  await shot(session, join(outDir, `trade-hero-${label}.png`))

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.trade-page__cards')?.scrollIntoView({block:'center'})`,
  })
  await sleep(700)
  await shot(session, join(outDir, `trade-cards-${label}.png`))

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('#trade-coop')?.scrollIntoView({block:'center'})`,
  })
  await sleep(900)
  await shot(session, join(outDir, `trade-coop-${label}.png`))

  const meta = await measure(session)
  writeFileSync(join(outDir, `trade-meta-${label}.json`), JSON.stringify(meta, null, 2))
  console.log('meta', label, meta)
  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(390, 844, '390')
console.log('done', outDir)
