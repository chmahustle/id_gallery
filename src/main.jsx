import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { loadSiteData } from './content/loadSiteData'
import { startImageFrames } from './lib/applyImageFrames'

/* правки из админки применяются к данным до первой отрисовки */
loadSiteData().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  /* кадры фото, выставленные в админке */
  startImageFrames()
})
