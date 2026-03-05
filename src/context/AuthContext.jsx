import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    try {
      const controller = new AbortController()
      const abortTimeout = setTimeout(() => controller.abort(), 3000)
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userId)
        .maybeSingle()
        .abortSignal(controller.signal)
      clearTimeout(abortTimeout)
      if (data) {
        data.full_name = [data.first_name, data.last_name].filter(Boolean).join(' ') || data.email
      }
      setProfile(data)
    } catch (err) {
      console.error('fetchProfile error:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    let mounted = true

    // Timeout di sicurezza: sblocca l'app dopo 4s qualsiasi cosa succeda
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth timeout - sblocco forzato')
        setLoading(false)
      }
    }, 4000)

    // onAuthStateChange con INITIAL_SESSION e' il modo piu affidabile (Supabase v2.39+)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          // fetchProfile NON blocca il rendering: usa timeout separato
          const profileTimeout = setTimeout(() => {
            if (mounted) setLoading(false)
          }, 3000)
          fetchProfile(session.user.id).finally(() => {
            clearTimeout(profileTimeout)
            if (mounted) setLoading(false)
          })
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password, fullName) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  function hasRole(...roles) {
    return profile && roles.includes(profile.role)
  }

  function isStaff() {
    return hasRole('admin', 'segreteria', 'istruttore')
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isStaff,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider')
  }
  return context
}
