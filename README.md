# Site vitrine artisan — démo MJAGENCY

Démo commerciale « Vernet Élec, électricien à Sète » : style fiche technique / plan d'architecte,
3D éclatée au scroll, avant/après au doigt, carte du bassin de Thau, devis en 3 étapes.

**Stack** : Vite 8 · React 19 · Tailwind 4 · Framer Motion · Three.js via @react-three/fiber.
Pré-rendu statique (SSG) au build → Lighthouse mobile 99–100 en performance, 100 en accessibilité, bonnes pratiques et SEO.

```bash
npm install
npm run dev        # http://localhost:5173 (accessible depuis le téléphone sur le même Wi-Fi)
npm run build      # build + pré-rendu HTML dans dist/
npm run preview    # sert dist/ en local
```

## Personnaliser en 10 minutes

Tout le contenu se trouve dans **`src/config.json`**. Aucun texte n'est écrit en dur dans les composants.

| Bloc | Contenu |
|---|---|
| `entreprise` | nom, initiales (logo), métier, `schemaType` (Electrician, Plumber, HousePainter…), adresse, GPS, téléphone, e-mail, SIRET, TVA, APE |
| `theme` | palette : `graphite`, `papier`, `accent`, `surAccent` (texte posé sur l'accent) |
| `seo` | title, description, URL du site, image de partage |
| `preuves` | note Google, nombre d'avis, lien Google, chantiers, délai d'intervention |
| `hero` | modèle 3D (`ampoule`, `robinet`, `rouleau`, `couches`), affiche, annotations du plan |
| `services.liste` | lignes de la nomenclature (titre, résumé, détail, inclus, prix, délai) |
| `realisations.liste` | paires avant/après (`src` dans `public/photos/`, `alt` obligatoire) |
| `zone.villes` | villes avec latitude/longitude, `base: true` pour l'atelier, position de l'étiquette |
| `avis` | compteurs, tampons (décennale, artisan local…), avis clients |
| `devis` | envoi `mailto` ou `formspree` (+ `formspreeId`), questions, urgences |
| `assurance`, `horaires`, `pied` | mentions légales, assurance décennale, horaires |

Jetons utilisables dans tous les textes : `{nom}` `{metier}` `{metierMin}` `{ville}` `{telephone}` `{delai}` `{annees}` `{chantiers}` `{nombreAvis}` `{police}` `{anneeCreation}` `{annee}`.

Le **title, la meta description, l'Open Graph, le JSON-LD** (LocalBusiness/Electrician avec `areaServed`, horaires et `aggregateRating`), le `robots.txt`, le `sitemap.xml` et le favicon sont générés depuis ce fichier au build (`vite.config.js`).

### Changer de métier

```bash
npm run metier -- plombier      # electricien | plombier | peintre | paysagiste
```

Cette commande copie `presets/<métier>.json` vers `src/config.json`. Chaque preset change les textes, les couleurs, le modèle 3D et les photos.

**En rendez-vous** : en bas de page, le sélecteur « Démo — voir ce site pour un autre métier » (ou l'URL `?metier=peintre`) bascule le site en direct sur le téléphone, sans rebuild. Pour un vrai client, désactivez-le avec `"demo": { "afficherSelecteur": false }`.

### Formulaire de devis

- `"envoi": "mailto"` : ouvre l'application mail du visiteur avec la demande pré-remplie (aucun service tiers).
- `"envoi": "formspree"` + `"formspreeId": "xxxxabcd"` : envoi direct par Formspree (créez le formulaire sur formspree.io).

### Photos

- Remplacez les fichiers de `public/photos/` par les photos du chantier (format 4:3, WebP ou JPG d'environ 1200 × 900), puis mettez à jour `src` et `alt` dans le config.
- **Unsplash** : renseignez `"unsplash": "photo-…"` (identifiant ou URL `images.unsplash.com`) sur une photo avant/après, puis lancez :
  ```bash
  npm run photos:unsplash          # télécharge, recadre en 1200×900, convertit en WebP dans public/photos/
  ```
- Les visuels livrés sont des rendus 3D générés (même cadrage avant/après, sans droits à gérer). Pour les régénérer : lancez `npm run dev`, puis `npm i -D playwright` et `npm run photos:render`. Ce script produit aussi les affiches 3D `hero-*.webp`. `scripts/dev/og.cjs` régénère l'image de partage `og.jpg`.

## Choix techniques

- **Mobile d'abord** : barre collante [Appeler] [Devis gratuit], zones tactiles ≥ 44 px, `safe-area`, slider avant/après en `touch-action: pan-y` (le défilement vertical reste possible).
- **3D légère** : le chunk Three.js (~240 Ko gzip) se charge seulement au premier geste ou au repos. Une affiche WebP s'affiche avant. Le rendu se met en pause hors écran. Avec `prefers-reduced-motion` ou sans WebGL : affiche statique + légende, sans 3D.
- **SSG** : `src/entry-server.jsx` + `scripts/prerender.mjs` injectent le HTML complet dans `dist/index.html`. Les sections sous la ligne de flottaison sont hydratées séparément (code-splitting), ce qui évite les tâches longues.

## Déploiement Vercel

`vercel.json` est fourni (preset Vite, cache long sur `/assets` et `/photos`).

```bash
npm i -g vercel
vercel login
vercel            # aperçu
vercel --prod     # production
```

Pensez à remplacer `seo.url` dans `src/config.json` par l'URL ou le domaine final (canonical, Open Graph, sitemap).

---
Site de démonstration réalisé par **MJAGENCY** — [mjagency.eu](https://mjagency.eu)
