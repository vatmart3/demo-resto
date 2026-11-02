import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildTokens, interpolate } from './src/lib/tokens.js'

const CONFIG_PATH = fileURLToPath(new URL('./src/config.json', import.meta.url))

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * SEO local généré depuis src/config.json : <title>, description, Open Graph,
 * JSON-LD LocalBusiness/Electrician, palette CSS (sans flash), favicon,
 * robots.txt et sitemap.xml. Aucun texte en dur dans index.html.
 */
function configHtml() {
  let cfg
  const load = () => (cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')))
  return {
    name: 'config-html',
    buildStart() {
      load()
      this.addWatchFile(CONFIG_PATH)
    },
    handleHotUpdate(ctx) {
      if (ctx.file === CONFIG_PATH) {
        load()
        ctx.server.ws.send({ type: 'full-reload' })
      }
    },
    transformIndexHtml(html) {
      if (!cfg) load()
      const e = cfg.entreprise
      const tk = buildTokens(cfg)
      const t = (s) => interpolate(s, tk)
      const site = cfg.seo.url.replace(/\/$/, '')
      const title = t(cfg.seo.titre)
      const description = t(cfg.seo.description)
      const image = site + cfg.seo.image
      const villes = cfg.zone.villes

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': e.schemaType || 'LocalBusiness',
        '@id': `${site}/#entreprise`,
        name: e.nom,
        description,
        slogan: e.slogan,
        url: `${site}/`,
        telephone: e.telephone,
        email: e.email,
        image,
        logo: image,
        priceRange: e.prix,
        foundingDate: String(e.anneeCreation),
        founder: { '@type': 'Person', name: e.gerant },
        address: {
          '@type': 'PostalAddress',
          streetAddress: e.adresse,
          postalCode: e.codePostal,
          addressLocality: e.ville,
          addressRegion: e.region,
          addressCountry: e.pays,
        },
        geo: { '@type': 'GeoCoordinates', latitude: e.latitude, longitude: e.longitude },
        areaServed: villes.map((v) => ({
          '@type': 'City',
          name: v.nom,
          geo: { '@type': 'GeoCoordinates', latitude: v.latitude, longitude: v.longitude },
        })),
        openingHoursSpecification: cfg.horaires.map((h) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: h.jours.map((d) => `https://schema.org/${d}`),
          opens: h.ouverture,
          closes: h.fermeture,
        })),
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: cfg.preuves.noteGoogle,
          reviewCount: cfg.preuves.nombreAvis,
          bestRating: 5,
          worstRating: 1,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: t(cfg.services.titre),
          itemListElement: cfg.services.liste.map((s) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.titre, description: s.resume, areaServed: villes.map((v) => v.nom) },
          })),
        },
        identifier: { '@type': 'PropertyValue', propertyID: 'SIRET', value: e.siret.replace(/\s/g, '') },
        sameAs: [cfg.preuves.lienAvisGoogle].filter(Boolean),
      }

      const th = cfg.theme
      const favicon = `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${th.accent}"/><text x="32" y="43" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="28" text-anchor="middle" fill="${th.surAccent}">${esc(e.initiales)}</text></svg>`,
      )}`

      const head = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(site)}/" />
    <meta name="theme-color" content="${esc(th.graphite)}" />
    <meta name="geo.region" content="FR-${esc(e.codePostal.slice(0, 2))}" />
    <meta name="geo.placename" content="${esc(e.ville)}" />
    <meta name="geo.position" content="${e.latitude};${e.longitude}" />
    <meta name="ICBM" content="${e.latitude}, ${e.longitude}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="${esc(cfg.seo.locale)}" />
    <meta property="og:site_name" content="${esc(e.nom)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(site)}/" />
    <meta property="og:image" content="${esc(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="${favicon}" />
    <link rel="preload" as="image" href="${esc(cfg.hero.poster)}" fetchpriority="high" />
    <style>:root{--c-graphite:${th.graphite};--c-graphite-2:${th.graphite2};--c-papier:${th.papier};--c-papier-2:${th.papier2};--c-accent:${th.accent};--c-sur-accent:${th.surAccent}}</style>
    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`

      return html.replace('<!--config-head-->', head).replace('lang="fr"', `lang="${esc(cfg.seo.langue)}"`)
    },
    generateBundle() {
      if (!cfg) load()
      const site = cfg.seo.url.replace(/\/$/, '')
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n` })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [configHtml(), react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
})
