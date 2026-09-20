import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { AppContent } from './App'

/**
 * Build-time renderer used by scripts/prerender.mjs to produce static HTML for
 * the home route. The client hydrates this markup (src/main.tsx), so the first
 * paint no longer waits for React to download and execute.
 */
export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppContent />
      </StaticRouter>
    </StrictMode>
  )
}
