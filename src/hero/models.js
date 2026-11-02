import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Modèles 3D « vue éclatée » par métier. Choisir via config.hero.modele3d.
 * Chaque pièce : géométrie, matière (solid | metal | glass | accent | dark),
 * position assemblée, décalage éclaté, rotation éclatée, ancre d'annotation (repère local).
 * Les libellés viennent de config.hero.annotations[clé].
 */

const lathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)

const smoothProfile = (pts, n = 40) => {
  const curve = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)))
  return curve.getPoints(n).map((p) => [Math.max(0, p.x), p.y])
}

const tube = (points, radius, seg = 64, radial = 8) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), seg, radius, radial, false)

/* ---------------------------------------------------------------- AMPOULE */
function ampoule() {
  const globeProfile = smoothProfile(
    [
      [0.26, 0.0],
      [0.27, 0.16],
      [0.36, 0.42],
      [0.52, 0.72],
      [0.6, 1.02],
      [0.59, 1.3],
      [0.48, 1.56],
      [0.27, 1.72],
      [0.0, 1.78],
    ],
    48,
  )

  const threads = []
  for (let i = 0; i <= 60; i++) {
    const y = -0.7 + (i / 60) * 0.7
    threads.push([0.265 + 0.03 * Math.max(0, Math.sin((i / 60) * Math.PI * 10)), y])
  }
  threads.unshift([0.22, -0.72])
  threads.push([0.27, 0.0])

  const filaments = []
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4
    const top = [Math.cos(a) * 0.2, 1.12, Math.sin(a) * 0.2]
    const bottom = [Math.cos(a) * 0.06, 0.62, Math.sin(a) * 0.06]
    filaments.push(tube([bottom, [bottom[0] * 2.2, 0.85, bottom[2] * 2.2], top], 0.022, 24, 6))
  }
  filaments.push(new THREE.TorusGeometry(0.2, 0.012, 6, 48).rotateX(Math.PI / 2).translate(0, 1.12, 0))

  const stem = mergeGeometries([
    lathe([[0.0, 0.0], [0.2, 0.0], [0.2, 0.05], [0.08, 0.18], [0.06, 0.62], [0.0, 0.64]], 32),
    tube([[0.05, 0.0], [0.05, 0.3], [0.06, 0.62]], 0.008, 12, 4),
    tube([[-0.05, 0.0], [-0.05, 0.3], [-0.06, 0.62]], 0.008, 12, 4),
  ])

  return {
    tilt: [0.15, 0, -1.2],
    center: [0, 0.5, 0],
    spin: 0.12,
    parts: [
      { key: 'globe', geo: lathe(globeProfile, 56), mat: 'glass', meridians: true, pos: [0, 0, 0], explode: [0, 1.7, 0], rot: [0, 0, 0.12], anchor: [0.59, 1.15, 0] },
      { key: 'filament', geo: mergeGeometries(filaments), mat: 'accent', pos: [0, 0, 0], explode: [0, 0.85, 0], rot: [0, 0.8, 0], anchor: [0.2, 1.0, 0.0] },
      { key: 'support', geo: stem, mat: 'solid', pos: [0, 0, 0], explode: [0, 0.25, 0], rot: [0, 0, 0], anchor: [0.08, 0.35, 0] },
      { key: 'culot', geo: lathe(threads, 48), mat: 'metal', pos: [0, 0, 0], explode: [0, -0.6, 0], rot: [0, 0.6, 0], anchor: [0.29, -0.35, 0] },
      { key: 'isolant', geo: lathe([[0.0, -0.8], [0.18, -0.8], [0.22, -0.76], [0.22, -0.72], [0.0, -0.72]], 32), mat: 'dark', pos: [0, 0, 0], explode: [0, -1.1, 0], rot: [0, 0, 0], anchor: [0.21, -0.76, 0] },
      { key: 'plot', geo: lathe([[0.0, -0.9], [0.07, -0.9], [0.09, -0.86], [0.09, -0.8], [0.0, -0.8]], 24), mat: 'metal', pos: [0, 0, 0], explode: [0, -1.55, 0], rot: [0, 0, 0], anchor: [0.09, -0.86, 0] },
    ],
  }
}

/* ---------------------------------------------------------------- ROBINET */
function robinet() {
  const body = mergeGeometries([
    lathe([[0.0, 0.0], [0.3, 0.0], [0.3, 0.06], [0.24, 0.1], [0.24, 0.95], [0.0, 0.95]], 40),
    tube([[0, 0.75, 0], [0.25, 0.85, 0], [0.7, 1.05, 0], [1.0, 1.0, 0], [1.08, 0.82, 0]], 0.085, 48, 16),
  ])
  const nut = new THREE.CylinderGeometry(0.2, 0.2, 0.16, 6).translate(0, -0.08, 0)
  const flex = mergeGeometries([
    tube([[0.08, -0.16, 0], [0.08, -0.6, 0], [0.18, -1.0, 0.05]], 0.035, 24, 6),
    tube([[-0.08, -0.16, 0], [-0.08, -0.6, 0], [-0.18, -1.0, -0.05]], 0.035, 24, 6),
  ])
  const lever = mergeGeometries([
    lathe([[0.0, 0.0], [0.2, 0.0], [0.2, 0.14], [0.12, 0.2], [0.0, 0.2]], 32),
    new THREE.BoxGeometry(0.9, 0.08, 0.14).translate(-0.4, 0.17, 0).rotateZ(0.12),
  ])
  return {
    tilt: [0.1, 0, -0.35],
    center: [0.3, 0.6, 0],
    spin: 0.1,
    parts: [
      { key: 'levier', geo: lever, mat: 'metal', pos: [0, 1.25, 0], explode: [-0.2, 1.3, 0], rot: [0, 0.6, 0.3], anchor: [-0.75, 0.25, 0] },
      { key: 'capot', geo: lathe([[0.0, 0.0], [0.24, 0.0], [0.24, 0.2], [0.18, 0.3], [0.0, 0.32]], 40), mat: 'solid', meridians: true, pos: [0, 0.95, 0], explode: [0, 0.95, 0], rot: [0, 0, 0], anchor: [0.24, 0.12, 0] },
      { key: 'cartouche', geo: lathe([[0.0, 0.0], [0.17, 0.0], [0.17, 0.26], [0.1, 0.3], [0.1, 0.38], [0.0, 0.38]], 32), mat: 'accent', pos: [0, 0.82, 0], explode: [0, 0.55, 0], rot: [0, 0.8, 0], anchor: [0.17, 0.15, 0] },
      { key: 'corps', geo: body, mat: 'metal', meridians: true, pos: [0, 0, 0], explode: [0, 0, 0], rot: [0, 0, 0], anchor: [1.05, 0.9, 0] },
      { key: 'joint', geo: new THREE.TorusGeometry(0.27, 0.03, 8, 48).rotateX(Math.PI / 2), mat: 'dark', pos: [0, -0.02, 0], explode: [0, -0.35, 0], rot: [0, 0, 0], anchor: [0.3, 0, 0] },
      { key: 'ecrou', geo: nut, mat: 'solid', pos: [0, -0.06, 0], explode: [0, -0.65, 0], rot: [0, 0.5, 0], anchor: [0.2, -0.08, 0] },
      { key: 'flexibles', geo: flex, mat: 'solid', pos: [0, -0.06, 0], explode: [0, -1.0, 0], rot: [0, 0, 0], anchor: [0.15, -0.8, 0] },
    ],
  }
}

/* ---------------------------------------------------------------- ROULEAU */
function rouleau() {
  const sleeve = new THREE.CylinderGeometry(0.32, 0.32, 1.6, 48, 1, false).rotateZ(Math.PI / 2)
  const capL = lathe([[0.0, 0.0], [0.3, 0.0], [0.3, 0.05], [0.12, 0.09], [0.0, 0.09]], 32).rotateZ(Math.PI / 2).translate(-0.8, 0, 0)
  const capR = lathe([[0.0, 0.0], [0.3, 0.0], [0.3, 0.05], [0.12, 0.09], [0.0, 0.09]], 32).rotateZ(-Math.PI / 2).translate(0.8, 0, 0)
  const frame = tube(
    [[-0.9, 0, 0], [0.95, 0, 0], [1.05, 0.05, 0], [1.08, 0.45, 0], [0.9, 0.75, 0], [0.4, 0.95, 0], [0.1, 1.05, 0]],
    0.035,
    96,
    8,
  )
  const handle = lathe(
    smoothProfile([[0.06, 0.0], [0.11, 0.08], [0.13, 0.3], [0.12, 0.7], [0.14, 0.95], [0.1, 1.05], [0.0, 1.07]], 30),
    32,
  )
    .rotateZ(Math.PI / 2)
    .translate(0.1, 1.05, 0)
  const ferrule = lathe([[0.0, 0.0], [0.07, 0.0], [0.07, 0.14], [0.0, 0.14]], 24).rotateZ(Math.PI / 2).translate(0.14, 1.05, 0)
  return {
    tilt: [0.25, 0.2, 0.25],
    center: [0, 0.4, 0],
    spin: 0.1,
    parts: [
      { key: 'manchon', geo: sleeve, mat: 'accent', pos: [0, 0, 0], explode: [-0.2, -0.85, 0], rot: [0.4, 0, 0], anchor: [-0.3, -0.32, 0] },
      { key: 'embouts', geo: mergeGeometries([capL, capR]), mat: 'dark', pos: [0, 0, 0], explode: [-1.0, -0.2, 0], rot: [0, 0, 0], anchor: [-0.85, 0.2, 0] },
      { key: 'armature', geo: frame, mat: 'metal', pos: [0, 0, 0], explode: [0, 0.25, 0], rot: [0, 0, 0], anchor: [1.08, 0.45, 0] },
      { key: 'virole', geo: ferrule, mat: 'metal', pos: [0, 0, 0], explode: [-0.55, 0.55, 0], rot: [0, 0, 0], anchor: [0.1, 1.12, 0] },
      { key: 'manche', geo: handle, mat: 'solid', meridians: false, pos: [0, 0, 0], explode: [-1.35, 0.9, 0], rot: [0, 0, 0.15], anchor: [-0.6, 1.17, 0] },
    ],
  }
}

/* ---------------------------------------------------------------- COUCHES (allée / terrasse) */
function couches() {
  const W = 2.0
  const D = 1.3
  const pavers = []
  const cols = 7
  const rows = 4
  const gap = 0.03
  const pw = (W - gap * (cols + 1)) / cols
  const pd = (D - gap * (rows + 1)) / rows
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const off = j % 2 ? pw / 2 : 0
      const x = -W / 2 + gap + pw / 2 + i * (pw + gap) + off
      if (x + pw / 2 > W / 2 + 0.001) continue
      pavers.push(new THREE.BoxGeometry(pw, 0.09, pd).translate(x, 0.045, -D / 2 + gap + pd / 2 + j * (pd + gap)))
    }
  const box = (h) => new THREE.BoxGeometry(W, h, D).translate(0, -h / 2, 0)
  return {
    tilt: [0.42, -0.55, 0],
    center: [0, -0.2, 0],
    spin: 0.08,
    parts: [
      { key: 'paves', geo: mergeGeometries(pavers), mat: 'solid', pos: [0, 0, 0], explode: [0, 1.05, 0], rot: [0, 0, 0], anchor: [W / 2, 0.05, D / 2] },
      { key: 'sable', geo: box(0.06), mat: 'metal', pos: [0, 0, 0], explode: [0, 0.68, 0], rot: [0, 0, 0], anchor: [-W / 2, -0.03, D / 2] },
      { key: 'geotextile', geo: box(0.015).translate(0, -0.06, 0), mat: 'accent', pos: [0, 0, 0], explode: [0, 0.38, 0], rot: [0, 0, 0], anchor: [W / 2, -0.07, D / 2] },
      { key: 'grave', geo: box(0.28).translate(0, -0.075, 0), mat: 'dark', pos: [0, 0, 0], explode: [0, 0.05, 0], rot: [0, 0, 0], anchor: [-W / 2, -0.2, D / 2] },
      { key: 'sol', geo: box(0.3).translate(0, -0.355, 0), mat: 'solid', pos: [0, 0, 0], explode: [0, -0.3, 0], rot: [0, 0, 0], anchor: [W / 2, -0.5, D / 2] },
    ],
  }
}

export const MODELS = { ampoule, robinet, rouleau, couches }
