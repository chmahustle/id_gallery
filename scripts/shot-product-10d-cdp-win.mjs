import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = 'C:\\Temp\\idg-10d'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PAGE = 'http://127.0.0.1:5173/product/model-11-armchair/'

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
      const h1 = document.querySelector('.product-page__info h1');
      const price = document.querySelector('.product-page__price');
      const actions = document.querySelector('.product-page__actions');
      const btn = actions?.querySelector('.ui-btn');
      const finishes = document.querySelector('#product-finishes');
      const finTitle = finishes?.querySelector('.product-page__finishes-title');
      const main = document.querySelector('.product-page__main-image');
      const thumbs = document.querySelector('.product-page__thumbs');
      const anchors = document.querySelector('.product-page__anchors');
      const specs = [...document.querySelectorAll('.product-page__specs dd')].map((d) => d.textContent.trim());
      const gap = (a, b) => {
        if (!a || !b) return null;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return Math.round(rb.top - ra.bottom);
      };
      const blockStyles = finishes ? getComputedStyle(finishes) : null;
      const thumbCols = thumbs ? getComputedStyle(thumbs).gridTemplateColumns : null;
      const thumbCount = thumbs ? thumbs.querySelectorAll('li').length : 0;
      return {
        hasAnchors: Boolean(anchors),
        h1Top: h1 && Math.round(h1.getBoundingClientRect().top),
        mainTop: main && Math.round(main.getBoundingClientRect().top),
        titleAlignDelta: h1 && main
          ? Math.round(h1.getBoundingClientRect().top - main.getBoundingClientRect().top)
          : null,
        gapTitleToPrice: gap(h1, price),
        gapPriceToBtn: gap(price, btn),
        gapBtnToFinishesBlock: gap(actions, finishes),
        finishesPadTop: blockStyles ? blockStyles.paddingTop : null,
        finishesPadBottom: blockStyles ? blockStyles.paddingBottom : null,
        gapLineToFinTitle: finishes && finTitle
          ? Math.round(
              finTitle.getBoundingClientRect().top -
                finishes.getBoundingClientRect().top,
            )
          : null,
        specs,
        thumbCols,
        thumbCount,
        galleryBottom: (() => {
          const g = document.querySelector('.product-page__gallery')?.getBoundingClientRect();
          return g ? Math.round(g.bottom) : null;
        })(),
        viewportH: window.innerHeight,
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
  await sleep(2800)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(500)
  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(300)

  const metrics = await measure(session)
  writeFileSync(join(outDir, `armchair-metrics-${label}.json`), JSON.stringify(metrics, null, 2))
  console.log(label, metrics)
  await shot(session, join(outDir, `armchair-hero-${label}.png`))

  // full page via tall viewport
  const { result: sz } = await session.call('Runtime.evaluate', {
    expression: `({ w: Math.max(document.documentElement.scrollWidth, ${width}), h: Math.min(document.documentElement.scrollHeight, 12000) })`,
    returnByValue: true,
  })
  await session.call('Emulation.setDeviceMetricsOverride', {
    width: sz.value.w,
    height: sz.value.h,
    deviceScaleFactor: 1,
    mobile: width < 768,
  })
  await sleep(400)
  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(200)
  await shot(session, join(outDir, `armchair-full-${label}.png`))

  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(1440, 900, '1440')
await shoot(390, 844, '390')
console.log('done', outDir)
