// Boîte à outils de rendu des visuels avant/après (outil interne, non livré dans le site).
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export { THREE, RoundedBoxGeometry }

let seed = 1
export const rnd = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
export const reseed = (s) => (seed = s)

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function toTex(c, repeat = [1, 1]) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(...repeat)
  t.anisotropy = 8
  return t
}

/** Enduit / peinture avec bruit, taches d'humidité, fissures */
export function plaster(color, { dirt = 0, cracks = 0, noise = 0.06, size = 1024, repeat = [1, 1], stains = '#6b5a3a' } = {}) {
  const [c, g] = canvas(size, size)
  g.fillStyle = color
  g.fillRect(0, 0, size, size)
  for (let i = 0; i < 9000; i++) {
    const v = rnd()
    g.fillStyle = v > 0.5 ? `rgba(255,255,255,${noise * rnd()})` : `rgba(0,0,0,${noise * rnd()})`
    g.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 3, 1 + rnd() * 3)
  }
  for (let i = 0; i < dirt * 14; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const r = 40 + rnd() * 220
    const gr = g.createRadialGradient(x, y, 0, x, y, r)
    gr.addColorStop(0, hexA(stains, 0.22 * rnd() + 0.08))
    gr.addColorStop(1, hexA(stains, 0))
    g.fillStyle = gr
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }
  if (dirt) {
    // coulures
    for (let i = 0; i < dirt * 10; i++) {
      const x = rnd() * size
      const y = rnd() * size * 0.6
      const gr = g.createLinearGradient(x, y, x, y + 200 + rnd() * 300)
      gr.addColorStop(0, hexA(stains, 0.18))
      gr.addColorStop(1, hexA(stains, 0))
      g.fillStyle = gr
      g.fillRect(x, y, 3 + rnd() * 8, 500)
    }
  }
  g.strokeStyle = 'rgba(40,30,20,0.55)'
  for (let i = 0; i < cracks; i++) {
    let x = rnd() * size
    let y = rnd() * size
    g.lineWidth = 1 + rnd() * 1.5
    g.beginPath()
    g.moveTo(x, y)
    for (let k = 0; k < 22; k++) {
      x += (rnd() - 0.5) * 14
      y += rnd() * 9
      g.lineTo(x, y)
    }
    g.stroke()
  }
  return toTex(c, repeat)
}

export function tiles(cols, rows, tile, grout, { vary = 0.06, size = 1024, repeat = [1, 1], groutW = 6, dirt = 0 } = {}) {
  const [c, g] = canvas(size, size)
  g.fillStyle = grout
  g.fillRect(0, 0, size, size)
  const tw = size / cols
  const th = size / rows
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const col = new THREE.Color(tile).offsetHSL(0, 0, (rnd() - 0.5) * vary)
      g.fillStyle = `#${col.getHexString()}`
      g.fillRect(i * tw + groutW / 2, j * th + groutW / 2, tw - groutW, th - groutW)
      const gr = g.createLinearGradient(i * tw, j * th, i * tw + tw, j * th + th)
      gr.addColorStop(0, 'rgba(255,255,255,0.10)')
      gr.addColorStop(1, 'rgba(0,0,0,0.06)')
      g.fillStyle = gr
      g.fillRect(i * tw + groutW / 2, j * th + groutW / 2, tw - groutW, th - groutW)
    }
  if (dirt) {
    for (let i = 0; i < dirt * 20; i++) {
      const x = rnd() * size
      const y = rnd() * size
      const r = 30 + rnd() * 160
      const gr = g.createRadialGradient(x, y, 0, x, y, r)
      gr.addColorStop(0, `rgba(90,70,30,${0.15 + rnd() * 0.15})`)
      gr.addColorStop(1, 'rgba(90,70,30,0)')
      g.fillStyle = gr
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
  }
  return toTex(c, repeat)
}

export function wood(base, { planks = 6, size = 1024, repeat = [1, 1], vertical = false, contrast = 0.12 } = {}) {
  const [c, g] = canvas(size, size)
  const pw = size / planks
  for (let i = 0; i < planks; i++) {
    const col = new THREE.Color(base).offsetHSL((rnd() - 0.5) * 0.02, 0, (rnd() - 0.5) * contrast)
    g.fillStyle = `#${col.getHexString()}`
    if (vertical) g.fillRect(i * pw, 0, pw, size)
    else g.fillRect(0, i * pw, size, pw)
    for (let k = 0; k < 60; k++) {
      g.strokeStyle = `rgba(0,0,0,${0.03 + rnd() * 0.05})`
      g.lineWidth = 1 + rnd() * 2
      g.beginPath()
      const o = i * pw + rnd() * pw
      if (vertical) {
        g.moveTo(o, 0)
        g.bezierCurveTo(o + 8, size * 0.3, o - 8, size * 0.6, o + 4, size)
      } else {
        g.moveTo(0, o)
        g.bezierCurveTo(size * 0.3, o + 6, size * 0.6, o - 6, size, o + 3)
      }
      g.stroke()
    }
    g.fillStyle = 'rgba(0,0,0,0.35)'
    if (vertical) g.fillRect(i * pw, 0, 2, size)
    else g.fillRect(0, i * pw, size, 2)
    // joints de bout
    const off = rnd() * size
    if (vertical) g.fillRect(i * pw, off, pw, 2)
    else g.fillRect(off, i * pw, 2, pw)
  }
  return toTex(c, repeat)
}

export function grass(base, { size = 1024, repeat = [1, 1], patchy = 0 } = {}) {
  const [c, g] = canvas(size, size)
  g.fillStyle = base
  g.fillRect(0, 0, size, size)
  for (let i = 0; i < 26000; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const col = new THREE.Color(base).offsetHSL((rnd() - 0.5) * 0.04, (rnd() - 0.5) * 0.2, (rnd() - 0.5) * 0.22)
    g.strokeStyle = `#${col.getHexString()}`
    g.lineWidth = 1 + rnd()
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + (rnd() - 0.5) * 6, y - 4 - rnd() * 10)
    g.stroke()
  }
  for (let i = 0; i < patchy * 12; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const r = 40 + rnd() * 160
    const gr = g.createRadialGradient(x, y, 0, x, y, r)
    gr.addColorStop(0, 'rgba(150,120,70,0.85)')
    gr.addColorStop(1, 'rgba(150,120,70,0)')
    g.fillStyle = gr
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }
  return toTex(c, repeat)
}

export function gravel(base, { size = 1024, repeat = [1, 1], stones = 9000 } = {}) {
  const [c, g] = canvas(size, size)
  g.fillStyle = base
  g.fillRect(0, 0, size, size)
  for (let i = 0; i < stones; i++) {
    const col = new THREE.Color(base).offsetHSL(0, -0.05, (rnd() - 0.5) * 0.3)
    g.fillStyle = `#${col.getHexString()}`
    g.beginPath()
    g.ellipse(rnd() * size, rnd() * size, 2 + rnd() * 6, 2 + rnd() * 5, rnd() * 3, 0, Math.PI * 2)
    g.fill()
  }
  return toTex(c, repeat)
}

/** Étiquette imprimée (texte réel) */
export function label(text, { w = 512, h = 64, bg = '#ffffff', fg = '#222', font = '28px monospace' } = {}) {
  const [c, g] = canvas(w, h)
  g.fillStyle = bg
  g.fillRect(0, 0, w, h)
  g.fillStyle = fg
  g.font = font
  g.textBaseline = 'middle'
  g.fillText(text, 10, h / 2)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function hexA(hex, a) {
  const c = new THREE.Color(hex)
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`
}

export const std = (opts) => new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, ...opts })

export function box(w, h, d, mat, pos = [0, 0, 0], { round = 0, rot } = {}) {
  const geo = round ? new RoundedBoxGeometry(w, h, d, 3, round) : new THREE.BoxGeometry(w, h, d)
  const m = new THREE.Mesh(geo, mat)
  m.position.set(...pos)
  if (rot) m.rotation.set(...rot)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

export function cyl(r, h, mat, pos = [0, 0, 0], { rot, seg = 32, r2 } = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), mat)
  m.position.set(...pos)
  if (rot) m.rotation.set(...rot)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

export function cable(points, r, mat, seg = 80) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, r, 8, false), mat)
  m.castShadow = true
  return m
}

export function plane(w, h, mat, pos = [0, 0, 0], rot = [0, 0, 0]) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
  m.position.set(...pos)
  m.rotation.set(...rot)
  m.receiveShadow = true
  return m
}

/** Lumière douce de base + soleil avec ombres */
export function lights(scene, { ambient = 0.6, sun = 1.6, sunPos = [3, 5, 4], sunColor = '#fff6e8', sky = '#ffffff', ground = '#8a7d6b' } = {}) {
  scene.add(new THREE.HemisphereLight(sky, ground, ambient))
  const d = new THREE.DirectionalLight(sunColor, sun)
  d.position.set(...sunPos)
  d.castShadow = true
  d.shadow.mapSize.set(2048, 2048)
  d.shadow.camera.left = -6
  d.shadow.camera.right = 6
  d.shadow.camera.top = 6
  d.shadow.camera.bottom = -6
  d.shadow.bias = -0.0005
  d.shadow.radius = 6
  scene.add(d)
  return d
}

/** Texture dessinée à la main : draw(ctx, size) */
export function custom(draw, { size = 1024, repeat = [1, 1] } = {}) {
  const [c, g] = canvas(size, size)
  draw(g, size)
  return toTex(c, repeat)
}
