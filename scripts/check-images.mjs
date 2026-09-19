// Verifies that every stock photo referenced in src/ still exists upstream.
// Unsplash removes photos occasionally; four ids used by this site vanished in
// 2026 and rendered as broken-image icons. Needs network access, so it is a
// separate script rather than part of `npm run check`.
//
//   npm run check:images
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : [path.join(d, f)]))
const files = walk(path.join(root, 'src')).filter((f) => /\.(ts|tsx)$/.test(f))

const uses = new Map() // url -> [files]
for (const file of files) {
  const text = readFileSync(file, 'utf8')
  for (const m of text.matchAll(/https:\/\/images\.unsplash\.com\/photo-\d+-[a-f0-9]+/g)) {
    const list = uses.get(m[0]) ?? []
    list.push(path.relative(root, file))
    uses.set(m[0], list)
  }
}

const check = async (url) => {
  try {
    const res = await fetch(`${url}?auto=format&fit=crop&w=32&q=30`, { method: 'HEAD', signal: AbortSignal.timeout(20_000) })
    return res.status
  } catch (err) {
    return `network error: ${err.message}`
  }
}

const results = await Promise.all([...uses.keys()].map(async (url) => [url, await check(url)]))
const bad = results.filter(([, status]) => status !== 200)
for (const [url, status] of bad) console.error(`${status}  ${url}\n      used in: ${[...new Set(uses.get(url))].join(', ')}`)
if (bad.length) {
  console.error(`\n${bad.length} of ${uses.size} stock photos are unavailable — replace them (see src/lib/images.ts for the fallback behaviour).`)
  process.exit(1)
}
console.log(`All ${uses.size} stock photos respond with 200.`)
