/**
 * CDP: /interiors/ @ 1920 / 1440 / 390 — ряды, gap фото↔текст, hero.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-11b'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const LIST = 'http://127.0.0.1:5173/interiors/'

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
      const rows = [...document.querySelectorAll('.interiors-page__row')];
      const gaps = rows.map((row, i) => {
        const media = row.querySelector('.interiors-page__row-media');
        const copy = row.querySelector('.interiors-page__row-copy');
        if (!media || !copy) return null;
        const mr = media.getBoundingClientRect();
        const cr = copy.getBoundingClientRect();
        const gap = mr.left < cr.left
          ? Math.round(cr.left - mr.right)
          : Math.round(mr.left - cr.right);
        return {
          index: i + 1,
          title: row.querySelector('.interiors-page__row-title')?.textContent?.trim(),
          mirrored: row.classList.contains('interiors-page__row--mirror'),
          mediaW: Math.round(mr.width),
          mediaH: Math.round(mr.height),
          gapPx: gap,
          gutterLeft: Math.round(mr.left < cr.left ? mr.left : Math.min(mr.left, cr.left)),
        };
      });
      const heroImg = document.querySelector('.interiors-page__hero-img');
      return {
        viewport: { w: window.innerWidth, h: window.innerHeight },
        heroSrc: heroImg?.currentSrc || heroImg?.getAttribute('src') || null,
        heroNatural: heroImg ? { w: heroImg.naturalWidth, h: heroImg.naturalHeight } : null,
        heroDisplay: heroImg
          ? {
              w: Math.round(heroImg.getBoundingClientRect().width),
              h: Math.round(heroImg.getBoundingClientRect().height),
            }
          : null,
        columnGap: getComputedStyle(rows[0] || document.body).columnGap,
        rows: gaps,
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
  await session.call('Page.navigate', { url: LIST })
  await sleep(3500)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(800)

  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(1000)
  await shot(session, join(outDir, `interiors-hero-${label}.png`))

  for (let i = 0; i < 3; i++) {
    await session.call('Runtime.evaluate', {
      expression: `document.querySelectorAll('.interiors-page__row')[${i}]?.scrollIntoView({block:'center'})`,
    })
    await sleep(700)
    await shot(session, join(outDir, `interiors-row${i + 1}-${label}.png`))
  }

  const meta = await measure(session)
  writeFileSync(join(outDir, `interiors-meta-${label}.json`), JSON.stringify(meta, null, 2))
  console.log('meta', label, JSON.stringify(meta, null, 2))
  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(1440, 900, '1440')
await shoot(390, 844, '390')
console.log('done', outDir)
