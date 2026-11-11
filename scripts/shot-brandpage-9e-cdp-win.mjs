import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = 'C:\\Temp\\idg-9e'
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
      await sleep(800)
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

async function shotSection(session, selector, pathBase) {
  await waitIsIn(session, selector)
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

async function shootBrand(slug, width, height, label) {
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

  await shotSection(session, '.brand-page__about', `${prefix}-about-${label}`)
  if (
    (
      await session.call('Runtime.evaluate', {
        expression: `!!document.querySelector('.brand-page__strip')`,
        returnByValue: true,
      })
    ).result.value
  ) {
    await shotSection(session, '.brand-page__strip', `${prefix}-strip-${label}`)
    // individual crops
    const { result: cropCount } = await session.call('Runtime.evaluate', {
      expression: `document.querySelectorAll('.brand-page__strip-cell').length`,
      returnByValue: true,
    })
    for (let i = 0; i < cropCount.value; i++) {
      await session.call('Runtime.evaluate', {
        expression: `document.querySelectorAll('.brand-page__strip-cell')[${i}]?.scrollIntoView({block:'center'})`,
      })
      await sleep(400)
      const { result } = await session.call('Runtime.evaluate', {
        expression: `(() => {
          const el = document.querySelectorAll('.brand-page__strip-cell')[${i}];
          const r = el.getBoundingClientRect();
          return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
        })()`,
        returnByValue: true,
      })
      await viewportShot(session, `${prefix}-crop${i}-${label}.vp.png`)
      writeFileSync(`${prefix}-crop${i}-${label}.box.json`, JSON.stringify(result.value))
      console.log('crop', i, result.value)
    }
  }
  await shotSection(session, '.brand-page__rows', `${prefix}-rows-${label}`)
  const reqBox = await shotSection(
    session,
    '.brand-page__request',
    `${prefix}-request-${label}`,
  )

  // next banner
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
  console.log('next', nextBox.value)

  if (width >= 1280) {
    await session.call('Runtime.evaluate', {
      expression: `document.querySelector('.brand-page__next-banner')?.classList.add('is-hover-force')`,
    })
    await session.call('Runtime.evaluate', {
      expression: `(() => {
        let s = document.getElementById('hover-force');
        if (!s) { s = document.createElement('style'); s.id='hover-force'; document.head.appendChild(s); }
        s.textContent = '.brand-page__next-banner.is-hover-force .brand-page__next-img,.brand-page__next-banner.is-hover-force .brand-page__next-ph{transform:scale(1.04)!important}.brand-page__next-banner.is-hover-force .brand-page__next-arrow{transform:translateX(12px)!important}';
      })()`,
    })
    await sleep(500)
    await viewportShot(session, `${prefix}-next-hover-${label}.vp.png`)
    writeFileSync(
      `${prefix}-next-hover-${label}.box.json`,
      JSON.stringify(nextBox.value),
    )
  }

  const measure = {
    slug,
    label,
    requestHeight: reqBox?.height ?? null,
    requestPass: reqBox ? reqBox.height <= 320 : null,
  }
  writeFileSync(`${prefix}-measure-${label}.json`, JSON.stringify(measure, null, 2))
  console.log('measure', measure)

  session.close()
  return measure
}

const reports = []
reports.push(await shootBrand('visionnaire', 1920, 1080, '1920'))
reports.push(await shootBrand('visionnaire', 390, 844, '390'))
reports.push(await shootBrand('molteni', 1920, 1080, '1920'))
reports.push(await shootBrand('molteni', 390, 844, '390'))
writeFileSync(join(outDir, 'measure-summary.json'), JSON.stringify(reports, null, 2))
console.log('done', outDir)
