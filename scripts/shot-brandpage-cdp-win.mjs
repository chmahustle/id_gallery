import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = 'C:\\Temp\\idg-9c'
mkdirSync(outDir, { recursive: true })
const PAGE = 'http://127.0.0.1:5173/brands/visionnaire/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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
  close() { this.ws.close() }
}

async function captureViewport(session, path) {
  const { data } = await session.call('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  })
  writeFileSync(path, Buffer.from(data, 'base64'))
  console.log('wrote', path)
}

async function waitIsIn(session, selector) {
  await session.call('Runtime.evaluate', {
    expression: `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center'})`,
  })
  for (let i = 0; i < 25; i++) {
    const { result } = await session.call('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(selector)})?.classList.contains('is-in')`,
      returnByValue: true,
    })
    if (result.value) {
      await sleep(700) // transition
      return
    }
    await sleep(200)
  }
  console.warn('timeout is-in', selector)
}

async function clipEl(session, selector, path) {
  await waitIsIn(session, selector)
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.max(0,r.x), y: Math.max(0,r.y), width: Math.min(r.width, window.innerWidth - Math.max(0,r.x)), height: Math.min(r.height, window.innerHeight - Math.max(0,r.y)) };
    })()`,
    returnByValue: true,
  })
  const box = result?.value
  if (!box || box.width < 2 || box.height < 2) {
    console.warn('no box', selector, box)
    return
  }
  const { data } = await session.call('Page.captureScreenshot', {
    format: 'png',
    clip: { ...box, scale: 1 },
    fromSurface: true,
    captureBeyondViewport: false,
  })
  writeFileSync(path, Buffer.from(data, 'base64'))
  console.log('wrote', path, `${Math.round(box.width)}x${Math.round(box.height)}`)
}

async function shoot(width, height, label, { reduced = false } = {}) {
  const target = await openTarget('about:blank')
  const session = new Session(target.webSocketDebuggerUrl)
  await session.ready()
  await session.call('Page.enable')
  await session.call('Runtime.enable')
  await session.call('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile: width < 768,
  })
  if (reduced) {
    await session.call('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })
  }
  await session.call('Page.navigate', { url: PAGE })
  await sleep(4000)
  await session.call('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true })
  await sleep(1000)

  if (reduced) {
    const { result } = await session.call('Runtime.evaluate', {
      expression: `(() => {
        const hero = document.querySelector('.brand-page__hero-img, .brand-page__hero-ph');
        const content = document.querySelector('.brand-page__hero-content');
        const csH = hero && getComputedStyle(hero);
        const csC = content && getComputedStyle(content);
        return {
          heroTransform: csH?.transform,
          heroTransition: csH?.transitionDuration,
          contentOpacity: csC?.opacity,
          contentTransform: csC?.transform,
          runningAnims: document.getAnimations().filter(a => a.playState === 'running').length,
        };
      })()`,
      returnByValue: true,
    })
    writeFileSync(join(outDir, 'reduced-motion.json'), JSON.stringify(result.value, null, 2))
    console.log('reduced-motion', result.value)
    session.close()
    return
  }

  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(1600)
  await captureViewport(session, join(outDir, `visionnaire-hero-${label}.png`))

  await clipEl(session, '.brand-page__about', join(outDir, `visionnaire-about-${label}.png`))
  await clipEl(session, '.brand-page__rows', join(outDir, `visionnaire-rows-${label}.png`))

  if (width >= 1280) {
    await waitIsIn(session, '.brand-page__row')
    await session.call('Runtime.evaluate', {
      expression: `(() => {
        let s = document.getElementById('hover-force');
        if (!s) { s = document.createElement('style'); s.id = 'hover-force'; document.head.appendChild(s); }
        s.textContent = '.brand-page__row.is-hover-force{background-color:#D7D2CB!important}.brand-page__row.is-hover-force .ui-btn__arrow{transform:translateX(6px)!important}';
        document.querySelector('.brand-page__row')?.classList.add('is-hover-force');
      })()`,
    })
    await sleep(400)
    await clipEl(session, '.brand-page__row', join(outDir, `visionnaire-row-hover-${label}.png`))
  }

  await clipEl(session, '.brand-page__request', join(outDir, `visionnaire-request-${label}.png`))

  // full page
  for (const sel of ['.brand-page__about','.brand-page__rows','.brand-page__request']) {
    await waitIsIn(session, sel)
  }
  const { result: sz } = await session.call('Runtime.evaluate', {
    expression: `({w: Math.max(document.documentElement.scrollWidth, ${width}), h: Math.min(document.documentElement.scrollHeight, 14000)})`,
    returnByValue: true,
  })
  await session.call('Emulation.setDeviceMetricsOverride', {
    width: sz.value.w, height: sz.value.h, deviceScaleFactor: 1, mobile: width < 768,
  })
  await sleep(500)
  await captureViewport(session, join(outDir, `visionnaire-full-${label}.png`))
  session.close()
}

function contrastCalc() {
  function lum(r, g, b) {
    const a = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) })
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]
  }
  function ratio(c1, c2) {
    const L1 = lum(c1.r, c1.g, c1.b), L2 = lum(c2.r, c2.g, c2.b)
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
  }
  function mix(fg, a, bg) {
    return { r: Math.round(fg.r * a + bg.r * (1 - a)), g: Math.round(fg.g * a + bg.g * (1 - a)), b: Math.round(fg.b * a + bg.b * (1 - a)) }
  }
  const snow = { r: 242, g: 240, b: 235 }, ink = { r: 44, g: 41, b: 41 }
  const combinedA = 1 - (1 - 0.72) * (1 - 0.55)
  const bgWhite = mix(ink, combinedA, { r: 255, g: 255, b: 255 })
  const bgBlack = mix(ink, combinedA, { r: 0, g: 0, b: 0 })
  const out = {
    method: 'WCAG 2.1: scrim .72 + underlay .55 over white/black; Snow Ivory text opacities.',
    combined_scrim_alpha: +combinedA.toFixed(3),
    title_100_over_white: +ratio(snow, bgWhite).toFixed(2),
    title_100_over_black: +ratio(snow, bgBlack).toFixed(2),
    lead_90_over_white: +ratio(mix(snow, 0.9, bgWhite), bgWhite).toFixed(2),
    crumbs_68_over_white: +ratio(mix(snow, 0.68, bgWhite), bgWhite).toFixed(2),
    pass_aa_4_5: null,
  }
  out.pass_aa_4_5 = out.title_100_over_white >= 4.5 && out.lead_90_over_white >= 4.5 && out.crumbs_68_over_white >= 4.5
  return out
}

await shoot(1920, 1080, '1920')
await shoot(390, 844, '390')
await shoot(1920, 1080, 'reduced', { reduced: true })
const c = contrastCalc()
writeFileSync(join(outDir, 'contrast.json'), JSON.stringify(c, null, 2))
console.log('contrast', c)
console.log('done', outDir)
