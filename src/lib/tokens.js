const nf = new Intl.NumberFormat('fr-FR')

/** Variables utilisables dans n'importe quel texte du config.json : {nom}, {ville}… */
export function buildTokens(cfg) {
  const e = cfg.entreprise
  const year = new Date().getFullYear()
  return {
    nom: e.nom,
    metier: e.metier,
    metierMin: e.metierMin,
    ville: e.ville,
    telephone: e.telephoneAffiche,
    email: e.email,
    delai: cfg.preuves.delai,
    annees: String(year - e.anneeCreation),
    anneeCreation: String(e.anneeCreation),
    annee: String(year),
    chantiers: nf.format(cfg.preuves.chantiers),
    nombreAvis: String(cfg.preuves.nombreAvis),
    police: cfg.assurance.police,
  }
}

export function interpolate(str, tokens, extra) {
  if (typeof str !== 'string') return str
  return str.replace(/\{(\w+)\}/g, (m, k) => {
    if (extra && k in extra) return extra[k]
    return k in tokens ? tokens[k] : m
  })
}

export const formatNumber = (n) => nf.format(n)
const nf1 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export const formatNote = (n) => nf1.format(n)
