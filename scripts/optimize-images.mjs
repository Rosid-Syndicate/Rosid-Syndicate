#!/usr/bin/env node
// Generates the responsive brand/image assets the site actually renders.
// Run: npm run images   (idempotent; outputs to public/brand and public/img)
//
// Why: the header rendered a 1024×1024, 470 kB PNG at 56 px, and the Appi
// Saipal page shipped a 1.16 MB JPEG. Sources stay untouched in public/ so the
// business keeps its originals; the site references the generated files.

import sharp from 'sharp'
import { mkdir, stat } from 'node:fs/promises'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const out = (p) => path.join(root, 'public', p)

async function size(p) {
  try {
    return (await stat(p)).size
  } catch {
    return 0
  }
}

async function emit(src, dest, pipeline) {
  await pipeline.toFile(dest)
  const before = await size(src)
  const after = await size(dest)
  console.log(`${path.relative(root, dest).padEnd(46)} ${(after / 1024).toFixed(0).padStart(5)} kB  (source ${(before / 1024).toFixed(0)} kB)`)
}

async function main() {
  await mkdir(out('brand'), { recursive: true })
  await mkdir(out('img'), { recursive: true })

  // Logo mark: the source PNG carries ~42% transparent padding, so it is
  // trimmed to the visible emblem first — a 56 px box then shows a 56 px mark.
  // Rendered at 46–60 px tall → 128 px (2x) and 192 px (3x).
  const markSrc = out('logo-emblem-transparent.png')
  const mark = await sharp(markSrc).trim().png().toBuffer()
  for (const h of [128, 192]) {
    await emit(markSrc, out(`brand/logo-mark-${h}.webp`), sharp(mark).resize({ height: h }).webp({ quality: 88, effort: 6 }))
    await emit(markSrc, out(`brand/logo-mark-${h}.png`), sharp(mark).resize({ height: h }).png({ compressionLevel: 9, palette: true }))
  }

  // Full logo (with wordmark) for the admin login and email/social fallbacks.
  const full = out('logo-full-transparent.png')
  await emit(full, out('brand/logo-full-320.webp'), sharp(full).resize({ width: 320 }).webp({ quality: 88, effort: 6 }))
  await emit(full, out('brand/logo-full-320.png'), sharp(full).resize({ width: 320 }).png({ compressionLevel: 9, palette: true }))

  // Structured-data / favicon-sized square mark on white (schema.org logo).
  await emit(markSrc, out('brand/logo-square-512.png'), sharp(mark).resize(440, 440, { fit: 'contain', background: '#ffffff' }).extend({ top: 36, bottom: 36, left: 36, right: 36, background: '#ffffff' }).flatten({ background: '#ffffff' }).png({ compressionLevel: 9 }))

  // Favicons — the real emblem at every size browsers and Google ask for.
  // Transparent PNGs for tabs (the mark reads on light and dark chrome), a
  // white-backed 180px Apple touch icon (iOS ignores transparency), a
  // 512/192 pair for the web manifest, and a multi-size favicon.ico built
  // from PNG frames (valid per the ICO spec; what /favicon.ico requesters get).
  const icon = (px, bg) => {
    const fill = bg || { r: 0, g: 0, b: 0, alpha: 0 }
    const inner = Math.round(px * 0.9)
    const pad = Math.floor((px - inner) / 2)
    const p = sharp(mark).resize(inner, inner, { fit: 'contain', background: fill }).extend({ top: pad, bottom: px - inner - pad, left: pad, right: px - inner - pad, background: fill })
    return (bg ? p.flatten({ background: bg }) : p).png({ compressionLevel: 9 })
  }
  for (const px of [32, 48, 96, 192]) await emit(markSrc, out(`favicon-${px}x${px}.png`), icon(px))
  await emit(markSrc, out('apple-touch-icon.png'), icon(180, '#ffffff'))
  await emit(markSrc, out('icon-512.png'), icon(512))
  const frames = await Promise.all([16, 32, 48].map((px) => icon(px).toBuffer().then((buf) => ({ px, buf }))))
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(frames.length, 4)
  let offset = 6 + 16 * frames.length
  const dir = frames.map(({ px, buf }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(px === 256 ? 0 : px, 0)
    e.writeUInt8(px === 256 ? 0 : px, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(buf.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += buf.length
    return e
  })
  writeFileSync(out('favicon.ico'), Buffer.concat([header, ...dir, ...frames.map((f) => f.buf)]))
  console.log('favicon.ico', `(${frames.map((f) => f.px).join('/')} px)`)

  // Hydropower photo used on the Appi Saipal page (rendered ≤ 1200 px wide).
  const hydro = out('hydropower-plant.jpg')
  for (const w of [640, 1024, 1376]) {
    await emit(hydro, out(`img/hydropower-plant-${w}.webp`), sharp(hydro).resize({ width: w }).webp({ quality: 72, effort: 6 }))
  }
  await emit(hydro, out('img/hydropower-plant-1024.jpg'), sharp(hydro).resize({ width: 1024 }).jpeg({ quality: 74, mozjpeg: true }))

  // Open Graph preview: keep 1200×630, recompress.
  await emit(out('preview.png'), out('img/og-default.jpg'), sharp(out('preview.png')).jpeg({ quality: 82, mozjpeg: true }))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
