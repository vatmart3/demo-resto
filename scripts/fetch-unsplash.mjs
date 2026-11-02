#!/usr/bin/env node
/**
 * Télécharge en local les photos Unsplash déclarées dans src/config.json.
 * Dans config.json, pour une photo avant/après :
 *   "avant": { "src": "/photos/mon-chantier-avant.webp", "alt": "…", "unsplash": "photo-1581092160562-40aa08e78837" }
 * "unsplash" accepte l'identifiant "photo-…" ou une URL images.unsplash.com complète.
 * Le fichier est enregistré dans public/ au chemin "src" (redimensionné 1200×900, WebP).
 * Usage : npm run photos:unsplash   (ajoutez --force pour écraser l'existant)
 */
import { readFile, access } from 'node:fs/promises'
import sharp from 'sharp'

const force = process.argv.includes('--force')
const cfg = JSON.parse(await readFile(new URL('../src/config.json', import.meta.url), 'utf8'))
const jobs = []
for (const r of cfg.realisations?.liste || []) for (const k of ['avant', 'apres']) if (r[k]?.unsplash) jobs.push(r[k])

if (!jobs.length) {
  console.log('Aucune photo avec un champ "unsplash" renseigné dans src/config.json.')
  process.exit(0)
}

let ok = 0
for (const p of jobs) {
  const dest = new URL(`../public${p.src}`, import.meta.url)
  if (!force) {
    try {
      await access(dest)
      console.log(`= ${p.src} existe déjà (--force pour remplacer)`)
      continue
    } catch {}
  }
  const id = p.unsplash.startsWith('http') ? p.unsplash.split('?')[0] : `https://images.unsplash.com/${p.unsplash}`
  const url = `${id}?w=1600&q=80&fm=jpg&fit=crop&crop=entropy`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await sharp(buf).resize(1200, 900, { fit: 'cover', position: 'attention' }).webp({ quality: 74 }).toFile(dest.pathname)
    console.log(`✓ ${p.src}`)
    ok++
  } catch (e) {
    console.log(`✗ ${p.src} — ${e.message} (${url})`)
  }
}
console.log(`${ok}/${jobs.length} photo(s) téléchargée(s). Pensez à créditer les photographes Unsplash si vous publiez.`)
