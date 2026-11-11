/**
 * CDP: /request/ этап 18 — rest/focus/error @ 1920/390; visit; model prefill; tabs keyboard
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-18'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const BASE = 'http://127.0.0.1:5173'

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
      const text = document.querySelector('.request-page')?.innerText || '';
      const model = document.querySelector('input[name="model"]');
      const brand = document.querySelector('input[name="brandOrModel"]');
      const tabs = [...document.querySelectorAll('[role="tab"]')].map((t) => ({
        text: t.textContent?.trim(),
        selected: t.getAttribute('aria-selected'),
        type: t.getAttribute('data-type'),
      }));
      return {
        h1: document.querySelector('#request-hero-title')?.textContent?.trim(),
        crumbs: Boolean(document.querySelector('.page-crumbs')),
        type: new URL(location.href).searchParams.get('type'),
        modelValue: model?.value || '',
        brandValue: brand?.value || '',
        tabs,
        forbidden: ['Спасибо', 'отправлен', 'согласен', 'политик'].filter((n) =>
          text.toLowerCase().includes(n.toLowerCase()),
        ),
        consent: Boolean(document.querySelector('input[type="checkbox"]')),
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function openPage(width, height, path) {
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
  await session.call('Page.navigate', { url: `${BASE}${path}` })
  await sleep(3000)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(700)
  return session
}

async function shootOffer(width, height, label) {
  let session = await openPage(width, height, '/request/?type=offer')
  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(400)
  await shot(session, join(outDir, `request-offer-rest-${label}.png`))
  const meta = await measure(session)
  writeFileSync(
    join(outDir, `request-offer-meta-${label}.json`),
    JSON.stringify(meta, null, 2),
  )
  console.log('meta offer', label, meta)
  session.close()

  session = await openPage(width, height, '/request/?type=offer')
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('.request-page__panel')?.scrollIntoView({block:'center'});
      const el = document.querySelector('.request-page__control');
      el?.focus();
      el?.classList.add('is-focus-force');
    })()`,
  })
  await sleep(400)
  await shot(session, join(outDir, `request-offer-focus-${label}.png`))
  session.close()

  session = await openPage(width, height, '/request/?type=offer')
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('.request-page__panel')?.scrollIntoView({block:'center'});
      document.querySelector('.request-page__form button[type="submit"]')?.click();
    })()`,
  })
  await sleep(500)
  await shot(session, join(outDir, `request-offer-error-${label}.png`))
  session.close()
}

async function shootVisit(width, height, label) {
  let session = await openPage(width, height, '/request/?type=visit')
  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(400)
  await shot(session, join(outDir, `request-visit-rest-${label}.png`))
  const meta = await measure(session)
  writeFileSync(
    join(outDir, `request-visit-meta-${label}.json`),
    JSON.stringify(meta, null, 2),
  )
  console.log('meta visit', label, meta)
  session.close()

  session = await openPage(width, height, '/request/?type=visit')
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('.request-page__panel')?.scrollIntoView({block:'center'});
      const el = document.querySelector('input[name="date"]') || document.querySelector('.request-page__control');
      el?.focus();
      el?.classList.add('is-focus-force');
    })()`,
  })
  await sleep(400)
  await shot(session, join(outDir, `request-visit-focus-${label}.png`))
  session.close()

  session = await openPage(width, height, '/request/?type=visit')
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('.request-page__panel')?.scrollIntoView({block:'center'});
      document.querySelector('.request-page__form button[type="submit"]')?.click();
    })()`,
  })
  await sleep(500)
  await shot(session, join(outDir, `request-visit-error-${label}.png`))
  session.close()
}

async function shootPrefill() {
  const session = await openPage(
    1920,
    1080,
    '/request/?type=offer&model=model-01-sofa',
  )
  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.request-page__panel')?.scrollIntoView({block:'center'})`,
  })
  await sleep(400)
  await shot(session, join(outDir, 'request-prefill-model-1920.png'))
  const meta = await measure(session)
  writeFileSync(
    join(outDir, 'request-prefill-meta.json'),
    JSON.stringify(meta, null, 2),
  )
  console.log('prefill', meta)
  session.close()
}

async function shootTabsKeyboard() {
  const session = await openPage(1920, 1080, '/request/?type=offer')
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const offer = document.querySelector('[data-type="offer"]');
      offer?.focus();
      const ev = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      document.querySelector('[role="tablist"]')?.dispatchEvent(ev);
      return {
        url: location.href,
        type: new URL(location.href).searchParams.get('type'),
        active: document.querySelector('[role="tab"][aria-selected="true"]')?.getAttribute('data-type'),
        focused: document.activeElement?.getAttribute('data-type'),
      };
    })()`,
    returnByValue: true,
  })
  writeFileSync(
    join(outDir, 'request-tabs-keyboard.json'),
    JSON.stringify(result.value, null, 2),
  )
  console.log('tabs keyboard', result.value)
  await sleep(400)
  await shot(session, join(outDir, 'request-tabs-after-arrow-1920.png'))
  session.close()
}

await shootOffer(1920, 1080, '1920')
await shootOffer(390, 844, '390')
await shootVisit(1920, 1080, '1920')
await shootVisit(390, 844, '390')
await shootPrefill()
await shootTabsKeyboard()
console.log('done', outDir)
