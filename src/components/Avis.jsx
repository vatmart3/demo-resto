import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useConfig, formatNumber, formatNote } from '../lib/config.jsx'
import SectionHead from './SectionHead.jsx'

function Counter({ value }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const reduced = useReducedMotion()
  const target = Number(String(value).replace(/[^\d.,]/g, '').replace(/\s/g, '').replace(',', '.')) || 0

  useEffect(() => {
    if (!inView || reduced) return
    const ctrl = animate(0, target, {
      duration: Math.min(2.2, 0.8 + target / 1500),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => ref.current && (ref.current.textContent = formatNumber(Math.round(v))),
    })
    return () => ctrl.stop()
  }, [inView, reduced, target])

  return (
    <span ref={ref} className="tabular">
      {formatNumber(target)}
    </span>
  )
}

function Etoiles({ note, size = 'h-3 w-3' }) {
  return (
    <span className="inline-flex gap-1" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`relative block ${size} border border-ink`}>
          <span className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${Math.max(0, Math.min(1, note - i)) * 100}%` }} />
        </span>
      ))}
    </span>
  )
}

const moisFr = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' })

export default function Avis() {
  const { config, t } = useConfig()
  const a = config.avis
  const p = config.preuves

  return (
    <section id="avis" aria-labelledby="titre-avis" className="grid-light pb-16 text-ink md:pb-28">
      <SectionHead id="titre-avis" numero={a.numero} titre={a.titre} sousTitre={a.sousTitre} feuille={a.feuille} />

      {/* Note Google */}
      <div className="mt-8 px-4 md:mt-12 md:px-8">
        <div className="grid grid-cols-[auto_1fr] items-end gap-x-4 border-y border-ink py-5">
          <p className="display text-[clamp(5rem,30vw,11rem)] leading-[0.8] tabular">
            {formatNote(p.noteGoogle)}
          </p>
          <div className="pb-1">
            <p className="mono-label text-[10px] text-ink/60">{a.libelleNote}</p>
            <p className="display mt-1 text-[22px]">{a.libelleSur}</p>
            <div className="mt-2">
              <Etoiles note={p.noteGoogle} />
            </div>
            <p className="mt-2 font-mono text-[12px]">
              {p.nombreAvis} {a.libelleAvis}
            </p>
          </div>
        </div>
        <a
          href={p.lienAvisGoogle}
          target="_blank"
          rel="noopener noreferrer"
          className="mono-label flex items-center justify-between border-b border-ink py-3 text-[11px] hover:bg-accent"
        >
          {a.lienGoogle}
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* Compteurs */}
      <dl className="mt-10 grid grid-cols-1 border-t border-ink md:mx-8 md:grid-cols-3 md:border-x">
        {a.compteurs.map((c, i) => (
          <div key={i} className="flex items-end justify-between gap-4 border-b border-ink px-4 py-5 md:block md:border-b-0 md:border-r md:px-8 md:last:border-r-0">
            <dt className="mono-label order-2 max-w-[9rem] text-right text-[10px] text-ink/60 md:mt-3 md:max-w-none md:text-left">{t(c.libelle)}</dt>
            <dd className="display order-1 text-[clamp(3.2rem,17vw,6rem)] leading-[0.85]">
              <Counter value={t(c.valeur)} />
              {c.suffixe && <span className="ml-1 text-[0.4em] [font-stretch:100%]">{t(c.suffixe)}</span>}
            </dd>
          </div>
        ))}
      </dl>

      {/* Tampons de garantie */}
      <ul className="mt-10 flex flex-wrap gap-3 px-4 md:px-8">
        {a.tampons.map((s, i) => (
          <li
            key={s.titre}
            className="border-2 border-ink px-3 py-2 font-mono"
            style={{ transform: `rotate(${[-2, 1.5, -1][i % 3]}deg)` }}
          >
            <span className="mono-label block text-[11px] font-medium">■ {t(s.titre)}</span>
            <span className="block text-[10.5px] text-ink/65">{t(s.detail)}</span>
          </li>
        ))}
      </ul>

      {/* Avis */}
      <ol className="mt-10 border-t border-ink md:mx-8 md:grid md:grid-cols-2 md:border-l">
        {a.liste.map((r, i) => (
          <li key={i} className="border-b border-ink px-4 py-5 md:border-r md:px-8">
            <figure>
              <div className="mono-label flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink/60">
                <span className="tabular text-ink">#{String(i + 1).padStart(3, '0')}</span>
                <Etoiles note={r.note} size="h-2.5 w-2.5" />
                <span>{r.ville}</span>
                <span>{moisFr.format(new Date(`${r.date}-01T12:00:00`))}</span>
              </div>
              <blockquote className="mt-3 text-[16px] leading-snug">“{r.texte}”</blockquote>
              <figcaption className="mt-3 font-mono text-[12px]">— {r.auteur}</figcaption>
            </figure>
          </li>
        ))}
      </ol>
    </section>
  )
}
