import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = 'C:\\Temp\\idg-9g'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function relLum(r, g, b) {
  const lin = (c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(l1, l2) {
  const a = Math.max(l1, l2)
  const b = Math.min(l1, l2)
  return (a + 0.05) / (b + 0.05)
}

function mixSnow(alpha) {
  // snow over warm black: out = snow*a + ink*(1-a)
  const s = [242, 240, 235]
  const ink = [44, 41, 41]
  return s.map((v, i) => Math.round(v * alpha + ink[i] * (1 - alpha)))
}

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

async function waitIsIn(session, selector) {
  await session.call('Runtime.evaluate', {
    expression: `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center'})`,
  })
  for (let i = 0; i < 30; i++) {
    const { result } = await session.call('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(selector)})?.classList.contains('is-in')`,
      returnByValue: true,
    })
    if (result.value) {
      await sleep(900)
      return
    }
    await sleep(200)
  }
}

async function viewportShot(session, path) {
  const { data } = await session.call('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  })
  writeFileSync(path, Buffer.from(data, 'base64'))
}

async function boxOf(session, selector) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function shotSection(session, selector, pathBase, { waitReveal = false } = {}) {
  if (waitReveal) await waitIsIn(session, selector)
  else {
    await session.call('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center'})`,
    })
    await sleep(500)
  }
  const box = await boxOf(session, selector)
  await viewportShot(session, pathBase + '.vp.png')
  writeFileSync(pathBase + '.box.json', JSON.stringify(box))
  console.log(selector, box)
  return box
}

async function heroSeam(session) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const hero = document.querySelector('.brand-page__hero');
      const scrim = document.querySelector('.brand-page__hero-scrim');
      const content = document.querySelector('.brand-page__hero-content');
      if (!hero || !scrim) return null;
      const hs = getComputedStyle(scrim);
      const cs = content ? getComputedStyle(content) : null;
      const before = content ? getComputedStyle(content, '::before') : null;
      return {
        scrimInset: { top: hs.top, right: hs.right, bottom: hs.bottom, left: hs.left },
        scrimPos: hs.position,
        scrimW: scrim.getBoundingClientRect().width,
        heroW: hero.getBoundingClientRect().width,
        contentMaxW: cs?.maxWidth,
        contentBeforeContent: before?.content,
        contentBeforeW: before?.width,
        fullBleed: Math.abs(scrim.getBoundingClientRect().width - hero.getBoundingClientRect().width) < 2,
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function measureCards(session) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const cards = [...document.querySelectorAll('.brand-page__card')];
      const section = document.querySelector('.brand-page__cards');
      const banner = document.querySelector('.brand-page__next-banner');
      const gap = document.querySelector('.brand-page__banner-gap');
      if (!cards.length) return null;
      const heights = cards.map((c) => Math.round(c.getBoundingClientRect().height));
      const sr = section.getBoundingClientRect();
      const br = banner.getBoundingClientRect();
      // расстояние от низа сетки карточек до верха баннера
      const grid = document.querySelector('.brand-page__cards-grid');
      const gr = grid.getBoundingClientRect();
      return {
        cardHeights: heights,
        maxCardHeight: Math.max(...heights),
        cardsPass: Math.max(...heights) <= 360 && Math.max(...heights) >= 320,
        gapCardsToBanner: Math.round(br.top - gr.bottom),
        sectionPadBottom: getComputedStyle(section).paddingBottom,
        afterGapH: gap ? Math.round(gap.getBoundingClientRect().height) : null,
        afterGapAfterBanner: gap
          ? Math.round(gap.getBoundingClientRect().top - br.bottom)
          : null,
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function nextAlign(session) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const name = document.querySelector('.brand-page__next-name');
      const circle = document.querySelector('.brand-page__next-circle');
      const content = document.querySelector('.brand-page__next-content');
      if (!name || !circle || !content) return null;
      const nr = name.getBoundingClientRect();
      const cr = circle.getBoundingClientRect();
      const sr = content.getBoundingClientRect();
      const gutter = parseFloat(getComputedStyle(document.querySelector('.brand-page')).getPropertyValue('--brand-gutter'));
      return {
        nameBottom: Math.round(nr.bottom),
        circleBottom: Math.round(cr.bottom),
        baselineDelta: Math.round(cr.bottom - nr.bottom),
        circleRight: Math.round(cr.right),
        contentRight: Math.round(sr.right),
        circleSize: Math.round(cr.width),
        rightAlignDelta: Math.round(sr.right - cr.right),
        gutterApprox: gutter,
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

// Contrast: text over Warm Black scrim (worst-case solid ink under text zone)
const snow = [242, 240, 235]
const ink = [44, 41, 41]
const Lsnow = relLum(...snow)
const Link = relLum(...ink)
const eyebrow92 = mixSnow(0.92)
const Leyebrow = relLum(...eyebrow92)
const contrastReport = {
  method:
    'WCAG 2.1 relative luminance. Text vs Warm Black #2C2929 (scrim floor under titles). Photo under scrim is darker → contrast only improves.',
  name_snow_100_vs_ink: Number(contrast(Lsnow, Link).toFixed(2)),
  eyebrow_snow_92_vs_ink: Number(contrast(Leyebrow, Link).toFixed(2)),
  eyebrow_rgb: eyebrow92,
  pass_aa_4_5: contrast(Lsnow, Link) >= 4.5 && contrast(Leyebrow, Link) >= 4.5,
  brands: ['visionnaire', 'molteni', 'baxter', 'bonaldo'],
}

async function shootBrand(slug, width, height, label, { hover = false } = {}) {
  const url = `http://127.0.0.1:5173/brands/${slug}/`
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
  await sleep(4200)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(600)

  const prefix = join(outDir, `${slug}`)

  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(1200)
  await viewportShot(session, `${prefix}-hero-${label}.vp.png`)
  writeFileSync(
    `${prefix}-hero-${label}.box.json`,
    JSON.stringify({ x: 0, y: 0, width, height }),
  )
  const seam = await heroSeam(session)
  console.log('hero seam', seam)

  await waitIsIn(session, '.brand-page__cards')
  const cardsBox = await shotSection(session, '.brand-page__cards', `${prefix}-cards-${label}`)
  const cardsM = await measureCards(session)

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.brand-page__next-banner')?.scrollIntoView({block:'center'})`,
  })
  await sleep(600)
  const nextBox = await boxOf(session, '.brand-page__next-banner')
  await viewportShot(session, `${prefix}-next-${label}.vp.png`)
  writeFileSync(`${prefix}-next-${label}.box.json`, JSON.stringify(nextBox))
  const align = await nextAlign(session)
  console.log('next align', align)

  if (hover && width >= 1280) {
    await session.call('Runtime.evaluate', {
      expression: `(() => {
        let s = document.getElementById('hover-force');
        if (!s) { s = document.createElement('style'); s.id='hover-force'; document.head.appendChild(s); }
        s.textContent = [
          '.brand-page__next-banner.is-hover-force .brand-page__next-img{transform:scale(1.04)!important}',
          '.brand-page__next-banner.is-hover-force .brand-page__next-circle{background:#F2F0EB!important;color:#2C2929!important}',
          '.brand-page__next-banner.is-hover-force .brand-page__next-circle-arrow{transform:translateX(4px)!important}',
        ].join('');
        document.querySelector('.brand-page__next-banner')?.classList.add('is-hover-force');
      })()`,
    })
    await sleep(500)
    await viewportShot(session, `${prefix}-next-hover-${label}.vp.png`)
    writeFileSync(`${prefix}-next-hover-${label}.box.json`, JSON.stringify(nextBox))
  }

  const measure = {
    slug,
    label,
    cardsSectionHeight: cardsBox?.height ?? null,
    ...cardsM,
    seam,
    align,
  }
  writeFileSync(`${prefix}-measure-${label}.json`, JSON.stringify(measure, null, 2))
  console.log('measure', measure)
  session.close()
  return measure
}

writeFileSync(join(outDir, 'contrast.json'), JSON.stringify(contrastReport, null, 2))
console.log('contrast', contrastReport)

const reports = []
reports.push(await shootBrand('visionnaire', 1920, 1080, '1920', { hover: true }))
reports.push(await shootBrand('visionnaire', 390, 844, '390'))
reports.push(await shootBrand('bonaldo', 1920, 1080, '1920', { hover: true }))
reports.push(await shootBrand('bonaldo', 390, 844, '390'))
// hero seam also at 1440
reports.push(await shootBrand('visionnaire', 1440, 900, '1440'))
writeFileSync(join(outDir, 'measure-summary.json'), JSON.stringify(reports, null, 2))
console.log('done', outDir)
