import { useEffect, useState } from 'react'
import { Building2, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'

const DEFAULT_SETTINGS = {
  name: '',
  address: '',
  city: '',
  zip_code: '',
  province: '',
  phone: '',
  email: '',
  pec: '',
  fiscal_code: '',
  vat_number: '',
  website: '',
  president: '',
  founded_year: '',
  sport_type: '',
  notes: '',
}

export default function SettingsAssociation() {
  const [form, setForm] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { fetchSettings() }, [])

  async function fetchSettings() {
    setLoading(true)
    const { data } = await supabase
      .from('association_settings')
      .select('*')
      .limit(1)
      .single()
    if (data) {
      setForm({ ...DEFAULT_SETTINGS, ...data })
    }
    setLoading(false)
  }

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    const payload = { ...form }
    delete payload.id
    delete payload.created_at
    delete payload.updated_at

    // Prova update, se non esiste fai insert
    const { data: existing } = await supabase
      .from('association_settings')
      .select('id')
      .limit(1)
      .single()

    if (existing?.id) {
      await supabase.from('association_settings').update(payload).eq('id', existing.id)
    } else {
      await supabase.from('association_settings').insert(payload)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'

  if (loading) return <div className="py-12 text-center text-gray-500">Caricamento...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Associazione</h1>
        <p className="text-sm text-gray-500">Dati e contatti dell'associazione sportiva</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dati generali */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Dati generali</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Nome Associazione</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Presidente</label>
              <input type="text" value={form.president} onChange={(e) => set('president', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Anno Fondazione</label>
              <input type="text" value={form.founded_year} onChange={(e) => set('founded_year', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tipo Sport</label>
              <input type="text" value={form.sport_type} onChange={(e) => set('sport_type', e.target.value)} placeholder="Es. Calcio, Nuoto, Multisport..." className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Codice Fiscale</label>
              <input type="text" value={form.fiscal_code} onChange={(e) => set('fiscal_code', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Partita IVA</label>
              <input type="text" value={form.vat_number} onChange={(e) => set('vat_number', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Contatti */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Contatti</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
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
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Telefono</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">PEC</label>
              <input type="email" value={form.pec} onChange={(e) => set('pec', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sito Web</label>
              <input type="url" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Note</h3>
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={4} className={inputClass} />
        </div>

        {/* Salva */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
          </button>
          {saved && <span className="text-sm text-green-600">Salvato con successo!</span>}
        </div>
      </form>
    </div>
  )
}
