import { THREE } from './kit.js'
import { SCENES, GRADE } from './scenes.js'

const W = 1200
const H = 900
const SS = 2 // suréchantillonnage

window.renderPair = async (id, variant) => {
  const { scene, camera } = SCENES[id](variant)
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setSize(W * SS, H * SS, false)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = variant === 'avant' ? 0.95 : 1.1
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.render(scene, camera)

  const out = document.createElement('canvas')
  out.width = W
  out.height = H
  const g = out.getContext('2d')
  const gr = GRADE[variant]
  g.filter = gr.filter
  g.drawImage(renderer.domElement, 0, 0, W, H)
  g.filter = 'none'
  // vignettage
  const v = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, `rgba(0,0,0,${gr.vignette})`)
  g.fillStyle = v
  g.fillRect(0, 0, W, H)
  // grain argentique
  const img = g.getImageData(0, 0, W, H)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * gr.grain
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  g.putImageData(img, 0, 0)
  renderer.dispose()
  renderer.forceContextLoss()
  return out.toDataURL('image/png')
}
window.__ready = true
