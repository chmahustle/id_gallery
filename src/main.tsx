import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { loadSiteData } from './content/loadSiteData'
import { startImageFrames } from './lib/applyImageFrames'

/* правки из админки применяются к данным до первой отрисовки */
loadSiteData().finally(() => {
  const root = document.getElementById('root')
  if (!root) throw new Error('Нет элемента #root в index.html')
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  /* кадры фото, выставленные в админке */
  startImageFrames()
})
