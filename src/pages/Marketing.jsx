import { useEffect, useState } from 'react'
import { Plus, Megaphone, UserPlus, Phone, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, formatDateTime } from '../lib/utils'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const SOURCES = ['Sito web', 'Passaparola', 'Evento', 'Social', 'Volantino', 'Altro']
const STATUSES = ['tutti', 'nuovo', 'contattato', 'interessato', 'convertito', 'perso']

export default function Marketing() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('tutti')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [convertTarget, setConvertTarget] = useState(null)
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => { fetchContacts() }, [])

  async function fetchContacts() {
    setLoading(true)
    const { data } = await supabase.from('users').select('*').eq('is_member', false).order('created_at', { ascending: false })
    setContacts(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('users').delete().eq('id', id)
    fetchContacts()
  }

  async function handleConvert(contact) {
    // Converti contatto a socio: basta aggiornare is_member e contact_status
    const { error } = await supabase.from('users').update({
      is_member: true,
      contact_status: 'convertito',
      membership_start: new Date().toISOString().split('T')[0],
    }).eq('id', contact.id)

    if (error) { alert(error.message); return }

    setConvertTarget(null)
    fetchContacts()
  }

  const filtered = contacts.filter((c) => {
    const matchesSearch = !search ||
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'tutti' || c.contact_status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.contact_status === 'nuovo').length,
    interested: contacts.filter(c => c.contact_status === 'interessato').length,
    converted: contacts.filter(c => c.contact_status === 'convertito').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing & Contatti</h1>
          <p className="text-sm text-gray-500">
            {stats.total} contatti | {stats.new} nuovi | {stats.interested} interessati | {stats.converted} convertiti
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmail(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-600 px-4 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50"
          >
            <Mail size={18} /> Invia Email
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus size={18} /> Nuovo Contatto
          </button>
        </div>
      </div>

      {/* Pipeline visuale */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: 'Nuovi', count: stats.new, color: 'bg-blue-500' },
          { label: 'Contattati', count: contacts.filter(c => c.contact_status === 'contattato').length, color: 'bg-purple-500' },
          { label: 'Interessati', count: stats.interested, color: 'bg-orange-500' },
          { label: 'Convertiti', count: stats.converted, color: 'bg-green-500' },
          { label: 'Persi', count: contacts.filter(c => c.contact_status === 'perso').length, color: 'bg-red-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <div className={`mx-auto mb-2 h-2 w-12 rounded-full ${s.color}`} />
            <p className="text-2xl font-bold text-gray-900">{s.count}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtri */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-80">
          <SearchInput value={search} onChange={setSearch} placeholder="Cerca contatti..." />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-2 text-sm font-medium capitalize ${
                filterStatus === s ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Caricamento...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nessun contatto trovato" description="Aggiungi il primo contatto" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nome</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Contatti</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 lg:table-cell">Fonte</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 lg:table-cell">Interesse</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stato</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Ultimo contatto</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="font-medium text-gray-900">{contact.first_name} {contact.last_name}</p>
                    <p className="text-xs text-gray-500">{formatDate(contact.created_at)}</p>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
                    <div className="space-y-1 text-sm text-gray-600">
                      {contact.email && <div className="flex items-center gap-1"><Mail size={12} /> {contact.email}</div>}
                      {contact.phone && <div className="flex items-center gap-1"><Phone size={12} /> {contact.phone}</div>}
                    </div>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 lg:table-cell">{contact.source || '-'}</td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 lg:table-cell">{contact.interest || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <select
                      value={contact.contact_status}
                      onChange={async (e) => {
                        await supabase.from('users').update({ contact_status: e.target.value }).eq('id', contact.id)
                        fetchContacts()
                      }}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      <option value="nuovo">Nuovo</option>
                      <option value="contattato">Contattato</option>
                      <option value="interessato">Interessato</option>
                      <option value="convertito">Convertito</option>
                      <option value="perso">Perso</option>
                    </select>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-500 md:table-cell">
                    {contact.last_contacted_at ? formatDateTime(contact.last_contacted_at) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {contact.contact_status !== 'convertito' && (
                        <button onClick={() => setConvertTarget(contact)} className="text-xs text-green-600 hover:text-green-700" title="Converti a atleta">
                          <UserPlus size={16} />
                        </button>
                      )}
                      <button onClick={() => { setEditing(contact); setShowForm(true) }} className="text-xs text-gray-600 hover:text-gray-700">Modifica</button>
                      <button onClick={() => setDeleteTarget(contact)} className="text-xs text-red-600 hover:text-red-700">Elimina</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showEmail} onClose={() => setShowEmail(false)} title="Invia Comunicazione Email" size="lg">
        <EmailCompose contacts={filtered.filter(c => c.email)} onClose={() => setShowEmail(false)} />
      </Modal>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Modifica Contatto' : 'Nuovo Contatto'} size="md">
        <ContactForm contact={editing} onSaved={() => { setShowForm(false); fetchContacts() }} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Elimina Contatto"
        message={`Eliminare ${deleteTarget?.first_name} ${deleteTarget?.last_name}?`}
        confirmLabel="Elimina"
        danger
      />

      <ConfirmDialog
        open={!!convertTarget}
        onClose={() => setConvertTarget(null)}
        onConfirm={() => handleConvert(convertTarget)}
        title="Converti a Atleta"
        message={`Vuoi convertire ${convertTarget?.first_name} ${convertTarget?.last_name} in atleta? I dati verranno copiati nella scheda atleta.`}
        confirmLabel="Converti"
      />
    </div>
  )
}

function ContactForm({ contact, onSaved, onCancel }) {
  const [form, setForm] = useState({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    source: contact?.source || '',
    interest: contact?.interest || '',
    contact_status: contact?.contact_status || 'nuovo',
    notes: contact?.notes || '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    for (const key of Object.keys(payload)) {
      if (payload[key] === '') payload[key] = null
    }
    payload.first_name = form.first_name
    payload.last_name = form.last_name

    try {
      if (contact?.id) {
        const { error } = await supabase.from('users').update(payload).eq('id', contact.id)
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Fonte</label>
          <select value={form.source || ''} onChange={(e) => set('source', e.target.value)} className={inputClass}>
            <option value="">--</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Interesse / Sport</label>
          <input type="text" value={form.interest || ''} onChange={(e) => set('interest', e.target.value)} placeholder="Es. Nuoto, Calcio..." className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Stato</label>
          <select value={form.contact_status} onChange={(e) => set('contact_status', e.target.value)} className={inputClass}>
            <option value="nuovo">Nuovo</option>
            <option value="contattato">Contattato</option>
            <option value="interessato">Interessato</option>
            <option value="convertito">Convertito</option>
            <option value="perso">Perso</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Note</label>
        <textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={3} className={inputClass} />
      </div>
      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Annulla</button>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Salvataggio...' : contact ? 'Salva' : 'Crea'}
        </button>
      </div>
    </form>
  )
}

function EmailCompose({ contacts, onClose }) {
  const [selected, setSelected] = useState(new Set(contacts.map(c => c.id)))
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  function toggleContact(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === contacts.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(contacts.map(c => c.id)))
    }
  }

  function handleSend() {
    const recipients = contacts.filter(c => selected.has(c.id)).map(c => c.email).filter(Boolean)
    if (recipients.length === 0) return
    const mailto = `mailto:?bcc=${encodeURIComponent(recipients.join(','))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto)
    // Aggiorna last_contacted_at per i contatti selezionati
    const ids = contacts.filter(c => selected.has(c.id)).map(c => c.id)
    supabase.from('users').update({ last_contacted_at: new Date().toISOString() }).in('id', ids).then(() => {})
    onClose()
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Destinatari ({contacts.filter(c => selected.has(c.id)).length} selezionati)
          </label>
          <button onClick={toggleAll} className="text-xs text-primary-600 hover:text-primary-700">
            {selected.size === contacts.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-2">
          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500 py-2 text-center">Nessun contatto con email</p>
          ) : (
            contacts.map(c => (
              <label key={c.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggleContact(c.id)}
                  className="rounded border-gray-300 text-primary-600"
                />
                <span className="font-medium">{c.first_name} {c.last_name}</span>
                <span className="text-gray-400">({c.email})</span>
              </label>
            ))
          )}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Oggetto</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Oggetto della comunicazione..."
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Messaggio</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Scrivi il messaggio..."
          className={inputClass}
        />
      </div>
      <div className="flex justify-end gap-3 border-t pt-4">
        <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Annulla
        </button>
        <button
          onClick={handleSend}
          disabled={selected.size === 0 || !subject}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          Apri nel client email
        </button>
      </div>
    </div>
  )
}
