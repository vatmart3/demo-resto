import { useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useConfig } from '../lib/config.jsx'
import SectionHead from './SectionHead.jsx'
import BeforeAfter from './BeforeAfter.jsx'

export default function Realisations() {
  const { config } = useConfig()
  const r = config.realisations
  const [idx, setIdx] = useState(0)
  const cur = r.liste[idx] || r.liste[0]

  return (
    <section id="realisations" aria-labelledby="titre-realisations" className="grid-dark pb-16 text-paper md:pb-28">
      <SectionHead id="titre-realisations" tone="dark" numero={r.numero} titre={r.titre} sousTitre={r.sousTitre} feuille={r.feuille} />

      <div className="mt-8 md:mx-8 md:mt-12 md:grid md:grid-cols-[1fr_22rem] md:gap-10">
        <div>
          <div role="tablist" aria-label={r.titre} className="mono-label flex border-y border-paper/20 text-[11px] md:border-x">
            {r.liste.map((item, i) => (
              <button
                key={item.ref}
                role="tab"
                type="button"
                aria-selected={i === idx}
                aria-controls="realisation-panneau"
                onClick={() => setIdx(i)}
                className={`flex-1 border-r border-paper/20 px-2 py-3 last:border-r-0 ${i === idx ? 'bg-accent text-on-accent' : 'text-paper/70'}`}
              >
                {item.ref}
              </button>
            ))}
          </div>

          <div id="realisation-panneau" role="tabpanel" className="relative">
            <AnimatePresence mode="wait" initial={false}>
              <m.div key={cur.ref} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <BeforeAfter
                  avant={cur.avant}
                  apres={cur.apres}
                  labels={{ avant: r.libelleAvant, apres: r.libelleApres, glisser: r.libelleGlisser }}
                />
              </m.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="px-4 pt-5 md:px-0 md:pt-0">
          <p className="mono-label text-[10.5px] text-accent">{cur.ref}</p>
          <h3 className="mt-1 text-[22px] font-bold leading-tight [font-stretch:90%] md:text-[30px]">{cur.titre}</h3>
          <dl className="mt-4 border-t border-paper/20 font-mono text-[12.5px]">
            {[
              [r.libelleLieu, cur.lieu],
              [r.libelleDuree, cur.duree],
              [r.libelleType, cur.type],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[6.5rem_1fr] border-b border-paper/20 py-2">
                <dt className="mono-label text-[10px] leading-[1.9] text-paper/50">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
