/**
 * CDP screenshots: /about/ @ 1920 и 390.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-15'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PAGE = 'http://127.0.0.1:5173/about/'

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
        '.about-page__hero-img, .about-page__approach-crop img'
      )].map((img) => img.getAttribute('src')).filter(Boolean);
      const body = document.body?.innerText || '';
      const forbidden = /в Казахстане|шоурум|эксклюзив|Все бренды|В каталог|Записаться на визит|индивидуальный|О компании/i;
      const broken = [...document.querySelectorAll('img')].filter((img) => !img.getAttribute('src'));
      return {
        h1: document.querySelector('#about-hero-title')?.textContent?.trim(),
        brands: [...document.querySelectorAll('.about-page__brand-name')].map((el) => el.textContent?.trim()),
        imgs,
        imgDupes: imgs.filter((s, i) => imgs.indexOf(s) !== i),
        forbiddenHits: forbidden.test(body) ? body.match(forbidden) : null,
        crumbs: Boolean(document.querySelector('.page-crumbs')),
        brokenImgs: broken.length,
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
  await shot(session, join(outDir, `about-hero-${label}.png`))

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.about-page__approach')?.scrollIntoView({block:'center'})`,
  })
  await sleep(700)
  await shot(session, join(outDir, `about-approach-${label}.png`))

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.about-page__brands')?.scrollIntoView({block:'center'})`,
  })
  await sleep(700)
  await shot(session, join(outDir, `about-brands-${label}.png`))

  if (width >= 1280) {
    await session.call('Runtime.evaluate', {
      expression: `(() => {
        let s = document.getElementById('hover-force');
        if (!s) { s = document.createElement('style'); s.id = 'hover-force'; document.head.appendChild(s); }
        s.textContent = '.about-page__brand-link.is-hover-force{background-color:var(--color-cream)!important}.about-page__brand-link.is-hover-force .about-page__brand-name{transform:translateX(1rem)!important}.about-page__brand-link.is-hover-force .about-page__brand-arrow{opacity:1!important;transform:translateX(0.75rem)!important}';
        document.querySelector('.about-page__brand-link')?.classList.add('is-hover-force');
      })()`,
    })
    await sleep(400)
    await shot(session, join(outDir, `about-brands-hover-${label}.png`))
  }

  const meta = await measure(session)
  writeFileSync(join(outDir, `about-meta-${label}.json`), JSON.stringify(meta, null, 2))
  console.log('meta', label, meta)
  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(390, 844, '390')
console.log('done', outDir)
