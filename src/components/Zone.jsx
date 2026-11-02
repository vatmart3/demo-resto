import { useMemo, useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'
import { useConfig } from '../lib/config.jsx'
import { CARTES } from '../data/cartes.js'
import { distanceKm, projector, dms } from '../lib/geo.js'
import SectionHead from './SectionHead.jsx'

const toPath = (pts, close = true) => 'M' + pts.map((p) => p.map((v) => v.toFixed(2)).join(' ')).join('L') + (close ? 'Z' : '')

export default function Zone() {
  const { config, t } = useConfig()
  const z = config.zone
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20%' })
  const reduced = useReducedMotion()
  const lit = inView || reduced

  const data = useMemo(() => {
    const base = z.villes.find((v) => v.base) || z.villes[0]
    const proj = projector(base)
    const villes = z.villes.map((v) => {
      const [x, y] = proj([v.longitude, v.latitude])
      const km = distanceKm(base, v)
      const min = Math.max(5, Math.round(((km * 1.3) / z.vitesseMoyenneKmh) * 60 / 5) * 5)
      return { ...v, x, y, km, min }
    })
    const xs = villes.map((v) => v.x)
    const ys = villes.map((v) => v.y)
    let minX = Math.min(...xs) - 3
    let maxX = Math.max(...xs) + 3
    let minY = Math.min(...ys) - 4
    let maxY = Math.max(...ys) + 4
    // place pour les étiquettes à droite / à gauche
    villes.forEach((v) => {
      const len = v.nom.length * 1.25
      if ((v.etiquette || 'droite') === 'droite') maxX = Math.max(maxX, v.x + len + 2)
      if (v.etiquette === 'gauche') minX = Math.min(minX, v.x - len - 2)
    })
    // ratio 4:3 minimum
    const w = maxX - minX
    const h = maxY - minY
    if (h < w * 0.75) {
      const add = (w * 0.75 - h) / 2
      minY -= add
      maxY += add
    }
    const carte = CARTES[z.fondDeCarte]
    const geo = carte && {
      etangs: carte.etangs.map((poly) => toPath(poly.map(proj))),
      cote: toPath(carte.cote.map(proj), false),
      mer: toPath([...carte.cote, ...carte.merCoins].map(proj)),
      etangLabel: (() => {
        const c = carte.etangs[0].map(proj)
        const cx = c.reduce((s, p) => s + p[0], 0) / c.length
        const cy = c.reduce((s, p) => s + p[1], 0) / c.length
        return [cx, cy]
      })(),
    }
    const maxKm = Math.max(...villes.map((v) => v.km))
    const rings = []
    for (let r = 5; r <= Math.ceil(maxKm / 5) * 5; r += 5) rings.push(r)
    const inv = (x, y) => ({ lon: base.longitude + x / (111.32 * Math.cos((base.latitude * Math.PI) / 180)), lat: base.latitude - y / 110.57 })
    return {
      base,
      villes,
      vb: [minX, minY, maxX - minX, maxY - minY],
      geo,
      rings,
      corners: { nw: inv(minX, minY), se: inv(maxX, maxY) },
    }
  }, [z])

  const [vx, vy, vw, vh] = data.vb
  const u = vw / 100 // unité relative pour les épaisseurs
  const others = data.villes.filter((v) => !v.base)

  return (
    <section id="zone" aria-labelledby="titre-zone" className="grid-light pb-16 text-ink md:pb-28">
      <SectionHead id="titre-zone" numero={z.numero} titre={z.titre} sousTitre={z.sousTitre} feuille={z.feuille} />

      <div className="mt-8 px-4 md:mt-12 md:grid md:grid-cols-[1.4fr_1fr] md:gap-10 md:px-8" ref={ref}>
        <figure className="relative overflow-hidden border border-ink bg-paper">
          <div className="mono-label flex justify-between border-b border-ink px-2 py-1 text-[9px] text-ink/60">
            <span>{dms(data.corners.nw.lat, 'N', 'S')} · {dms(data.corners.nw.lon, 'E', 'O')}</span>
            <span>{dms(data.corners.se.lat, 'N', 'S')} · {dms(data.corners.se.lon, 'E', 'O')}</span>
          </div>
          <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="block h-auto w-full" role="img" aria-label={`${z.titre} : ${z.villes.map((v) => v.nom).join(', ')}`}>
            <defs>
              <pattern id="hachures-mer" width={u * 1.6} height={u * 1.6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2={u * 1.6} stroke="currentColor" strokeWidth={u * 0.12} className="text-ink/35" />
              </pattern>
              <pattern id="hachures-etang" width={u * 1.1} height={u * 1.1} patternUnits="userSpaceOnUse">
                <line x1="0" y1={u * 0.55} x2={u * 1.1} y2={u * 0.55} stroke="currentColor" strokeWidth={u * 0.1} className="text-ink/30" />
              </pattern>
            </defs>

            {data.geo && (
              <g>
                <path d={data.geo.mer} fill="url(#hachures-mer)" />
                {data.geo.etangs.map((d, i) => (
                  <path key={i} d={d} fill="url(#hachures-etang)" stroke="currentColor" strokeWidth={u * 0.25} className="text-ink" />
                ))}
                <path d={data.geo.cote} fill="none" stroke="currentColor" strokeWidth={u * 0.3} className="text-ink" />
                <text x={data.geo.etangLabel[0]} y={data.geo.etangLabel[1]} fontSize={u * 2.3} textAnchor="middle" className="fill-ink/70 font-mono italic" transform={`rotate(-28 ${data.geo.etangLabel[0]} ${data.geo.etangLabel[1]})`}>
                  {z.libelleEtang}
                </text>
                <text x={vx + vw * 0.72} y={vy + vh * 0.9} fontSize={u * 2.3} textAnchor="middle" className="fill-ink/70 font-mono italic">
                  {z.libelleMer}
                </text>
              </g>
            )}

            {/* Cercles de distance */}
            {data.rings.map((r) => (
              <g key={r}>
                <circle cx="0" cy="0" r={r} fill="none" stroke="currentColor" strokeWidth={u * 0.15} strokeDasharray={`${u * 0.8} ${u * 0.6}`} className="text-ink/45" />
                <text x={r * 0.26} y={-r * 0.97} fontSize={u * 1.6} className="fill-ink/60 font-mono">
                  {r} {z.libelleDistance}
                </text>
              </g>
            ))}

            {/* Trajets */}
            {others.map((v, i) => (
              <m.line
                key={v.nom}
                x1="0"
                y1="0"
                x2={v.x}
                y2={v.y}
                stroke="currentColor"
                strokeWidth={u * 0.3}
                className="text-ink"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: lit ? 1 : 0 }}
                transition={{ duration: 0.5, delay: reduced ? 0 : 0.3 + i * 0.35, ease: 'easeOut' }}
              />
            ))}

            {/* Villes */}
            {data.villes.map((v, i) => {
              const delay = reduced ? 0 : v.base ? 0 : 0.7 + (others.indexOf(v)) * 0.35
              const s = u * (v.base ? 2.2 : 1.7)
              const pos = v.etiquette || 'droite'
              const fs = u * (v.base ? 3.4 : 2.7)
              const lx = pos === 'droite' ? s * 1.1 : pos === 'gauche' ? -s * 1.1 : 0
              const ly = pos === 'haut' ? -s * 1.2 - u * 2.6 : pos === 'bas' ? s * 1.2 + fs : -s * 0.2
              const anchor = pos === 'droite' ? 'start' : pos === 'gauche' ? 'end' : 'middle'
              return (
                <g key={v.nom} transform={`translate(${v.x} ${v.y})`}>
                  {v.base && <circle r={s} className="pulse-ring fill-accent/70" />}
                  <m.rect
                    x={-s / 2}
                    y={-s / 2}
                    width={s}
                    height={s}
                    stroke="currentColor"
                    strokeWidth={u * 0.3}
                    className="text-ink"
                    initial={{ fill: 'var(--c-papier)' }}
                    animate={{ fill: lit ? 'var(--c-accent)' : 'var(--c-papier)' }}
                    transition={{ duration: 0.3, delay }}
                  />
                  <m.g initial={{ opacity: 0.35 }} animate={{ opacity: lit ? 1 : 0.35 }} transition={{ duration: 0.3, delay }}>
                    <text x={lx} y={ly} fontSize={fs} textAnchor={anchor} className="fill-ink font-sans font-bold" paintOrder="stroke" stroke="var(--c-papier)" strokeWidth={u * 0.6} style={{ fontStretch: '90%' }}>
                      {v.nom}
                    </text>
                    <text x={lx} y={ly + u * 2.4} fontSize={u * 1.9} textAnchor={anchor} className="fill-ink/60 font-mono" paintOrder="stroke" stroke="var(--c-papier)" strokeWidth={u * 0.5}>
                      {v.base ? z.libelleBase : `${v.km.toFixed(1).replace('.', ',')} ${z.libelleDistance}`}
                    </text>
                  </m.g>
                </g>
              )
            })}

            {/* Nord + échelle */}
            <g transform={`translate(${vx + vw - u * 5} ${vy + u * 6})`}>
              <path d={`M0 ${-u * 3} L${u * 1.4} ${u * 1.5} L0 ${u * 0.6} L${-u * 1.4} ${u * 1.5}Z`} className="fill-ink" />
              <text y={u * 4.6} fontSize={u * 2} textAnchor="middle" className="fill-ink font-mono">N</text>
            </g>
            <g transform={`translate(${vx + u * 3} ${vy + vh - u * 4})`}>
              <rect width="5" height={u * 0.8} className="fill-ink" />
              <text y={-u * 1} fontSize={u * 1.8} className="fill-ink font-mono">0 — 5 {z.libelleDistance}</text>
            </g>
          </svg>
        </figure>

        <div className="mt-6 md:mt-0">
          <table className="w-full font-mono text-[13px]">
            <caption className="sr-only">{z.titre}</caption>
            <thead>
              <tr className="mono-label border-b border-ink text-left text-[10px] text-ink/55">
                <th scope="col" className="py-1.5 font-normal">#</th>
                <th scope="col" className="py-1.5 font-normal">{z.titre}</th>
                <th scope="col" className="py-1.5 text-right font-normal">{z.libelleDistance}</th>
                <th scope="col" className="py-1.5 text-right font-normal">{z.libelleTrajet}</th>
              </tr>
            </thead>
            <tbody>
              {data.villes.map((v, i) => (
                <tr key={v.nom} className="border-b border-ink/25">
                  <td className="py-2.5 pr-2 tabular text-ink/60">
                    <m.span
                      aria-hidden="true"
                      className="mr-1.5 inline-block h-2 w-2 border border-ink align-middle"
                      initial={{ backgroundColor: 'var(--c-papier)' }}
                      animate={{ backgroundColor: lit ? 'var(--c-accent)' : 'var(--c-papier)' }}
                      transition={{ delay: reduced ? 0 : v.base ? 0 : 0.7 + others.indexOf(v) * 0.35 }}
                    />
                    {String(i + 1).padStart(2, '0')}
                  </td>
                  <th scope="row" className="py-2.5 text-left font-sans text-[16px] font-semibold [font-stretch:92%]">
                    {v.nom}
                    {v.base && <span className="mono-label ml-2 bg-accent px-1 text-[9px] text-on-accent">{z.libelleBase}</span>}
                  </th>
                  <td className="py-2.5 text-right tabular">{v.base ? '0' : v.km.toFixed(1).replace('.', ',')}</td>
                  <td className="py-2.5 text-right tabular">{v.base ? '—' : `~${v.min}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 font-mono text-[12px] leading-relaxed text-ink/60">{t(z.noteHorsZone)}</p>
        </div>
      </div>
    </section>
  )
}
