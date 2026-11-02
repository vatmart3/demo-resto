#!/usr/bin/env node
/**
 * Génère les visuels de démonstration (avant/après + affiches 3D du hero) dans public/photos/.
 * Prérequis : `npm run dev` lancé (port 5173) et Playwright + Chromium installés.
 * Usage : npm run photos:render [-- elec-tableau peint-salon ...]
 */
import { createRequire } from 'node:module'
import { writeFile, mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const BASE = process.env.DEV_URL || 'http://localhost:5173'
const OUT = new URL('../public/photos/', import.meta.url)

const ALL = ['elec-tableau', 'elec-prises', 'elec-eclairage', 'plomb-sdb', 'plomb-chauffe-eau', 'peint-salon', 'peint-porte', 'pay-jardin', 'pay-terrasse']
const POSTERS = ['ampoule', 'robinet', 'rouleau', 'couches']

const args = process.argv.slice(2)
const scenes = args.length ? args.filter((a) => ALL.includes(a)) : ALL
const posters = args.length ? args.filter((a) => POSTERS.includes(a)) : POSTERS

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })

if (scenes.length) {
  const page = await browser.newPage()
  page.on('pageerror', (e) => console.error('pageerror', e.message))
  await page.goto(`${BASE}/scripts/render/placeholders.html`)
  await page.waitForFunction(() => window.__ready, null, { timeout: 60000 })
  for (const id of scenes) {
    for (const variant of ['avant', 'apres']) {
      const t0 = Date.now()
      const url = await page.evaluate(([i, v]) => window.renderPair(i, v), [id, variant])
      const buf = Buffer.from(url.split(',')[1], 'base64')
      const file = new URL(`${id}-${variant}.webp`, OUT)
      await sharp(buf).webp({ quality: 74, effort: 6 }).toFile(file.pathname)
      console.log(`✓ ${id}-${variant}.webp (${Date.now() - t0} ms)`)
    }
  }
  await page.close()
}

for (const modele of posters) {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1.5 })
  await page.goto(`${BASE}/?__poster&modele=${modele}`)
  await page.waitForFunction(() => window.__posterReady, null, { timeout: 60000 })
  const png = await page.screenshot({ omitBackground: true })
  const file = new URL(`hero-${modele}.webp`, OUT)
  await sharp(png).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(file.pathname)
  console.log(`✓ hero-${modele}.webp`)
  await page.close()
}

await browser.close()
