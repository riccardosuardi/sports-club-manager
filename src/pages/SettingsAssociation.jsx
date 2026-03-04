import { useEffect, useState } from 'react'
import { Building2, Save, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getFullName } from '../lib/utils'

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
  organigramma: [],
}

const TABS = [
  { id: 'generale', label: 'Dati Generali' },
  { id: 'contatti', label: 'Contatti' },
  { id: 'note', label: 'Note' },
  { id: 'organigramma', label: 'Organigramma' },
]

export default function SettingsAssociation() {
  const [form, setForm] = useState(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('generale')
  const [members, setMembers] = useState([])

  useEffect(() => { fetchSettings() }, [])

  async function fetchSettings() {
    setLoading(true)
    const [settingsRes, membersRes] = await Promise.all([
      supabase.from('association_settings').select('*').limit(1).single(),
      supabase.from('users').select('id, first_name, last_name, member_type').eq('is_member', true).order('last_name'),
    ])
    if (settingsRes.data) {
      const data = { ...DEFAULT_SETTINGS, ...settingsRes.data }
      if (typeof data.organigramma === 'string') {
        try { data.organigramma = JSON.parse(data.organigramma) } catch { data.organigramma = [] }
      }
      if (!Array.isArray(data.organigramma)) data.organigramma = []
      setForm(data)
    }
    setMembers(membersRes.data || [])
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
    payload.organigramma = JSON.stringify(payload.organigramma || [])

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

  // Organigramma helpers
  function addOrgRole() {
    set('organigramma', [...(form.organigramma || []), { role: '', member_id: '', children: [] }])
  }

  function updateOrgItem(index, field, value) {
    const updated = [...(form.organigramma || [])]
    updated[index] = { ...updated[index], [field]: value }
    set('organigramma', updated)
  }

  function removeOrgItem(index) {
    const updated = (form.organigramma || []).filter((_, i) => i !== index)
    set('organigramma', updated)
  }

  function addOrgChild(parentIndex) {
    const updated = [...(form.organigramma || [])]
    if (!updated[parentIndex].children) updated[parentIndex].children = []
    updated[parentIndex].children.push({ role: '', member_id: '' })
    set('organigramma', updated)
  }

  function updateOrgChild(parentIndex, childIndex, field, value) {
    const updated = [...(form.organigramma || [])]
    updated[parentIndex].children[childIndex] = { ...updated[parentIndex].children[childIndex], [field]: value }
    set('organigramma', updated)
  }

  function removeOrgChild(parentIndex, childIndex) {
    const updated = [...(form.organigramma || [])]
    updated[parentIndex].children = updated[parentIndex].children.filter((_, i) => i !== childIndex)
    set('organigramma', updated)
  }

  function getMemberName(memberId) {
    const m = members.find(m => m.id === memberId)
    return m ? getFullName(m) : ''
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'

  if (loading) return <div className="py-12 text-center text-gray-500">Caricamento...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Associazione</h1>
        <p className="text-sm text-gray-500">Dati e contatti dell'associazione sportiva</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dati generali */}
        {activeTab === 'generale' && (
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
        )}

        {/* Contatti */}
        {activeTab === 'contatti' && (
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
        )}

        {/* Note */}
        {activeTab === 'note' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Note</h3>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={8} className={inputClass} />
          </div>
        )}

        {/* Organigramma */}
        {activeTab === 'organigramma' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Organigramma</h3>
              <button
                type="button"
                onClick={addOrgRole}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus size={16} /> Aggiungi Ruolo
              </button>
            </div>

            {(!form.organigramma || form.organigramma.length === 0) ? (
              <p className="text-sm text-gray-500">Nessun ruolo definito. Aggiungi ruoli per creare l'organigramma.</p>
            ) : (
              <div className="space-y-4">
                {form.organigramma.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-500">Ruolo</label>
                        <input
                          type="text"
                          value={item.role || ''}
                          onChange={(e) => updateOrgItem(idx, 'role', e.target.value)}
                          placeholder="Es. Presidente, Vicepresidente, Allenatore..."
                          className={inputClass}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-500">Persona</label>
                        <select
                          value={item.member_id || ''}
                          onChange={(e) => updateOrgItem(idx, 'member_id', e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Seleziona persona...</option>
                          {members.map(m => (
                            <option key={m.id} value={m.id}>{m.last_name} {m.first_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end gap-1">
                        <button
                          type="button"
                          onClick={() => addOrgChild(idx)}
                          className="rounded-lg p-2 text-primary-600 hover:bg-primary-50"
                          title="Aggiungi sotto-ruolo"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeOrgItem(idx)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          title="Rimuovi"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    {item.children && item.children.length > 0 && (
                      <div className="ml-6 mt-3 space-y-2 border-l-2 border-primary-200 pl-4">
                        {item.children.map((child, cIdx) => (
                          <div key={cIdx} className="flex gap-3">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={child.role || ''}
                                onChange={(e) => updateOrgChild(idx, cIdx, 'role', e.target.value)}
                                placeholder="Sotto-ruolo..."
                                className={inputClass}
                              />
                            </div>
                            <div className="flex-1">
                              <select
                                value={child.member_id || ''}
                                onChange={(e) => updateOrgChild(idx, cIdx, 'member_id', e.target.value)}
                                className={inputClass}
                              >
                                <option value="">Seleziona persona...</option>
                                {members.map(m => (
                                  <option key={m.id} value={m.id}>{m.last_name} {m.first_name}</option>
                                ))}
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOrgChild(idx, cIdx)}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                              title="Rimuovi"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
