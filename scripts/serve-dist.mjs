#!/usr/bin/env node
// Local approximation of the Vercel runtime for QA:
//   - serves dist/ with the headers, redirects, rewrites and trailingSlash rules
//     from vercel.json (so CSP / 404 / route behaviour can be checked before deploy)
//   - mounts the serverless functions in api/ with a minimal req/res adapter
//
// Usage: npm run build && npm run serve   → http://localhost:4173
// Not used in production; Vercel applies vercel.json itself.

import http from 'node:http'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = path.join(root, 'dist')
const config = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'))
const port = Number(process.env.PORT || 4173)

// Load .env.local so the API sees the same public config as the build
try {
  for (const line of readFileSync(path.join(root, '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '')
  }
} catch {
  /* optional */
}
process.env.SITE_URL ||= `http://localhost:${port}`
// Never let local QA write to the production inquiries table or send email.
process.env.INQUIRY_DRY_RUN ||= '1'
process.env.ALLOWED_ORIGINS = [process.env.ALLOWED_ORIGINS, `http://localhost:${port}`].filter(Boolean).join(',')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
}

const toRegex = (source) => {
  let re = source.replace(/\/:([a-zA-Z]+)\*/g, '(?:/[^/]+)*').replace(/:([a-zA-Z]+)/g, '([^/]+)')
  return new RegExp(`^${re}$`)
}
const headerRules = config.headers.map((h) => ({ re: toRegex(h.source), headers: h.headers }))
const redirects = config.redirects.map((r) => ({ re: toRegex(r.source), ...r }))
const rewrites = config.rewrites.map((r) => ({ re: toRegex(r.source), ...r }))

function applyHeaders(pathname, res) {
  for (const rule of headerRules) {
    if (rule.re.test(pathname)) for (const { key, value } of rule.headers) res.setHeader(key, value)
  }
}

function sendFile(file, res, status = 200) {
  const ext = path.extname(file).toLowerCase()
  res.statusCode = status
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
  res.setHeader('Content-Length', statSync(file).size)
  createReadStream(file).pipe(res)
}

async function runApi(name, req, res) {
  const mod = await import(pathToFileURL(path.join(root, 'api', `${name}.js`)).href)
  // Vercel parses JSON bodies for us; emulate that.
  let body = ''
  for await (const chunk of req) body += chunk
  try {
    req.body = body ? JSON.parse(body) : {}
  } catch {
    req.body = {}
  }
  const adapter = Object.assign(res, {
    status(code) {
      res.statusCode = code
      return adapter
    },
    json(obj) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(obj))
      return adapter
    },
    send(text) {
      res.end(text)
      return adapter
    },
  })
  return mod.default(req, adapter)
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`)
    let pathname = decodeURIComponent(url.pathname)

    // trailingSlash: false
    if (config.trailingSlash === false && pathname.length > 1 && pathname.endsWith('/')) {
      res.writeHead(308, { Location: pathname.slice(0, -1) + url.search })
      return res.end()
    }
    for (const r of redirects) {
      if (r.re.test(pathname)) {
        res.writeHead(r.permanent ? 308 : 307, { Location: r.destination })
        return res.end()
      }
    }
    applyHeaders(pathname, res)

    if (pathname.startsWith('/api/')) return runApi(pathname.slice(5), req, res).catch((e) => { res.statusCode = 500; res.end(String(e)) })

    // filesystem first
    const file = path.join(dist, pathname === '/' ? 'index.html' : pathname)
    if (file.startsWith(dist) && existsSync(file) && statSync(file).isFile()) return sendFile(file, res)

    for (const r of rewrites) {
      if (r.re.test(pathname)) {
        if (r.destination.startsWith('/api/')) return runApi(r.destination.slice(5), req, res).catch((e) => { res.statusCode = 500; res.end(String(e)) })
        return sendFile(path.join(dist, r.destination), res)
      }
    }
    const notFound = path.join(dist, '404.html')
    if (existsSync(notFound)) return sendFile(notFound, res, 404)
    res.statusCode = 404
    res.end('Not found')
  })
  .listen(port, () => console.log(`serving dist/ with vercel.json rules at http://localhost:${port}`))
