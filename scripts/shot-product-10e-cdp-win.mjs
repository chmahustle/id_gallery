import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = 'C:\\Temp\\idg-10e'
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
      const header = document.querySelector('header.header');
      const main = document.querySelector('.product-page__main-image');
      const thumbs = document.querySelector('.product-page__thumbs');
      const thumbBtn = thumbs?.querySelector('button');
      const h1 = document.querySelector('.product-page__info h1');
      const summary = document.querySelector('.product-page__summary');
      const price = document.querySelector('.product-page__price');
      const order = [];
      const info = document.querySelector('.product-page__info');
      if (info) {
        for (const el of info.querySelectorAll('h1, .product-page__summary, .product-page__price, .product-page__actions, #product-finishes, #product-description, #product-specs')) {
          if (el.matches('h1')) order.push('title');
          else if (el.classList.contains('product-page__summary')) order.push('summary');
          else if (el.classList.contains('product-page__price')) order.push('price');
          else if (el.classList.contains('product-page__actions')) order.push('actions');
          else if (el.id === 'product-finishes') order.push('finishes');
          else if (el.id === 'product-description') order.push('desc-acc');
          else if (el.id === 'product-specs') order.push('specs-acc');
        }
      }
      const relatedImgs = [...document.querySelectorAll('.product-related__grid .product-grid__media img')]
        .map((img) => img.getAttribute('src'))
        .filter(Boolean);
      const mr = main?.getBoundingClientRect();
      const tr = thumbs?.getBoundingClientRect();
      const br = thumbBtn?.getBoundingClientRect();
      const hr = header?.getBoundingClientRect();
      return {
        headerH: hr ? Math.round(hr.height) : null,
        mainW: mr ? Math.round(mr.width) : null,
        mainH: mr ? Math.round(mr.height) : null,
        mainRatio: mr && mr.height ? +(mr.width / mr.height).toFixed(3) : null,
        thumbW: br ? Math.round(br.width) : null,
        thumbH: br ? Math.round(br.height) : null,
        thumbsBottom: tr ? Math.round(tr.bottom) : null,
        galleryFits1080: tr ? tr.bottom <= 1080 : false,
        order,
        summary: summary?.textContent?.trim()?.slice(0, 80) || null,
        descAcc: document.querySelector('#product-description .product-page__desc')?.textContent?.trim() || null,
        relatedImgs,
        relatedDupes: relatedImgs.filter((s, i) => relatedImgs.indexOf(s) !== i),
        gapTitleSummary: h1 && summary
          ? Math.round(summary.getBoundingClientRect().top - h1.getBoundingClientRect().bottom)
          : null,
        gapSummaryPrice: summary && price
          ? Math.round(price.getBoundingClientRect().top - summary.getBoundingClientRect().bottom)
          : null,
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
  writeFileSync(
    join(outDir, `armchair-metrics-${label}.json`),
    JSON.stringify(metrics, null, 2),
  )
  console.log(label, metrics)
  await shot(session, join(outDir, `armchair-hero-${label}.png`))

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
