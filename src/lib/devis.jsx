import { createContext, useContext, useState, useCallback } from 'react'

const DevisContext = createContext(null)

export function DevisProvider({ children }) {
  const [preselection, setPreselection] = useState(null)
  const choisir = useCallback((serviceId) => {
    setPreselection({ id: serviceId, at: Date.now() })
    document.getElementById('devis')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])
  return <DevisContext.Provider value={{ preselection, choisir }}>{children}</DevisContext.Provider>
}

export const useDevis = () => useContext(DevisContext)
