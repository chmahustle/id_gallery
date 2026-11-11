/**
 * CDP: /contact/ этап 14b — hero, столбцы, focus, error @ 1920/390
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-14b'
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
      const page = document.querySelector('.contact-page');
      const text = page?.innerText || '';
      const info = document.querySelector('.contact-page__info');
      const rows = [...document.querySelectorAll('.contact-page__row-label')]
        .map((el) => el.textContent?.trim());
      const pending = document.querySelector('.contact-page__pending-note')?.textContent?.trim();
      const hero = document.querySelector('.contact-page__hero-img')?.getAttribute('src');
      const sectionLabel = [...document.querySelectorAll('.contact-page__hero .contact-page__label')]
        .map((el) => el.textContent?.trim());
      return {
        h1: document.querySelector('#contact-hero-title')?.textContent?.trim(),
        hero,
        heroH: document.querySelector('.contact-page__hero')
          ? getComputedStyle(document.querySelector('.contact-page__hero')).height
          : null,
        crumbs: Boolean(document.querySelector('.page-crumbs')),
        sectionLabel,
        hasInfo: Boolean(info),
        rows,
        pending,
        dashHits: (text.match(/(^|\\s)—(\\s|$)/g) || []).length,
        forbidden: ['Астана','Алматы','Горячая','[Город]','+7','Записаться на визит']
          .filter((n) => text.includes(n)),
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function openPage(width, height, url) {
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
  await session.call('Page.navigate', { url })
  await sleep(3200)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(700)
  return session
}

async function shoot(width, height, label) {
  let session = await openPage(width, height, `${BASE}?placeholders=1`)
  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(500)
  await shot(session, join(outDir, `contact-hero-${label}.png`))

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.contact-page__body')?.scrollIntoView({block:'start'})`,
  })
  await sleep(500)
  await shot(session, join(outDir, `contact-cols-ph-on-${label}.png`))
  const metaOn = await measure(session)
  writeFileSync(join(outDir, `contact-meta-ph-on-${label}.json`), JSON.stringify(metaOn, null, 2))
  console.log('meta on', label, metaOn)
  session.close()

  session = await openPage(width, height, `${BASE}?placeholders=0`)
  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.contact-page__body')?.scrollIntoView({block:'start'})`,
  })
  await sleep(500)
  await shot(session, join(outDir, `contact-cols-ph-off-${label}.png`))
  const metaOff = await measure(session)
  writeFileSync(join(outDir, `contact-meta-ph-off-${label}.json`), JSON.stringify(metaOff, null, 2))
  console.log('meta off', label, metaOff)
  session.close()

  session = await openPage(width, height, `${BASE}?placeholders=1`)
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('.contact-page__body')?.scrollIntoView({block:'center'});
      const el = document.querySelector('.contact-page__control');
      el?.focus();
      el?.classList.add('is-focus-force');
      el?.closest('.contact-page__field')?.classList.add('is-focus-force');
    })()`,
  })
  await sleep(400)
  await shot(session, join(outDir, `contact-focus-${label}.png`))
  session.close()

  session = await openPage(width, height, `${BASE}?placeholders=1`)
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('.contact-page__body')?.scrollIntoView({block:'center'});
      document.querySelector('.contact-page__form')?.requestSubmit?.();
      const btn = document.querySelector('.contact-page__form-actions button, .contact-page__form button');
      btn?.click();
    })()`,
  })
  await sleep(500)
  await shot(session, join(outDir, `contact-error-${label}.png`))
  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(390, 844, '390')
console.log('done', outDir)
