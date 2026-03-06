import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getFullName } from '../lib/utils'
import Badge from '../components/ui/Badge'

export default function SettingsUser() {
  const { profile, hasRole } = useAuth()
  const [authUsers, setAuthUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Profile edit state
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    zip_code: '',
    province: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        address: profile.address || '',
        city: profile.city || '',
        zip_code: profile.zip_code || '',
        province: profile.province || '',
      })
    }
  }, [profile])

  useEffect(() => { if (hasRole('admin')) fetchAuthUsers() }, [])

  async function fetchAuthUsers() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .not('auth_id', 'is', null)
        .order('first_name')
      setAuthUsers(data || [])
    } catch (err) {
      console.error('SettingsUser fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId, newRole) {
    await supabase.from('users').update({ role: newRole }).eq('id', userId)
    fetchAuthUsers()
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const payload = { ...form }
      for (const key of Object.keys(payload)) {
        if (payload[key] === '') payload[key] = null
      }
      const { error: err } = await supabase.from('users').update(payload).eq('id', profile.id)
      if (err) throw err
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utente</h1>
        <p className="text-sm text-gray-500">Gestione profilo e utenti</p>
      </div>

      {/* Modifica profilo */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Il tuo profilo</h3>
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nome</label>
              <input type="text" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cognome</label>
              <input type="text" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Telefono</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Data di nascita</label>
              <input type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Indirizzo</label>
              <input type="text" value={form.address} onChange={(e) => set('address', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Città</label>
              <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">CAP</label>
                <input type="text" value={form.zip_code} onChange={(e) => set('zip_code', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Provincia</label>
                <input type="text" value={form.province} onChange={(e) => set('province', e.target.value)} maxLength={2} className={inputClass} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">Ruolo: <span className="font-medium capitalize">{profile?.role}</span></p>
          </div>
          <div className="flex items-center gap-3 border-t pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : 'Salva Profilo'}
            </button>
            {saved && <span className="text-sm text-green-600">Salvato!</span>}
          </div>
        </form>
      </div>

      {/* Gestione utenti - solo admin */}
      {hasRole('admin') && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Utenti registrati</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Caricamento...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">Nome</th>
                    <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                    <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">Ruolo</th>
                    <th className="pb-3 text-left text-xs font-medium uppercase text-gray-500">Cambia Ruolo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {authUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 text-sm font-medium text-gray-900">{getFullName(u)}</td>
                      <td className="py-3 text-sm text-gray-600">{u.email}</td>
                      <td className="py-3"><Badge status={u.role === 'admin' ? 'attivo' : 'nuovo'}>{u.role}</Badge></td>
                      <td className="py-3">
                        {u.auth_id !== profile?.auth_id ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                          >
                            <option value="admin">Admin</option>
                            <option value="segreteria">Segreteria</option>
                            <option value="istruttore">Istruttore</option>
                            <option value="socio">Atleta</option>
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400">Il tuo account</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
