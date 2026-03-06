import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AssociationContext = createContext({})

export function AssociationProvider({ children }) {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data } = await supabase
        .from('association_settings')
        .select('name, logo_url')
        .limit(1)
        .maybeSingle()
      if (data) setSettings(data)
    } catch {
      // Silently fail - settings not available
    }
  }

  return (
    <AssociationContext.Provider value={{ settings, refetchSettings: fetchSettings }}>
      {children}
    </AssociationContext.Provider>
  )
}

export function useAssociation() {
  return useContext(AssociationContext)
}
