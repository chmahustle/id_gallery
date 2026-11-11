/**
 * CDP: /contact/ 14c — панель формы, aside photo, focus/error, высоты столбцов
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-14c'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const BASE = 'http://127.0.0.1:5173/contact/?placeholders=1'

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
      const left = document.querySelector('.contact-page__left');
      const right = document.querySelector('.contact-page__form-block');
      const photo = document.querySelector('.contact-page__aside-media');
      const panel = document.querySelector('.contact-page__form-panel');
      const infoLabel = document.querySelector('#contact-info-title');
      const formLabel = document.querySelector('#contact-form-title');
      const lr = left?.getBoundingClientRect();
      const rr = right?.getBoundingClientRect();
      const pr = photo?.getBoundingClientRect();
      const pan = panel?.getBoundingClientRect();
      return {
        leftH: lr ? Math.round(lr.height) : null,
        rightH: rr ? Math.round(rr.height) : null,
        heightsMatch: lr && rr ? Math.abs(lr.height - rr.height) < 2 : null,
        photoBottom: pr ? Math.round(pr.bottom) : null,
        panelBottom: pan ? Math.round(pan.bottom) : null,
        bottomsMatch: pr && pan ? Math.abs(pr.bottom - pan.bottom) < 2 : null,
        labelsTopMatch:
          infoLabel && formLabel
            ? Math.abs(
                infoLabel.getBoundingClientRect().top -
                  formLabel.getBoundingClientRect().top,
              ) < 2
            : null,
        asideSrc: document.querySelector('.contact-page__aside-img')?.getAttribute('src'),
        heroSrc: document.querySelector('.contact-page__hero-img')?.getAttribute('src'),
        panelPad: panel ? getComputedStyle(panel).padding : null,
        fieldBg: document.querySelector('.contact-page__control')
          ? getComputedStyle(document.querySelector('.contact-page__control')).backgroundColor
          : null,
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function openPage(width, height) {
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
  await session.call('Page.navigate', { url: BASE })
  await sleep(3200)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(700)
  return session
}

async function shoot(width, height, label) {
  let session = await openPage(width, height)
  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.contact-page__body')?.scrollIntoView({block:'start'})`,
  })
  await sleep(600)
  await shot(session, join(outDir, `contact-cols-${label}.png`))
  const meta = await measure(session)
  writeFileSync(join(outDir, `contact-meta-${label}.json`), JSON.stringify(meta, null, 2))
  console.log('meta', label, meta)
  session.close()

  session = await openPage(width, height)
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

  session = await openPage(width, height)
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('.contact-page__body')?.scrollIntoView({block:'center'});
      document.querySelector('.contact-page__form-actions button')?.click();
    })()`,
  })
  await sleep(500)
  await shot(session, join(outDir, `contact-error-${label}.png`))
  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(390, 844, '390')
console.log('done', outDir)
