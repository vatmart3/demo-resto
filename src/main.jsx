import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const el = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// Outil interne (dev uniquement) : rendu des affiches 3D -> npm run photos:render
if (import.meta.env.DEV && new URLSearchParams(location.search).has('__poster')) {
  import('./hero/PosterRender.jsx').then(({ default: PosterRender }) => createRoot(el).render(<PosterRender />))
} else if (el.hasChildNodes()) {
  hydrateRoot(el, app)
} else {
  createRoot(el).render(app)
}
