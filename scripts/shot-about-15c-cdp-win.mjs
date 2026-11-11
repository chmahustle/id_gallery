/**
 * CDP: /about/ brands list — full-bleed hover + scrollWidth check
 * @ 1920 (покой + hover 2-я строка), 1440, 390
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-15c'
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
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const list = document.querySelector('.about-page__brand-list');
      const link = document.querySelectorAll('.about-page__brand-link')[1];
      const lr = list?.getBoundingClientRect();
      const kr = link?.getBoundingClientRect();
      const cs = link ? getComputedStyle(link) : null;
      return {
        scrollWidth,
        innerWidth,
        noHScroll: scrollWidth === innerWidth,
        listLeft: lr ? Math.round(lr.left) : null,
        listRight: lr ? Math.round(lr.right) : null,
        listWidth: lr ? Math.round(lr.width) : null,
        linkPadInline: cs?.paddingInline,
        secondBg: cs?.backgroundColor,
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
  await sleep(600)

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.about-page__brands')?.scrollIntoView({block:'center'})`,
  })
  await sleep(800)

  await shot(session, join(outDir, `about-brands-rest-${label}.png`))

  if (width >= 1280) {
    await session.call('Runtime.evaluate', {
      expression: `(() => {
        const links = document.querySelectorAll('.about-page__brand-link');
        const second = links[1];
        second?.classList.add('is-hover-force');
        let s = document.getElementById('hover-force');
        if (!s) {
          s = document.createElement('style');
          s.id = 'hover-force';
          document.head.appendChild(s);
        }
        s.textContent = [
          '.about-page__brand-link.is-hover-force{background-color:var(--color-cream)!important}',
          '.about-page__brand-link.is-hover-force .about-page__brand-name{transform:translateX(1rem)!important}',
          '.about-page__brand-link.is-hover-force .about-page__brand-arrow{opacity:1!important;transform:translateX(0.75rem)!important}',
        ].join('');
      })()`,
    })
    await sleep(350)
    await shot(session, join(outDir, `about-brands-hover2-${label}.png`))
  }

  const meta = await measure(session)
  writeFileSync(join(outDir, `about-meta-${label}.json`), JSON.stringify(meta, null, 2))
  console.log('meta', label, meta)
  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(1440, 900, '1440')
await shoot(390, 844, '390')
console.log('done', outDir)
