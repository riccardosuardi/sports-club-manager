import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY = {
  first_name: '',
  last_name: '',
  fiscal_code: '',
  date_of_birth: '',
  gender: '',
  member_type: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip_code: '',
  province: '',
  parent_id: '',
  is_minor: false,
  membership_number: '',
  status: 'attivo',
  membership_start: '',
  membership_end: '',
  medical_certificate_expiry: '',
  medical_certificate_type: '',
  notes: '',
}

export default function MemberForm({ member, members = [], onSaved, onCancel }) {
  const [form, setForm] = useState(member ? {
    ...EMPTY,
    ...member,
    parent_id: member.parent_id || '',
    date_of_birth: member.date_of_birth || '',
    membership_start: member.membership_start || '',
    membership_end: member.membership_end || '',
    medical_certificate_expiry: member.medical_certificate_expiry || '',
  } : EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = { ...form }
    // Clean empty strings to null
    for (const key of Object.keys(payload)) {
      if (payload[key] === '') payload[key] = null
    }
    delete payload.parent
    delete payload.created_at
    delete payload.updated_at

    try {
      payload.is_member = true
      if (member?.id) {
        const { error } = await supabase.from('users').update(payload).eq('id', member.id)
        if (error) throw error
      } else {
        delete payload.id
        const { error } = await supabase.from('users').insert(payload)
        if (error) throw error
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const parentOptions = members.filter((m) => m.id !== member?.id && !m.is_minor)

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nome *</label>
          <input type="text" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cognome *</label>
          <input type="text" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Codice Fiscale</label>
          <input type="text" value={form.fiscal_code || ''} onChange={(e) => set('fiscal_code', e.target.value.toUpperCase())} maxLength={16} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Data di Nascita</label>
          <input type="date" value={form.date_of_birth || ''} onChange={(e) => set('date_of_birth', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Genere</label>
          <select value={form.gender || ''} onChange={(e) => set('gender', e.target.value)} className={inputClass}>
            <option value="">--</option>
            <option value="M">Maschio</option>
            <option value="F">Femmina</option>
            <option value="Altro">Altro</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Tipologia Socio</label>
          <select value={form.member_type || ''} onChange={(e) => set('member_type', e.target.value)} className={inputClass}>
            <option value="">--</option>
            <option value="giovane">Giovane</option>
            <option value="adulto">Adulto</option>
            <option value="genitore">Genitore</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Numero Tessera</label>
          <input type="text" value={form.membership_number || ''} onChange={(e) => set('membership_number', e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Minor + Genitore */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_minor}
            onChange={(e) => set('is_minor', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="font-medium text-gray-700">Socio minorenne</span>
        </label>
        {form.is_minor && (
          <div className="mt-3">
            <label className={labelClass}>Genitore/Tutore</label>
            <select value={form.parent_id || ''} onChange={(e) => set('parent_id', e.target.value)} className={inputClass}>
              <option value="">Seleziona genitore...</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.last_name} {p.first_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Contatti */}
      <h4 className="text-sm font-semibold text-gray-900">Contatti</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Telefono</label>
          <input type="tel" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Indirizzo</label>
          <input type="text" value={form.address || ''} onChange={(e) => set('address', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Citt&agrave;</label>
          <input type="text" value={form.city || ''} onChange={(e) => set('city', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>CAP</label>
          <input type="text" value={form.zip_code || ''} onChange={(e) => set('zip_code', e.target.value)} maxLength={5} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Provincia</label>
          <input type="text" value={form.province || ''} onChange={(e) => set('province', e.target.value)} maxLength={2} className={inputClass} />
        </div>
      </div>

      {/* Associazione */}
      <h4 className="text-sm font-semibold text-gray-900">Associazione</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Stato</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
            <option value="attivo">Attivo</option>
            <option value="sospeso">Sospeso</option>
            <option value="scaduto">Scaduto</option>
            <option value="cancellato">Cancellato</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Inizio Iscrizione</label>
          <input type="date" value={form.membership_start || ''} onChange={(e) => set('membership_start', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Fine Iscrizione</label>
          <input type="date" value={form.membership_end || ''} onChange={(e) => set('membership_end', e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Certificato Medico */}
      <h4 className="text-sm font-semibold text-gray-900">Certificato Medico</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Scadenza Certificato</label>
          <input type="date" value={form.medical_certificate_expiry || ''} onChange={(e) => set('medical_certificate_expiry', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Tipo Certificato</label>
          <select value={form.medical_certificate_type || ''} onChange={(e) => set('medical_certificate_type', e.target.value)} className={inputClass}>
            <option value="">--</option>
            <option value="agonistico">Agonistico</option>
            <option value="non_agonistico">Non Agonistico</option>
            <option value="ludico_motorio">Ludico Motorio</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Note</label>
        <textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={3} className={inputClass} />
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Annulla
        </button>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Salvataggio...' : member ? 'Salva Modifiche' : 'Crea Socio'}
        </button>
      </div>
    </form>
  )
}
