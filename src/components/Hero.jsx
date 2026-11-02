import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { m, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { useConfig, formatNote } from '../lib/config.jsx'
import Header from './Header.jsx'

const Scene = lazy(() => import('../hero/Scene.jsx'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

/* Règle graduée façon cadre de plan */
function Ruler({ vertical = false }) {
  const ticks = Array.from({ length: 41 }, (_, i) => i)
  return (
    <svg
      aria-hidden="true"
      className={vertical ? 'absolute left-0 top-0 h-full w-3' : 'absolute left-0 top-0 h-3 w-full'}
      preserveAspectRatio="none"
      viewBox={vertical ? '0 0 12 400' : '0 0 400 12'}
    >
      {ticks.map((i) =>
        vertical ? (
          <line key={i} x1="0" x2={i % 5 === 0 ? 10 : 5} y1={i * 10} y2={i * 10} stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        ) : (
          <line key={i} y1="0" y2={i % 5 === 0 ? 10 : 5} x1={i * 10} x2={i * 10} stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        ),
      )}
    </svg>
  )
}

function Stars({ value }) {
  return (
    <span className="inline-flex gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i))
        return (
          <span key={i} className="relative block h-2.5 w-2.5 border border-accent">
            <span className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${fill * 100}%` }} />
          </span>
        )
      })}
    </span>
  )
}

export default function Hero() {
  const { config, t, tokens } = useConfig()
  const { entreprise: e, hero, preuves } = config
  const reduced = useReducedMotion()
  const section = useRef(null)
  const stage = useRef(null)
  const overlay = useRef({ items: [] })
  const pctRef = useRef(null)
  const stateRef = useRef(null)
  const [load3d, setLoad3d] = useState(false)
  const [ready3d, setReady3d] = useState(false)
  const [active, setActive] = useState(true)
  const [colors, setColors] = useState(null)

  const annotations = useMemo(() => Object.entries(hero.annotations || {}), [hero.annotations])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const pct = Math.round(Math.min(1, v * 1.25) * 100)
    if (pctRef.current) pctRef.current.textContent = String(pct).padStart(3, '0')
    if (stateRef.current) stateRef.current.textContent = pct >= 100 ? hero.etatAssemble : hero.etatEclate
  })

  // Charge la 3D après le premier geste (ou au repos) — ne pénalise pas le premier affichage
  useEffect(() => {
    if (reduced || !hasWebGL()) return
    let done = false
    const go = () => {
      if (done) return
      done = true
      setColors({ paper: cssVar('--c-papier') || '#f1eee7', accent: cssVar('--c-accent') || '#f6c400' })
      setLoad3d(true)
      cleanup()
    }
    const evts = ['scroll', 'touchstart', 'pointerdown', 'keydown', 'wheel', 'mousemove']
    evts.forEach((ev) => window.addEventListener(ev, go, { passive: true, once: true }))
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(go, { timeout: 2000 })
      else go()
    }, 3500)
    function cleanup() {
      evts.forEach((ev) => window.removeEventListener(ev, go))
      clearTimeout(timer)
    }
    return cleanup
  }, [reduced])

  // Couleurs à jour si le preset change
  useEffect(() => {
    if (load3d) setColors({ paper: cssVar('--c-papier'), accent: cssVar('--c-accent') })
  }, [config.theme, load3d])

  // Pause du rendu quand le hero sort de l'écran
  useEffect(() => {
    const el = section.current
    if (!el) return
    const io = new IntersectionObserver(([en]) => setActive(en.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Mesure des étiquettes pour le tracé des lignes de rappel
  useEffect(() => {
    overlay.current.measure = () => {
      overlay.current.items.forEach((it) => {
        it.width = it.label.offsetWidth
      })
    }
    overlay.current.measure()
  }, [annotations, ready3d])

  const registerItem = (key, part) => (el) => {
    if (!el) return
    let item = overlay.current.items.find((it) => it.key === key)
    if (!item) {
      item = { key }
      overlay.current.items.push(item)
    }
    item[part] = el
  }

  useEffect(() => {
    overlay.current.items = overlay.current.items.filter((it) => annotations.some(([k]) => k === it.key))
  }, [annotations])

  return (
    <section
      ref={section}
      id="haut"
      aria-labelledby="titre-principal"
      className="relative grid-dark h-[200svh] text-paper motion-reduce:h-auto"
    >
      <div className="sticky top-0 flex h-[calc(100svh-var(--bar-h))] min-h-[560px] flex-col md:h-svh md:min-h-[640px]">
        <Header />

        <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
          {/* --- Zone 3D --- */}
          <div ref={stage} className="relative min-h-0 flex-1 overflow-hidden border-y border-paper/15 md:border-r md:border-y-0">
            <div className="text-paper/40">
              <Ruler />
              <Ruler vertical />
            </div>
            {/* repères d'angle */}
            <span aria-hidden="true" className="absolute right-2 top-2 h-3 w-3 border-r border-t border-paper/50" />
            <span aria-hidden="true" className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-paper/50" />

            <img
              src={hero.poster}
              alt=""
              aria-hidden="true"
              width="1200"
              height="900"
              fetchPriority="high"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ${ready3d ? 'opacity-0' : 'opacity-100'}`}
            />

            {load3d && colors && (
              <Suspense fallback={null}>
                <div className={`absolute inset-0 transition-opacity duration-700 ${ready3d ? 'opacity-100' : 'opacity-0'}`}>
                  <Scene
                    modelId={hero.modele3d}
                    progress={scrollYProgress}
                    overlay={overlay}
                    colors={colors}
                    active={active}
                    onReady={() => setReady3d(true)}
                  />
                </div>
              </Suspense>
            )}

            {/* Annotations façon plan coté */}
            <div
              className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${ready3d ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden="true"
            >
              <svg className="absolute inset-0 h-full w-full overflow-visible">
                {annotations.map(([key]) => (
                  <g key={key}>
                    <polyline ref={registerItem(key, 'line')} fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" className="text-paper" />
                    <circle ref={registerItem(key, 'dot')} r="3" fill="var(--c-graphite)" stroke="var(--c-accent)" strokeWidth="1.5" />
                  </g>
                ))}
              </svg>
              {annotations.map(([key, label], i) => (
                <div
                  key={key}
                  ref={registerItem(key, 'label')}
                  className="absolute left-0 top-0 flex max-w-[38%] items-start gap-1.5 will-change-transform"
                  style={{ transform: 'translate3d(-999px,-999px,0)' }}
                >
                  <span className="mono-label shrink-0 bg-accent px-1 text-[9px] text-on-accent">{String(i + 1).padStart(2, '0')}</span>
                  <span className="mono-label text-[9.5px] leading-tight text-paper/85 normal-case tracking-normal">{t(label)}</span>
                </div>
              ))}
            </div>

            {/* Légende statique si pas d'animation */}
            {annotations.length > 0 && (
              <ol className="absolute bottom-3 left-4 right-4 hidden grid-cols-2 gap-x-3 gap-y-1 motion-reduce:grid">
                {annotations.map(([key, label], i) => (
                  <li key={key} className="mono-label flex gap-1.5 text-[9.5px] normal-case tracking-normal text-paper/80">
                    <span className="bg-accent px-1 text-on-accent">{String(i + 1).padStart(2, '0')}</span>
                    {t(label)}
                  </li>
                ))}
              </ol>
            )}

            {annotations.length > 0 && (
              <div className="mono-label absolute bottom-3 left-4 flex items-center gap-2 text-[10px] text-paper/70 motion-reduce:hidden" aria-hidden="true">
                <span className="tabular text-accent">
                  <span ref={pctRef}>000</span>%
                </span>
                <span ref={stateRef}>{hero.etatEclate}</span>
                <span className="text-paper/40">— {hero.indicationScroll} ↓</span>
              </div>
            )}
          </div>

          {/* --- Cartouche (bloc-titre du plan) --- */}
          <div className="@container relative shrink-0 bg-ink md:flex md:w-[44%] md:max-w-[620px] md:flex-col md:justify-end md:bg-transparent">
            <div className="hidden px-8 pb-10 md:block">
              <p className="mono-label text-[11px] text-accent">{e.metier} — {config.horairesUrgence}</p>
              <p className="mt-4 max-w-[16ch] text-[clamp(2rem,3.2vw,3.25rem)] font-bold leading-[1.02] [font-stretch:85%]">{e.slogan}</p>
            </div>
            <div className="mono-label flex border-b border-paper/15 text-[10px] text-paper/60 md:border-t md:bg-ink">
              <span className="flex-1 border-r border-paper/15 px-4 py-1.5">{hero.refPlan}</span>
              <span className="border-r border-paper/15 px-3 py-1.5">{hero.echelle}</span>
              <span className="px-3 py-1.5">{hero.indice}</span>
            </div>

            <div className="px-4 pb-3 pt-2.5 md:px-8 md:pb-8 md:pt-10">
              {/* Cote au-dessus du nom */}
              <div className="mb-1.5 flex items-center gap-2 text-accent" aria-hidden="true">
                <span className="h-3 w-px bg-current" />
                <m.span
                  className="h-px flex-1 origin-left bg-current"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
                />
                <span className="mono-label whitespace-nowrap text-[10px]">{t(hero.cote)}</span>
                <m.span
                  className="h-px flex-1 origin-right bg-current"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }}
                />
                <span className="h-3 w-px bg-current" />
              </div>

              <h1 id="titre-principal" className="leading-none">
                <span className="display block whitespace-nowrap uppercase" style={{ fontSize: `clamp(1.6rem, calc((100cqw - 2rem) / ${(e.nom.length * 0.84).toFixed(2)}), 6rem)` }}>{e.nom}</span>
                <span className="mt-1.5 block text-[clamp(1.05rem,4.6vw,1.6rem)] font-semibold [font-stretch:88%]">
                  {t(hero.titreMetier)}
                  <span className="text-paper/50"> — {e.departement}</span>
                </span>
              </h1>
              <p className="mt-2 hidden max-w-md text-[15px] leading-snug text-paper/70 md:block">{t(hero.accroche)}</p>
            </div>

            <dl className="grid grid-cols-3 border-t border-paper/15">
              <div className="border-r border-paper/15 px-4 py-2.5 md:px-8">
                <dt className="sr-only">{hero.statNote}</dt>
                <dd className="display text-[22px] tabular text-accent md:text-[30px]">{formatNote(preuves.noteGoogle)}</dd>
                <dd className="mt-1 flex items-center gap-1.5">
                  <Stars value={preuves.noteGoogle} />
                </dd>
                <dd className="mono-label mt-1 text-[9.5px] text-paper/55">{t(hero.statAvis)}</dd>
              </div>
              <div className="border-r border-paper/15 px-4 py-2.5 md:px-8">
                <dt className="sr-only">{hero.statChantiers}</dt>
                <dd className="display text-[22px] tabular md:text-[30px]">{tokens.chantiers}</dd>
                <dd className="mono-label mt-[18px] text-[9.5px] text-paper/55">{hero.statChantiers}</dd>
              </div>
              <div className="px-4 py-2.5 md:px-8">
                <dt className="sr-only">{hero.statDelai}</dt>
                <dd className="display text-[22px] tabular md:text-[30px]">{preuves.delaiCourt}</dd>
                <dd className="mono-label mt-[18px] text-[9.5px] text-paper/55">{hero.statDelai}</dd>
              </div>
            </dl>

            {/* CTA desktop (sur mobile : barre collante) */}
            <div className="hidden border-t border-paper/15 md:flex">
              <a
                href={`tel:${e.telephone}`}
                className="group flex flex-1 items-center justify-between bg-accent px-8 py-5 text-on-accent transition-colors hover:bg-paper"
              >
                <span>
                  <span className="mono-label block text-[11px]">{hero.ctaAppeler}</span>
                  <span className="display block text-[28px] tabular">{e.telephoneAffiche}</span>
                </span>
                <span className="text-3xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </a>
            </div>
            <a href="#devis" className="mono-label flex items-center justify-between border-t border-paper/15 px-4 py-2.5 text-[10.5px] text-paper/80 md:px-8 md:py-4">
              <span>{hero.ctaDevis}</span>
              <span aria-hidden="true" className="text-accent">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
