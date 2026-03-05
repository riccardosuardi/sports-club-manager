import { useEffect, useState, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Plus, Megaphone, UserCheck, Phone, Mail, LayoutList, Columns3, Upload, Download, FileDown, CheckCircle2, AlertCircle, Users, Eye, Pencil, Trash2, MessageCircle, ChevronDown, ChevronRight, ChevronUp, GripVertical, Search, X, Link, CheckSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, formatDateTime, getFullName, calculateAge } from '../lib/utils'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const IMPORT_CONTACT_COLUMNS = [
  { header: 'Cognome', field: 'last_name' },
  { header: 'Nome', field: 'first_name' },
  { header: 'Email', field: 'email' },
  { header: 'Telefono', field: 'phone' },
  { header: 'Stato', field: 'contact_status' },
  { header: 'Note', field: 'notes' },
]

const MEMBER_TYPES = [
  { value: 'giovane', label: 'Giovane' },
  { value: 'adulto', label: 'Adulto' },
]
const STATUSES = ['tutti', 'nuovo', 'contattato', 'interessato', 'convertito', 'perso']
const PIPELINE_COLUMNS = [
  { key: 'nuovo', label: 'Nuovi', color: 'border-blue-400', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  { key: 'contattato', label: 'Contattati', color: 'border-purple-400', bg: 'bg-purple-50', dot: 'bg-purple-500' },
  { key: 'interessato', label: 'Interessati', color: 'border-orange-400', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  { key: 'convertito', label: 'Convertiti', color: 'border-green-400', bg: 'bg-green-50', dot: 'bg-green-500' },
  { key: 'perso', label: 'Persi', color: 'border-red-400', bg: 'bg-red-50', dot: 'bg-red-500' },
]

const CONTACT_METHODS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'phone', label: 'Telefono', icon: Phone },
]

function ContactButton({ contact, size = 14 }) {
  const method = contact.preferred_contact_method
  const phone = (contact.phone || '').replace(/\s+/g, '')

  if (method === 'whatsapp' && phone) {
    return (
      <a href={`https://wa.me/${phone.startsWith('+') ? phone.slice(1) : '39' + phone}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-green-600 hover:bg-green-50" title="WhatsApp">
        <MessageCircle size={size} />
      </a>
    )
  }
  if (method === 'phone' && phone) {
    return (
      <a href={`tel:${phone}`} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50" title="Chiama">
        <Phone size={size} />
      </a>
    )
  }
  if (method === 'email' && contact.email) {
    return (
      <a href={`mailto:${contact.email}`} className="rounded-lg p-1.5 text-orange-600 hover:bg-orange-50" title="Email">
        <Mail size={size} />
      </a>
    )
  }
  // Fallback: show first available method
  if (contact.email) {
    return (
      <a href={`mailto:${contact.email}`} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50" title="Email">
        <Mail size={size} />
      </a>
    )
  }
  if (phone) {
    return (
      <a href={`tel:${phone}`} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50" title="Chiama">
        <Phone size={size} />
      </a>
    )
  }
  return null
}

export default function Marketing() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [convertTarget, setConvertTarget] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'board'
  const [listFilter, setListFilter] = useState('tutti') // 'tutti' | 'giovani' | 'genitori'
  const [boardGroupBy, setBoardGroupBy] = useState('athlete') // 'athlete' | 'parent'
  const [showImportModal, setShowImportModal] = useState(false)
  const [draggedContact, setDraggedContact] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [sortBy, setSortBy] = useState(null) // 'name' | 'contacts' | 'type'
  const [sortDir, setSortDir] = useState('asc')
  const searchInputRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => { fetchContacts() }, [])

  async function fetchContacts() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, contact_status, notes, created_at, parent_id, preferred_contact_method, member_type, date_of_birth, parent:parent_id(id, first_name, last_name, email, phone, preferred_contact_method)')
        .eq('is_member', false)
        .order('created_at', { ascending: false })
      if (error) console.error('Marketing query error:', error)
      setContacts(data || [])
    } catch (err) {
      console.error('Marketing fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    await supabase.from('users').delete().eq('id', id)
    fetchContacts()
  }

  async function handleConvert(contact) {
    const { error } = await supabase.from('users').update({
      is_member: true,
      contact_status: 'convertito',
      membership_start: new Date().toISOString().split('T')[0],
    }).eq('id', contact.id)

    if (error) { alert(error.message); return }
    setConvertTarget(null)
    fetchContacts()
  }

  async function handleStatusChange(contactId, newStatus) {
    await supabase.from('users').update({ contact_status: newStatus }).eq('id', contactId)
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, contact_status: newStatus } : c))
  }

  async function handleAssignParent(childId, parentId) {
    const { error } = await supabase.from('users').update({ parent_id: parentId || null }).eq('id', childId)
    if (error) { console.error('Assign parent error:', error); return }
    const parent = parentId ? contacts.find(c => c.id === parentId) : null
    setContacts(prev => prev.map(c =>
      c.id === childId
        ? { ...c, parent_id: parentId || null, parent: parent ? { id: parent.id, first_name: parent.first_name, last_name: parent.last_name, email: parent.email, phone: parent.phone, preferred_contact_method: parent.preferred_contact_method } : null }
        : c
    ))
  }

  // Drag and drop handlers
  function handleDragStart(e, contact) {
    setDraggedContact(contact)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', contact.id)
    e.currentTarget.classList.add('opacity-50')
  }

  function handleDragEnd(e) {
    e.currentTarget.classList.remove('opacity-50')
    setDraggedContact(null)
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDragEnter(e) {
    e.preventDefault()
    e.currentTarget.classList.add('ring-2', 'ring-primary-400', 'bg-primary-50/50')
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('ring-2', 'ring-primary-400', 'bg-primary-50/50')
  }

  function handleDrop(e, newStatus) {
    e.preventDefault()
    e.currentTarget.classList.remove('ring-2', 'ring-primary-400', 'bg-primary-50/50')
    if (draggedContact && draggedContact.contact_status !== newStatus) {
      handleStatusChange(draggedContact.id, newStatus)
    }
    setDraggedContact(null)
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll(filteredContacts) {
    setSelectedIds(prev => {
      const allSelected = filteredContacts.every(c => prev.has(c.id))
      if (allSelected) return new Set()
      return new Set(filteredContacts.map(c => c.id))
    })
  }

  async function handleBulkMemberType(type) {
    const ids = [...selectedIds]
    const { error } = await supabase.from('users').update({ member_type: type }).in('id', ids)
    if (error) { console.error('Bulk update error:', error); return }
    setContacts(prev => prev.map(c => ids.includes(c.id) ? { ...c, member_type: type } : c))
    setSelectedIds(new Set())
  }

  async function handleInlineUpdate(contactId, field, value) {
    const { error } = await supabase.from('users').update({ [field]: value || null }).eq('id', contactId)
    if (error) { console.error('Inline update error:', error); return }
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, [field]: value || null } : c))
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds]
    const { error } = await supabase.from('users').delete().in('id', ids)
    if (error) { console.error('Bulk delete error:', error); return }
    setContacts(prev => prev.filter(c => !ids.includes(c.id)))
    setSelectedIds(new Set())
    setBulkDeleteConfirm(false)
  }

  function handleSort(column) {
    if (sortBy === column) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
  }

  const filtered = contacts.filter((c) => {
    const matchesSearch = !search ||
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.parent ? `${c.parent.first_name} ${c.parent.last_name}`.toLowerCase().includes(search.toLowerCase()) : false)
    const matchesFilter = listFilter === 'tutti' ||
      (listFilter === 'giovani' && c.member_type === 'giovane') ||
      (listFilter === 'genitori' && c.member_type === 'adulto')
    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    if (!sortBy) return 0
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortBy === 'name') {
      const nameA = `${a.last_name} ${a.first_name}`.toLowerCase()
      const nameB = `${b.last_name} ${b.first_name}`.toLowerCase()
      return nameA.localeCompare(nameB) * dir
    }
    if (sortBy === 'contacts') {
      const cA = (a.email ? 1 : 0) + (a.phone ? 1 : 0)
      const cB = (b.email ? 1 : 0) + (b.phone ? 1 : 0)
      return (cA - cB) * dir
    }
    if (sortBy === 'type') {
      const order = { giovane: 1, adulto: 2 }
      const tA = order[a.member_type] || 99
      const tB = order[b.member_type] || 99
      return (tA - tB) * dir
    }
    return 0
  })

  // Group contacts by parent for parent view
  function getParentGroups() {
    const groups = new Map()
    const noParent = []
    for (const c of filtered) {
      if (c.parent_id && c.parent) {
        const key = c.parent_id
        if (!groups.has(key)) {
          groups.set(key, { parent: c.parent, children: [] })
        }
        groups.get(key).children.push(c)
      } else {
        noParent.push(c)
      }
    }
    return { groups: Array.from(groups.values()), noParent }
  }

  // Group board contacts by parent
  function getBoardParentGroups(colContacts) {
    const groups = new Map()
    const noParent = []
    for (const c of colContacts) {
      if (c.parent_id && c.parent) {
        const key = c.parent_id
        if (!groups.has(key)) {
          groups.set(key, { parent: c.parent, children: [] })
        }
        groups.get(key).children.push(c)
      } else {
        noParent.push(c)
      }
    }
    return { groups: Array.from(groups.values()), noParent }
  }

  function handleExport() {
    const headers = IMPORT_CONTACT_COLUMNS.map(c => c.header)
    const rows = contacts.map(c => IMPORT_CONTACT_COLUMNS.map(col => c[col.field] || ''))
    const csv = [headers.join(';'), ...rows.map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(';'))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contatti_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Contatti</h1>
          <p className="text-sm text-gray-500">
            {stats.total} contatti | {stats.new} nuovi | {stats.interested} interessati | {stats.converted} convertiti
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} /> Esporta
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Upload size={16} /> Importa CSV
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus size={18} /> Nuovo Contatto
          </button>
        </div>
      </div>

      {/* Vista toggle + Filtri */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="sm:w-80">
            <SearchInput ref={searchInputRef} value={search} onChange={setSearch} placeholder="Cerca contatti..." />
          </div>
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {[
              { value: 'tutti', label: 'Tutti' },
              { value: 'giovani', label: 'Giovani' },
              { value: 'genitori', label: 'Genitori' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setListFilter(f.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  listFilter === f.value ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
                viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutList size={16} /> Lista
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
                viewMode === 'board' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Columns3 size={16} /> Board
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Caricamento...</div>
      ) : viewMode === 'board' ? (
        /* ===== KANBAN BOARD ===== */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col) => {
            const colContacts = filtered.filter((c) => c.contact_status === col.key)

            return (
              <div
                key={col.key}
                className={`flex min-w-[280px] flex-1 flex-col rounded-lg border-t-4 ${col.color} bg-gray-50 transition-all`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm">
                    {colContacts.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 px-3 pb-3">
                  {colContacts.length === 0 ? (
                    <p className="py-4 text-center text-xs text-gray-400">Nessun contatto</p>
                  ) : boardGroupBy === 'parent' ? (
                    /* Board grouped by parent */
                    (() => {
                      const { groups, noParent } = getBoardParentGroups(colContacts)
                      return (
                        <>
                          {groups.map(({ parent, children }) => (
                            <ParentBoardGroup
                              key={parent.id}
                              parent={parent}
                              children={children}
                              onEdit={(c) => { setEditing(c); setShowForm(true) }}
                              onDelete={setDeleteTarget}
                              onConvert={setConvertTarget}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                              onStatusChange={handleStatusChange}
                            />
                          ))}
                          {noParent.map((contact) => (
                            <KanbanCard
                              key={contact.id}
                              contact={contact}
                              onEdit={() => { setEditing(contact); setShowForm(true) }}
                              onDelete={() => setDeleteTarget(contact)}
                              onConvert={() => setConvertTarget(contact)}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                              onStatusChange={handleStatusChange}
                            />
                          ))}
                        </>
                      )
                    })()
                  ) : (
                    /* Board by athlete */
                    colContacts.map((contact) => (
                      <KanbanCard
                        key={contact.id}
                        contact={contact}
                        onEdit={() => { setEditing(contact); setShowForm(true) }}
                        onDelete={() => setDeleteTarget(contact)}
                        onConvert={() => setConvertTarget(contact)}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : listFilter === 'genitori' ? (
        /* ===== PARENTS VIEW (filtered as list) ===== */
        <ParentsView
          contacts={filtered}
          parentGroups={getParentGroups()}
          onEdit={(c) => { setEditing(c); setShowForm(true) }}
          onDelete={setDeleteTarget}
          onConvert={setConvertTarget}
          onStatusChange={handleStatusChange}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nessun contatto trovato" description="Aggiungi il primo contatto" />
      ) : (
        /* ===== LIST VIEW ===== */
        <>
        {selectedIds.size > 0 && (
          <div className="mb-2 flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2">
            <span className="text-sm font-medium text-primary-700">
              {selectedIds.size} selezionat{selectedIds.size === 1 ? 'o' : 'i'}
            </span>
            <div className="h-4 w-px bg-primary-200" />
            <span className="text-xs text-gray-500">Tipologia:</span>
            {MEMBER_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => handleBulkMemberType(t.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  t.value === 'giovane' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                  t.value === 'adulto' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                  'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {t.label}
              </button>
            ))}
            <div className="h-4 w-px bg-primary-200" />
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              <Trash2 size={14} />
              Elimina
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-gray-500 hover:text-gray-700"
            >
              Deseleziona tutto
            </button>
          </div>
        )}
        <div className="overflow-auto rounded-lg border border-gray-200 bg-white" style={{ maxHeight: 'calc(100vh - 260px)', willChange: 'transform' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && filtered.every(c => selectedIds.has(c.id))}
                    onChange={() => toggleSelectAll(filtered)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('name')}>
                  <span className="inline-flex items-center gap-1">Nome {sortBy === 'name' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</span>
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('contacts')}>
                  <span className="inline-flex items-center gap-1">Contatti {sortBy === 'contacts' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</span>
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 lg:table-cell">Genitore</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 lg:table-cell cursor-pointer select-none hover:text-gray-700" onClick={() => handleSort('type')}>
                  <span className="inline-flex items-center gap-1">Tipologia {sortBy === 'type' && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}</span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stato</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((contact) => (
                <tr key={contact.id} className={`hover:bg-gray-50 ${selectedIds.has(contact.id) ? 'bg-primary-50' : ''}`}>
                  <td className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {contact.first_name} {contact.last_name}
                      {contact.date_of_birth && (
                        <span className="ml-1.5 text-xs font-normal text-gray-400">{calculateAge(contact.date_of_birth)} anni</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(contact.created_at)}</p>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
                    <div className="space-y-1 text-sm text-gray-600">
                      {contact.email && <div className="flex items-center gap-1"><Mail size={12} /> {contact.email}</div>}
                      {contact.phone && <div className="flex items-center gap-1"><Phone size={12} /> {contact.phone}</div>}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-gray-600 lg:table-cell">
                    <ParentCell
                      contact={contact}
                      contacts={contacts}
                      onAssign={handleAssignParent}
                    />
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-sm lg:table-cell">
                    <select
                      value={contact.member_type || ''}
                      onChange={(e) => handleInlineUpdate(contact.id, 'member_type', e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      <option value="">-</option>
                      {MEMBER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <select
                      value={contact.contact_status}
                      onChange={(e) => handleStatusChange(contact.id, e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1 text-xs"
                    >
                      <option value="nuovo">Nuovo</option>
                      <option value="contattato">Contattato</option>
                      <option value="interessato">Interessato</option>
                      <option value="convertito">Convertito</option>
                      <option value="perso">Perso</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <ContactButton contact={contact} />
                      {contact.contact_status !== 'convertito' && (
                        <button onClick={() => setConvertTarget(contact)} className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100" title="Converti in atleta">
                          <UserCheck size={14} /> Atleta
                        </button>
                      )}
                      <button onClick={() => { setEditing(contact); setShowForm(true) }} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" title="Modifica">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(contact)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Elimina">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      <ConfirmDialog
        open={bulkDeleteConfirm}
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Elimina contatti selezionati"
        message={`Sei sicuro di voler eliminare ${selectedIds.size} contatt${selectedIds.size === 1 ? 'o' : 'i'}? Questa azione non può essere annullata.`}
        confirmText="Elimina"
        variant="danger"
      />


      <Modal open={showImportModal} onClose={() => setShowImportModal(false)} title="Importa Contatti da CSV" size="lg">
        <ImportContattiModal
          onDone={() => { setShowImportModal(false); fetchContacts() }}
          onCancel={() => setShowImportModal(false)}
        />
      </Modal>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Modifica Contatto' : 'Nuovo Contatto'} size="md">
        <ContactForm
          contact={editing}
          contacts={contacts}
          onSaved={() => { setShowForm(false); fetchContacts() }}
          onCancel={() => setShowForm(false)}
        />
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

/* ===== Kanban Card ===== */
function KanbanCard({ contact, onEdit, onDelete, onConvert, onDragStart, onDragEnd, onStatusChange }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, contact)}
      onDragEnd={onDragEnd}
      className="cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <GripVertical size={14} className="text-gray-300" />
          <p className="text-sm font-medium text-gray-900">{contact.first_name} {contact.last_name}</p>
        </div>
        <ContactButton contact={contact} size={12} />
      </div>
      {contact.email && (
        <p className="mt-0.5 flex items-center gap-1 pl-5 text-xs text-gray-500">
          <Mail size={10} /> {contact.email}
        </p>
      )}
      {contact.phone && (
        <p className="mt-0.5 flex items-center gap-1 pl-5 text-xs text-gray-500">
          <Phone size={10} /> {contact.phone}
        </p>
      )}
      {contact.parent && (
        <p className="mt-0.5 flex items-center gap-1 pl-5 text-xs text-blue-600">
          <Users size={10} /> {getFullName(contact.parent)}
        </p>
      )}
      <div className="mt-1.5 flex flex-wrap gap-1">
        {contact.member_type && (
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            contact.member_type === 'giovane' ? 'bg-blue-100 text-blue-700' :
            contact.member_type === 'adulto' ? 'bg-green-100 text-green-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {contact.member_type === 'giovane' ? 'Giovane' : 'Adulto'}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
        <select
          value={contact.contact_status}
          onChange={(e) => { e.stopPropagation(); onStatusChange(contact.id, e.target.value) }}
          className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-600"
        >
          <option value="nuovo">Nuovo</option>
          <option value="contattato">Contattato</option>
          <option value="interessato">Interessato</option>
          <option value="convertito">Convertito</option>
          <option value="perso">Perso</option>
        </select>
        <div className="flex gap-1">
          {contact.contact_status !== 'convertito' && (
            <button onClick={onConvert} className="inline-flex items-center gap-1 rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 hover:bg-green-100" title="Converti in atleta">
              <UserCheck size={12} /> Atleta
            </button>
          )}
          <button onClick={onEdit} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100" title="Modifica">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="rounded-lg p-1 text-red-500 hover:bg-red-50" title="Elimina">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ===== Parent Board Group ===== */
function ParentBoardGroup({ parent, children, onEdit, onDelete, onConvert, onDragStart, onDragEnd, onStatusChange }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-1.5 text-left">
        {expanded ? <ChevronDown size={14} className="text-blue-600" /> : <ChevronRight size={14} className="text-blue-600" />}
        <Users size={14} className="text-blue-600" />
        <span className="text-xs font-semibold text-blue-800">{getFullName(parent)}</span>
        <span className="ml-auto rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-600">{children.length}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {children.map((contact) => (
            <KanbanCard
              key={contact.id}
              contact={contact}
              onEdit={() => onEdit(contact)}
              onDelete={() => onDelete(contact)}
              onConvert={() => onConvert(contact)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ===== Parents View ===== */
function ParentsView({ contacts, parentGroups, onEdit, onDelete, onConvert, onStatusChange }) {
  const { groups, noParent } = parentGroups

  if (groups.length === 0 && noParent.length === 0) {
    return <EmptyState icon={Users} title="Nessun contatto trovato" description="Aggiungi il primo contatto" />
  }

  return (
    <div className="space-y-4">
      {groups.map(({ parent, children }) => (
        <ParentCard
          key={parent.id}
          parent={parent}
          children={children}
          onEdit={onEdit}
          onDelete={onDelete}
          onConvert={onConvert}
          onStatusChange={onStatusChange}
        />
      ))}
      {noParent.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-600">Senza genitore assegnato</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {noParent.map((c) => (
              <ParentChildRow key={c.id} contact={c} onEdit={onEdit} onDelete={onDelete} onConvert={onConvert} onStatusChange={onStatusChange} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ParentCard({ parent, children, onEdit, onDelete, onConvert, onStatusChange }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 bg-blue-50 px-4 py-3">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-left">
          {expanded ? <ChevronDown size={16} className="text-blue-600" /> : <ChevronRight size={16} className="text-blue-600" />}
          <Users size={16} className="text-blue-600" />
          <div>
            <span className="font-semibold text-gray-900">{getFullName(parent)}</span>
            <span className="ml-2 text-xs text-gray-500">{children.length} figli</span>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {parent.phone && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Phone size={12} /> {parent.phone}
            </span>
          )}
          {parent.email && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Mail size={12} /> {parent.email}
            </span>
          )}
          <ContactButton contact={parent} />
        </div>
      </div>
      {expanded && (
        <div className="divide-y divide-gray-100">
          {children.map((c) => (
            <ParentChildRow key={c.id} contact={c} onEdit={onEdit} onDelete={onDelete} onConvert={onConvert} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  )
}

function ParentChildRow({ contact, onEdit, onDelete, onConvert, onStatusChange }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{contact.first_name} {contact.last_name}</p>
          <div className="flex gap-3 text-xs text-gray-500">
            {contact.email && <span className="flex items-center gap-1"><Mail size={10} /> {contact.email}</span>}
            {contact.phone && <span className="flex items-center gap-1"><Phone size={10} /> {contact.phone}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {contact.member_type && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            contact.member_type === 'giovane' ? 'bg-blue-100 text-blue-700' :
            contact.member_type === 'adulto' ? 'bg-green-100 text-green-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {contact.member_type === 'giovane' ? 'Giovane' : 'Adulto'}
          </span>
        )}
        <select
          value={contact.contact_status}
          onChange={(e) => onStatusChange(contact.id, e.target.value)}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        >
          <option value="nuovo">Nuovo</option>
          <option value="contattato">Contattato</option>
          <option value="interessato">Interessato</option>
          <option value="convertito">Convertito</option>
          <option value="perso">Perso</option>
        </select>
        <div className="flex gap-1">
          <ContactButton contact={contact} />
          {contact.contact_status !== 'convertito' && (
            <button onClick={() => onConvert(contact)} className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100" title="Converti in atleta">
              <UserCheck size={14} /> Atleta
            </button>
          )}
          <button onClick={() => onEdit(contact)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" title="Modifica">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(contact)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Elimina">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ===== Parent Cell (inline search) ===== */
function ParentCell({ contact, contacts, onAssign }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target) && dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      const rect = ref.current?.getBoundingClientRect()
      if (rect) {
        setDropdownPos({ top: rect.top - 4, left: rect.left })
      }
    }
  }, [open])

  const candidates = contacts.filter(c => c.id !== contact.id)

  // Sort: same last_name first, then by search match
  const filtered = candidates
    .filter(c => {
      if (!search) return true
      const name = `${c.first_name} ${c.last_name}`.toLowerCase()
      return name.includes(search.toLowerCase())
    })
    .sort((a, b) => {
      const aMatch = a.last_name?.toLowerCase() === contact.last_name?.toLowerCase() ? 0 : 1
      const bMatch = b.last_name?.toLowerCase() === contact.last_name?.toLowerCase() ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
      return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`)
    })
    .slice(0, 20)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group flex items-center gap-1 rounded px-1 py-0.5 hover:bg-gray-100 text-left w-full"
        title="Clicca per associare un genitore"
      >
        {contact.parent ? (
          <>
            <span>{getFullName(contact.parent)}</span>
            <Pencil size={12} className="text-gray-400 opacity-0 group-hover:opacity-100 shrink-0" />
          </>
        ) : (
          <span className="text-gray-400 flex items-center gap-1">
            <Link size={12} />
            <span className="opacity-0 group-hover:opacity-100">Associa</span>
          </span>
        )}
      </button>
    )
  }

  const dropdown = (
    <div
      ref={dropdownRef}
      className="fixed z-50 max-h-48 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
      style={{ top: dropdownPos.top, left: dropdownPos.left, transform: 'translateY(-100%)' }}
    >
      {filtered.length === 0 ? (
        <p className="px-3 py-2 text-xs text-gray-400">Nessun risultato</p>
      ) : (
        filtered.map(c => (
          <button
            key={c.id}
            onClick={() => { onAssign(contact.id, c.id); setOpen(false); setSearch('') }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">{c.last_name} {c.first_name}</span>
            {c.last_name?.toLowerCase() === contact.last_name?.toLowerCase() && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">stesso cognome</span>
            )}
            {c.member_type && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                c.member_type === 'giovane' ? 'bg-blue-100 text-blue-700' :
                c.member_type === 'adulto' ? 'bg-green-100 text-green-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {c.member_type === 'giovane' ? 'Giovane' : 'Adulto'}
              </span>
            )}
          </button>
        ))
      )}
    </div>
  )

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome..."
            className="w-full rounded border border-gray-300 py-1 pl-7 pr-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        {contact.parent_id && (
          <button
            onClick={() => { onAssign(contact.id, null); setOpen(false) }}
            className="rounded p-1 text-red-500 hover:bg-red-50 shrink-0"
            title="Rimuovi genitore"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {ReactDOM.createPortal(dropdown, document.body)}
    </div>
  )
}

/* ===== Contact Form ===== */
function ContactForm({ contact, contacts = [], onSaved, onCancel }) {
  const [form, setForm] = useState({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    contact_status: contact?.contact_status || 'nuovo',
    notes: contact?.notes || '',
    parent_id: contact?.parent_id || '',
    preferred_contact_method: contact?.preferred_contact_method || '',
    member_type: contact?.member_type || '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  // Possible parents: other contacts or any user that could be a parent
  const parentOptions = contacts.filter((c) => c.id !== contact?.id)

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
        payload.contact_status = payload.contact_status || 'nuovo'
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Metodo contatto preferito</label>
          <select value={form.preferred_contact_method || ''} onChange={(e) => set('preferred_contact_method', e.target.value)} className={inputClass}>
            <option value="">--</option>
            {CONTACT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Genitore</label>
          <select value={form.parent_id || ''} onChange={(e) => set('parent_id', e.target.value)} className={inputClass}>
            <option value="">-- Nessuno --</option>
            {parentOptions.map(p => <option key={p.id} value={p.id}>{p.last_name} {p.first_name}</option>)}
          </select>
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
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tipologia</label>
          <select value={form.member_type || ''} onChange={(e) => set('member_type', e.target.value)} className={inputClass}>
            <option value="">--</option>
            {MEMBER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
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

/* ===== Import CSV - riga per riga ===== */
function ImportContattiModal({ onDone, onCancel }) {
  const fileInputRef = useRef()
  const [step, setStep] = useState('upload') // upload | importing | done
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [results, setResults] = useState({ imported: 0, errors: [] })

  function handleDownloadTemplate() {
    const headers = IMPORT_CONTACT_COLUMNS.map(c => c.header)
    const exampleRow = ['Rossi', 'Maria', 'maria@email.com', '3331234567', 'Evento', 'Nuoto', 'nuovo', '']
    const csv = [headers.join(';'), exampleRow.map(v => `"${v}"`).join(';')].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_contatti.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setStep('importing')
    const errorsList = []
    let imported = 0

    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length < 2) {
        setResults({ imported: 0, errors: [{ row: 0, message: 'Il file deve avere almeno una riga di intestazione e una di dati' }] })
        setStep('done')
        return
      }

      const sep = lines[0].includes(';') ? ';' : ','
      const headers = lines[0].split(sep).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase())

      const colMap = {}
      for (const col of IMPORT_CONTACT_COLUMNS) {
        colMap[col.header.toLowerCase()] = col.field
      }
      colMap['cognome'] = 'last_name'
      colMap['nome'] = 'first_name'
      colMap['telefono'] = 'phone'
      colMap['stato'] = 'contact_status'
      colMap['note'] = 'notes'

      const totalRows = lines.length - 1
      setProgress({ current: 0, total: totalRows })

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(sep).map(v => v.replace(/^"|"$/g, '').trim())
        const row = {}
        headers.forEach((h, idx) => {
          const field = colMap[h]
          if (field && vals[idx]) row[field] = vals[idx]
        })

        if (!row.first_name && !row.last_name) {
          errorsList.push({ row: i + 1, message: 'Nome e cognome mancanti' })
          setProgress({ current: i, total: totalRows })
          continue
        }

        row.is_member = false
        row.contact_status = row.contact_status || 'nuovo'
        row.status = 'attivo'

        const { error } = await supabase.from('users').insert(row)
        if (error) {
          errorsList.push({ row: i + 1, message: error.message })
        } else {
          imported++
        }
        setProgress({ current: i, total: totalRows })
      }
    } catch (err) {
      errorsList.push({ row: 0, message: err.message })
    }

    setResults({ imported, errors: errorsList })
    setStep('done')
  }

  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="space-y-4">
      {step === 'upload' && (
        <>
          <p className="text-sm text-gray-600">
            Importa i contatti da un file CSV. Scarica prima il template per vedere il formato corretto delle colonne.
          </p>
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <button
              onClick={handleDownloadTemplate}
              className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileDown size={16} /> Scarica Template CSV
            </button>
            <div className="text-sm text-gray-500 mb-4">
              <p>Colonne supportate:</p>
              <p className="text-xs text-gray-400 mt-1">{IMPORT_CONTACT_COLUMNS.map(c => c.header).join(' | ')}</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
              <Upload size={16} /> Seleziona file CSV
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileSelected} className="hidden" />
            </label>
          </div>
          <div className="flex justify-end">
            <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Annulla</button>
          </div>
        </>
      )}

      {step === 'importing' && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Importazione in corso...</p>
          <div className="w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            {progress.current} / {progress.total} righe elaborate ({progressPercent}%)
          </p>
        </div>
      )}

      {step === 'done' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
            <CheckCircle2 size={20} className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Importazione completata: {results.imported} contatti importati
              </p>
              {results.errors.length > 0 && (
                <p className="text-sm text-red-600">{results.errors.length} errori riscontrati</p>
              )}
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-red-200 bg-red-50">
              <div className="p-3">
                <p className="mb-2 text-sm font-medium text-red-800">Dettaglio errori:</p>
                <div className="space-y-1">
                  {results.errors.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-red-700">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>
                        {err.row > 0 ? `Riga ${err.row}: ` : ''}{err.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onDone}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

