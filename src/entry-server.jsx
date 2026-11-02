import { prerenderToNodeStream } from 'react-dom/static'
import { StrictMode } from 'react'
import App from './App.jsx'

/** Pré-rendu statique (SSG) : HTML complet injecté dans dist/index.html au build. */
export async function render() {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  let html = ''
  for await (const chunk of prelude) html += chunk
  return html
}
