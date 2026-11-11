import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = 'C:\\Temp\\idg-9d'
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
  for (let i = 0; i < 25; i++) {
    const { result } = await session.call('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(selector)})?.classList.contains('is-in')`,
      returnByValue: true,
    })
    if (result.value) {
      await sleep(750)
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

async function shotSection(session, selector, pathBase, forceClass) {
  if (forceClass) {
    await session.call('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(selector)})?.classList.add('is-in')`,
    })
  }
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

async function measureAxis(session) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const els = [...document.querySelectorAll('.brand-page__axis-start')];
      return els.map((el) => {
        const r = el.getBoundingClientRect();
        return { class: el.className, left: Math.round(r.left * 100) / 100 };
      });
    })()`,
    returnByValue: true,
  })
  return result.value
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
  await sleep(4000)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(800)

  const prefix = join(outDir, `${slug}`)

  await shotSection(session, '.brand-page__about', `${prefix}-about-${label}`)
  const strip = await session.call('Runtime.evaluate', {
    expression: `!!document.querySelector('.brand-page__strip')`,
    returnByValue: true,
  })
  if (strip.result.value) {
    await shotSection(session, '.brand-page__strip', `${prefix}-strip-${label}`)
  }
  await shotSection(session, '.brand-page__rows', `${prefix}-rows-${label}`)

  if (width >= 1280) {
    await waitIsIn(session, '.brand-page__rows')
    await session.call('Runtime.evaluate', {
      expression: `(() => {
        let s = document.getElementById('hover-force');
        if (!s) { s = document.createElement('style'); s.id='hover-force'; document.head.appendChild(s); }
        s.textContent = '.brand-page__row.is-hover-force{background-color:#D7D2CB!important}.brand-page__row.is-hover-force .ui-btn__arrow{transform:translateX(6px)!important}';
        document.querySelector('.brand-page__row')?.classList.add('is-hover-force');
      })()`,
    })
    await sleep(400)
    await shotSection(session, '.brand-page__row', `${prefix}-row-hover-${label}`)
  }

  await shotSection(session, '.brand-page__request', `${prefix}-request-${label}`)
  // next has no is-in
  await session.call('Runtime.evaluate', {
    expression: `document.querySelector('.brand-page__next')?.scrollIntoView({block:'center'})`,
  })
  await sleep(500)
  const { result: nextBox } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.brand-page__next');
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    })()`,
    returnByValue: true,
  })
  await viewportShot(session, `${prefix}-next-${label}.vp.png`)
  writeFileSync(`${prefix}-next-${label}.box.json`, JSON.stringify(nextBox.value))
  console.log('next', nextBox.value)

  // Axis: scroll to about and measure all after revealing
  await waitIsIn(session, '.brand-page__about')
  await waitIsIn(session, '.brand-page__rows')
  await waitIsIn(session, '.brand-page__request')
  await session.call('Runtime.evaluate', {
    expression: `window.scrollTo(0, document.querySelector('.brand-page__about').offsetTop - 80)`,
  })
  await sleep(400)
  // Measure with page scrolled so elements exist; get absolute document left via getBoundingClientRect + scrollX
  const { result: axisAbs } = await session.call('Runtime.evaluate', {
    expression: `(() => {
      const els = [...document.querySelectorAll('.brand-page__axis-start')];
      return els.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          class: el.className.replace(/\\s+/g,' ').trim(),
          leftDoc: Math.round((r.left + window.scrollX) * 100) / 100,
          leftView: Math.round(r.left * 100) / 100,
        };
      });
    })()`,
    returnByValue: true,
  })
  // Force layout measure at same scroll for each by scrolling each into view and reading leftDoc
  const lefts = []
  for (const sel of [
    '.brand-page__about-text',
    '.brand-page__row-aside',
    '.brand-page__request-aside',
  ]) {
    await session.call('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(sel)})?.scrollIntoView({block:'center'})`,
    })
    await sleep(200)
    const { result } = await session.call('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(sel)});
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { sel: ${JSON.stringify(sel)}, left: Math.round((r.left + window.scrollX) * 100) / 100 };
      })()`,
      returnByValue: true,
    })
    if (result.value) lefts.push(result.value)
  }
  const vals = lefts.map((x) => x.left)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const axisReport = {
    slug,
    label,
    width,
    lefts,
    deltaPx: Math.round((max - min) * 100) / 100,
    pass: max - min <= 1,
    axisVarSample: axisAbs.value,
  }
  writeFileSync(`${prefix}-axis-${label}.json`, JSON.stringify(axisReport, null, 2))
  console.log('axis', axisReport)

  session.close()
  return axisReport
}

const reports = []
reports.push(await shootBrand('visionnaire', 1920, 1080, '1920'))
reports.push(await shootBrand('visionnaire', 390, 844, '390'))
reports.push(await shootBrand('baxter', 1920, 1080, '1920'))
reports.push(await shootBrand('baxter', 390, 844, '390'))
writeFileSync(join(outDir, 'axis-summary.json'), JSON.stringify(reports, null, 2))
console.log('done', outDir)
