import { m } from 'framer-motion'
import { useConfig } from '../lib/config.jsx'

/** En-tête de section façon cartouche de feuille de plan */
export default function SectionHead({ numero, titre, sousTitre, feuille, id, tone = 'light' }) {
  const { t } = useConfig()
  const line = tone === 'light' ? 'border-ink/80' : 'border-paper/30'
  const muted = tone === 'light' ? 'text-ink/60' : 'text-paper/60'
  return (
    <header className="px-4 pt-14 md:px-8 md:pt-24">
      <div className={`mono-label flex items-center gap-3 border-t ${line} pt-2 text-[10.5px] ${muted}`}>
        <span className="bg-accent px-1.5 text-on-accent">§ {numero}</span>
        <span className="flex-1 truncate">{titre}</span>
        <span>{feuille}</span>
      </div>
      <m.h2
        id={id}
        className="display mt-5 hyphens-auto break-words text-[clamp(2.2rem,11vw,6.5rem)] uppercase"
        initial={{ y: 24 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {t(titre)}
      </m.h2>
      {sousTitre && <p className={`mt-3 max-w-xl font-mono text-[13px] leading-relaxed ${muted}`}>{t(sousTitre)}</p>}
    </header>
  )
}
