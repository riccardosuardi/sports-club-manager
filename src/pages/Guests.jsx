import { useEffect, useState } from 'react'
import { Plus, UserRoundPlus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, getFullName, calculateAge } from '../lib/utils'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function Guests() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchGuests() }, [])

  async function fetchGuests() {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('is_member', false)
      .is('contact_status', null)
      .order('last_name')
    setGuests(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('users').delete().eq('id', id)
    fetchGuests()
  }

  const filtered = guests.filter(g =>
    !search || getFullName(g).toLowerCase().includes(search.toLowerCase()) || (g.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ospiti</h1>
          <p className="text-sm text-gray-500">{guests.length} ospiti registrati</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus size={18} /> Nuovo Ospite
        </button>
      </div>

      <div className="sm:w-80">
        <SearchInput value={search} onChange={setSearch} placeholder="Cerca ospiti..." />
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Caricamento...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserRoundPlus} title="Nessun ospite" description="Gli ospiti sono persone non iscritte come atleti e non contatti marketing" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nome</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Email</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Telefono</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Età</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Note</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{getFullName(g)}</td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 md:table-cell">{g.email || '-'}</td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 md:table-cell">{g.phone || '-'}</td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 md:table-cell">{g.date_of_birth ? calculateAge(g.date_of_birth) : '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{g.notes || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing(g); setShowForm(true) }} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" title="Modifica">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(g)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Elimina">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Modifica Ospite' : 'Nuovo Ospite'} size="md">
        <GuestForm guest={editing} onSaved={() => { setShowForm(false); fetchGuests() }} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Elimina Ospite"
        message={`Eliminare ${deleteTarget ? getFullName(deleteTarget) : ''}?`}
        confirmLabel="Elimina"
        danger
      />
    </div>
  )
}

function GuestForm({ guest, onSaved, onCancel }) {
  const [form, setForm] = useState({
    first_name: guest?.first_name || '',
    last_name: guest?.last_name || '',
    email: guest?.email || '',
    phone: guest?.phone || '',
    date_of_birth: guest?.date_of_birth || '',
    notes: guest?.notes || '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    for (const k of Object.keys(payload)) { if (payload[k] === '') payload[k] = null }
    try {
      if (guest?.id) {
        const { error } = await supabase.from('users').update(payload).eq('id', guest.id)
        if (error) throw error
      } else {
        payload.is_member = false
        payload.status = 'attivo'
        const { error } = await supabase.from('users').insert(payload)
        if (error) throw error
      }
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nome *</label>
          <input type="text" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Cognome *</label>
          <input type="text" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Telefono</label>
          <input type="tel" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Data di nascita</label>
          <input type="date" value={form.date_of_birth || ''} onChange={(e) => set('date_of_birth', e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Note</label>
        <textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={2} className={inputClass} />
      </div>
      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Annulla</button>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Salvataggio...' : guest ? 'Salva' : 'Crea'}
        </button>
      </div>
    </form>
  )
}
