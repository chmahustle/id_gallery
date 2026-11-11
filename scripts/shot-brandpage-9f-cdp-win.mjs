import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = 'C:\\Temp\\idg-9f'
mkdirSync(outDir, { recursive: true })
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

async function shotSection(session, selector, pathBase, { waitReveal = true } = {}) {
  if (waitReveal) await waitIsIn(session, selector)
  else {
    await session.call('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center'})`,
    })
    await sleep(500)
  }
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    })()`,
    returnByValue: true,
  })
  const box = result.value
  await viewportShot(session, pathBase + '.vp.png')
  writeFileSync(pathBase + '.box.json', JSON.stringify(box))
  console.log(selector, box)
  return box
}

async function measureCards(session) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const grid = document.querySelector('.brand-page__cards-grid');
      const cards = [...document.querySelectorAll('.brand-page__card')];
      const section = document.querySelector('.brand-page__cards');
      if (!grid || !cards.length) return null;
      const g = grid.getBoundingClientRect();
      return {
        gridHeight: Math.round(g.height),
        sectionHeight: Math.round(section.getBoundingClientRect().height),
        cardHeights: cards.map((c) => Math.round(c.getBoundingClientRect().height)),
        maxCardHeight: Math.max(...cards.map((c) => Math.round(c.getBoundingClientRect().height))),
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function arrowContrast(session) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const arrow = document.querySelector('.brand-page__next-arrow');
      const banner = document.querySelector('.brand-page__next-banner');
      if (!arrow || !banner) return null;
      const cs = getComputedStyle(arrow);
      const color = cs.color;
      const stroke = cs.stroke;
      const rect = arrow.getBoundingClientRect();
      // sample pixels under arrow via canvas from page screenshot is hard; report CSS color + size
      return {
        color,
        stroke,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        snow: 'rgb(242, 240, 235)',
        // Snow Ivory #F2F0EB on dark scrim (~#2C2929 at 0.72 over photo):
        // relative luminance snow≈0.88, dark≈0.02 → contrast ≈ 12:1 >> 3:1
        note: 'Snow Ivory arrow on Warm Black scrim; WCAG large UI ≥3:1 expected',
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function shootBrand(slug, width, height, label, { hoverCards = false } = {}) {
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

  const cardsBox = await shotSection(
    session,
    '.brand-page__cards',
    `${prefix}-cards-${label}`,
  )
  const cardsMeasure = await measureCards(session)

  if (hoverCards && width >= 1280) {
    await waitIsIn(session, '.brand-page__cards')
    await session.call('Runtime.evaluate', {
      expression: `(() => {
        let s = document.getElementById('hover-force');
        if (!s) { s = document.createElement('style'); s.id='hover-force'; document.head.appendChild(s); }
        s.textContent = [
          '.brand-page__card--cream.is-hover-force{background:#2C2929!important;color:#F2F0EB!important}',
          '.brand-page__card--cream.is-hover-force .brand-page__card-text{color:rgba(242,240,235,.68)!important}',
          '.brand-page__card--cream.is-hover-force .ui-btn--secondary{border-color:#F2F0EB!important;color:#F2F0EB!important;background:transparent!important}',
          '.brand-page__card--cream.is-hover-force .ui-btn__arrow{transform:translateX(6px)!important}',
          '.brand-page__card--ink.is-hover-force{background:#4A412A!important;color:#F2F0EB!important}',
          '.brand-page__card--ink.is-hover-force .ui-btn__arrow{transform:translateX(6px)!important}',
        ].join('');
        document.querySelector('.brand-page__card--cream')?.classList.add('is-hover-force');
      })()`,
    })
    await sleep(400)
    await shotSection(session, '.brand-page__cards', `${prefix}-cards-hover-cream-${label}`, {
      waitReveal: false,
    })
    await session.call('Runtime.evaluate', {
      expression: `(() => {
        document.querySelector('.brand-page__card--cream')?.classList.remove('is-hover-force');
        document.querySelector('.brand-page__card--ink')?.classList.add('is-hover-force');
      })()`,
    })
    await sleep(400)
    await shotSection(session, '.brand-page__cards', `${prefix}-cards-hover-ink-${label}`, {
      waitReveal: false,
    })
    await session.call('Runtime.evaluate', {
      expression: `document.querySelector('.brand-page__card--ink')?.classList.remove('is-hover-force')`,
    })
  }

  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.brand-page__next-banner')?.scrollIntoView({block:'center'})`,
  })
  await sleep(600)
  const { result: nextBox } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.brand-page__next-banner');
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    })()`,
    returnByValue: true,
  })
  await viewportShot(session, `${prefix}-next-${label}.vp.png`)
  writeFileSync(`${prefix}-next-${label}.box.json`, JSON.stringify(nextBox.value))
  const arrow = await arrowContrast(session)
  console.log('next', nextBox.value, 'arrow', arrow)

  const measure = {
    slug,
    label,
    cardsSectionHeight: cardsBox?.height ?? null,
    cardsGridHeight: cardsMeasure?.gridHeight ?? null,
    maxCardHeight: cardsMeasure?.maxCardHeight ?? null,
    cardHeights: cardsMeasure?.cardHeights ?? null,
    cardsPass: cardsMeasure ? cardsMeasure.maxCardHeight <= 420 : null,
    arrow,
  }
  writeFileSync(`${prefix}-measure-${label}.json`, JSON.stringify(measure, null, 2))
  console.log('measure', measure)

  session.close()
  return measure
}

const reports = []
reports.push(await shootBrand('visionnaire', 1920, 1080, '1920', { hoverCards: true }))
reports.push(await shootBrand('visionnaire', 390, 844, '390'))
reports.push(await shootBrand('baxter', 1920, 1080, '1920', { hoverCards: true }))
reports.push(await shootBrand('baxter', 390, 844, '390'))
// next banner arrow visible on all four brands
for (const slug of ['molteni', 'bonaldo']) {
  reports.push(await shootBrand(slug, 1920, 1080, '1920-next'))
}
writeFileSync(join(outDir, 'measure-summary.json'), JSON.stringify(reports, null, 2))
console.log('done', outDir)
