import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import defaultConfig from '../config.json'
import { buildTokens, interpolate, formatNumber, formatNote } from './tokens.js'

export { buildTokens, interpolate, formatNumber, formatNote }

/** Applique la palette du config en variables CSS (aussi injectée au build). */
export function applyTheme(theme) {
  const r = document.documentElement.style
  r.setProperty('--c-graphite', theme.graphite)
  r.setProperty('--c-graphite-2', theme.graphite2)
  r.setProperty('--c-papier', theme.papier)
  r.setProperty('--c-papier-2', theme.papier2)
  r.setProperty('--c-accent', theme.accent)
  r.setProperty('--c-sur-accent', theme.surAccent)
}

const ConfigContext = createContext(null)

const presetLoaders = import.meta.glob('../../presets/*.json', { import: 'default' })

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(defaultConfig)
  const [presetId, setPresetId] = useState(null)

  // Démo commerciale : ?metier=plombier charge un autre preset sans rebuild.
  const loadPreset = useCallback(async (id) => {
    const loader = presetLoaders[`../../presets/${id}.json`]
    if (!loader) return
    const next = await loader()
    setConfig(next)
    setPresetId(id)
    applyTheme(next.theme)
    const t = buildTokens(next)
    document.title = interpolate(next.seo.titre, t)
    const url = new URL(window.location.href)
    url.searchParams.set('metier', id)
    window.history.replaceState(null, '', url)
  }, [])

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('metier')
    if (id) loadPreset(id)
  }, [loadPreset])

  const value = useMemo(() => {
    const tokens = buildTokens(config)
    const t = (s, extra) => interpolate(s, tokens, extra)
    return { config, tokens, t, loadPreset, presetId }
  }, [config, loadPreset, presetId])

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  return useContext(ConfigContext)
}
