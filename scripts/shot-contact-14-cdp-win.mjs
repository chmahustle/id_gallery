/**
 * CDP screenshots: /contact/ @ 1920 и 390
 * (placeholders on/off + focus поля)
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-14'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const BASE = 'http://127.0.0.1:5173/contact/'

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
      const main = document.querySelector('.contact-page')?.innerText || '';
      const needles = ['Астана','Алматы','Горячая','[Город]','+7','@','Записаться на визит'];
      const hits = needles.filter((n) => main.includes(n));
      const pending = [...document.querySelectorAll('.contact-page__row-value.is-pending')]
        .map((el) => el.textContent?.trim());
      const rows = [...document.querySelectorAll('.contact-page__row-label')]
        .map((el) => el.textContent?.trim());
      return {
        h1: document.querySelector('#contact-hero-title')?.textContent?.trim(),
        crumbs: Boolean(document.querySelector('.page-crumbs')),
        form: Boolean(document.querySelector('.contact-page__form')),
        rows,
        pending,
        forbiddenHits: hits,
        hasMap: Boolean(document.querySelector('iframe, .contacts-map')),
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function prepare(session, width, height, url) {
  const target = await openTarget('about:blank')
  const session2 = new Session(target.webSocketDebuggerUrl)
  await session2.ready()
  await session2.call('Page.enable')
  await session2.call('Runtime.enable')
  await session2.call('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  })
  await session2.call('Page.navigate', { url })
  await sleep(3200)
  await session2.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(700)
  await session2.call('Runtime.evaluate', {
    expression: `document.querySelector('.contact-page__body')?.scrollIntoView({block:'start'})`,
  })
  await sleep(500)
  await session2.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(600)
  void session
  return session2
}

async function shoot(width, height, label) {
  /* placeholders on */
  let session = await prepare(null, width, height, `${BASE}?placeholders=1`)
  await shot(session, join(outDir, `contact-ph-on-${label}.png`))
  const metaOn = await measure(session)
  writeFileSync(
    join(outDir, `contact-meta-ph-on-${label}.json`),
    JSON.stringify(metaOn, null, 2),
  )
  console.log('meta on', label, metaOn)
  session.close()

  /* placeholders off */
  session = await prepare(null, width, height, `${BASE}?placeholders=0`)
  await shot(session, join(outDir, `contact-ph-off-${label}.png`))
  const metaOff = await measure(session)
  writeFileSync(
    join(outDir, `contact-meta-ph-off-${label}.json`),
    JSON.stringify(metaOff, null, 2),
  )
  console.log('meta off', label, metaOff)
  session.close()

  /* focus field (1920 only once is enough, still do both widths) */
  session = await prepare(null, width, height, `${BASE}?placeholders=1`)
  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.contact-page__body')?.scrollIntoView({block:'center'})`,
  })
  await sleep(400)
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('#contact-form-title')?.scrollIntoView({block:'start'});
      const el = document.querySelector('.contact-page__control');
      el?.focus();
      el?.classList.add('is-focus-force');
    })()`,
  })
  await sleep(400)
  await shot(session, join(outDir, `contact-focus-${label}.png`))
  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(390, 844, '390')
console.log('done', outDir)
