import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = 'C:\\Temp\\idg-10c'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const PAGES = [
  { key: 'sofa', path: '/product/model-02-sofa/' },
  { key: 'armchair', path: '/product/model-11-armchair/' },
  { key: 'bonaldo-2rel', path: '/product/model-03-armchair/' },
]

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

async function viewportShot(session, path) {
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
      const gallery = document.querySelector('.product-page__gallery');
      const main = document.querySelector('.product-page__main-image');
      const thumbs = document.querySelector('.product-page__thumbs');
      const h1 = document.querySelector('.product-page__info h1');
      const related = document.querySelector('.product-related__grid');
      const cards = related ? related.querySelectorAll('.product-grid__card').length : 0;
      const brands = [...document.querySelectorAll('.product-grid__brand')].map((el) => el.textContent.trim());
      const g = gallery?.getBoundingClientRect();
      const m = main?.getBoundingClientRect();
      const t = thumbs?.getBoundingClientRect();
      const layout = getComputedStyle(document.querySelector('.product-page__layout') || document.body);
      return {
        viewport: { w: window.innerWidth, h: window.innerHeight },
        galleryBottom: g ? Math.round(g.bottom) : null,
        mainH: m ? Math.round(m.height) : null,
        thumbsH: t ? Math.round(t.height) : null,
        galleryFitsFirstScreen: g ? g.bottom <= window.innerHeight - 8 : false,
        h1: h1?.textContent?.replace(/\\s+/g, ' ').trim() || null,
        h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
        gridCols: layout.gridTemplateColumns,
        relatedCards: cards,
        brandLabels: brands,
        lowerBrandHits: brands.filter((b) => b && b === b.toLowerCase() && /[a-z]/.test(b)),
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function shoot(page, width, height, label) {
  const url = `http://127.0.0.1:5173${page.path}`
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
  await sleep(2800)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(600)
  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(400)

  const metrics = await measure(session)
  writeFileSync(
    join(outDir, `${page.key}-metrics-${label}.json`),
    JSON.stringify(metrics, null, 2),
  )
  console.log(page.key, label, metrics)

  await viewportShot(session, join(outDir, `${page.key}-hero-${label}.png`))

  // click 2nd thumb if present
  const { result: clicked } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelectorAll('.product-page__thumbs button')[1];
      if (!btn) return false;
      btn.click();
      return true;
    })()`,
    returnByValue: true,
  })
  if (clicked.value) {
    await sleep(350)
    await viewportShot(session, join(outDir, `${page.key}-thumb2-${label}.png`))
  }

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.product-related')?.scrollIntoView({block:'start'})`,
  })
  await sleep(500)
  await viewportShot(session, join(outDir, `${page.key}-related-${label}.png`))

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.product-page__stack')?.scrollIntoView({block:'start'})`,
  })
  await sleep(400)
  await viewportShot(session, join(outDir, `${page.key}-stack-${label}.png`))

  session.close()
}

const viewports = [
  [1920, 1080, '1920'],
  [1440, 900, '1440'],
  [390, 844, '390'],
]

for (const page of PAGES) {
  for (const [w, h, label] of viewports) {
    await shoot(page, w, h, label)
  }
}

console.log('done', outDir)
