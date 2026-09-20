#!/usr/bin/env node
// Generates the responsive brand/image assets the site actually renders.
// Run: npm run images   (idempotent; outputs to public/brand and public/img)
//
// Why: the header rendered a 1024×1024, 470 kB PNG at 56 px, and the Appi
// Saipal page shipped a 1.16 MB JPEG. Sources stay untouched in public/ so the
// business keeps its originals; the site references the generated files.

import sharp from 'sharp'
import { mkdir, stat } from 'node:fs/promises'
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

  // Logo mark: rendered at 44–64 px tall → 128 px (2x) and 192 px (3x).
  const mark = out('logo-emblem-transparent.png')
  for (const h of [128, 192]) {
    await emit(mark, out(`brand/logo-mark-${h}.webp`), sharp(mark).resize({ height: h }).webp({ quality: 88, effort: 6 }))
    await emit(mark, out(`brand/logo-mark-${h}.png`), sharp(mark).resize({ height: h }).png({ compressionLevel: 9, palette: true }))
  }

  // Full logo (with wordmark) for the admin login and email/social fallbacks.
  const full = out('logo-full-transparent.png')
  await emit(full, out('brand/logo-full-320.webp'), sharp(full).resize({ width: 320 }).webp({ quality: 88, effort: 6 }))
  await emit(full, out('brand/logo-full-320.png'), sharp(full).resize({ width: 320 }).png({ compressionLevel: 9, palette: true }))

  // Structured-data / favicon-sized square mark on white (schema.org logo).
  await emit(mark, out('brand/logo-square-512.png'), sharp(mark).resize(512, 512, { fit: 'contain', background: '#ffffff' }).flatten({ background: '#ffffff' }).png({ compressionLevel: 9 }))

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
