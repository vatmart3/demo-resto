// Scènes avant/après (même cadrage pour les deux états). Outil interne.
import { THREE, rnd, reseed, plaster, tiles, wood, grass, gravel, label, std, box, cyl, cable, plane, lights, custom } from './kit.js'

const GRADE = {
  avant: { filter: 'brightness(0.9) saturate(0.62) sepia(0.18) contrast(0.94)', grain: 0.06, vignette: 0.5 },
  apres: { filter: 'brightness(1.03) saturate(1.06) contrast(1.05)', grain: 0.035, vignette: 0.22 },
}

function base(bg = '#ddd') {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(bg)
  return scene
}
function cam(pos, look, fov = 40) {
  const c = new THREE.PerspectiveCamera(fov, 4 / 3, 0.05, 100)
  c.position.set(...pos)
  c.lookAt(...look)
  return c
}

/* ============================================================ ÉLECTRICIEN */

function elecTableau(v) {
  reseed(11)
  const s = base()
  const A = v === 'avant'
  s.add(plane(6, 4, std({ map: A ? plaster('#cdbf9f', { dirt: 4, cracks: 2 }) : plaster('#efebe3', { noise: 0.03 }) }), [0, 1.5, 0]))
  if (A) {
    s.add(box(0.62, 0.74, 0.025, std({ map: wood('#6b4c2e', { planks: 4, vertical: true, contrast: 0.08 }) }), [0, 1.5, 0.013]))
    const bake = std({ color: '#161514', roughness: 0.35 })
    s.add(box(0.17, 0.26, 0.11, bake, [-0.17, 1.66, 0.08], { round: 0.02 }))
    s.add(cyl(0.055, 0.01, std({ color: '#b9b4a3', roughness: 0.2, metalness: 0.2 }), [-0.17, 1.7, 0.14], { rot: [Math.PI / 2, 0, 0] }))
    s.add(box(0.07, 0.02, 0.01, std({ color: '#ddd8c8' }), [-0.17, 1.6, 0.139]))
    const porc = std({ color: '#ece6d6', roughness: 0.25 })
    for (let i = 0; i < 6; i++) {
      const x = -0.04 + i * 0.055
      s.add(box(0.045, 0.085, 0.045, porc, [x, 1.4, 0.05], { round: 0.008 }))
      s.add(cyl(0.015, 0.03, std({ color: ['#c23b22', '#2f6db3', '#c9a227'][i % 3], roughness: 0.4 }), [x, 1.4, 0.085], { rot: [Math.PI / 2, 0, 0] }))
    }
    s.add(box(0.1, 0.14, 0.06, std({ color: '#4a3524', roughness: 0.5 }), [0.19, 1.64, 0.045], { round: 0.01 }))
    s.add(box(0.015, 0.08, 0.02, std({ color: '#111' }), [0.19, 1.66, 0.09], { rot: [0.5, 0, 0] }))
    const cols = ['#2b2a28', '#7a2b1e', '#5a4a2a', '#b8a27a', '#3c3a36', '#8a3a24', '#2b2a28', '#a08a5a']
    for (let i = 0; i < 12; i++) {
      const sx = -0.06 + (i % 6) * 0.055
      const sy = i < 6 ? 1.35 : 1.2
      const pts = [
        [sx, sy, 0.05],
        [sx + (rnd() - 0.5) * 0.25, sy - 0.12 - rnd() * 0.1, 0.12 + rnd() * 0.08],
        [sx + (rnd() - 0.5) * 0.5, sy - 0.35 - rnd() * 0.15, 0.06 + rnd() * 0.12],
        [sx + (rnd() - 0.5) * 0.7, 0.6 + rnd() * 0.2, 0.03 + rnd() * 0.15],
        [sx + (rnd() - 0.5) * 0.8, -0.2, 0.05],
      ]
      s.add(cable(pts, 0.0055, std({ color: cols[i % cols.length], roughness: 0.7 })))
    }
    for (let i = 0; i < 4; i++) {
      const pts = [[-0.2 + i * 0.12, 1.88, 0.02], [-0.25 + i * 0.13 + (rnd() - 0.5) * 0.2, 2.0, 0.1], [-0.3 + i * 0.15, 2.6, 0.04]]
      s.add(cable(pts, 0.006, std({ color: cols[(i + 3) % cols.length] })))
    }
    s.add(box(0.035, 0.018, 0.02, std({ color: '#f2efe6' }), [0.22, 1.08, 0.16], { rot: [0, 0, 0.6] }))
    s.add(box(0.035, 0.018, 0.02, std({ color: '#f2efe6' }), [-0.12, 1.02, 0.14], { rot: [0, 0, -0.3] }))
    lights(s, { ambient: 0.35, sun: 1.1, sunPos: [-2, 3, 3], sunColor: '#ffd9a0', ground: '#4a3b2a' })
    const p = new THREE.PointLight('#ffcf8a', 2.5, 4, 1.5)
    p.position.set(0.6, 2.3, 1.2)
    s.add(p)
  } else {
    s.add(box(0.46, 0.66, 0.11, std({ color: '#f7f6f3', roughness: 0.4 }), [0, 1.5, 0.055], { round: 0.02 }))
    s.add(box(0.4, 0.6, 0.02, std({ color: '#e9e8e4', roughness: 0.5 }), [0, 1.5, 0.105]))
    const rows = [1.72, 1.5, 1.28]
    const names = [
      ['DIFF 40A 30mA', 'CUISINE', 'LAVE-LINGE', 'FOUR', 'PLAQUES'],
      ['DIFF 40A 30mA', 'PRISES SÉJOUR', 'CH. 1', 'CH. 2', 'ÉCLAIRAGE'],
      ['DIFF 40A 30mA', 'SDB', 'CHAUFFE-EAU', 'VMC', 'PARAFOUDRE'],
    ]
    rows.forEach((y, r) => {
      s.add(box(0.38, 0.02, 0.01, std({ color: '#8f9296', metalness: 0.6, roughness: 0.3 }), [0, y, 0.12]))
      let x = -0.175
      for (let k = 0; k < 16; k++) {
        const wide = k === 0
        const w = wide ? 0.068 : 0.0175
        const mod = box(w - 0.001, 0.088, 0.06, std({ color: '#fbfbf9', roughness: 0.35 }), [x + w / 2, y, 0.14], { round: 0.003 })
        s.add(mod)
        s.add(box(0.008, 0.02, 0.012, std({ color: wide ? '#2f6db3' : '#2a2b2e', roughness: 0.4 }), [x + w / 2, y + 0.008, 0.176]))
        if (wide) s.add(box(0.01, 0.01, 0.008, std({ color: '#f6c400' }), [x + w - 0.014, y - 0.026, 0.172]))
        x += w + 0.0005
      }
      const lbl = label(names[r].join('   '), { w: 1024, h: 48, font: 'bold 18px monospace', fg: '#1d1d1d' })
      s.add(plane(0.37, 0.018, std({ map: lbl, roughness: 0.6 }), [0, y - 0.06, 0.116]))
    })
    const gaine = std({ color: '#8d9095', roughness: 0.6 })
    for (const dx of [-0.12, -0.04, 0.04, 0.12]) {
      s.add(cyl(0.012, 1.2, gaine, [dx, 2.43, 0.03]))
      s.add(cyl(0.012, 0.9, gaine, [dx * 0.6, 0.72, 0.03]))
    }
    lights(s, { ambient: 0.9, sun: 1.5, sunPos: [1.5, 3, 4], sunColor: '#ffffff', ground: '#bfb8aa' })
  }
  return { scene: s, camera: cam([0.2, 1.47, 1.02], [0.0, 1.43, 0], 42) }
}

function elecPrises(v) {
  reseed(23)
  const s = base()
  const A = v === 'avant'
  s.add(plane(8, 3, std({ map: A ? plaster('#d8ccae', { dirt: 3, cracks: 2, repeat: [2, 1] }) : plaster('#c7cebd', { noise: 0.025, repeat: [2, 1] }) }), [0, 1.5, 0]))
  s.add(plane(8, 6, std({ map: wood(A ? '#8e6d48' : '#b98d5f', { planks: 10, repeat: [2, 2], contrast: A ? 0.22 : 0.1 }), roughness: A ? 0.9 : 0.55 }), [0, 0, 3], [-Math.PI / 2, 0, 0]))
  s.add(box(8, 0.08, 0.014, std({ color: A ? '#e2dac6' : '#f3f1ec' }), [0, 0.04, 0.007]))
  const white = std({ color: A ? '#ebe5d4' : '#f7f7f5', roughness: 0.4 })
  if (A) {
    s.add(box(8, 0.045, 0.025, white, [0, 0.32, 0.013]))
    s.add(box(0.045, 1.4, 0.025, white, [-0.75, 1.02, 0.013]))
    s.add(box(0.045, 1.4, 0.025, white, [0.95, 1.02, 0.013]))
    s.add(box(0.085, 0.085, 0.045, white, [0.25, 0.32, 0.03], { round: 0.01 }))
    s.add(box(0.085, 0.085, 0.045, white, [-0.35, 0.32, 0.03], { round: 0.01 }))
    s.add(box(0.36, 0.045, 0.065, std({ color: '#efefe9', roughness: 0.4 }), [0.45, 0.023, 0.32], { rot: [0, 0.25, 0] }))
    const plugCols = ['#1c1c1c', '#f2f2f2', '#1c1c1c', '#5a5a5a']
    for (let i = 0; i < 4; i++) {
      const x = 0.32 + i * 0.075
      s.add(box(0.035, 0.05, 0.045, std({ color: plugCols[i] }), [x, 0.06, 0.32 - (x - 0.45) * 0.25], { round: 0.006 }))
      s.add(
        cable(
          [[x, 0.06, 0.34], [x + (rnd() - 0.5) * 0.4, 0.01, 0.5 + rnd() * 0.3], [x + (rnd() - 0.5) * 1.2, 0.01, 0.8 + rnd() * 0.4], [-1.5 + rnd() * 3, 0.01, 1.6]],
          0.0045,
          std({ color: plugCols[i] }),
        ),
      )
    }
    s.add(cable([[0.25, 0.3, 0.06], [0.3, 0.12, 0.15], [0.32, 0.02, 0.25], [0.3, 0.025, 0.32]], 0.005, std({ color: '#f2f2f2' })))
    s.add(cable([[-0.35, 0.3, 0.06], [-0.3, 0.05, 0.2], [-0.6, 0.01, 0.5], [-1.4, 0.01, 0.7]], 0.005, std({ color: '#1c1c1c' })))
    lights(s, { ambient: 0.45, sun: 1.1, sunPos: [-3, 2, 3], sunColor: '#ffd9a8', ground: '#5a4a35' })
  } else {
    for (const x of [-0.35, 0.3]) {
      s.add(box(0.155, 0.082, 0.009, white, [x, 0.3, 0.005], { round: 0.004 }))
      for (const dx of [-0.038, 0.038]) {
        s.add(cyl(0.024, 0.004, std({ color: '#e8e8e4' }), [x + dx, 0.3, 0.011], { rot: [Math.PI / 2, 0, 0] }))
        s.add(cyl(0.004, 0.006, std({ color: '#222' }), [x + dx - 0.009, 0.3, 0.012], { rot: [Math.PI / 2, 0, 0] }))
        s.add(cyl(0.004, 0.006, std({ color: '#222' }), [x + dx + 0.009, 0.3, 0.012], { rot: [Math.PI / 2, 0, 0] }))
      }
    }
    s.add(box(0.082, 0.082, 0.009, white, [0.55, 1.1, 0.005], { round: 0.004 }))
    s.add(box(0.03, 0.045, 0.006, std({ color: '#ececea' }), [0.55, 1.1, 0.011], { round: 0.003 }))
    const oak = std({ map: wood('#a87b4f', { planks: 3, contrast: 0.06 }), roughness: 0.5 })
    s.add(box(1.0, 0.5, 0.42, oak, [1.05, 0.38, 0.22], { round: 0.01 }))
    for (const [lx, lz] of [[0.6, 0.05], [1.5, 0.05], [0.6, 0.39], [1.5, 0.39]]) s.add(cyl(0.015, 0.13, std({ color: '#222' }), [lx, 0.065, lz]))
    s.add(cyl(0.11, 0.22, std({ color: '#d9d4c8', roughness: 0.9 }), [-0.95, 0.11, 0.35], { r2: 0.13 }))
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.09 + rnd() * 0.05, 16, 12), std({ color: new THREE.Color('#3f6b3a').offsetHSL(0, 0, (rnd() - 0.5) * 0.1) }))
      m.position.set(-0.95 + (rnd() - 0.5) * 0.25, 0.32 + rnd() * 0.35, 0.35 + (rnd() - 0.5) * 0.25)
      m.castShadow = true
      s.add(m)
    }
    lights(s, { ambient: 0.95, sun: 1.6, sunPos: [3, 3, 4], sunColor: '#fff8ee', ground: '#b49a7a' })
  }
  return { scene: s, camera: cam([0.15, 0.78, 1.85], [0.05, 0.42, 0], 44) }
}

function elecEclairage(v) {
  reseed(37)
  const A = v === 'avant'
  const s = base(A ? '#1a1612' : '#ddd')
  s.add(plane(6, 3, std({ map: A ? plaster('#cfc2a2', { dirt: 3 }) : plaster('#f0ede6', { noise: 0.02 }) }), [0, 1.25, 0]))
  s.add(plane(4, 6, std({ map: A ? plaster('#c9bc9c', { dirt: 2 }) : plaster('#efece5', { noise: 0.02 }) }), [-1.6, 1.25, 1.5], [0, Math.PI / 2, 0]))
  s.add(plane(6, 6, std({ color: A ? '#bfb397' : '#f4f2ed' }), [0, 2.5, 1.5], [Math.PI / 2, 0, 0]))
  s.add(plane(6, 6, std({ map: tiles(8, 8, A ? '#8a6a4a' : '#bdb7ad', A ? '#3a2d20' : '#8c877e', { repeat: [3, 3] }) }), [0, 0, 1.5], [-Math.PI / 2, 0, 0]))
  s.add(plane(3.2, 0.62, std({ map: A ? tiles(16, 3, '#d8c79c', '#7b6a4a', { dirt: 2, repeat: [1, 1] }) : tiles(10, 6, '#f6f4ef', '#d9d6cf', { groutW: 4 }), roughness: A ? 0.5 : 0.2 }), [0, 1.2, 0.002]))
  const front = A ? std({ map: wood('#8a6440', { planks: 2, vertical: true, contrast: 0.15 }), roughness: 0.6 }) : std({ color: '#f1efea', roughness: 0.35 })
  const carcass = std({ color: A ? '#6e5236' : '#e6e3dc' })
  s.add(box(3.2, 0.85, 0.6, carcass, [0, 0.425, 0.3]))
  for (let i = 0; i < 5; i++) s.add(box(0.6, 0.78, 0.02, front, [-1.24 + i * 0.62, 0.45, 0.61], { round: 0.004 }))
  s.add(box(3.24, 0.04, 0.64, std({ color: A ? '#9c8c74' : '#2a2a2c', roughness: A ? 0.7 : 0.25 }), [0, 0.87, 0.31]))
  s.add(box(3.2, 0.7, 0.35, carcass, [0, 1.9, 0.175]))
  for (let i = 0; i < 5; i++) s.add(box(0.6, 0.66, 0.02, front, [-1.24 + i * 0.62, 1.9, 0.36], { round: 0.004 }))
  const handle = std({ color: A ? '#b59a5a' : '#1c1c1c', metalness: 0.6, roughness: 0.35 })
  for (let i = 0; i < 5; i++) {
    s.add(box(0.12, 0.012, 0.02, handle, [-1.24 + i * 0.62, 0.78, 0.63]))
    s.add(box(0.12, 0.012, 0.02, handle, [-1.24 + i * 0.62, 1.6, 0.38]))
  }
  s.add(cyl(0.12, 0.26, std({ color: '#d8d8d8', metalness: 0.7, roughness: 0.3 }), [0.6, 1.02, 0.35]))
  if (A) {
    s.add(new THREE.HemisphereLight('#ffe2b0', '#2a2015', 0.12))
    s.add(cable([[0, 2.5, 1.3], [0, 2.2, 1.3], [0, 2.02, 1.3]], 0.004, std({ color: '#222' }), 10))
    s.add(cyl(0.022, 0.05, std({ color: '#3a3a3a' }), [0, 2.0, 1.3]))
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff1c7' }))
    bulb.position.set(0, 1.94, 1.3)
    s.add(bulb)
    const p = new THREE.PointLight('#ffc77a', 4.2, 0, 1.6)
    p.position.set(0, 1.9, 1.3)
    p.castShadow = true
    p.shadow.mapSize.set(1024, 1024)
    s.add(p)
  } else {
    s.add(new THREE.HemisphereLight('#ffffff', '#c8bba8', 1.0))
    for (const x of [-1.1, 0, 1.1]) {
      for (const z of [0.9, 1.9]) {
        s.add(cyl(0.045, 0.01, new THREE.MeshBasicMaterial({ color: '#fffaf0' }), [x, 2.495, z]))
        const sp = new THREE.SpotLight('#fff3e0', 6, 6, 0.75, 0.6, 1.4)
        sp.position.set(x, 2.45, z)
        sp.target.position.set(x, 0, z - 0.2)
        s.add(sp, sp.target)
        if (z === 0.9) sp.castShadow = true
      }
    }
    s.add(box(3.1, 0.012, 0.03, new THREE.MeshBasicMaterial({ color: '#fff6dc' }), [0, 1.545, 0.3]))
    for (let i = 0; i < 6; i++) {
      const p = new THREE.PointLight('#ffe9c2', 0.9, 1.6, 1.5)
      p.position.set(-1.35 + i * 0.54, 1.5, 0.28)
      s.add(p)
    }
  }
  return { scene: s, camera: cam([0.35, 1.55, 3.4], [0, 1.3, 0], 50) }
}

/* ============================================================ PLOMBIER */

function plombSdb(v) {
  reseed(51)
  const A = v === 'avant'
  const s = base()
  const wallT = A ? tiles(14, 14, '#d6b5a6', '#6e5a50', { dirt: 3, repeat: [3, 2] }) : tiles(3, 6, '#c3bfb7', '#a9a59d', { groutW: 3, vary: 0.03, repeat: [3, 1] })
  s.add(plane(6, 3, std({ map: wallT, roughness: A ? 0.4 : 0.25 }), [0, 1.5, 0]))
  s.add(plane(4, 3, std({ map: wallT, roughness: A ? 0.4 : 0.25 }), [-1.3, 1.5, 1.5], [0, Math.PI / 2, 0]))
  s.add(plane(6, 6, std({ map: A ? tiles(20, 20, '#7a5a44', '#3a2c22', { repeat: [3, 3] }) : tiles(4, 4, '#8f8b84', '#7d7972', { groutW: 3, repeat: [3, 3] }) }), [0, 0, 1.5], [-Math.PI / 2, 0, 0]))
  if (A) {
    const enamel = std({ color: '#e7e0c9', roughness: 0.25 })
    s.add(box(1.7, 0.56, 0.76, enamel, [-0.45, 0.28, 0.39], { round: 0.05 }))
    s.add(box(1.5, 0.1, 0.56, std({ color: '#cfc6ab', roughness: 0.3 }), [-0.45, 0.53, 0.39], { round: 0.04 }))
    const cu = std({ color: '#7f6a4c', metalness: 0.6, roughness: 0.55 })
    s.add(cable([[0.55, 0.05, 0.04], [0.55, 0.8, 0.04], [0.4, 0.85, 0.04], [-0.1, 0.85, 0.04], [-0.2, 0.75, 0.05]], 0.012, cu))
    s.add(cable([[0.62, 0.05, 0.04], [0.62, 0.9, 0.04], [0.3, 0.95, 0.04], [-0.3, 0.93, 0.04]], 0.012, std({ color: '#6b7a55', metalness: 0.4, roughness: 0.7 })))
    s.add(box(0.12, 0.06, 0.08, std({ color: '#b8b3a6', metalness: 0.8, roughness: 0.35 }), [-0.25, 0.85, 0.06]))
    s.add(cable([[-0.25, 0.85, 0.1], [-0.15, 0.7, 0.3], [-0.6, 0.62, 0.4], [-0.8, 0.6, 0.35]], 0.01, std({ color: '#c8c8c0', metalness: 0.7, roughness: 0.4 })))
    s.add(box(0.5, 0.65, 0.02, std({ color: '#bfc6c4', metalness: 0.9, roughness: 0.25 }), [0.6, 1.55, 0.01]))
    lights(s, { ambient: 0.5, sun: 1.1, sunPos: [2, 3, 3], sunColor: '#ffe2b8', ground: '#5a4535' })
  } else {
    s.add(box(1.3, 0.03, 0.95, std({ color: '#47484b', roughness: 0.6 }), [-0.62, 0.015, 0.48]))
    const glass = new THREE.MeshPhysicalMaterial({ color: '#dfe8ea', transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1 })
    s.add(box(0.012, 2.0, 0.95, glass, [0.05, 1.0, 0.48]))
    s.add(box(0.012, 2.0, 0.012, std({ color: '#1d1d1d', metalness: 0.6 }), [0.05, 1.0, 0.95]))
    const black = std({ color: '#1d1d1d', metalness: 0.5, roughness: 0.35 })
    s.add(cyl(0.012, 1.25, black, [-0.62, 1.3, 0.03]))
    s.add(cable([[-0.62, 1.92, 0.03], [-0.62, 2.05, 0.08], [-0.62, 2.05, 0.38]], 0.012, black, 20))
    s.add(cyl(0.15, 0.015, black, [-0.62, 2.04, 0.4]))
    s.add(box(0.08, 0.14, 0.06, black, [-0.62, 1.15, 0.05], { round: 0.01 }))
    s.add(box(0.5, 0.3, 0.1, std({ color: '#4a4b4e', roughness: 0.4 }), [-0.62, 1.45, -0.04]))
    s.add(box(0.5, 0.008, 0.1, std({ color: '#b5b1a9' }), [-0.62, 1.3, 0.01]))
    for (let i = 0; i < 7; i++) s.add(cyl(0.012, 0.5, black, [0.75, 0.55 + i * 0.12, 0.08], { rot: [0, 0, Math.PI / 2] }))
    for (const x of [0.5, 1.0]) s.add(cyl(0.016, 0.9, black, [x, 0.9, 0.08]))
    s.add(box(0.46, 0.06, 0.08, std({ color: '#f1efe9' }), [0.75, 1.02, 0.1], { round: 0.01 }))
    lights(s, { ambient: 1.0, sun: 1.5, sunPos: [2.5, 3.5, 3.5], sunColor: '#ffffff', ground: '#b0aaa0' })
  }
  return { scene: s, camera: cam([0.9, 1.35, 2.7], [-0.15, 1.0, 0], 46) }
}

function plombChauffeEau(v) {
  reseed(63)
  const A = v === 'avant'
  const s = base()
  s.add(plane(6, 3, std({ map: A ? plaster('#bdb39e', { dirt: 5, cracks: 3, stains: '#7a4a20' }) : plaster('#ecebe6', { noise: 0.025 }) }), [0, 1.5, 0]))
  s.add(plane(6, 6, std({ map: A ? plaster('#7d7a72', { dirt: 4, stains: '#3a2a15', repeat: [2, 2] }) : plaster('#b9b7b1', { noise: 0.05, repeat: [2, 2] }) }), [0, 0, 1.5], [-Math.PI / 2, 0, 0]))
  const tank = A
    ? std({ map: plaster('#d6cca8', { dirt: 6, stains: '#8a4a1a', noise: 0.08 }), roughness: 0.5 })
    : std({ color: '#f5f5f3', roughness: 0.3 })
  s.add(cyl(0.29, 1.15, tank, [-0.25, 1.32, 0.33], { seg: 48 }))
  const capM = std({ color: A ? '#b9ad8a' : '#f0f0ee', roughness: 0.4 })
  s.add(new THREE.Mesh(new THREE.SphereGeometry(0.29, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), capM).translateX(-0.25).translateY(1.895).translateZ(0.33))
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.29, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), capM)
  bottom.position.set(-0.25, 0.745, 0.33)
  s.add(bottom)
  if (A) {
    const rust = std({ color: '#6f5a44', metalness: 0.5, roughness: 0.7 })
    const pipes = [
      [[-0.32, 0.62, 0.33], [-0.32, 0.45, 0.33], [-0.1, 0.4, 0.2], [0.3, 0.42, 0.06], [0.5, 0.8, 0.05], [0.45, 1.6, 0.05], [0.7, 2.6, 0.05]],
      [[-0.18, 0.62, 0.33], [-0.15, 0.5, 0.3], [0.2, 0.55, 0.12], [0.6, 0.5, 0.05], [0.8, 1.2, 0.05], [0.9, 2.6, 0.05]],
      [[0.25, 0.0, 0.05], [0.28, 0.35, 0.08], [0.15, 0.3, 0.22], [-0.2, 0.25, 0.35]],
    ]
    pipes.forEach((p, i) => s.add(cable(p, 0.014, i === 2 ? std({ color: '#5f7052', metalness: 0.4, roughness: 0.8 }) : rust)))
    s.add(cyl(0.13, 0.26, std({ color: '#a8322a', roughness: 0.6 }), [0.15, 0.13, 0.45], { r2: 0.15 }))
    s.add(box(0.05, 0.11, 0.05, std({ color: '#8c7a4a', metalness: 0.6, roughness: 0.5 }), [-0.32, 0.55, 0.33]))
    lights(s, { ambient: 0.45, sun: 1.0, sunPos: [-2, 3, 3], sunColor: '#ffd8a0', ground: '#3a3020' })
  } else {
    const cu = std({ color: '#c47a46', metalness: 0.85, roughness: 0.3 })
    const foam = std({ color: '#3b3c3f', roughness: 0.9 })
    const run = (pts, r, m) => s.add(cable(pts, r, m, 60))
    run([[-0.33, 0.68, 0.33], [-0.33, 0.48, 0.33], [-0.33, 0.42, 0.25], [-0.33, 0.42, 0.06], [0.3, 0.42, 0.06], [0.3, 3, 0.06]], 0.014, cu)
    run([[-0.17, 0.68, 0.33], [-0.17, 0.52, 0.33], [-0.17, 0.5, 0.2], [-0.17, 0.5, 0.1], [0.45, 0.5, 0.1], [0.45, 3, 0.1]], 0.028, foam)
    s.add(box(0.07, 0.16, 0.07, std({ color: '#c9a640', metalness: 0.8, roughness: 0.3 }), [-0.33, 0.56, 0.33], { round: 0.01 }))
    s.add(cyl(0.025, 0.05, std({ color: '#2f6db3' }), [-0.33, 0.64, 0.38], { rot: [Math.PI / 2, 0, 0] }))
    s.add(cyl(0.05, 0.1, std({ color: '#e8e8e6' }), [-0.33, 0.2, 0.33], { r2: 0.06 }))
    s.add(cable([[-0.33, 0.48, 0.38], [-0.33, 0.26, 0.36]], 0.008, std({ color: '#e8e8e6' })))
    s.add(plane(0.16, 0.22, std({ map: label('230V  200L  A', { w: 256, h: 64, font: 'bold 26px monospace', bg: '#2f6db3', fg: '#fff' }) }), [-0.25, 1.35, 0.622]))
    lights(s, { ambient: 1.0, sun: 1.5, sunPos: [2, 3.5, 3.5], sunColor: '#ffffff', ground: '#aaa59a' })
  }
  return { scene: s, camera: cam([0.35, 1.25, 2.45], [0.05, 1.05, 0], 46) }
}

/* ============================================================ PEINTRE */

function peintSalon(v) {
  reseed(71)
  const A = v === 'avant'
  const s = base()
  const wallMap = A
    ? custom(
        (g, n) => {
          g.fillStyle = '#d9cdb0'
          g.fillRect(0, 0, n, n)
          for (let x = 0; x < n; x += 64) {
            g.fillStyle = 'rgba(150,120,80,0.22)'
            g.fillRect(x, 0, 18, n)
            g.fillStyle = 'rgba(120,90,60,0.12)'
            g.fillRect(x + 30, 0, 4, n)
          }
          for (let i = 0; i < 30; i++) {
            const x = rnd() * n
            const y = rnd() * n
            const r = 60 + rnd() * 200
            const gr = g.createRadialGradient(x, y, 0, x, y, r)
            gr.addColorStop(0, 'rgba(110,85,45,0.28)')
            gr.addColorStop(1, 'rgba(110,85,45,0)')
            g.fillStyle = gr
            g.fillRect(x - r, y - r, 2 * r, 2 * r)
          }
          g.fillStyle = '#efe6cf'
          for (let i = 0; i < 4; i++) {
            g.beginPath()
            const x = rnd() * n
            const y = rnd() * n
            g.moveTo(x, y)
            for (let k = 0; k < 8; k++) g.lineTo(x + (rnd() - 0.3) * 120, y + (rnd() - 0.3) * 120)
            g.fill()
          }
          g.strokeStyle = 'rgba(60,40,20,0.6)'
          for (let i = 0; i < 6; i++) {
            let x = rnd() * n
            let y = rnd() * n * 0.5
            g.lineWidth = 1.5
            g.beginPath()
            g.moveTo(x, y)
            for (let k = 0; k < 25; k++) g.lineTo((x += (rnd() - 0.5) * 26), (y += rnd() * 20))
            g.stroke()
          }
        },
        { repeat: [2, 1] },
      )
    : custom(
        (g, n) => {
          g.fillStyle = '#efeae0'
          g.fillRect(0, 0, n, n)
          g.fillStyle = '#2f4a3e'
          g.fillRect(0, n * 0.6, n, n * 0.4)
          g.fillStyle = '#c9a24a'
          g.fillRect(0, n * 0.6 - 3, n, 3)
          for (let i = 0; i < 4000; i++) {
            g.fillStyle = `rgba(0,0,0,${0.02 * rnd()})`
            g.fillRect(rnd() * n, rnd() * n, 2, 2)
          }
        },
        { repeat: [1, 1] },
      )
  const wall = plane(6, 2.7, std({ map: wallMap, roughness: A ? 0.85 : 0.75 }), [0, 1.35, 0])
  if (!A) wallMap.repeat.set(1, 1)
  s.add(wall)
  s.add(plane(6, 6, std({ map: wood(A ? '#7a5a3a' : '#9a7350', { planks: 10, repeat: [2, 2], contrast: A ? 0.2 : 0.1 }), roughness: 0.6 }), [0, 0, 3], [-Math.PI / 2, 0, 0]))
  s.add(box(6, 0.1, 0.015, std({ color: A ? '#d8ccaa' : '#f4f1ea' }), [0, 0.05, 0.008]))
  const frame = std({ color: A ? '#d7c9a2' : '#fbfaf7', roughness: 0.5 })
  s.add(box(1.0, 1.4, 0.06, frame, [0.75, 1.45, 0.03]))
  s.add(box(0.88, 1.28, 0.02, new THREE.MeshBasicMaterial({ color: A ? '#cfd6d2' : '#e8f0f2' }), [0.75, 1.45, 0.05]))
  s.add(box(0.04, 1.28, 0.03, frame, [0.75, 1.45, 0.065]))
  s.add(box(1.12, 0.05, 0.12, frame, [0.75, 0.74, 0.06]))
  const fabric = std({ color: A ? '#6a5a48' : '#c9b9a0', roughness: 0.95 })
  s.add(box(0.85, 0.42, 0.8, fabric, [-1.0, 0.21, 0.6], { round: 0.06 }))
  s.add(box(0.85, 0.55, 0.18, fabric, [-1.0, 0.65, 0.25], { round: 0.06 }))
  s.add(box(0.16, 0.28, 0.8, fabric, [-1.38, 0.48, 0.6], { round: 0.05 }))
  s.add(box(0.16, 0.28, 0.8, fabric, [-0.62, 0.48, 0.6], { round: 0.05 }))
  if (!A) {
    const art = custom((g, n) => {
      g.fillStyle = '#f2ede2'
      g.fillRect(0, 0, n, n)
      g.fillStyle = '#c9a24a'
      g.beginPath()
      g.arc(n * 0.45, n * 0.55, n * 0.22, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = '#2f4a3e'
      g.fillRect(n * 0.15, n * 0.7, n * 0.7, n * 0.08)
    })
    s.add(box(0.5, 0.62, 0.025, std({ color: '#1d1d1d' }), [-1.0, 1.55, 0.015]))
    s.add(plane(0.44, 0.56, std({ map: art }), [-1.0, 1.55, 0.029]))
  }
  lights(s, A ? { ambient: 0.5, sun: 1.1, sunPos: [3, 2.5, 3], sunColor: '#ffd9a8', ground: '#5a4a35' } : { ambient: 1.0, sun: 1.7, sunPos: [3, 3, 4], sunColor: '#fff6e6', ground: '#a08a6a' })
  return { scene: s, camera: cam([0, 1.3, 3.1], [-0.05, 1.15, 0], 48) }
}

function peintPorte(v) {
  reseed(83)
  const A = v === 'avant'
  const s = base()
  s.add(plane(6, 3, std({ map: A ? plaster('#cfc3a6', { dirt: 4, cracks: 3 }) : plaster('#ebe7de', { noise: 0.02 }) }), [0, 1.5, 0]))
  s.add(plane(6, 6, std({ map: tiles(6, 6, A ? '#9a8a74' : '#b8b2a6', A ? '#5a4a3a' : '#9a958c', { repeat: [3, 3], dirt: A ? 2 : 0 }) }), [0, 0, 3], [-Math.PI / 2, 0, 0]))
  const paintMap = (col, chips) =>
    custom((g, n) => {
      g.fillStyle = col
      g.fillRect(0, 0, n, n)
      for (let i = 0; i < chips; i++) {
        g.fillStyle = rnd() > 0.5 ? 'rgba(120,90,50,0.6)' : 'rgba(80,60,40,0.35)'
        g.beginPath()
        const x = rnd() * n
        const y = rnd() * n
        g.ellipse(x, y, 3 + rnd() * 14, 2 + rnd() * 8, rnd() * 3, 0, Math.PI * 2)
        g.fill()
      }
      for (let i = 0; i < 3000; i++) {
        g.fillStyle = `rgba(0,0,0,${0.025 * rnd()})`
        g.fillRect(rnd() * n, rnd() * n, 2, 2)
      }
    })
  const door = std({ map: paintMap(A ? '#e0d4b4' : '#25395a', A ? 140 : 0), roughness: A ? 0.75 : 0.42 })
  const casing = std({ map: paintMap(A ? '#ddd0ae' : '#faf9f6', A ? 80 : 0), roughness: A ? 0.7 : 0.45 })
  s.add(box(0.84, 2.04, 0.04, door, [0, 1.02, 0.02]))
  for (const [y, h] of [[1.55, 0.75], [0.6, 0.85]]) {
    s.add(box(0.58, h, 0.015, door, [0, y, 0.045], { round: 0.006 }))
  }
  s.add(box(0.07, 2.12, 0.025, casing, [-0.455, 1.06, 0.012]))
  s.add(box(0.07, 2.12, 0.025, casing, [0.455, 1.06, 0.012]))
  s.add(box(0.98, 0.07, 0.025, casing, [0, 2.115, 0.012]))
  s.add(box(6, 0.1, 0.015, casing, [0, 0.05, 0.008]))
  const metal = std({ color: A ? '#8f8a7a' : '#c9a24a', metalness: 0.85, roughness: A ? 0.55 : 0.25 })
  s.add(cyl(0.025, 0.012, metal, [0.33, 1.02, 0.046], { rot: [Math.PI / 2, 0, 0] }))
  s.add(box(0.12, 0.016, 0.016, metal, [0.29, 1.02, 0.07], { round: 0.006 }))
  s.add(cyl(0.008, 0.01, std({ color: '#111' }), [0.33, 0.94, 0.046], { rot: [Math.PI / 2, 0, 0] }))
  if (!A) {
    s.add(cyl(0.16, 0.42, std({ color: '#d0cbc0', roughness: 0.9 }), [0.85, 0.21, 0.35], { r2: 0.13 }))
    for (let i = 0; i < 14; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08 + rnd() * 0.05, 12, 10), std({ color: new THREE.Color('#3e6a3a').offsetHSL(0, 0, (rnd() - 0.5) * 0.12) }))
      leaf.position.set(0.85 + (rnd() - 0.5) * 0.35, 0.55 + rnd() * 0.65, 0.35 + (rnd() - 0.5) * 0.3)
      leaf.castShadow = true
      s.add(leaf)
    }
  }
  lights(s, A ? { ambient: 0.5, sun: 1.1, sunPos: [-2, 3, 3], sunColor: '#ffd9a8', ground: '#5a4a35' } : { ambient: 0.95, sun: 1.6, sunPos: [2.5, 3, 4], sunColor: '#fff8ee', ground: '#a8a090' })
  return { scene: s, camera: cam([0.25, 1.15, 2.7], [0.05, 1.05, 0], 46) }
}

/* ============================================================ PAYSAGISTE */

function sky(s, A) {
  s.background = new THREE.Color(A ? '#c9c6b8' : '#bcd3e0')
  s.fog = new THREE.Fog(s.background, 9, 22)
}

function fence(s, A) {
  const m = std({ map: wood(A ? '#6f5d48' : '#8a6a4c', { planks: 14, vertical: true, contrast: A ? 0.25 : 0.12, repeat: [3, 1] }), roughness: 0.85 })
  s.add(box(12, 1.8, 0.05, m, [0, 0.9, -2.6]))
}

function payJardin(v) {
  reseed(97)
  const A = v === 'avant'
  const s = base()
  sky(s, A)
  s.add(plane(14, 10, std({ map: grass(A ? '#7f8648' : '#4e7e33', { repeat: [4, 3], patchy: A ? 6 : 0 }), roughness: 1 }), [0, 0, 1], [-Math.PI / 2, 0, 0]))
  fence(s, A)
  const leafM = (c) => std({ color: c, roughness: 0.95 })
  if (A) {
    for (let i = 0; i < 46; i++) {
      const r = 0.25 + rnd() * 0.35
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), leafM(new THREE.Color('#4a5a2a').offsetHSL((rnd() - 0.5) * 0.05, 0, (rnd() - 0.5) * 0.15)))
      m.position.set(-5 + rnd() * 10, 0.3 + rnd() * 1.4, -2.3 + rnd() * 0.6)
      m.castShadow = true
      s.add(m)
    }
    const weed = leafM('#6b7a3a')
    for (let i = 0; i < 140; i++) {
      const h = 0.15 + rnd() * 0.45
      const c = cyl(0.004, h, weed, [-3 + rnd() * 6, h / 2, -1.5 + rnd() * 4], { r2: 0.0, seg: 4, rot: [(rnd() - 0.5) * 0.6, 0, (rnd() - 0.5) * 0.6] })
      s.add(c)
    }
    s.add(cyl(0.18, 0.3, std({ color: '#9a5a3a', roughness: 0.9 }), [1.2, 0.15, 0.6], { rot: [Math.PI / 2.3, 0.4, 0], r2: 0.22 }))
    lights(s, { ambient: 0.7, sun: 1.3, sunPos: [-3, 4, 2], sunColor: '#ffe6c0', ground: '#5a5030' })
  } else {
    s.add(box(9, 1.1, 0.6, leafM('#2f5a2a'), [0, 0.55, -2.15], { round: 0.15 }))
    s.add(plane(9, 0.9, std({ map: gravel('#cfc5b0', { repeat: [6, 1] }) }), [0, 0.006, -1.45], [-Math.PI / 2, 0, 0]))
    s.add(box(9, 0.05, 0.01, std({ color: '#4a4a4a', metalness: 0.6, roughness: 0.4 }), [0, 0.015, -1.0]))
    const stone = std({ color: '#b9b4a8', roughness: 0.9 })
    ;[[0.2, 1.8], [-0.1, 1.0], [0.25, 0.25], [-0.05, -0.5]].forEach(([x, z]) => s.add(box(0.55, 0.04, 0.38, stone, [x, 0.02, z], { round: 0.015, rot: [0, (rnd() - 0.5) * 0.3, 0] })))
    s.add(cyl(0.06, 1.2, std({ color: '#6a5a48' }), [-1.8, 0.6, -1.45], { r2: 0.05 }))
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 + rnd() * 0.12, 1), leafM(new THREE.Color('#6d7f5a').offsetHSL(0, 0, (rnd() - 0.5) * 0.1)))
      m.position.set(-1.8 + (rnd() - 0.5) * 0.8, 1.35 + rnd() * 0.5, -1.45 + (rnd() - 0.5) * 0.6)
      m.castShadow = true
      s.add(m)
    }
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12 + rnd() * 0.06, 1), leafM(['#7a6a9a', '#c9a24a', '#7f9a5a'][i % 3]))
      m.position.set(0.8 + i * 0.35, 0.12, -1.45 + (rnd() - 0.5) * 0.3)
      m.castShadow = true
      s.add(m)
    }
    lights(s, { ambient: 1.0, sun: 1.8, sunPos: [3, 5, 3], sunColor: '#fff4e0', ground: '#5a7040' })
  }
  return { scene: s, camera: cam([0.4, 1.55, 4.6], [0, 0.35, 0], 48) }
}

function payTerrasse(v) {
  reseed(109)
  const A = v === 'avant'
  const s = base()
  sky(s, A)
  s.add(plane(14, 10, std({ map: A ? gravel('#8a6d4d', { repeat: [4, 3], stones: 4000 }) : grass('#55803a', { repeat: [4, 3] }), roughness: 1 }), [0, 0, 1], [-Math.PI / 2, 0, 0]))
  s.add(plane(12, 4, std({ map: plaster(A ? '#d2c3a2' : '#efe6d6', { dirt: A ? 4 : 0, cracks: A ? 3 : 0, repeat: [3, 1] }) }), [0, 2, -1.6]))
  s.add(box(1.0, 2.1, 0.05, std({ color: A ? '#5a4a3a' : '#2b2f33', roughness: 0.6 }), [0.6, 1.05, -1.57]))
  s.add(box(0.9, 2.0, 0.02, new THREE.MeshBasicMaterial({ color: A ? '#2a2620' : '#3a4650' }), [0.6, 1.05, -1.54]))
  if (A) {
    const rubble = std({ color: '#9a8f80', roughness: 0.95 })
    for (let i = 0; i < 26; i++) s.add(box(0.08 + rnd() * 0.25, 0.05 + rnd() * 0.12, 0.08 + rnd() * 0.2, rubble, [-2.5 + rnd() * 5, 0.04, -1.2 + rnd() * 3], { rot: [rnd(), rnd() * 3, rnd()] }))
    const pallet = std({ map: wood('#9a8060', { planks: 5 }), roughness: 0.9 })
    for (let i = 0; i < 5; i++) s.add(box(1.2, 0.025, 0.12, pallet, [-1.3, 0.12, -0.2 + i * 0.22], { rot: [0, 0.3, 0.12] }))
    for (let i = 0; i < 70; i++) {
      const h = 0.1 + rnd() * 0.35
      s.add(cyl(0.004, h, std({ color: '#6b7a3a' }), [-3 + rnd() * 6, h / 2, -1.4 + rnd() * 3.5], { r2: 0, seg: 4, rot: [(rnd() - 0.5) * 0.6, 0, (rnd() - 0.5) * 0.6] }))
    }
    lights(s, { ambient: 0.65, sun: 1.3, sunPos: [-3, 4, 2], sunColor: '#ffe3bb', ground: '#5a4a30' })
  } else {
    s.add(box(4.2, 0.1, 2.6, std({ map: wood('#a0744a', { planks: 18, repeat: [1, 1] }), roughness: 0.75 }), [0, 0.05, -0.3]))
    s.add(plane(4.6, 0.35, std({ map: gravel('#d8d0bf', { repeat: [5, 1] }) }), [0, 0.004, 1.2], [-Math.PI / 2, 0, 0]))
    const planter = std({ map: wood('#5a4632', { planks: 4 }), roughness: 0.8 })
    for (const x of [-1.8, 1.8]) {
      s.add(box(0.5, 0.5, 0.5, planter, [x, 0.35, -1.25]))
      for (let i = 0; i < 9; i++) {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13 + rnd() * 0.08, 1), std({ color: new THREE.Color('#4a7a3a').offsetHSL(0, 0, (rnd() - 0.5) * 0.12) }))
        m.position.set(x + (rnd() - 0.5) * 0.35, 0.72 + rnd() * 0.45, -1.25 + (rnd() - 0.5) * 0.35)
        m.castShadow = true
        s.add(m)
      }
    }
    const tableM = std({ color: '#2b2b2b', metalness: 0.4, roughness: 0.5 })
    s.add(cyl(0.45, 0.03, std({ color: '#e9e4da', roughness: 0.5 }), [-0.3, 0.82, 0.0]))
    s.add(cyl(0.03, 0.72, tableM, [-0.3, 0.46, 0.0]))
    for (const [x, z, r] of [[-1.0, 0.25, 0.6], [0.4, 0.3, -0.6]]) {
      s.add(box(0.5, 0.05, 0.5, std({ color: '#c9b79a' }), [x, 0.5, z], { round: 0.02, rot: [0, r, 0] }))
      s.add(box(0.5, 0.45, 0.05, std({ color: '#c9b79a' }), [x - Math.sin(r) * 0.25, 0.72, z - Math.cos(r) * 0.25], { round: 0.02, rot: [0, r, 0] }))
    }
    lights(s, { ambient: 1.0, sun: 1.8, sunPos: [3, 5, 3], sunColor: '#fff2dc', ground: '#6a7a4a' })
  }
  return { scene: s, camera: cam([1.3, 1.9, 4.6], [0, 0.4, -0.3], 48) }
}

export const SCENES = {
  'elec-tableau': elecTableau,
  'elec-prises': elecPrises,
  'elec-eclairage': elecEclairage,
  'plomb-sdb': plombSdb,
  'plomb-chauffe-eau': plombChauffeEau,
  'peint-salon': peintSalon,
  'peint-porte': peintPorte,
  'pay-jardin': payJardin,
  'pay-terrasse': payTerrasse,
}

export { GRADE }
