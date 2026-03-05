import { useEffect, useState, useRef } from 'react'
import { Plus, Calendar, MapPin, Clock, Users, Trophy, ChevronLeft, ChevronRight, Filter, Upload, Eye, Pencil, Trash2, FileDown, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, getFullName } from '../lib/utils'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns'
import { it } from 'date-fns/locale'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useAuth } from '../context/AuthContext'

const STATUS_OPTIONS = [
  { value: 'programmata', label: 'Programmata' },
  { value: 'iscrizioni_aperte', label: 'Iscrizioni Aperte' },
  { value: 'iscrizioni_chiuse', label: 'Iscrizioni Chiuse' },
  { value: 'in_corso', label: 'In Corso' },
  { value: 'completata', label: 'Completata' },
  { value: 'annullata', label: 'Annullata' },
]

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

const EMPTY_COMPETITION = {
  name: '',
  description: '',
  competition_date: '',
  competition_end_date: '',
  start_time: '',
  end_time: '',
  location: '',
  address: '',
  city: '',
  province: '',
  status: 'programmata',
  max_participants: '',
  registration_deadline: '',
  notes: '',
  is_home: false,
}

const IMPORT_COLUMNS = [
  { header: 'Nome', field: 'name' },
  { header: 'Data Gara', field: 'competition_date' },
  { header: 'Data Fine', field: 'competition_end_date' },
  { header: 'Ora Inizio', field: 'start_time' },
  { header: 'Ora Fine', field: 'end_time' },
  { header: 'Luogo', field: 'location' },
  { header: 'Indirizzo', field: 'address' },
  { header: 'Citt\u00e0', field: 'city' },
  { header: 'Provincia', field: 'province' },
  { header: 'Stato', field: 'status' },
  { header: 'Descrizione', field: 'description' },
  { header: 'Note', field: 'notes' },
  { header: 'Max Partecipanti', field: 'max_participants' },
  { header: 'Scadenza Iscrizioni', field: 'registration_deadline' },
]

export default function Competitions() {
  const { hasRole } = useAuth()
  const canManage = hasRole('admin') || hasRole('segreteria') || hasRole('istruttore')

  const [competitions, setCompetitions] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar')
  const [filterStatus, setFilterStatus] = useState('tutti')
  const [search, setSearch] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)

  // Modals
  const [showForm, setShowForm] = useState(false)
  const [editingComp, setEditingComp] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedComp, setSelectedComp] = useState(null)
  const [showRegistrations, setShowRegistrations] = useState(false)
  const [registrations, setRegistrations] = useState([])
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  // Association settings for home auto-fill
  const [assocSettings, setAssocSettings] = useState(null)

  async function fetchData() {
    setLoading(true)
    try {
      const [compRes, membersRes, assocRes] = await Promise.all([
        supabase.from('competitions').select('id, name, description, competition_date, competition_end_date, start_time, end_time, location, address, city, province, status, max_participants, registration_deadline, notes, is_home, sport').order('competition_date', { ascending: true }),
        supabase.from('users').select('id, first_name, last_name, member_type').eq('is_member', true).eq('status', 'attivo').order('last_name'),
        supabase.from('association_settings').select('*').limit(1).maybeSingle(),
      ])
      if (!compRes.error) setCompetitions(compRes.data || [])
      if (!membersRes.error) setMembers(membersRes.data || [])
      if (assocRes.data) setAssocSettings(assocRes.data)
    } catch (err) {
      console.error('Competitions fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchRegistrations(competitionId) {
    try {
      const { data } = await supabase
        .from('competition_registrations')
        .select('*, member:member_id(id, first_name, last_name, member_type)')
        .eq('competition_id', competitionId)
        .order('registered_at')
      setRegistrations(data || [])
    } catch (err) {
      console.error('Registrations fetch error:', err)
    }
  }

  async function handleDelete(id) {
    await supabase.from('competitions').delete().eq('id', id)
    fetchData()
  }

  async function handleEnrollMember(competitionId, memberId, category) {
    const { error } = await supabase.from('competition_registrations').insert({
      competition_id: competitionId,
      member_id: memberId,
      category,
    })
    if (!error) {
      fetchRegistrations(competitionId)
    }
  }

  async function handleRemoveRegistration(regId, competitionId) {
    await supabase.from('competition_registrations').delete().eq('id', regId)
    fetchRegistrations(competitionId)
  }

  async function handleUpdateResult(regId, result, competitionId) {
    await supabase.from('competition_registrations').update({ result }).eq('id', regId)
    fetchRegistrations(competitionId)
  }

  // Filtri
  const filtered = competitions.filter((c) => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.city || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'tutti' || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calendario
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOffset = (getDay(monthStart) + 6) % 7

  function getCompetitionsForDay(day) {
    return competitions.filter((c) => {
      const start = parseISO(c.competition_date)
      const end = c.competition_end_date ? parseISO(c.competition_end_date) : start
      return day >= start && day <= end || isSameDay(day, start)
    })
  }

  if (loading) return <div className="py-12 text-center text-gray-500">Caricamento gare...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario Gare</h1>
          <p className="text-sm text-gray-500">
            {competitions.length} gare totali, {competitions.filter((c) => c.status === 'iscrizioni_aperte').length} con iscrizioni aperte
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Upload size={16} /> Importa CSV
            </button>
            <button
              onClick={() => { setEditingComp(null); setShowForm(true) }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus size={18} /> Nuova Gara
            </button>
          </div>
        )}
      </div>

      {/* View toggle + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${viewMode === 'calendar' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Calendar size={16} /> Calendario
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Filter size={16} /> Lista
          </button>
        </div>
        <div className="flex gap-3">
          <div className="sm:w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="Cerca gara, citt\u00e0..." />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            <option value="tutti">Tutti gli stati</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar view */}
      {viewMode === 'calendar' && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="rounded-lg p-2 hover:bg-gray-100">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold capitalize text-gray-900">
              {format(currentMonth, 'MMMM yyyy', { locale: it })}
            </h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="rounded-lg p-2 hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 border-b border-gray-200">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium uppercase text-gray-500">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-24 border-b border-r border-gray-100 bg-gray-50 p-1" />
            ))}
            {calendarDays.map((day) => {
              const dayComps = getCompetitionsForDay(day)
              const today = isToday(day)
              return (
                <div key={day.toISOString()} className={`min-h-24 border-b border-r border-gray-100 p-1 ${today ? 'bg-primary-50' : ''}`}>
                  <div className={`mb-1 text-right text-xs font-medium ${today ? 'text-primary-700' : 'text-gray-500'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayComps.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedComp(c); setShowRegistrations(true); fetchRegistrations(c.id) }}
                        className={`block w-full truncate rounded px-1 py-0.5 text-left text-xs font-medium ${
                          c.is_home
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                        }`}
                        title={c.name}
                      >
                        {c.start_time && <span className="mr-1">{c.start_time.slice(0, 5)}</span>}
                        {c.name}
                      </button>
                    ))}
                    {dayComps.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayComps.length - 3} altre</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        filtered.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Nessuna gara trovata"
            description={search ? 'Prova con una ricerca diversa' : 'Aggiungi la prima gara al calendario'}
            action={
              canManage && !search && (
                <button
                  onClick={() => { setEditingComp(null); setShowForm(true) }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  <Plus size={16} /> Nuova Gara
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((comp) => (
              <div key={comp.id} className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">{comp.name}</h3>
                      {comp.is_home && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Casa</span>
                      )}
                      <Badge status={comp.status} />
                    </div>
                    {comp.description && <p className="mt-1 text-sm text-gray-600">{comp.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(comp.competition_date)}
                        {comp.competition_end_date && comp.competition_end_date !== comp.competition_date && ` - ${formatDate(comp.competition_end_date)}`}
                      </span>
                      {comp.start_time && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} />
                          {comp.start_time.slice(0, 5)}{comp.end_time && ` - ${comp.end_time.slice(0, 5)}`}
                        </span>
                      )}
                      {(comp.location || comp.city) && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={14} />
                          {[comp.location, comp.city].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {comp.max_participants && (
                        <span className="inline-flex items-center gap-1">
                          <Users size={14} />
                          Max {comp.max_participants}
                        </span>
                      )}
                    </div>
                    {comp.registration_deadline && (
                      <p className="mt-1 text-xs text-orange-600">
                        Scadenza iscrizioni: {formatDate(comp.registration_deadline)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setSelectedComp(comp); setShowRegistrations(true); fetchRegistrations(comp.id) }}
                      className="rounded-lg p-1.5 text-primary-600 hover:bg-primary-50"
                      title="Iscritti"
                    >
                      <Eye size={16} />
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => { setEditingComp(comp); setShowForm(true) }}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                          title="Modifica"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(comp)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          title="Elimina"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Form gara */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingComp ? 'Modifica Gara' : 'Nuova Gara'}
        size="lg"
      >
        <CompetitionForm
          competition={editingComp}
          assocSettings={assocSettings}
          onSaved={() => { setShowForm(false); fetchData() }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Modal importazione gare */}
      <Modal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importa Gare da CSV"
        size="lg"
      >
        <ImportGareModal
          onDone={() => { setShowImportModal(false); fetchData() }}
          onCancel={() => setShowImportModal(false)}
        />
      </Modal>

      {/* Dettaglio iscrizioni gara */}
      <Modal
        open={showRegistrations}
        onClose={() => setShowRegistrations(false)}
        title={selectedComp ? `Iscritti - ${selectedComp.name}` : 'Iscritti'}
        size="lg"
      >
        {selectedComp && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                <span>{formatDate(selectedComp.competition_date)}</span>
                {selectedComp.location && <span>{selectedComp.location}</span>}
                {selectedComp.city && <span>{selectedComp.city}</span>}
                <Badge status={selectedComp.status} />
              </div>
            </div>

            {registrations.length === 0 ? (
              <p className="text-sm text-gray-500">Nessun iscritto a questa gara</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="pb-2 text-left text-xs font-medium text-gray-500">Atleta</th>
                      <th className="pb-2 text-left text-xs font-medium text-gray-500">Tipo</th>
                      <th className="pb-2 text-left text-xs font-medium text-gray-500">Categoria</th>
                      <th className="pb-2 text-left text-xs font-medium text-gray-500">Risultato</th>
                      {canManage && <th className="pb-2 text-right text-xs font-medium text-gray-500">Azioni</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td className="py-2 text-sm font-medium text-gray-900">
                          {reg.member ? getFullName(reg.member) : '-'}
                        </td>
                        <td className="py-2 text-sm text-gray-600 capitalize">
                          {reg.member?.member_type || '-'}
                        </td>
                        <td className="py-2 text-sm text-gray-600">{reg.category || '-'}</td>
                        <td className="py-2">
                          {canManage ? (
                            <input
                              type="text"
                              defaultValue={reg.result || ''}
                              onBlur={(e) => handleUpdateResult(reg.id, e.target.value, selectedComp.id)}
                              placeholder="Es. 1\u00B0 posto"
                              className="w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                            />
                          ) : (
                            <span className="text-sm text-gray-600">{reg.result || '-'}</span>
                          )}
                        </td>
                        {canManage && (
                          <td className="py-2 text-right">
                            <button
                              onClick={() => handleRemoveRegistration(reg.id, selectedComp.id)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                              title="Rimuovi"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {canManage && (
              <button
                onClick={() => setShowEnrollModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus size={16} /> Iscrivi Atleta
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Modal iscrizione atleta a gara */}
      <Modal
        open={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Iscrivi Atleta alla Gara"
        size="sm"
      >
        <EnrollMemberForm
          members={members}
          registrations={registrations}
          onEnroll={(memberId, category) => {
            handleEnrollMember(selectedComp?.id, memberId, category)
            setShowEnrollModal(false)
          }}
          onCancel={() => setShowEnrollModal(false)}
        />
      </Modal>

      {/* Conferma eliminazione */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Elimina Gara"
        message={`Sei sicuro di voler eliminare "${deleteTarget?.name}"? Tutte le iscrizioni associate verranno eliminate.`}
        confirmLabel="Elimina"
        danger
      />
    </div>
  )
}

// ---- Form Gara (with multi-day checkbox like Activities) ----
function CompetitionForm({ competition, assocSettings, onSaved, onCancel }) {
  const [form, setForm] = useState(
    competition
      ? {
          ...EMPTY_COMPETITION,
          ...competition,
          competition_date: competition.competition_date || '',
          competition_end_date: competition.competition_end_date || '',
          start_time: competition.start_time || '',
          end_time: competition.end_time || '',
          registration_deadline: competition.registration_deadline || '',
          max_participants: competition.max_participants || '',
        }
      : EMPTY_COMPETITION
  )
  const [multiDay, setMultiDay] = useState(!!(competition?.competition_end_date && competition.competition_end_date !== competition.competition_date))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleMultiDayToggle(checked) {
    setMultiDay(checked)
    if (!checked) set('competition_end_date', '')
  }

  function handleHomeToggle(checked) {
    set('is_home', checked)
    if (checked && assocSettings) {
      setForm(prev => ({
        ...prev,
        is_home: true,
        location: assocSettings.name || prev.location,
        address: assocSettings.address || prev.address,
        city: assocSettings.city || prev.city,
        province: assocSettings.province || prev.province,
      }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = { ...form }
    if (!multiDay) payload.competition_end_date = null
    for (const key of Object.keys(payload)) {
      if (payload[key] === '') payload[key] = null
    }
    if (payload.max_participants) payload.max_participants = parseInt(payload.max_participants, 10)
    delete payload.created_at
    delete payload.updated_at

    try {
      if (competition?.id) {
        const { error } = await supabase.from('competitions').update(payload).eq('id', competition.id)
        if (error) throw error
      } else {
        delete payload.id
        const { error } = await supabase.from('competitions').insert(payload)
        if (error) throw error
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'
  const disabledInputClass = 'w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500'
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700'
  const isHomeLocked = form.is_home

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome Gara *</label>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Descrizione</label>
        <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} rows={2} className={inputClass} />
      </div>

      <h4 className="text-sm font-semibold text-gray-900">Date e Orari</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Data Gara *</label>
          <input type="date" value={form.competition_date} onChange={(e) => set('competition_date', e.target.value)} required className={inputClass} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={multiDay} onChange={(e) => handleMultiDayToggle(e.target.checked)} className="rounded border-gray-300 text-primary-600" />
            <span className="text-gray-700">Per pi&ugrave; giorni</span>
          </label>
        </div>
        {multiDay && (
          <div className="sm:col-span-2">
            <label className={labelClass}>Data Fine</label>
            <input type="date" value={form.competition_end_date || ''} onChange={(e) => set('competition_end_date', e.target.value)} min={form.competition_date || undefined} className={inputClass} />
          </div>
        )}
        <div>
          <label className={labelClass}>Ora Inizio</label>
          <input type="time" value={form.start_time || ''} onChange={(e) => set('start_time', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Ora Fine</label>
          <input type="time" value={form.end_time || ''} onChange={(e) => set('end_time', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Scadenza Iscrizioni</label>
          <input type="date" value={form.registration_deadline || ''} onChange={(e) => set('registration_deadline', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Max Partecipanti</label>
          <input type="number" value={form.max_participants || ''} onChange={(e) => set('max_participants', e.target.value)} min="1" className={inputClass} />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-gray-900">Luogo</h4>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <label className="flex items-center gap-3 text-sm">
          <button
            type="button"
            role="switch"
            aria-checked={form.is_home}
            onClick={() => handleHomeToggle(!form.is_home)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.is_home ? 'bg-green-600' : 'bg-gray-200'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${form.is_home ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="font-medium text-gray-700">Gara in casa</span>
          {form.is_home && <span className="text-xs text-green-600">(campi compilati automaticamente)</span>}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Impianto/Luogo</label>
          <input type="text" value={form.location || ''} onChange={(e) => set('location', e.target.value)} className={isHomeLocked ? disabledInputClass : inputClass} readOnly={isHomeLocked} />
        </div>
        <div>
          <label className={labelClass}>Indirizzo</label>
          <input type="text" value={form.address || ''} onChange={(e) => set('address', e.target.value)} className={isHomeLocked ? disabledInputClass : inputClass} readOnly={isHomeLocked} />
        </div>
        <div>
          <label className={labelClass}>Citt&agrave;</label>
          <input type="text" value={form.city || ''} onChange={(e) => set('city', e.target.value)} className={isHomeLocked ? disabledInputClass : inputClass} readOnly={isHomeLocked} />
        </div>
        <div>
          <label className={labelClass}>Provincia</label>
          <input type="text" value={form.province || ''} onChange={(e) => set('province', e.target.value)} maxLength={2} className={isHomeLocked ? disabledInputClass : inputClass} readOnly={isHomeLocked} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Stato</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Note</label>
        <textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={2} className={inputClass} />
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Annulla
        </button>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Salvataggio...' : competition ? 'Salva Modifiche' : 'Crea Gara'}
        </button>
      </div>
    </form>
  )
}

// ---- Import Gare Modal ----
function ImportGareModal({ onDone, onCancel }) {
  const fileInputRef = useRef()
  const [step, setStep] = useState('upload')
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [results, setResults] = useState({ imported: 0, errors: [] })

  function handleDownloadTemplate() {
    const headers = IMPORT_COLUMNS.map(c => c.header)
    const exampleRow = ['Campionato Regionale', '15/03/2025', '', '09:00', '18:00', 'Palazzetto dello Sport', 'Via Roma 1', 'Milano', 'MI', 'programmata', 'Campionato regionale cat. assoluti', '', '50', '10/03/2025']
    const csv = [headers.join(';'), exampleRow.map(v => `"${v}"`).join(';')].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_gare.csv'
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
      for (const col of IMPORT_COLUMNS) {
        colMap[col.header.toLowerCase()] = col.field
      }
      // Extra aliases
      colMap['nome'] = 'name'
      colMap['data gara'] = 'competition_date'
      colMap['data fine'] = 'competition_end_date'
      colMap['ora inizio'] = 'start_time'
      colMap['ora fine'] = 'end_time'
      colMap['luogo'] = 'location'
      colMap['indirizzo'] = 'address'
      colMap['citt\u00e0'] = 'city'
      colMap['provincia'] = 'province'
      colMap['stato'] = 'status'
      colMap['descrizione'] = 'description'
      colMap['note'] = 'notes'
      colMap['max partecipanti'] = 'max_participants'
      colMap['scadenza iscrizioni'] = 'registration_deadline'

      const totalRows = lines.length - 1
      setProgress({ current: 0, total: totalRows })

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(sep).map(v => v.replace(/^"|"$/g, '').trim())
        const row = {}
        headers.forEach((h, idx) => {
          const field = colMap[h]
          if (field && vals[idx]) row[field] = vals[idx]
        })

        if (!row.name) {
          errorsList.push({ row: i + 1, message: 'Nome gara mancante' })
          setProgress({ current: i, total: totalRows })
          continue
        }

        // Parse European date format DD/MM/YYYY to YYYY-MM-DD for date fields
        for (const dateField of ['competition_date', 'competition_end_date', 'registration_deadline']) {
          if (row[dateField]) {
            const val = row[dateField].trim()
            const ddmmyyyy = val.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
            if (ddmmyyyy) {
              row[dateField] = `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`
            }
          }
        }

        row.status = row.status || 'programmata'
        if (row.max_participants) row.max_participants = parseInt(row.max_participants, 10)

        const { error } = await supabase.from('competitions').insert(row)
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
            Importa le gare da un file CSV. Scarica prima il template per vedere il formato corretto delle colonne.
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
              <p className="text-xs text-gray-400 mt-1">{IMPORT_COLUMNS.map(c => c.header).join(' | ')}</p>
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
                Importazione completata: {results.imported} gare importate
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

// ---- Form iscrizione atleta a gara ----
function EnrollMemberForm({ members, registrations, onEnroll, onCancel }) {
  const [memberId, setMemberId] = useState('')
  const [category, setCategory] = useState('')

  const registeredIds = new Set(registrations.map((r) => r.member_id))
  const availableMembers = members.filter((m) => !registeredIds.has(m.id))

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Atleta *</label>
        <select
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">Seleziona atleta...</option>
          {availableMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.last_name} {m.first_name} {m.member_type ? `(${m.member_type})` : ''}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Categoria Gara</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Es. Esordienti A, Cadetti..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        />
      </div>
      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Annulla
        </button>
        <button
          onClick={() => { if (memberId) onEnroll(memberId, category || null) }}
          disabled={!memberId}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          Iscrivi
        </button>
      </div>
    </div>
  )
}
