import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../tmp/footer-measure')
mkdirSync(outDir, { recursive: true })

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173/'

async function measureAt(width, height) {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.CHROME_PATH ||
      '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
  })
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 })
  await page.evaluate(() => document.fonts.ready)
  // Wait for footer links to exist
  await page.waitForSelector('footer.footer a.footer__link', { timeout: 30000 })
  await page.locator('footer.footer').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)

  const data = await page.evaluate(() => {
    const footer = document.querySelector('footer.footer')
    const links = [...document.querySelectorAll('footer.footer .footer__col a.footer__link')]
    const a = links[0]
    const a2 = links[1]
    const cs = getComputedStyle(a)
    const r = a.getBoundingClientRect()
    const r2 = a2.getBoundingClientRect()
    return {
      href: a.getAttribute('href'),
      text: a.textContent?.trim(),
      className: a.className,
      inlineStyle: a.getAttribute('style'),
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      fontFamily: cs.fontFamily,
      display: cs.display,
      height: cs.height,
      minHeight: cs.minHeight,
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      marginTop: cs.marginTop,
      marginBottom: cs.marginBottom,
      boxHeight: r.height,
      stepCenters: (r2.top + r2.height / 2) - (r.top + r.height / 2),
      stepTop: r2.top - r.top,
      linkCount: links.length,
      footerCount: document.querySelectorAll('footer').length,
      footerClass: footer?.className,
    }
  })

  // CDP: winning matched CSS for font-size / line-height / height
  const client = await context.newCDPSession(page)
  await client.send('DOM.enable')
  await client.send('CSS.enable')
  const { root } = await client.send('DOM.getDocument', { depth: 0 })
  const { nodeId } = await client.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector: 'footer.footer .footer__col a.footer__link',
  })
  const matched = await client.send('CSS.getMatchedStylesForNode', { nodeId })
  const interesting = ['font-size', 'line-height', 'height', 'min-height', 'padding-top', 'display', 'gap']
  const winning = {}
  for (const prop of interesting) {
    const fromInline = matched.inlineStyle?.cssProperties?.find(
      (p) => p.name === prop && p.status !== 'disabled',
    )
    const fromMatched = (matched.matchedCSSRules || [])
      .flatMap((m) =>
        (m.rule?.style?.cssProperties || []).map((p) => ({
          ...p,
          selector: m.rule?.selectorList?.text,
          origin: m.rule?.origin,
          source: m.rule?.styleSheetId,
        })),
      )
      .filter((p) => p.name === prop && p.status !== 'disabled')
    winning[prop] = {
      inline: fromInline ? { value: fromInline.value } : null,
      rules: fromMatched.map((p) => ({
        value: p.value,
        important: p.important,
        selector: p.selector,
        origin: p.origin,
      })),
    }
  }

  // Also check ul gap
  const { nodeId: ulId } = await client.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector: 'footer.footer .footer__col > ul',
  })
  const ulMatched = await client.send('CSS.getMatchedStylesForNode', { nodeId: ulId })
  const ulGap = (ulMatched.matchedCSSRules || [])
    .flatMap((m) =>
      (m.rule?.style?.cssProperties || []).map((p) => ({
        ...p,
        selector: m.rule?.selectorList?.text,
      })),
    )
    .filter((p) => p.name === 'gap' && p.status !== 'disabled')

  const shotPath = join(outDir, `footer-${width}x${height}.png`)
  await page.locator('footer.footer').screenshot({ path: shotPath })

  await browser.close()
  return {
    viewport: { width, height },
    measured: data,
    winning,
    ulGap: ulGap.map((p) => ({ value: p.value, important: p.important, selector: p.selector })),
    screenshot: shotPath,
  }
}

const results = []
for (const [w, h] of [
  [1440, 900],
  [1920, 1080],
]) {
  results.push(await measureAt(w, h))
}

const outPath = join(outDir, 'results.json')
writeFileSync(outPath, JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
console.log('WROTE', outPath)
