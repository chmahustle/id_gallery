/**
 * Этап 16: мобильный аудит (только измерения, без правок).
 * CDP → скрины + метрики → audit/mobile/
 */
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_WIN = process.env.OUT_DIR || 'C:\\Temp\\idg-audit-mobile'
const OUT_WSL = join(ROOT, 'audit', 'mobile')
mkdirSync(OUT_WIN, { recursive: true })
mkdirSync(OUT_WSL, { recursive: true })

const BASE = 'http://127.0.0.1:5173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const VIEWPORTS = [
  { w: 390, h: 844, label: '390' },
  { w: 768, h: 1024, label: '768' },
  { w: 1440, h: 900, label: '1440' },
]

const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'catalog', path: '/catalog/' },
  { id: 'catalog-divany', path: '/catalog/divany/' },
  { id: 'brands', path: '/brands/' },
  { id: 'brand-visionnaire', path: '/brands/visionnaire/' },
  { id: 'brand-molteni', path: '/brands/molteni/' },
  { id: 'brand-baxter', path: '/brands/baxter/' },
  { id: 'brand-bonaldo', path: '/brands/bonaldo/' },
  { id: 'product-sofa', path: '/product/model-01-sofa/' },
  { id: 'product-sofa-preview', path: '/product/model-01-sofa/?preview=full' },
  { id: 'interiors', path: '/interiors/' },
  { id: 'interior-gostinaya', path: '/interiors/gostinaya/' },
  { id: 'showrooms', path: '/showrooms/' },
  { id: 'trade', path: '/trade/' },
  { id: 'about', path: '/about/' },
  { id: 'contact', path: '/contact/' },
]

const SPECIALS = [
  {
    id: 'menu-open',
    path: '/',
    setup: `document.querySelector('button[aria-label="Открыть меню"], button[aria-controls][aria-expanded="false"].header__icon-btn')?.click()`,
    waitMs: 800,
  },
  {
    id: 'catalog-filters',
    path: '/catalog/',
    setup: `document.querySelector('.catalog-fab, button[aria-controls="catalog-filters"]')?.click()`,
    waitMs: 900,
  },
  {
    id: 'finishes-drawer',
    path: '/product/model-01-sofa/',
    setup: `document.querySelector('.product-page__swatch-all, button[aria-haspopup="dialog"]')?.click()`,
    waitMs: 900,
  },
  {
    id: 'footer',
    path: '/about/',
    setup: `window.scrollTo(0, document.documentElement.scrollHeight)`,
    waitMs: 600,
  },
]

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

const MEASURE_JS = `(() => {
  const iw = window.innerWidth;
  const ih = window.innerHeight;
  const sw = document.documentElement.scrollWidth;
  const issues = [];

  function cssPath(el) {
    if (!el || el === document.body) return 'body';
    const parts = [];
    let cur = el;
    for (let i = 0; i < 5 && cur && cur !== document.body; i++) {
      let part = cur.tagName?.toLowerCase() || '?';
      if (cur.id) { parts.unshift('#' + cur.id); break; }
      if (cur.classList?.length) {
        part += '.' + [...cur.classList].slice(0, 2).join('.');
      }
      const parent = cur.parentElement;
      if (parent) {
        const same = [...parent.children].filter((c) => c.tagName === cur.tagName);
        if (same.length > 1) part += ':nth-child(' + ([...parent.children].indexOf(cur) + 1) + ')';
      }
      parts.unshift(part);
      cur = parent;
    }
    return parts.join(' > ');
  }

  // 1. Horizontal scroll offenders
  const offenders = [];
  if (sw > iw + 1) {
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      if (r.right > iw + 1) {
        offenders.push({
          sel: cssPath(el),
          right: Math.round(r.right),
          w: Math.round(r.width),
        });
      }
    });
    offenders.sort((a, b) => b.right - a.right);
  }

  // 2. Tap targets < 44×44
  const tapSel = 'a, button, [role="button"], input, select, textarea, summary, .header__icon-btn, [class*="swatch"], [class*="chip"], label';
  const smallTaps = [];
  document.querySelectorAll(tapSel).forEach((el) => {
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || st.pointerEvents === 'none') return;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    if (r.width < 44 || r.height < 44) {
      smallTaps.push({
        sel: cssPath(el),
        w: Math.round(r.width),
        h: Math.round(r.height),
        tag: el.tagName.toLowerCase(),
      });
    }
  });

  // 3. Text < 14px (skip uppercase short labels) and long lines on narrow
  const smallText = [];
  const longLines = [];
  document.querySelectorAll('p, li, td, dd, span, a, h1, h2, h3, h4, label, button').forEach((el) => {
    if (!el.childNodes.length) return;
    const st = getComputedStyle(el);
    const fs = parseFloat(st.fontSize);
    const text = (el.textContent || '').replace(/\\s+/g, ' ').trim();
    if (!text || text.length < 2) return;
    const isCapsLabel =
      st.textTransform === 'uppercase' && text.length <= 40 && !text.includes('.');
    if (fs > 0 && fs < 14 && !isCapsLabel) {
      smallText.push({ sel: cssPath(el), px: Math.round(fs * 10) / 10, sample: text.slice(0, 60) });
    }
    if (iw <= 500 && text.length > 75 && (el.tagName === 'P' || el.tagName === 'LI')) {
      longLines.push({ sel: cssPath(el), chars: text.length, sample: text.slice(0, 80) });
    }
  });

  // 4. Images
  const images = [];
  document.querySelectorAll('img').forEach((img) => {
    const r = img.getBoundingClientRect();
    if (r.width < 2 && r.height < 2) return;
    const nw = img.naturalWidth || 0;
    const nh = img.naturalHeight || 0;
    const stretched =
      nw > 0 &&
      nh > 0 &&
      (Math.abs(r.width / r.height - nw / nh) > 0.08) &&
      getComputedStyle(img).objectFit === 'fill';
    const noDims = !img.getAttribute('width') && !img.getAttribute('height') && !getComputedStyle(img).aspectRatio;
    images.push({
      src: img.currentSrc || img.src || '',
      nw,
      nh,
      rw: Math.round(r.width),
      rh: Math.round(r.height),
      stretched: Boolean(stretched),
      noDims: Boolean(noDims),
      objectFit: getComputedStyle(img).objectFit,
    });
  });

  // 5. Headings
  const headings = [...document.querySelectorAll('h1, h2')].map((el) => {
    const st = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      text: (el.textContent || '').trim().slice(0, 80),
      px: Math.round(parseFloat(st.fontSize) * 10) / 10,
      overflow: st.overflow,
      textOverflow: st.textOverflow,
      clipped: r.width > 0 && el.scrollWidth > el.clientWidth + 2,
      wraps: (el.textContent || '').trim().includes(' ') && el.clientHeight > parseFloat(st.lineHeight) * 1.5,
    };
  });

  // 6. Sticky / fixed
  const sticky = [];
  document.querySelectorAll('body *').forEach((el) => {
    const st = getComputedStyle(el);
    if (st.position !== 'fixed' && st.position !== 'sticky') return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    if (st.visibility === 'hidden' || st.display === 'none' || st.opacity === '0') return;
    sticky.push({
      sel: cssPath(el),
      pos: st.position,
      h: Math.round(r.height),
      top: Math.round(r.top),
      pctH: Math.round((r.height / ih) * 1000) / 10,
      z: st.zIndex,
    });
  });

  // 7. Focus visibility sample + hover-only heuristic from stylesheets
  let focusVisible = null;
  const focusables = [...document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => {
      const st = getComputedStyle(el);
      return st.display !== 'none' && st.visibility !== 'hidden' && el.getClientRects().length;
    });
  if (focusables[0]) {
    focusables[0].focus();
    const st = getComputedStyle(focusables[0]);
    const outline = st.outlineStyle !== 'none' && parseFloat(st.outlineWidth) > 0;
    const ring = st.boxShadow !== 'none';
    focusVisible = {
      sel: cssPath(focusables[0]),
      visible: outline || ring || st.borderBottomWidth === '2px',
      outline: st.outline,
      boxShadow: st.boxShadow.slice(0, 80),
    };
  }

  const hoverOnly = [];
  try {
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      if (!rules) continue;
      for (const rule of rules) {
        if (!rule.selectorText || !rule.selectorText.includes(':hover')) continue;
        const sel = rule.selectorText;
        if (sel.includes(':focus') || sel.includes(':active') || sel.includes(':focus-visible')) continue;
        if (/opacity|transform|background|color|translate/i.test(rule.cssText)) {
          hoverOnly.push(sel.slice(0, 120));
        }
      }
    }
  } catch (_) {}

  // 8. Contrast (simplified WCAG relative luminance on text nodes)
  function parseColor(c) {
    const m = c.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  }
  function lum({ r, g, b }) {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function contrast(a, b) {
    const L1 = lum(a);
    const L2 = lum(b);
    const hi = Math.max(L1, L2);
    const lo = Math.min(L1, L2);
    return (hi + 0.05) / (lo + 0.05);
  }
  function bgOf(el) {
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const bg = parseColor(getComputedStyle(cur).backgroundColor);
      if (bg && bg.a > 0.9) return bg;
      cur = cur.parentElement;
    }
    return parseColor(getComputedStyle(document.body).backgroundColor) || { r: 242, g: 240, b: 235, a: 1 };
  }
  const lowContrast = [];
  document.querySelectorAll('p, a, button, h1, h2, h3, li, label, span').forEach((el) => {
    const text = (el.textContent || '').trim();
    if (text.length < 3) return;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') return;
    const fg = parseColor(st.color);
    if (!fg || fg.a < 0.5) return;
    const bg = bgOf(el);
    const ratio = contrast(fg, bg);
    if (ratio < 4.5) {
      lowContrast.push({
        sel: cssPath(el),
        ratio: Math.round(ratio * 100) / 100,
        sample: text.slice(0, 50),
        color: st.color,
      });
    }
  });

  // dedupe small lists
  function uniq(arr, key) {
    const seen = new Set();
    return arr.filter((x) => {
      const k = key(x);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  return {
    iw,
    ih,
    sw,
    hScroll: sw > iw + 1,
    offenders: uniq(offenders, (x) => x.sel).slice(0, 12),
    smallTaps: uniq(smallTaps, (x) => x.sel + x.w + x.h).slice(0, 40),
    smallText: uniq(smallText, (x) => x.sel).slice(0, 25),
    longLines: uniq(longLines, (x) => x.sel).slice(0, 15),
    images: images.slice(0, 40),
    headings,
    sticky: uniq(sticky, (x) => x.sel).slice(0, 15),
    focusVisible,
    hoverOnly: [...new Set(hoverOnly)].slice(0, 25),
    lowContrast: uniq(lowContrast, (x) => x.sel + x.ratio).slice(0, 30),
  };
})()`

async function fullPageShot(session, path, width) {
  const { result } = await session.call('Runtime.evaluate', {
    expression: `({
      w: Math.max(document.documentElement.scrollWidth, ${width}),
      h: Math.min(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), 14000)
    })`,
    returnByValue: true,
  })
  const { w, h } = result.value
  await session.call('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: width < 768,
  })
  await sleep(250)
  const { data } = await session.call('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: true,
  })
  writeFileSync(path, Buffer.from(data, 'base64'))
  // restore viewport height for subsequent measures if needed — caller re-sets
}

async function measureImagesSizes(images) {
  const heavy = []
  const seen = new Set()
  for (const img of images) {
    let src = img.src
    if (!src || src.startsWith('data:')) continue
    if (src.startsWith('/')) src = BASE + src
    if (seen.has(src)) continue
    seen.add(src)
    try {
      const res = await fetch(src, { method: 'HEAD' })
      let len = Number(res.headers.get('content-length') || 0)
      if (!len) {
        const full = await fetch(src)
        const buf = Buffer.from(await full.arrayBuffer())
        len = buf.length
      }
      if (len > 400 * 1024) {
        heavy.push({ src, kb: Math.round(len / 1024) })
      }
    } catch (_) {}
  }
  return heavy
}

function classifyFindings(meta, heavyImgs, routeId, width) {
  const rows = []
  const add = (sev, problem, detail) =>
    rows.push({ route: routeId, width, severity: sev, problem, detail })

  if (meta.hScroll) {
    add(
      'блокирует',
      'Горизонтальный скролл',
      `sw=${meta.sw} > iw=${meta.iw}; ` +
        meta.offenders
          .slice(0, 5)
          .map((o) => `${o.sel}(right=${o.right})`)
          .join('; '),
    )
  }
  if (meta.smallTaps.length) {
    const sample = meta.smallTaps
      .slice(0, 8)
      .map((t) => `${t.sel} ${t.w}×${t.h}`)
      .join('; ')
    add(
      meta.smallTaps.length > 8 ? 'портит вид' : 'мелочь',
      `Тап <44×44 (${meta.smallTaps.length})`,
      sample,
    )
  }
  if (meta.smallText.length && width <= 390) {
    add(
      'мелочь',
      `Текст <14px (${meta.smallText.length})`,
      meta.smallText
        .slice(0, 5)
        .map((t) => `${t.px}px ${t.sample}`)
        .join('; '),
    )
  }
  if (meta.longLines.length && width <= 390) {
    add(
      'мелочь',
      `Длинные строки >75 (${meta.longLines.length})`,
      meta.longLines
        .slice(0, 3)
        .map((t) => `${t.chars}ch`)
        .join(', '),
    )
  }
  const stretched = meta.images.filter((i) => i.stretched)
  const noDims = meta.images.filter((i) => i.noDims)
  if (stretched.length) {
    add('портит вид', 'Растяжение img (object-fit:fill)', String(stretched.length))
  }
  if (noDims.length) {
    add('мелочь', `img без width/height (${noDims.length})`, noDims[0]?.src?.slice(-40) || '')
  }
  if (heavyImgs.length && width <= 390) {
    add(
      'портит вид',
      `Картинки >400KB (${heavyImgs.length})`,
      heavyImgs
        .slice(0, 5)
        .map((h) => `${h.kb}KB ${h.src.split('/').pop()}`)
        .join('; '),
    )
  }
  if (width <= 390) {
    for (const h of meta.headings) {
      if (h.clipped) {
        add('портит вид', `${h.tag} обрезан`, `${h.px}px «${h.text}»`)
      }
    }
  }
  for (const s of meta.sticky) {
    if (s.pctH > 25 && s.pos === 'fixed') {
      add(
        'портит вид',
        'Крупный fixed перекрывает экран',
        `${s.sel} ${s.pctH}% высоты (${s.h}px)`,
      )
    }
  }
  if (meta.focusVisible && meta.focusVisible.visible === false) {
    add('портит вид', 'Фокус Tab слабо/не виден', meta.focusVisible.sel)
  }
  if (meta.hoverOnly.length && width <= 768) {
    add(
      'мелочь',
      `Hover-only CSS (${meta.hoverOnly.length})`,
      meta.hoverOnly.slice(0, 5).join(' | '),
    )
  }
  if (meta.lowContrast.length) {
    add(
      meta.lowContrast.some((c) => c.ratio < 3) ? 'блокирует' : 'портит вид',
      `Контраст <4.5:1 (${meta.lowContrast.length})`,
      meta.lowContrast
        .slice(0, 6)
        .map((c) => `${c.ratio}:1 ${c.sample}`)
        .join('; '),
    )
  }
  return rows
}

async function runPage(session, vp, item) {
  await session.call('Emulation.setDeviceMetricsOverride', {
    width: vp.w,
    height: vp.h,
    deviceScaleFactor: 1,
    mobile: vp.w < 768,
  })
  const url = BASE + item.path
  await session.call('Page.navigate', { url })
  await sleep(2800)
  await session.call('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true,
  })
  await sleep(400)
  if (item.setup) {
    await session.call('Runtime.evaluate', { expression: item.setup })
    await sleep(item.waitMs || 700)
  }

  const { result } = await session.call('Runtime.evaluate', {
    expression: MEASURE_JS,
    returnByValue: true,
  })
  const meta = result.value

  let heavy = []
  if (vp.w <= 390) {
    heavy = await measureImagesSizes(meta.images || [])
  }

  const file = `${item.id}-${vp.label}.png`
  const winPath = join(OUT_WIN, file)
  await fullPageShot(session, winPath, vp.w)
  // restore metrics for next
  await session.call('Emulation.setDeviceMetricsOverride', {
    width: vp.w,
    height: vp.h,
    deviceScaleFactor: 1,
    mobile: vp.w < 768,
  })

  try {
    copyFileSync(winPath, join(OUT_WSL, file))
  } catch (_) {}

  writeFileSync(
    join(OUT_WSL, `${item.id}-${vp.label}.json`),
    JSON.stringify({ ...meta, heavyImages: heavy }, null, 2),
  )

  return { meta, heavy, file }
}

async function main() {
  const allFindings = []
  const summaryRows = []

  const target = await openTarget('about:blank')
  const session = new Session(target.webSocketDebuggerUrl)
  await session.ready()
  await session.call('Page.enable')
  await session.call('Runtime.enable')

  const allItems = [...ROUTES, ...SPECIALS]

  for (const item of allItems) {
    for (const vp of VIEWPORTS) {
      // specials: only meaningful widths — still shoot all three per brief
      console.log('→', item.id, vp.label)
      try {
        const { meta, heavy, file } = await runPage(session, vp, item)
        const findings = classifyFindings(meta, heavy, item.id, vp.label)
        allFindings.push(...findings)
        summaryRows.push({
          id: item.id,
          path: item.path,
          width: vp.label,
          file,
          hScroll: meta.hScroll,
          smallTaps: meta.smallTaps.length,
          lowContrast: meta.lowContrast.length,
          heavy: heavy.length,
          findings: findings.length,
        })
        console.log(
          '  ',
          `hScroll=${meta.hScroll}`,
          `taps=${meta.smallTaps.length}`,
          `contrast=${meta.lowContrast.length}`,
          `findings=${findings.length}`,
        )
      } catch (err) {
        console.error('FAIL', item.id, vp.label, err.message)
        allFindings.push({
          route: item.id,
          width: vp.label,
          severity: 'блокирует',
          problem: 'Ошибка аудита',
          detail: String(err.message || err),
        })
      }
    }
  }

  session.close()

  // Top-10 by severity weight
  const weight = { блокирует: 3, 'портит вид': 2, мелочь: 1 }
  const freq = new Map()
  for (const f of allFindings) {
    const key = f.problem.replace(/\\s*\\(\\d+\\)/, '')
    const prev = freq.get(key) || { problem: key, count: 0, severity: f.problem, maxSev: f.severity, samples: [] }
    prev.count += 1
    if (weight[f.severity] > weight[prev.maxSev]) prev.maxSev = f.severity
    if (prev.samples.length < 3) prev.samples.push(`${f.route}@${f.width}`)
    freq.set(key, prev)
  }
  const top10 = [...freq.values()]
    .sort((a, b) => weight[b.maxSev] * 100 + b.count - (weight[a.maxSev] * 100 + a.count))
    .slice(0, 10)

  const checks = {
    lint: process.env.AUDIT_LINT || 'see shell',
    typecheck: process.env.AUDIT_TYPECHECK || 'see shell',
    build: process.env.AUDIT_BUILD || 'see shell',
    checkContent: process.env.AUDIT_CONTENT || 'see shell',
    checkImages: process.env.AUDIT_IMAGES || 'see shell',
  }

  const md = []
  md.push('# Мобильный аудит — этап 16')
  md.push('')
  md.push(`Дата: ${new Date().toISOString()}`)
  md.push('')
  md.push('Только измерения, без исправлений. Скрины: `audit/mobile/<id>-<width>.png`.')
  md.push('')
  md.push('## Проверки сборки')
  md.push('')
  md.push('| Команда | Результат |')
  md.push('|---------|-----------|')
  md.push(`| lint | ${checks.lint} |`)
  md.push(`| typecheck | ${checks.typecheck} |`)
  md.push(`| build | ${checks.build} |`)
  md.push(`| check:content | ${checks.checkContent} |`)
  md.push(`| check:images | ${checks.checkImages} |`)
  md.push('')
  md.push('## Топ-10 проблем')
  md.push('')
  md.push('| # | Серьёзность | Проблема | Частота | Примеры |')
  md.push('|---|-------------|----------|---------|---------|')
  top10.forEach((t, i) => {
    md.push(
      `| ${i + 1} | ${t.maxSev} | ${t.problem} | ${t.count} | ${t.samples.join(', ')} |`,
    )
  })
  md.push('')
  md.push('## Таблица маршрут × проблема')
  md.push('')
  md.push('| Маршрут | Ширина | Серьёзность | Проблема | Детали |')
  md.push('|---------|--------|-------------|----------|--------|')
  for (const f of allFindings) {
    const detail = String(f.detail || '')
      .replace(/\\|/g, '\\\\|')
      .slice(0, 180)
    md.push(
      `| ${f.route} | ${f.width} | ${f.severity} | ${f.problem} | ${detail} |`,
    )
  }
  md.push('')
  md.push('## Сводка по экранам')
  md.push('')
  md.push('| id | path | width | hScroll | smallTaps | lowContrast | heavyImg | findings | file |')
  md.push('|----|------|-------|---------|-----------|-------------|----------|----------|------|')
  for (const r of summaryRows) {
    md.push(
      `| ${r.id} | ${r.path} | ${r.width} | ${r.hScroll} | ${r.smallTaps} | ${r.lowContrast} | ${r.heavy} | ${r.findings} | ${r.file} |`,
    )
  }
  md.push('')
  md.push('## Примечания')
  md.push('')
  md.push('- Контраст: упрощённый WCAG relative luminance по computed color/фону (не полный axe-core tree).')
  md.push('- Hover-only: селекторы из CSS с `:hover` без `:focus`/`:active`/`:focus-visible`.')
  md.push('- Маршрут продукта в приложении: `/product/...` (не `/products/...`).')
  md.push('- Specials: `menu-open`, `catalog-filters`, `finishes-drawer`, `footer` сняты на всех трёх ширинах.')
  md.push('')

  const reportPath = join(OUT_WSL, 'REPORT.md')
  writeFileSync(reportPath, md.join('\n'))
  writeFileSync(join(OUT_WSL, 'findings.json'), JSON.stringify({ top10, allFindings, summaryRows }, null, 2))
  try {
    copyFileSync(reportPath, join(OUT_WIN, 'REPORT.md'))
  } catch (_) {}

  console.log('REPORT', reportPath)
  console.log('findings', allFindings.length, 'top10', top10.map((t) => t.problem))
  console.log('done')
}

await main()
