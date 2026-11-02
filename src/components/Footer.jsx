import { useConfig } from '../lib/config.jsx'

export default function Footer() {
  const { config, t, loadPreset, presetId } = useConfig()
  const { entreprise: e, pied: p, assurance: a, demo } = config
  const rows = [
    [p.libelleRaisonSociale, `${e.nom} — ${e.gerant} (${e.formeJuridique})`],
    [p.libelleSiret, e.siret],
    [p.libelleTva, e.tva],
    [p.libelleApe, e.codeApe],
    [p.libelleAssurance, `${a.assureur} — ${p.libellePolice} ${a.police} — ${a.couverture}`],
    [p.libelleAdresse, `${e.adresse}, ${e.codePostal} ${e.ville}`],
    [p.libelleHoraires, [...config.horaires.map((h) => `${h.libelle} ${h.ouverture.replace(':', 'h')}–${h.fermeture.replace(':', 'h')}`), config.horairesUrgence].join(' · ')],
  ]
  const currentPreset = presetId || demo?.presets?.find((x) => x.label === e.metier)?.id

  return (
    <footer className="grid-dark border-t-2 border-accent pb-6 text-paper">
      <div className="px-4 pt-12 md:px-8">
        <p className="display text-[clamp(2.4rem,13vw,7rem)] uppercase leading-[0.85]">{e.nom}</p>
        <p className="mt-2 font-mono text-[13px] text-paper/70">{e.slogan}</p>

        <div className="mt-8 grid grid-cols-2 border-y border-paper/25">
          <a href={`tel:${e.telephone}`} className="border-r border-paper/25 py-4 pr-3">
            <span className="mono-label block text-[10px] text-paper/50">{p.libelleContact}</span>
            <span className="mt-1 block font-mono text-[14px] tabular text-accent">{e.telephoneAffiche}</span>
          </a>
          <a href={`mailto:${e.email}`} className="truncate py-4 pl-3">
            <span className="mono-label block text-[10px] text-paper/50">{p.libelleEmail}</span>
            <span className="mt-1 block truncate font-mono text-[13px]">{e.email}</span>
          </a>
        </div>

        <h2 className="mono-label mt-10 text-[11px] text-paper/50">{p.titreMentions}</h2>
        <dl className="mt-2 border-t border-paper/25 font-mono text-[12px]">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3 border-b border-paper/15 py-2 md:grid-cols-[12rem_1fr]">
              <dt className="mono-label pt-px text-[9.5px] text-paper/45">{k}</dt>
              <dd className="text-paper/85">{v}</dd>
            </div>
          ))}
        </dl>

        {demo?.afficherSelecteur && (
          <div className="mt-10 border border-dashed border-paper/30 p-3">
            <p className="mono-label text-[10px] text-paper/50">{demo.libelle}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {demo.presets.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => loadPreset(x.id)}
                  aria-pressed={currentPreset === x.id}
                  className={`mono-label border px-2.5 py-1.5 text-[10.5px] ${currentPreset === x.id ? 'border-accent bg-accent text-on-accent' : 'border-paper/40 text-paper/80'}`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-2 border-t border-paper/25 pt-4 font-mono text-[11.5px] text-paper/60 md:flex-row md:justify-between">
          <p>{t(p.copyright)}</p>
          <p>
            {p.mentionDemo}{' '}
            <a href={p.agenceUrl} target="_blank" rel="noopener" className="text-paper underline decoration-accent decoration-2 underline-offset-4">
              {p.agence}
            </a>{' '}
            — <a href={p.agenceUrl} target="_blank" rel="noopener" className="text-accent">{p.agenceLibelleUrl}</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
