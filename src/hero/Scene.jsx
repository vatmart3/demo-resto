import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MODELS } from './models.js'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/* Silhouette « trait de plan » : coque inversée poussée le long des normales */
function outlineMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uThick: { value: 0.012 } },
    vertexShader: `uniform float uThick;
      void main(){ vec3 p = position + normal * uThick; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: `uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor, 1.0); }`,
    side: THREE.BackSide,
  })
}

/* Verre : liseré de Fresnel, intérieur transparent */
function glassMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uGlow: { value: 0 }, uAccent: { value: new THREE.Color('#ffcc00') } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform vec3 uAccent; uniform float uGlow; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6);
        vec3 c = mix(uColor, uAccent, uGlow);
        gl_FragColor = vec4(c, clamp(f * 0.95 + 0.03 + uGlow * 0.16, 0.0, 1.0)); }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}

function meridianLines(geo, material) {
  const p = geo.parameters
  if (!p || !p.points) return null
  const P = p.points.length
  const segs = p.segments
  const pos = geo.attributes.position
  const group = new THREE.Group()
  for (const frac of [0, 0.25, 0.5, 0.75]) {
    const i = Math.round(frac * segs)
    const pts = []
    for (let j = 0; j < P; j++) {
      const k = i * P + j
      pts.push(new THREE.Vector3(pos.getX(k), pos.getY(k), pos.getZ(k)))
    }
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material))
  }
  return group
}

function Rig({ modelId, progress, overlay, colors, onReady }) {
  const model = useMemo(() => (MODELS[modelId] || MODELS.ampoule)(), [modelId])
  const outer = useRef()
  const parts = useRef([])
  const { camera, size } = useThree()
  const ready = useRef(false)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  const mats = useMemo(() => {
    const line = new THREE.LineBasicMaterial({ color: colors.paper, transparent: true, opacity: 0.85 })
    const lineSoft = new THREE.LineBasicMaterial({ color: colors.paper, transparent: true, opacity: 0.32 })
    return {
      solid: new THREE.MeshLambertMaterial({ color: '#3b3d42', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
      metal: new THREE.MeshLambertMaterial({ color: '#8c8e93', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
      dark: new THREE.MeshLambertMaterial({ color: '#1d1e21', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
      accent: new THREE.MeshBasicMaterial({ color: colors.accent }),
      glass: glassMaterial(colors.paper),
      outline: outlineMaterial(colors.paper),
      line,
      lineSoft,
    }
  }, [colors])

  // Construit les pièces (maillage + arêtes + silhouette)
  const built = useMemo(() => {
    mats.glass.uniforms.uAccent.value.set(colors.accent)
    return model.parts.map((part) => {
      const g = new THREE.Group()
      const mesh = new THREE.Mesh(part.geo, mats[part.mat])
      g.add(mesh)
      if (part.mat !== 'glass') {
        if (part.mat !== 'accent') g.add(new THREE.LineSegments(new THREE.EdgesGeometry(part.geo, 32), mats.line))
        if (modelId !== 'couches') g.add(new THREE.Mesh(part.geo, mats.outline))
      }
      if (part.meridians || part.mat === 'glass') {
        const m = meridianLines(part.geo, part.mat === 'glass' ? mats.lineSoft : mats.line)
        if (m) g.add(m)
      }
      g.position.set(...part.pos)
      return { group: g, part, anchor: new THREE.Vector3(...part.anchor) }
    })
  }, [model, mats, modelId, colors.accent])

  useEffect(() => {
    parts.current = built
    return () => {
      built.forEach(({ part }) => part.geo.dispose())
    }
  }, [built])

  // Cadrage : tient compte de la vue éclatée et de la place des annotations
  useEffect(() => {
    const box = new THREE.Box3()
    const tmpBox = new THREE.Box3()
    const inner = outer.current.children[0]
    built.forEach(({ group, part }) => {
      group.position.set(part.pos[0] + part.explode[0], part.pos[1] + part.explode[1], part.pos[2] + part.explode[2])
    })
    inner.updateMatrixWorld(true)
    built.forEach(({ group }) => {
      tmpBox.setFromObject(group)
      box.union(tmpBox)
    })
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const aspect = size.width / size.height
    const vfov = THREE.MathUtils.degToRad(camera.fov)
    const k = size.width < 640 ? 0.86 : 0.8
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect * k)
    const fov = Math.min(vfov * 0.9, hfov)
    const dist = (sphere.radius / Math.sin(fov / 2)) * 0.8
    const dir = new THREE.Vector3(0.35, 0.32, 1).normalize()
    camera.position.copy(sphere.center).addScaledVector(dir, dist)
    camera.lookAt(sphere.center)
    camera.near = dist / 20
    camera.far = dist * 4
    camera.updateProjectionMatrix()
    if (overlay.current) overlay.current.measure?.()
  }, [built, size, camera, overlay])

  useFrame((state) => {
    const p = clamp01(progress.get() * 1.25)
    const t = state.clock.elapsedTime
    const list = parts.current
    const n = list.length
    const stagger = 0.07
    let assembled = 1
    list.forEach(({ group, part }, i) => {
      const local = ease(clamp01((p - i * stagger * 0.5) / (1 - (n - 1) * stagger * 0.5)))
      const e = 1 - local
      assembled = Math.min(assembled, local)
      group.position.set(part.pos[0] + part.explode[0] * e, part.pos[1] + part.explode[1] * e, part.pos[2] + part.explode[2] * e)
      group.rotation.set(part.rot[0] * e, part.rot[1] * e, part.rot[2] * e)
    })
    if (outer.current) {
      outer.current.rotation.y = Math.sin(t * model.spin * 2.2) * 0.35 + p * 0.6
    }
    mats.glass.uniforms.uGlow.value = assembled > 0.98 ? 0.6 + Math.sin(t * 3) * 0.05 : assembled * 0.15

    // Annotations HTML : projection des ancres à l'écran
    const ov = overlay.current
    if (ov && ov.items.length) {
      const w = size.width
      const h = size.height
      const placed = []
      list.forEach(({ group, part, anchor }) => {
        const item = ov.items.find((it) => it.key === part.key)
        if (!item) return
        tmp.copy(anchor).applyMatrix4(group.matrixWorld).project(camera)
        const x = (tmp.x * 0.5 + 0.5) * w
        const y = (-tmp.y * 0.5 + 0.5) * h
        placed.push({ item, x, y, side: x < w * 0.5 ? 'L' : 'R' })
      })
      for (const side of ['L', 'R']) {
        const arr = placed.filter((pl) => pl.side === side).sort((a, b) => a.y - b.y)
        const gap = 34
        let prev = -Infinity
        arr.forEach((pl) => {
          pl.ly = Math.max(pl.y, prev + gap, 22)
          prev = pl.ly
        })
        let next = Infinity
        for (let i = arr.length - 1; i >= 0; i--) {
          arr[i].ly = Math.min(arr[i].ly, next - gap, h - 46)
          next = arr[i].ly
        }
      }
      placed.forEach(({ item, x, y, side, ly }) => {
        const lw = item.width || 110
        const lx = side === 'L' ? 6 : w - 6 - lw
        const edge = side === 'L' ? 6 + lw + 4 : w - 6 - lw - 4
        const elbow = side === 'L' ? edge + 12 : edge - 12
        item.label.style.transform = `translate3d(${lx}px, ${ly - 9}px, 0)`
        item.line.setAttribute('points', `${edge},${ly} ${elbow},${ly} ${x},${y}`)
        item.dot.setAttribute('cx', x)
        item.dot.setAttribute('cy', y)
      })
    }

    if (!ready.current) {
      ready.current = true
      requestAnimationFrame(() => onReady?.())
    }
  })

  return (
    <group ref={outer}>
      <group rotation={model.tilt} position={[-model.center[0], -model.center[1], -model.center[2]]}>
        {built.map(({ group, part }) => (
          <primitive key={part.key} object={group} />
        ))}
      </group>
    </group>
  )
}

// Objets constants : r3f réapplique les props caméra si l'objet change à chaque rendu
const CAMERA = { fov: 30, position: [0, 0, 8] }
const GL_ALPHA = { antialias: true, alpha: true, powerPreference: 'low-power' }
const GL_OPAQUE = { ...GL_ALPHA, alpha: false }

export default function Scene({ modelId, progress, overlay, colors, onReady, active, transparent = true }) {
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      camera={CAMERA}
      gl={transparent ? GL_ALPHA : GL_OPAQUE}
      aria-hidden="true"
    >
      <hemisphereLight args={[colors.paper, '#000000', 1.6]} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <Rig modelId={modelId} progress={progress} overlay={overlay} colors={colors} onReady={onReady} />
    </Canvas>
  )
}
