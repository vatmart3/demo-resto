#!/usr/bin/env node
// Injecte le HTML pré-rendu (SSG) dans dist/index.html. Lancé par "npm run build".
import { readFile, writeFile, rm } from 'node:fs/promises'

const ssr = new URL('../dist-ssr/entry-server.js', import.meta.url)
const { render } = await import(ssr.href)
const file = new URL('../dist/index.html', import.meta.url)
const tpl = await readFile(file, 'utf8')
const html = await render()
if (!tpl.includes('<div id="root"></div>')) throw new Error('Balise #root introuvable dans dist/index.html')
await writeFile(file, tpl.replace('<div id="root"></div>', `<div id="root">${html}</div>`))
await rm(new URL('../dist-ssr/', import.meta.url), { recursive: true, force: true })
console.log(`✓ SSG : ${Math.round(html.length / 1024)} Ko de HTML pré-rendu`)
