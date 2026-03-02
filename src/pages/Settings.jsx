import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/ui/Badge'

export default function Settings() {
  const { profile } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('full_name')
    setProfiles(data || [])
    setLoading(false)
  }

  async function handleRoleChange(userId, newRole) {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    fetchProfiles()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
        <p className="text-sm text-gray-500">Gestione utenti e ruoli</p>
      </div>

      {/* Info profilo */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Il tuo profilo</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500">Nome</p>
            <p className="text-sm font-medium">{profile?.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium">{profile?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ruolo</p>
            <p className="text-sm font-medium capitalize">{profile?.role}</p>
          </div>
        </div>
      </div>

      {/* Gestione utenti */}
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
                {profiles.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 text-sm font-medium text-gray-900">{p.full_name}</td>
                    <td className="py-3 text-sm text-gray-600">{p.email}</td>
                    <td className="py-3"><Badge status={p.role === 'admin' ? 'attivo' : 'nuovo'}>{p.role}</Badge></td>
                    <td className="py-3">
                      {p.id !== profile?.id ? (
                        <select
                          value={p.role}
                          onChange={(e) => handleRoleChange(p.id, e.target.value)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        >
                          <option value="admin">Admin</option>
                          <option value="segreteria">Segreteria</option>
                          <option value="istruttore">Istruttore</option>
                          <option value="socio">Socio</option>
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
    </div>
  )
}
