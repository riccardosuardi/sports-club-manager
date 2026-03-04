import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getFullName } from '../lib/utils'
import Badge from '../components/ui/Badge'

export default function SettingsUser() {
  const { profile } = useAuth()
  const [authUsers, setAuthUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAuthUsers() }, [])

  async function fetchAuthUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('*')
      .not('auth_id', 'is', null)
      .order('first_name')
    setAuthUsers(data || [])
    setLoading(false)
  }

  async function handleRoleChange(userId, newRole) {
    await supabase.from('users').update({ role: newRole }).eq('id', userId)
    fetchAuthUsers()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utente</h1>
        <p className="text-sm text-gray-500">Gestione profilo e utenti</p>
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
    </div>
  )
}
