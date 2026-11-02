#!/usr/bin/env node
// Bascule le site sur un autre métier : npm run metier -- plombier
import { copyFile, readdir } from 'node:fs/promises'

const id = process.argv[2]
const dir = new URL('../presets/', import.meta.url)
const list = (await readdir(dir)).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''))
if (!id || !list.includes(id)) {
  console.log(`Usage : npm run metier -- <${list.join(' | ')}>`)
  process.exit(1)
}
await copyFile(new URL(`${id}.json`, dir), new URL('../src/config.json', import.meta.url))
console.log(`✓ src/config.json ← presets/${id}.json — relancez "npm run dev" ou "npm run build".`)
