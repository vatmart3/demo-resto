import { useConfig } from '../lib/config.jsx'

/** Barre d'action collante mobile : [Appeler] [Devis gratuit] */
export default function StickyBar() {
  const { config } = useConfig()
  const e = config.entreprise
  const b = config.barreMobile
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink bg-ink md:hidden">
      <div className="grid h-[var(--bar-h)] grid-cols-[1.25fr_1fr]">
        <a href={`tel:${e.telephone}`} className="flex flex-col justify-center bg-accent px-4 text-on-accent active:bg-paper">
          <span className="display text-[19px] uppercase leading-none">
            <span aria-hidden="true" className="mr-1.5 inline-block h-2.5 w-2.5 bg-on-accent align-middle" />
            {b.appeler}
          </span>
          <span className="mt-1 font-mono text-[11.5px] tabular">{e.telephoneAffiche}</span>
        </a>
        <a href="#devis" className="flex items-center justify-between gap-2 border-l-2 border-ink px-4 text-paper active:bg-ink-2">
          <span className="text-[15px] font-bold leading-tight [font-stretch:90%]">{b.devis}</span>
          <span aria-hidden="true" className="text-accent">→</span>
        </a>
      </div>
    </div>
  )
}
