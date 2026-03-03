import { useEffect, useState } from 'react'
import { Plus, Calendar, MapPin, Clock, Users, Trophy, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
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
  sport: '',
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
  category: '',
  notes: '',
  is_home: false,
}

export default function Competitions() {
  const { hasRole } = useAuth()
  const canManage = hasRole('admin') || hasRole('segreteria') || hasRole('istruttore')

  const [competitions, setCompetitions] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' | 'list'
  const [filterStatus, setFilterStatus] = useState('tutti')
  const [search, setSearch] = useState('')

  // Modals
  const [showForm, setShowForm] = useState(false)
  const [editingComp, setEditingComp] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedComp, setSelectedComp] = useState(null)
  const [showRegistrations, setShowRegistrations] = useState(false)
  const [registrations, setRegistrations] = useState([])
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  async function fetchData() {
    setLoading(true)
    const [compRes, membersRes] = await Promise.all([
      supabase.from('competitions').select('*').order('competition_date', { ascending: true }),
      supabase.from('persone').select('id, first_name, last_name, member_type').eq('is_member', true).eq('status', 'attivo').order('last_name'),
    ])
    if (!compRes.error) setCompetitions(compRes.data || [])
    if (!membersRes.error) setMembers(membersRes.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchRegistrations(competitionId) {
    const { data } = await supabase
      .from('competition_registrations')
      .select('*, member:member_id(id, first_name, last_name, member_type)')
      .eq('competition_id', competitionId)
      .order('registered_at')
    setRegistrations(data || [])
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
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.sport || '').toLowerCase().includes(search.toLowerCase()) || (c.city || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'tutti' || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Calendario
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  // getDay() returns 0 for Sunday; shift to Monday-first
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
          <button
            onClick={() => { setEditingComp(null); setShowForm(true) }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus size={18} /> Nuova Gara
          </button>
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
            <SearchInput value={search} onChange={setSearch} placeholder="Cerca gara, sport, città..." />
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
          {/* Month navigation */}
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

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium uppercase text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for offset */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-24 border-b border-r border-gray-100 bg-gray-50 p-1" />
            ))}
            {calendarDays.map((day) => {
              const dayComps = getCompetitionsForDay(day)
              const today = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-24 border-b border-r border-gray-100 p-1 ${today ? 'bg-primary-50' : ''}`}
                >
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
                      {comp.sport && (
                        <span className="inline-flex items-center gap-1">
                          <Trophy size={14} />
                          {comp.sport}
                        </span>
                      )}
                      {comp.category && (
                        <span className="text-xs font-medium text-gray-600">Cat: {comp.category}</span>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedComp(comp); setShowRegistrations(true); fetchRegistrations(comp.id) }}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Iscritti
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => { setEditingComp(comp); setShowForm(true) }}
                          className="text-sm text-gray-600 hover:text-gray-700"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => setDeleteTarget(comp)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Elimina
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
          onSaved={() => { setShowForm(false); fetchData() }}
          onCancel={() => setShowForm(false)}
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
            {/* Info gara */}
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                <span>{formatDate(selectedComp.competition_date)}</span>
                {selectedComp.location && <span>{selectedComp.location}</span>}
                {selectedComp.city && <span>{selectedComp.city}</span>}
                <Badge status={selectedComp.status} />
              </div>
            </div>

            {/* Iscrizioni */}
            {registrations.length === 0 ? (
              <p className="text-sm text-gray-500">Nessun iscritto a questa gara</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="pb-2 text-left text-xs font-medium text-gray-500">Socio</th>
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
                              placeholder="Es. 1° posto"
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
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Rimuovi
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Iscrivi socio */}
            {canManage && (
              <button
                onClick={() => setShowEnrollModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus size={16} /> Iscrivi Socio
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Modal iscrizione socio a gara */}
      <Modal
        open={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Iscrivi Socio alla Gara"
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

// ---- Form Gara ----
function CompetitionForm({ competition, onSaved, onCancel }) {
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
  const labelClass = 'mb-1 block text-sm font-medium text-gray-700'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome Gara *</label>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sport</label>
          <input type="text" value={form.sport || ''} onChange={(e) => set('sport', e.target.value)} className={inputClass} placeholder="Es. Nuoto, Atletica..." />
        </div>
        <div>
          <label className={labelClass}>Categoria</label>
          <input type="text" value={form.category || ''} onChange={(e) => set('category', e.target.value)} className={inputClass} placeholder="Es. Esordienti, Cadetti..." />
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
        <div>
          <label className={labelClass}>Data Fine (se più giorni)</label>
          <input type="date" value={form.competition_end_date || ''} onChange={(e) => set('competition_end_date', e.target.value)} className={inputClass} />
        </div>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Impianto/Luogo</label>
          <input type="text" value={form.location || ''} onChange={(e) => set('location', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Indirizzo</label>
          <input type="text" value={form.address || ''} onChange={(e) => set('address', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Città</label>
          <input type="text" value={form.city || ''} onChange={(e) => set('city', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Provincia</label>
          <input type="text" value={form.province || ''} onChange={(e) => set('province', e.target.value)} maxLength={2} className={inputClass} />
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
        <div className="flex items-end">
          <label className="flex items-center gap-2 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_home}
              onChange={(e) => set('is_home', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium text-gray-700">Gara in casa</span>
          </label>
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

// ---- Form iscrizione socio a gara ----
function EnrollMemberForm({ members, registrations, onEnroll, onCancel }) {
  const [memberId, setMemberId] = useState('')
  const [category, setCategory] = useState('')

  const registeredIds = new Set(registrations.map((r) => r.member_id))
  const availableMembers = members.filter((m) => !registeredIds.has(m.id))

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Socio *</label>
        <select
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        >
          <option value="">Seleziona socio...</option>
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
