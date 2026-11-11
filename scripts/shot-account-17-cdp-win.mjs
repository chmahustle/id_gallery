/**
 * CDP: /account/ этап 17 — покой, focus, error, autofill @ 1920/390
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const outDir = process.env.OUT_DIR || 'C:\\Temp\\idg-17'
mkdirSync(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const PAGE = 'http://127.0.0.1:5173/account/'

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
      const text = document.querySelector('.account-page')?.innerText || '';
      const profile = document.querySelector('.header__profile-btn');
      return {
        h1: document.querySelector('#account-hero-title')?.textContent?.trim(),
        crumbs: Boolean(document.querySelector('.page-crumbs')),
        panels: document.querySelectorAll('.account-page__panel').length,
        forbidden: ['Повторите пароль','Забыли','ВХОД'].filter((n) => text.includes(n)),
        authModal: Boolean(document.querySelector('.auth-modal')),
        profileHref: profile?.getAttribute('href') || profile?.getAttribute('to'),
        profileTag: profile?.tagName,
      };
    })()`,
    returnByValue: true,
  })
  return result.value
}

async function openPage(width, height) {
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
  await sleep(3000)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(600)
  return session
}

async function shoot(width, height, label) {
  let session = await openPage(width, height)
  await session.call('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(400)
  await shot(session, join(outDir, `account-rest-${label}.png`))
  const meta = await measure(session)
  writeFileSync(join(outDir, `account-meta-${label}.json`), JSON.stringify(meta, null, 2))
  console.log('meta', label, meta)
  session.close()

  session = await openPage(width, height)
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('.account-page__panels')?.scrollIntoView({block:'center'});
      const el = document.querySelector('.account-page__control');
      el?.focus();
      el?.classList.add('is-focus-force');
    })()`,
  })
  await sleep(400)
  await shot(session, join(outDir, `account-focus-${label}.png`))
  session.close()

  session = await openPage(width, height)
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('.account-page__panels')?.scrollIntoView({block:'center'});
      document.querySelectorAll('.account-page__form').forEach((f) => {
        f.querySelector('button[type="submit"]')?.click();
      });
    })()`,
  })
  await sleep(500)
  await shot(session, join(outDir, `account-error-${label}.png`))
  session.close()

  /* simulate autofill styles on password */
  session = await openPage(width, height)
  await session.call('Runtime.evaluate', {
    expression: `(() => {
      document.querySelector('.account-page__panels')?.scrollIntoView({block:'center'});
      const pw = document.querySelector('input[type="password"]');
      if (!pw) return;
      pw.value = 'ChromeAutofillTest9';
      pw.dispatchEvent(new Event('input', { bubbles: true }));
      pw.classList.add('is-autofill-force');
      let s = document.getElementById('af-force');
      if (!s) { s = document.createElement('style'); s.id = 'af-force'; document.head.appendChild(s); }
      s.textContent = '.account-page__control.is-autofill-force{-webkit-text-fill-color:var(--color-ink)!important;box-shadow:0 0 0 1000px var(--color-snow) inset!important;background-color:var(--color-snow)!important}';
    })()`,
  })
  await sleep(400)
  await shot(session, join(outDir, `account-autofill-${label}.png`))
  session.close()
}

await shoot(1920, 1080, '1920')
await shoot(390, 844, '390')
console.log('done', outDir)
