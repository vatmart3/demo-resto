import { useConfig } from '../lib/config.jsx'

/** Ruban de chantier : réassurance en défilement */
export default function Bandeau() {
  const { config, t } = useConfig()
  const items = config.bandeau.map((x) => t(x))
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((x, i) => (
        <li key={i} className="mono-label flex items-center whitespace-nowrap px-4 text-[12px] font-medium text-on-accent">
          {x}
          <span className="ml-8 inline-block h-2 w-2 bg-on-accent" aria-hidden="true" />
        </li>
      ))}
    </ul>
  )
  return (
    <div className="relative z-10 border-y-2 border-ink">
      <div className="hazard h-2" aria-hidden="true" />
      <div className="overflow-hidden bg-accent py-2.5">
        <div className="marquee-track flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
      <div className="hazard h-2" aria-hidden="true" />
    </div>
  )
}
