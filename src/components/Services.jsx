import { useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useConfig } from '../lib/config.jsx'
import { useDevis } from '../lib/devis.jsx'
import SectionHead from './SectionHead.jsx'

export default function Services() {
  const { config, t } = useConfig()
  const s = config.services
  const { choisir } = useDevis()
  const [open, setOpen] = useState(0)

  return (
    <section id="services" aria-labelledby="titre-services" className="grid-light pb-16 text-ink md:pb-28">
      <SectionHead id="titre-services" numero={s.numero} titre={s.titre} sousTitre={s.sousTitre} feuille={s.feuille} />

      <div className="mt-10 px-4 md:px-8">
        <div className="mono-label grid grid-cols-[2.25rem_1fr_auto] gap-x-3 border-b border-ink pb-1.5 text-[10px] text-ink/55 md:grid-cols-[4rem_1fr_10rem_8rem]">
          <span>N°</span>
          <span>{s.titre}</span>
          <span className="text-right md:text-left">{s.colonnePrix}</span>
          <span className="hidden md:block">{s.colonneDelai}</span>
        </div>

        <ol>
          {s.liste.map((item, i) => {
            const isOpen = open === i
            const num = String(i + 1).padStart(2, '0')
            return (
              <li key={item.id} className="border-b border-ink/25">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`service-${item.id}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-4 text-left md:grid-cols-[4rem_1fr_10rem_8rem] md:py-6"
                  >
                    <span className={`font-mono text-[13px] tabular transition-colors ${isOpen ? 'text-ink' : 'text-ink/45'}`}>
                      {isOpen ? <span className="bg-accent px-1">{num}</span> : num}
                    </span>
                    <span>
                      <span className="block text-[19px] font-bold leading-tight [font-stretch:92%] md:text-[28px]">{item.titre}</span>
                      <span className="mt-1 block font-mono text-[12px] leading-snug text-ink/60">{item.resume}</span>
                    </span>
                    <span className="flex items-center gap-2 whitespace-nowrap font-mono text-[12.5px] tabular md:justify-between">
                      {item.prix}
                      <span
                        aria-hidden="true"
                        className={`grid h-5 w-5 place-items-center border border-ink text-[13px] leading-none transition-transform md:hidden ${isOpen ? 'rotate-45 bg-ink text-paper' : ''}`}
                      >
                        +
                      </span>
                    </span>
                    <span className="hidden items-center justify-between font-mono text-[12.5px] md:flex">
                      {item.delai}
                      <span aria-hidden="true" className={`grid h-6 w-6 place-items-center border border-ink transition-transform ${isOpen ? 'rotate-45 bg-ink text-paper' : ''}`}>+</span>
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      id={`service-${item.id}`}
                      key="c"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-5 pb-6 pl-[3rem] md:grid-cols-[1fr_18rem] md:pl-[4.75rem]">
                        <div>
                          <p className="text-[15px] leading-relaxed text-ink/85">{t(item.detail)}</p>
                          <p className="mono-label mt-4 text-[10px] text-ink/55 md:hidden">
                            {s.colonneDelai} : <span className="text-ink">{item.delai}</span>
                          </p>
                        </div>
                        <div>
                          <p className="mono-label text-[10px] text-ink/55">{s.libelleInclus}</p>
                          <ul className="mt-2 space-y-1.5">
                            {item.inclus.map((x) => (
                              <li key={x} className="flex items-start gap-2 font-mono text-[12.5px]">
                                <span aria-hidden="true" className="mt-[5px] h-2 w-2 shrink-0 bg-accent outline outline-1 outline-ink" />
                                {x}
                              </li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            onClick={() => choisir(item.id)}
                            className="mono-label mt-5 flex w-full items-center justify-between bg-ink px-4 py-3 text-[11px] text-paper transition-colors hover:bg-accent hover:text-on-accent"
                          >
                            {s.ctaService}
                            <span aria-hidden="true" className="text-accent">→</span>
                          </button>
                        </div>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
