import { lazy, Suspense } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { ConfigProvider } from './lib/config.jsx'
import { DevisProvider } from './lib/devis.jsx'
import Hero from './components/Hero.jsx'
import Bandeau from './components/Bandeau.jsx'
import StickyBar from './components/StickyBar.jsx'

// Sections sous la ligne de flottaison : code séparé, hydratées une à une
// (le HTML est pré-rendu au build, donc visible et indexable immédiatement).
const Services = lazy(() => import('./components/Services.jsx'))
const Realisations = lazy(() => import('./components/Realisations.jsx'))
const Zone = lazy(() => import('./components/Zone.jsx'))
const Avis = lazy(() => import('./components/Avis.jsx'))
const Devis = lazy(() => import('./components/Devis.jsx'))
const Footer = lazy(() => import('./components/Footer.jsx'))

const Part = ({ children }) => <Suspense fallback={null}>{children}</Suspense>

export default function App() {
  return (
    <ConfigProvider>
      <DevisProvider>
        <MotionConfig reducedMotion="user">
          <LazyMotion features={domAnimation} strict>
            <main>
              <Hero />
              <Bandeau />
              <Part><Services /></Part>
              <Part><Realisations /></Part>
              <Part><Zone /></Part>
              <Part><Avis /></Part>
              <Part><Devis /></Part>
            </main>
            <Part><Footer /></Part>
            <StickyBar />
          </LazyMotion>
        </MotionConfig>
      </DevisProvider>
    </ConfigProvider>
  )
}
