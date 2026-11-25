import { frameStyle, readFrame } from './imageFrame'

const MARK = 'idgFrame'
const PROPS = ['objectFit', 'objectPosition', 'transformOrigin', 'scale', 'clipPath'] as const

function apply(img: HTMLImageElement) {
  const frame = readFrame(img.getAttribute('src'))
  const style = img.style as unknown as Record<string, string>
  if (frame) {
    const next = frameStyle(frame)
    for (const prop of PROPS) style[prop] = next[prop] || ''
    img.dataset[MARK] = '1'
  } else if (img.dataset[MARK]) {
    for (const prop of PROPS) style[prop] = ''
    delete img.dataset[MARK]
  }
}

function scan(node: Node) {
  if (node instanceof HTMLImageElement) apply(node)
  else if (node instanceof Element) node.querySelectorAll('img').forEach(apply)
}

/**
 * Кадры фото из админки на всём сайте: любая картинка с меткой «#frame=»
 * в адресе показывается так, как её выставили в окне «Кадр».
 */
export function startImageFrames() {
  if (typeof MutationObserver === 'undefined') return
  scan(document.body)
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') scan(mutation.target)
      else mutation.addedNodes.forEach(scan)
    }
  }).observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['src'],
  })
}
