#!/usr/bin/env node
// Post-build step: pre-render the home route into dist/index.html.
//
//   dist/app.html   – the empty SPA shell (what `vite build` produced), served
//                     for every other route via the vercel.json rewrites
//   dist/index.html – the same document with the home page's HTML inside #root,
//                     served for "/" straight from the filesystem
//
// Why: the largest contentful paint on the home page is the <h1>. As a pure SPA
// nothing was painted until ~270 kB of JavaScript had downloaded and executed
// (measured render delay 2.5–3.1 s on a throttled mobile profile). With static
// markup the headline paints with the HTML, and React hydrates afterwards.

import { build } from 'vite'
import { readFileSync, writeFileSync, copyFileSync, rmSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { STATIC_ROUTES, COMPANY_SLUGS, SERVICE_SLUGS } from '../api/_lib/routes.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = path.join(root, 'dist')
const ssrOut = path.join(root, 'dist-ssr')

const indexPath = path.join(dist, 'index.html')
const shellPath = path.join(dist, 'app.html')
if (!existsSync(indexPath)) {
  console.error('dist/index.html not found — run `vite build` first')
  process.exit(1)
}

// 1. Keep the untouched shell for client-rendered routes.
copyFileSync(indexPath, shellPath)

// 2. Build the server entry (no minification needed; it is deleted afterwards).
await build({
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: ssrOut, emptyOutDir: true, minify: false, sourcemap: false },
})

// 3. Render all public static routes and inject into the document.
const mod = await import(pathToFileURL(path.join(ssrOut, 'entry-server.js')).href)
const shell = readFileSync(indexPath, 'utf8')
const marker = '<div id="root"></div>'
if (!shell.includes(marker)) {
  console.error('Could not find <div id="root"></div> in dist/index.html')
  process.exit(1)
}

const routesToPrerender = [
  ...STATIC_ROUTES.map((r) => r.path),
  ...COMPANY_SLUGS.map((slug) => `/companies/${slug}`),
  ...SERVICE_SLUGS.map((slug) => `/service/${slug}`)
]

let totalKb = 0

for (const route of routesToPrerender) {
  const html = mod.render(route)
  const fullHtml = shell.replace(marker, `<div id="root">${html}</div>`)
  
  let outPath = indexPath
  if (route !== '/') {
    outPath = path.join(dist, `${route}.html`)
    mkdirSync(path.dirname(outPath), { recursive: true })
  }
  
  writeFileSync(outPath, fullHtml)
  totalKb += html.length / 1024
}

rmSync(ssrOut, { recursive: true, force: true })

console.log(`prerender: ${routesToPrerender.length} routes → dist/*.html (${totalKb.toFixed(1)} kB of markup); shell kept at dist/app.html`)
