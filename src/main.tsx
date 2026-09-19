import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { sweepBrokenImages } from './lib/images'

// Web fonts are attached after the app script runs so the stylesheet never
// blocks first render (the <link rel="preload"> in index.html has already
// warmed the request). font-display: swap keeps text visible meanwhile.
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@700;800&display=swap'
if (!document.querySelector(`link[rel="stylesheet"][href="${FONT_CSS}"]`)) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = FONT_CSS
  document.head.appendChild(link)
}

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// index.html ships pre-rendered markup for the home route (scripts/prerender.mjs);
// every other route is served from the empty app.html shell.
if (root.hasChildNodes()) {
  hydrateRoot(root, app)
  // Photos in the pre-rendered markup may have failed before React attached
  // its onError handlers; hide any that did so no broken-image icon remains.
  window.addEventListener('load', () => sweepBrokenImages(root), { once: true })
} else {
  createRoot(root).render(app)
}
