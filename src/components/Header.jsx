import { useConfig } from '../lib/config.jsx'

export default function Header() {
  const { config } = useConfig()
  const { entreprise: e, navigation: nav } = config
  const links = [
    ['#services', nav.services],
    ['#realisations', nav.realisations],
    ['#zone', nav.zone],
    ['#avis', nav.avis],
    ['#devis', nav.devis],
  ]
  return (
    <header className="relative z-10 flex h-12 shrink-0 items-center justify-between px-4 md:h-16 md:px-8">
      <a href="#haut" className="flex items-center gap-2.5">
        <span className="display grid h-7 w-7 place-items-center bg-accent text-[12px] text-on-accent md:h-9 md:w-9 md:text-[15px]" aria-hidden="true">
          {e.initiales}
        </span>
        <span className="mono-label text-[11px] text-paper/80">{e.nom}</span>
      </a>
      <nav className="hidden md:block" aria-label={nav.libelle}>
        <ul className="mono-label flex gap-6 text-[11px] text-paper/70">
          {links.map(([href, label]) => (
            <li key={href}>
              <a className="hover:text-accent" href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <a href={`tel:${e.telephone}`} className="mono-label tabular text-[11px] text-accent md:text-[12px]">
        {e.telephoneAffiche}
      </a>
    </header>
  )
}
