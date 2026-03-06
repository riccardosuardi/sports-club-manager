import { useEffect, useState, useRef, useCallback } from 'react'
import { Building2, Save, Plus, Trash2, Search, GripVertical, X, Link2 } from 'lucide-react'
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
  organigramma: { nodes: [], connections: [] },
}

const TABS = [
  { id: 'generale', label: 'Dati Generali' },
  { id: 'contatti', label: 'Contatti' },
  { id: 'organigramma', label: 'Organigramma' },
]

function migrateOrgData(data) {
  if (!data) return { nodes: [], connections: [] }
  if (data.nodes) return data
  // Migrate from old array format
  if (Array.isArray(data)) {
    const nodes = []
    const connections = []
    data.forEach((item, idx) => {
      const parentId = `node-${Date.now()}-${idx}`
      nodes.push({ id: parentId, role: item.role || '', member_id: item.member_id || '', x: 200 + idx * 250, y: 60 })
      if (item.children) {
        item.children.forEach((child, cIdx) => {
          const childId = `node-${Date.now()}-${idx}-${cIdx}`
          nodes.push({ id: childId, role: child.role || '', member_id: child.member_id || '', x: 100 + idx * 250 + cIdx * 200, y: 200 })
          connections.push({ from: parentId, to: childId })
        })
      }
    })
    return { nodes, connections }
  }
  return { nodes: [], connections: [] }
}

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
    try {
      const [settingsRes, membersRes] = await Promise.all([
        supabase.from('association_settings').select('*').limit(1).maybeSingle(),
        supabase.from('users').select('id, first_name, last_name, member_type').eq('is_member', true).order('last_name'),
      ])
      if (settingsRes.data) {
        const data = { ...DEFAULT_SETTINGS, ...settingsRes.data }
        if (typeof data.organigramma === 'string') {
          try { data.organigramma = JSON.parse(data.organigramma) } catch { data.organigramma = { nodes: [], connections: [] } }
        }
        data.organigramma = migrateOrgData(data.organigramma)
        setForm(data)
      }
      setMembers(membersRes.data || [])
    } catch (err) {
      console.error('Settings fetch error:', err)
    } finally {
      setLoading(false)
    }
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
    payload.organigramma = JSON.stringify(payload.organigramma || { nodes: [], connections: [] })

    const { data: existing } = await supabase
      .from('association_settings')
      .select('id')
      .limit(1)
      .maybeSingle()

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
                <AddressAutocomplete
                  value={form.address}
                  onChange={(val) => set('address', val)}
                  onSelect={(place) => {
                    set('address', place.address)
                    if (place.city) set('city', place.city)
                    if (place.zip_code) set('zip_code', place.zip_code)
                    if (place.province) set('province', place.province)
                  }}
                  inputClass={inputClass}
                />
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

        {/* Organigramma - Canvas Drag & Drop */}
        {activeTab === 'organigramma' && (
          <OrgChart
            data={form.organigramma}
            onChange={(d) => set('organigramma', d)}
            members={members}
          />
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

const NODE_W = 180
const NODE_H = 70

function OrgChart({ data, onChange, members }) {
  const canvasRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editNode, setEditNode] = useState(null)
  const [connecting, setConnecting] = useState(null)
  const [connectMouse, setConnectMouse] = useState(null)

  const nodes = data?.nodes || []
  const connections = data?.connections || []

  function update(newNodes, newConnections) {
    onChange({ nodes: newNodes || nodes, connections: newConnections || connections })
  }

  function addNode() {
    const id = `node-${Date.now()}`
    const newNode = { id, role: 'Nuovo ruolo', member_id: '', x: 80 + Math.random() * 300, y: 80 + Math.random() * 200 }
    update([...nodes, newNode])
  }

  function deleteNode(id) {
    const newNodes = nodes.filter(n => n.id !== id)
    const newConns = connections.filter(c => c.from !== id && c.to !== id)
    update(newNodes, newConns)
    setEditNode(null)
  }

  function updateNode(id, field, value) {
    const newNodes = nodes.map(n => n.id === id ? { ...n, [field]: value } : n)
    update(newNodes)
  }

  function deleteConnection(idx) {
    const newConns = connections.filter((_, i) => i !== idx)
    update(null, newConns)
  }

  function getMemberName(memberId) {
    const m = members.find(m => m.id === memberId)
    return m ? getFullName(m) : ''
  }

  function getCanvasPoint(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function handleMouseDown(e, node) {
    if (e.button !== 0) return
    e.stopPropagation()
    const pt = getCanvasPoint(e)
    setDragging(node.id)
    setDragOffset({ x: pt.x - node.x, y: pt.y - node.y })
  }

  function handleMouseMove(e) {
    if (connecting) {
      const pt = getCanvasPoint(e)
      setConnectMouse(pt)
      return
    }
    if (!dragging) return
    const pt = getCanvasPoint(e)
    const newNodes = nodes.map(n =>
      n.id === dragging ? { ...n, x: Math.max(0, pt.x - dragOffset.x), y: Math.max(0, pt.y - dragOffset.y) } : n
    )
    update(newNodes)
  }

  function handleMouseUp(e) {
    if (connecting) {
      const pt = getCanvasPoint(e)
      const target = nodes.find(n =>
        n.id !== connecting &&
        pt.x >= n.x && pt.x <= n.x + NODE_W &&
        pt.y >= n.y && pt.y <= n.y + NODE_H
      )
      if (target) {
        const exists = connections.some(c =>
          (c.from === connecting && c.to === target.id) ||
          (c.from === target.id && c.to === connecting)
        )
        if (!exists) {
          update(null, [...connections, { from: connecting, to: target.id }])
        }
      }
      setConnecting(null)
      setConnectMouse(null)
      return
    }
    setDragging(null)
  }

  function startConnect(e, nodeId) {
    e.stopPropagation()
    e.preventDefault()
    setConnecting(nodeId)
    setConnectMouse(getCanvasPoint(e))
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h3 className="text-lg font-semibold text-gray-900">Organigramma</h3>
        <div className="flex gap-2">
          <span className="text-xs text-gray-400 self-center">Trascina i nodi per posizionarli. Usa il cerchio blu per collegare.</span>
          <button
            type="button"
            onClick={addNode}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus size={16} /> Aggiungi Ruolo
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="relative overflow-auto bg-gray-50 select-none"
        style={{ height: '500px', backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SVG connections */}
        <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
          {connections.map((conn, idx) => {
            const from = nodes.find(n => n.id === conn.from)
            const to = nodes.find(n => n.id === conn.to)
            if (!from || !to) return null
            const x1 = from.x + NODE_W / 2
            const y1 = from.y + NODE_H
            const x2 = to.x + NODE_W / 2
            const y2 = to.y
            const midY = (y1 + y2) / 2
            return (
              <g key={idx}>
                <path
                  d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
                  stroke="#9ca3af"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Clickable delete zone */}
                <circle
                  cx={(x1 + x2) / 2}
                  cy={(y1 + y2) / 2}
                  r="8"
                  fill="white"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  className="pointer-events-auto cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => deleteConnection(idx)}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#ef4444"
                  className="pointer-events-none opacity-0 hover:opacity-100"
                  style={{ pointerEvents: 'none' }}
                >
                  ×
                </text>
              </g>
            )
          })}
          {/* Connecting line preview */}
          {connecting && connectMouse && (() => {
            const from = nodes.find(n => n.id === connecting)
            if (!from) return null
            return (
              <line
                x1={from.x + NODE_W / 2}
                y1={from.y + NODE_H}
                x2={connectMouse.x}
                y2={connectMouse.y}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
            )
          })()}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`absolute rounded-xl border-2 bg-white shadow-md transition-shadow hover:shadow-lg ${
              dragging === node.id ? 'shadow-xl ring-2 ring-primary-300' : ''
            } ${connecting ? 'hover:ring-2 hover:ring-blue-400' : ''}`}
            style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
          >
            {/* Drag handle */}
            <div
              className="absolute -top-0 left-0 right-0 h-5 cursor-grab active:cursor-grabbing flex items-center justify-center rounded-t-xl bg-gray-50 border-b border-gray-100"
              onMouseDown={(e) => handleMouseDown(e, node)}
            >
              <GripVertical size={12} className="text-gray-400" />
            </div>

            {/* Content - click to edit */}
            <div
              className="flex h-full flex-col items-center justify-center px-3 pt-4 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); setEditNode(node.id) }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 truncate max-w-full">
                {node.role || 'Clicca per editare'}
              </p>
              <p className="mt-0.5 text-sm text-gray-800 truncate max-w-full">
                {node.member_id ? getMemberName(node.member_id) : <span className="italic text-gray-400">—</span>}
              </p>
            </div>

            {/* Connect handle (bottom center) */}
            <div
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-blue-500 border-2 border-white cursor-crosshair shadow-sm hover:bg-blue-600 flex items-center justify-center"
              onMouseDown={(e) => startConnect(e, node.id)}
              title="Trascina per collegare"
            >
              <Link2 size={10} className="text-white" />
            </div>

            {/* Delete button */}
            <button
              type="button"
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white shadow-sm opacity-0 hover:bg-red-600 group-hover:opacity-100 transition-opacity"
              style={{ opacity: editNode === node.id ? 1 : undefined }}
              onClick={(e) => { e.stopPropagation(); deleteNode(node.id) }}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Edit popup */}
        {editNode && (() => {
          const node = nodes.find(n => n.id === editNode)
          if (!node) return null
          return (
            <div
              className="absolute z-20 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
              style={{ left: node.x + NODE_W + 12, top: node.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Modifica ruolo</span>
                <button type="button" onClick={() => setEditNode(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={node.role}
                  onChange={(e) => updateNode(node.id, 'role', e.target.value)}
                  placeholder="Ruolo..."
                  className={inputClass}
                />
                <select
                  value={node.member_id || ''}
                  onChange={(e) => updateNode(node.id, 'member_id', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Seleziona persona...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.last_name} {m.first_name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => deleteNode(node.id)}
                  className="w-full rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  Elimina ruolo
                </button>
              </div>
            </div>
          )
        })()}

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">Clicca "Aggiungi Ruolo" per iniziare a creare l'organigramma</p>
              <p className="text-xs text-gray-400">Trascina i nodi per posizionarli e usa il cerchio blu per collegarli</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Address autocomplete component using Nominatim (OpenStreetMap)
function AddressAutocomplete({ value, onChange, onSelect, inputClass }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(val) {
    setQuery(val)
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=it&limit=5&q=${encodeURIComponent(val)}`,
          { headers: { 'Accept-Language': 'it' } }
        )
        const data = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 400)
  }

  function handleSelect(item) {
    const addr = item.address || {}
    const streetNumber = addr.house_number || ''
    const street = addr.road || addr.pedestrian || addr.footway || ''
    const fullAddress = [street, streetNumber].filter(Boolean).join(' ')

    onSelect({
      address: fullAddress || item.display_name.split(',')[0],
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      zip_code: addr.postcode || '',
      province: addr.county ? addr.county.replace('Provincia di ', '').substring(0, 2).toUpperCase() : '',
    })
    setQuery(fullAddress || item.display_name.split(',')[0])
    setShowSuggestions(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Inizia a digitare l'indirizzo..."
          className={inputClass}
        />
        <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              {item.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
