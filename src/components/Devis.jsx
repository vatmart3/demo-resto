import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useConfig } from '../lib/config.jsx'
import { useDevis } from '../lib/devis.jsx'
import SectionHead from './SectionHead.jsx'

const lettre = (i) => String.fromCharCode(65 + i)

function Option({ index, label, detail, selected, onClick }) {
  return (
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onClick}
        className={`grid w-full grid-cols-[2rem_1fr_1.25rem] items-center gap-3 border-b border-paper/20 px-1 py-3.5 text-left transition-colors ${
          selected ? 'bg-accent text-on-accent' : 'hover:bg-paper/5'
        }`}
      >
        <span className={`font-mono text-[12px] ${selected ? '' : 'text-paper/50'}`}>{lettre(index)}</span>
        <span>
          <span className="block text-[17px] font-semibold leading-tight [font-stretch:92%]">{label}</span>
          {detail && <span className={`mt-0.5 block font-mono text-[11.5px] ${selected ? 'text-on-accent/75' : 'text-paper/55'}`}>{detail}</span>}
        </span>
        <span aria-hidden="true" className={`h-4 w-4 border ${selected ? 'border-on-accent bg-on-accent' : 'border-paper/60'}`} />
      </button>
  )
}

function Field({ label, error, children, id }) {
  return (
    <div>
      <label htmlFor={id} className="mono-label block text-[10px] text-paper/60">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-1 font-mono text-[11.5px] text-accent" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

const inputCls =
  'mt-1 block w-full rounded-none border-0 border-b border-paper/40 bg-transparent px-0 py-2.5 text-[17px] text-paper placeholder:text-paper/30 focus:border-accent focus:outline-none focus:ring-0'

export default function Devis() {
  const { config, t } = useConfig()
  const d = config.devis
  const e = config.entreprise
  const { preselection } = useDevis()
  const reduced = useReducedMotion()
  const top = useRef(null)

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState({ travaux: null, urgence: null, nom: '', telephone: '', commune: e.ville, message: '', consent: false })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | ok | error

  const travauxOptions = [...config.services.liste.map((s) => ({ id: s.id, label: s.titre })), { id: 'autre', label: d.autreTravaux }]

  useEffect(() => {
    if (!preselection) return
    setData((x) => ({ ...x, travaux: preselection.id }))
    setDir(1)
    setStep(1)
    setStatus('idle')
  }, [preselection])

  const go = (n) => {
    setDir(n > step ? 1 : -1)
    setStep(n)
    // garde le haut du formulaire à l'écran sur mobile
    requestAnimationFrame(() => {
      const r = top.current?.getBoundingClientRect()
      if (r && r.top < 0) top.current.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    })
  }

  const pick = (field, value) => {
    setData((x) => ({ ...x, [field]: value }))
    setTimeout(() => go(field === 'travaux' ? 1 : 2), 220)
  }

  const validate = () => {
    const err = {}
    if (data.nom.trim().length < 2) err.nom = d.erreurNom
    if (data.telephone.replace(/\D/g, '').length < 10) err.telephone = d.erreurTelephone
    if (!data.consent) err.consent = d.erreurConsentement
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const travauxLabel = travauxOptions.find((o) => o.id === data.travaux)?.label || ''
  const urgenceLabel = d.urgences.find((o) => o.id === data.urgence)?.label || ''

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setStatus('sending')
    const subject = t(d.objetEmail, { travaux: travauxLabel, commune: data.commune })
    const lines = [
      `${d.etapes[0]} : ${travauxLabel}`,
      `${d.etapes[1]} : ${urgenceLabel}`,
      `${d.champNom} : ${data.nom}`,
      `${d.champTelephone} : ${data.telephone}`,
      `${d.champCommune} : ${data.commune}`,
      data.message ? `${d.champMessage} : ${data.message}` : '',
    ].filter(Boolean)

    try {
      if (d.envoi === 'formspree' && d.formspreeId) {
        const res = await fetch(`https://formspree.io/f/${d.formspreeId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            _subject: subject,
            travaux: travauxLabel,
            urgence: urgenceLabel,
            nom: data.nom,
            telephone: data.telephone,
            commune: data.commune,
            message: data.message,
          }),
        })
        if (!res.ok) throw new Error('formspree')
      } else {
        const to = t(d.emailDestination)
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
      }
      setStatus('ok')
    } catch {
      setStatus('error')
    }
  }

  const variants = {
    enter: (dd) => ({ x: reduced ? 0 : dd * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dd) => ({ x: reduced ? 0 : dd * -40, opacity: 0 }),
  }

  const progress = status === 'ok' ? 1 : [0.16, 0.5, 0.83][step]

  return (
    <section id="devis" aria-labelledby="titre-devis" className="grid-dark pb-16 text-paper md:pb-28">
      <SectionHead id="titre-devis" tone="dark" numero={d.numero} titre={d.titre} sousTitre={d.sousTitre} feuille={d.feuille} />

      <div ref={top} className="mx-4 mt-8 scroll-mt-4 border border-paper/30 bg-ink md:mx-auto md:mt-12 md:max-w-2xl">
        {/* Barre de progression segmentée */}
        <div className="border-b border-paper/30">
          <ol className="mono-label grid grid-cols-3 text-[10px]">
            {d.etapes.map((label, i) => {
              const done = status === 'ok' || i < step
              const cur = status !== 'ok' && i === step
              return (
                <li key={label} className={`border-r border-paper/30 px-3 py-2 last:border-r-0 ${cur ? 'text-accent' : done ? 'text-paper' : 'text-paper/65'}`} aria-current={cur ? 'step' : undefined}>
                  <span className="tabular">{String(i + 1).padStart(2, '0')}</span> {label}
                </li>
              )
            })}
          </ol>
          <div className="h-1.5 bg-paper/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label={`${d.etapeLibelle} ${step + 1} / 3`}>
            <m.div className="hazard h-full origin-left" initial={false} animate={{ scaleX: progress }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }} />
          </div>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {status === 'ok' ? (
              <m.div key="ok" variants={variants} custom={1} initial="enter" animate="center" exit="exit" className="px-4 py-8 md:px-8" role="status">
                <p className="display text-[34px] uppercase text-accent">{d.succesTitre}</p>
                <p className="mt-3 text-[16px] leading-snug text-paper/85">{t(d.succesTexte, { numeroClient: data.telephone })}</p>
                <a href={`tel:${e.telephone}`} className="mono-label mt-6 flex items-center justify-between bg-accent px-4 py-4 text-[12px] text-on-accent">
                  {config.barreMobile.appeler} · {e.telephoneAffiche}
                  <span aria-hidden="true">→</span>
                </a>
              </m.div>
            ) : step === 0 ? (
              <m.fieldset key="s0" variants={variants} custom={dir} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="px-4 py-5 md:px-8">
                <legend className="sr-only">{d.questionTravaux}</legend>
                <p className="text-[22px] font-bold leading-tight [font-stretch:90%]" aria-hidden="true">{d.questionTravaux}</p>
                <div role="radiogroup" aria-label={d.questionTravaux} className="mt-3 border-t border-paper/20">
                  {travauxOptions.map((o, i) => (
                    <Option key={o.id} index={i} label={o.label} selected={data.travaux === o.id} onClick={() => pick('travaux', o.id)} />
                  ))}
                </div>
              </m.fieldset>
            ) : step === 1 ? (
              <m.fieldset key="s1" variants={variants} custom={dir} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="px-4 py-5 md:px-8">
                <legend className="sr-only">{d.questionUrgence}</legend>
                <p className="mono-label text-[10px] text-accent">{travauxLabel}</p>
                <p className="mt-1 text-[22px] font-bold leading-tight [font-stretch:90%]" aria-hidden="true">{d.questionUrgence}</p>
                <div role="radiogroup" aria-label={d.questionUrgence} className="mt-3 border-t border-paper/20">
                  {d.urgences.map((o, i) => (
                    <Option key={o.id} index={i} label={o.label} detail={o.detail} selected={data.urgence === o.id} onClick={() => pick('urgence', o.id)} />
                  ))}
                </div>
                <button type="button" onClick={() => go(0)} className="mono-label mt-4 text-[11px] text-paper/60 underline underline-offset-4">
                  ← {d.boutonRetour}
                </button>
              </m.fieldset>
            ) : (
              <m.form key="s2" noValidate onSubmit={submit} variants={variants} custom={dir} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-5 px-4 py-5 md:px-8">
                <div>
                  <p className="mono-label text-[10px] text-accent">
                    {travauxLabel} · {urgenceLabel}
                  </p>
                  <p className="mt-1 text-[22px] font-bold leading-tight [font-stretch:90%]">{d.questionCoordonnees}</p>
                </div>
                <Field id="f-nom" label={d.champNom} error={errors.nom}>
                  <input id="f-nom" name="nom" autoComplete="name" className={inputCls} value={data.nom} aria-invalid={!!errors.nom} aria-describedby={errors.nom ? 'f-nom-err' : undefined} onChange={(ev) => setData({ ...data, nom: ev.target.value })} />
                </Field>
                <Field id="f-tel" label={d.champTelephone} error={errors.telephone}>
                  <input id="f-tel" name="telephone" type="tel" inputMode="tel" autoComplete="tel" className={`${inputCls} tabular`} value={data.telephone} aria-invalid={!!errors.telephone} aria-describedby={errors.telephone ? 'f-tel-err' : undefined} onChange={(ev) => setData({ ...data, telephone: ev.target.value })} />
                </Field>
                <Field id="f-commune" label={d.champCommune}>
                  <input id="f-commune" name="commune" list="communes" autoComplete="address-level2" className={inputCls} value={data.commune} onChange={(ev) => setData({ ...data, commune: ev.target.value })} />
                  <datalist id="communes">
                    {config.zone.villes.map((v) => (
                      <option key={v.nom} value={v.nom} />
                    ))}
                  </datalist>
                </Field>
                <Field id="f-msg" label={d.champMessage}>
                  <textarea id="f-msg" name="message" rows={2} placeholder={d.placeholderMessage} className={`${inputCls} resize-none text-[15px]`} value={data.message} onChange={(ev) => setData({ ...data, message: ev.target.value })} />
                </Field>
                <div>
                  <label className="flex cursor-pointer items-start gap-3 font-mono text-[11.5px] leading-snug text-paper/70">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--c-accent)]" checked={data.consent} aria-invalid={!!errors.consent} onChange={(ev) => setData({ ...data, consent: ev.target.checked })} />
                    {d.consentement}
                  </label>
                  {errors.consent && <p className="mt-1 font-mono text-[11.5px] text-accent" role="alert">{errors.consent}</p>}
                </div>

                <button type="submit" disabled={status === 'sending'} className="flex w-full items-center justify-between bg-accent px-4 py-4 text-on-accent transition-colors hover:bg-paper disabled:opacity-60">
                  <span className="display text-[20px] uppercase">{status === 'sending' ? d.envoiEnCours : d.boutonEnvoyer}</span>
                  <span aria-hidden="true" className="text-2xl">→</span>
                </button>
                {status === 'error' && <p className="font-mono text-[12px] text-accent" role="alert">{t(d.erreurEnvoi)}</p>}
                <button type="button" onClick={() => go(1)} className="mono-label text-[11px] text-paper/60 underline underline-offset-4">
                  ← {d.boutonRetour}
                </button>
              </m.form>
            )}
          </AnimatePresence>
        </div>

        <p className="mono-label border-t border-paper/30 px-4 py-3 text-[10px] text-paper/60 md:px-8">✓ {d.reassurance}</p>
      </div>
    </section>
  )
}
