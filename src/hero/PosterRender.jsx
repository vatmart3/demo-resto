import { useEffect, useMemo } from 'react'
import Scene from './Scene.jsx'
import config from '../config.json'

const presets = import.meta.glob('../../presets/*.json', { eager: true, import: 'default' })

/** Rendu statique (vue éclatée) servant d'affiche avant chargement de la 3D. Dev uniquement. */
export default function PosterRender() {
  const params = new URLSearchParams(location.search)
  const modelId = params.get('modele') || config.hero.modele3d
  // Couleurs du preset qui utilise ce modèle (sinon config courante)
  const theme = (Object.values(presets).find((p) => p.hero.modele3d === modelId) || config).theme
  const progress = useMemo(() => ({ get: () => Number(params.get('p') || 0) }), [])
  const overlay = useMemo(() => ({ current: { items: [] } }), [])
  const colors = useMemo(() => ({ paper: theme.papier, accent: theme.accent }), [theme])
  useEffect(() => {
    document.body.style.background = 'transparent'
    document.body.style.padding = '0'
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Scene modelId={modelId} progress={progress} overlay={overlay} colors={colors} active onReady={() => setTimeout(() => (window.__posterReady = true), 300)} />
    </div>
  )
}
