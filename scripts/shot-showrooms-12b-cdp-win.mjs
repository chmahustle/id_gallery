/**
 * CDP: /showrooms/ @ 1920 / 1440 / 390 — gap фото↔текст, ряды, details.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-12b'
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
      const rows = [...document.querySelectorAll('.showrooms-page__row')];
      const gaps = rows.map((row, i) => {
        const media = row.querySelector('.showrooms-page__row-media');
        const copy = row.querySelector('.showrooms-page__row-copy');
        if (!media || !copy) return null;
        const mr = media.getBoundingClientRect();
        const cr = copy.getBoundingClientRect();
        const gap = mr.left < cr.left
          ? Math.round(cr.left - mr.right)
          : Math.round(mr.left - cr.right);
        return {
          index: i + 1,
          mirrored: row.classList.contains('showrooms-page__row--mirror'),
          mediaX: Math.round(mr.left),
          copyRight: Math.round(cr.right),
          copyLeft: Math.round(cr.left),
          copyW: Math.round(cr.width),
          gapPx: gap,
          title: row.querySelector('.showrooms-page__row-title')?.textContent?.trim(),
        };
      });
      const imgs = [...document.querySelectorAll(
        '.showrooms-page__hero-img, .showrooms-page__row-crop img, #showrooms-visit .ff-banner__img'
      )].map((img) => img.getAttribute('src')).filter(Boolean);
      return {
        viewport: { w: window.innerWidth, h: window.innerHeight },
        columnGap: getComputedStyle(rows[0] || document.body).columnGap,
        rows: gaps,
        imgs,
        imgDupes: imgs.filter((s, i) => imgs.indexOf(s) !== i),
        openHint: document.querySelector('.showrooms-page__row.is-open .showrooms-page__row-hint')?.textContent?.trim() || null,
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
  await sleep(700)

  for (let i = 0; i < 2; i++) {
    await session.call('Runtime.evaluate', {
      expression: `document.querySelectorAll('.showrooms-page__row')[${i}]?.scrollIntoView({block:'center'})`,
    })
    await sleep(600)
    await shot(session, join(outDir, `showrooms-row${i + 1}-${label}.png`))
  }

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.showrooms-page__row button')?.click()`,
  })
  await sleep(450)
  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.showrooms-page__row')?.scrollIntoView({block:'center'})`,
  })
  await sleep(350)
  await shot(session, join(outDir, `showrooms-details-${label}.png`))

  const meta = await measure(session)
  writeFileSync(join(outDir, `showrooms-meta-${label}.json`), JSON.stringify(meta, null, 2))
  console.log('meta', label, JSON.stringify(meta, null, 2))
  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(1440, 900, '1440')
await shoot(390, 844, '390')
console.log('done', outDir)
