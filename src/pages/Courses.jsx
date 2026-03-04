import { useEffect, useState } from 'react'
import { Plus, GraduationCap, Users, Calendar, ChevronLeft, ChevronRight, List, Eye, Pencil, Trash2, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns'
import { it } from 'date-fns/locale'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showEnroll, setShowEnroll] = useState(false)
  const [enrollMemberId, setEnrollMemberId] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [coursesRes, enrollRes, membersRes] = await Promise.all([
      supabase.from('courses').select('*').order('name'),
      supabase.from('enrollments').select('*, member:member_id(first_name, last_name), course:course_id(name)'),
      supabase.from('users').select('id, first_name, last_name').eq('is_member', true).eq('status', 'attivo').order('last_name'),
    ])
    setCourses(coursesRes.data || [])
    setEnrollments(enrollRes.data || [])
    setMembers(membersRes.data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('courses').delete().eq('id', id)
    fetchData()
  }

  async function handleEnroll(courseId) {
    if (!enrollMemberId) return
    await supabase.from('enrollments').insert({ member_id: enrollMemberId, course_id: courseId })
    setShowEnroll(false)
    setEnrollMemberId('')
    fetchData()
  }

  async function handleRemoveEnrollment(enrollmentId) {
    await supabase.from('enrollments').delete().eq('id', enrollmentId)
    fetchData()
  }

  const filtered = courses.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  function getEnrollmentCount(courseId) {
    return enrollments.filter((e) => e.course_id === courseId && e.status === 'attivo').length
  }

  function getCourseEnrollments(courseId) {
    return enrollments.filter((e) => e.course_id === courseId)
  }

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOffset = (getDay(monthStart) + 6) % 7

  function getCoursesForDay(day) {
    return courses.filter((c) => {
      if (!c.start_date) return false
      const start = parseISO(c.start_date)
      const end = c.end_date ? parseISO(c.end_date) : start
      return (day >= start && day <= end) || isSameDay(day, start)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attivit&agrave;</h1>
          <p className="text-sm text-gray-500">{courses.length} corsi, {courses.filter(c => c.is_active).length} attivi</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus size={18} /> Nuovo Corso
        </button>
      </div>

      {/* View toggle + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <List size={16} /> Lista
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${viewMode === 'calendar' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Calendar size={16} /> Calendario
          </button>
        </div>
        <div className="sm:w-80">
          <SearchInput value={search} onChange={setSearch} placeholder="Cerca corsi..." />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Caricamento...</div>
      ) : viewMode === 'calendar' ? (
        /* Calendar view */
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
              const dayC = getCoursesForDay(day)
              const today = isToday(day)
              return (
                <div key={day.toISOString()} className={`min-h-24 border-b border-r border-gray-100 p-1 ${today ? 'bg-primary-50' : ''}`}>
                  <div className={`mb-1 text-right text-xs font-medium ${today ? 'text-primary-700' : 'text-gray-500'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayC.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className={`block w-full truncate rounded px-1 py-0.5 text-left text-xs font-medium ${
                          c.is_youth ? 'bg-blue-100 text-blue-800' : 'bg-primary-100 text-primary-800'
                        }`}
                        title={c.name}
                      >
                        {c.name}
                      </div>
                    ))}
                    {dayC.length > 3 && <div className="text-xs text-gray-500">+{dayC.length - 3} altri</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Nessun corso trovato" description="Crea il primo corso" />
      ) : (
        /* List view */
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Corso</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Periodo</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Iscritti</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Prezzo</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stato</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((course) => {
                const count = getEnrollmentCount(course.id)
                return (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{course.name}</p>
                        {course.description && <p className="text-xs text-gray-500 truncate max-w-xs">{course.description}</p>}
                      </div>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 md:table-cell">
                      {course.start_date ? format(parseISO(course.start_date), 'dd/MM/yyyy', { locale: it }) : '-'}
                      {course.end_date && course.end_date !== course.start_date && ` - ${format(parseISO(course.end_date), 'dd/MM/yyyy', { locale: it })}`}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 md:table-cell">
                      {count}{course.max_participants ? ` / ${course.max_participants}` : ''}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 md:table-cell">
                      {course.price ? `€ ${Number(course.price).toFixed(2)}` : '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex gap-1.5">
                        {course.is_youth && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Giovanile</span>
                        )}
                        <Badge status={course.is_active ? 'attivo' : 'sospeso'}>
                          {course.is_active ? 'Attivo' : 'Inattivo'}
                        </Badge>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setSelectedCourse(course); setShowEnroll(true) }} className="rounded-lg p-1.5 text-primary-600 hover:bg-primary-50" title="Iscrivi atleta">
                          <UserPlus size={16} />
                        </button>
                        <button onClick={() => setSelectedCourse(course)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" title="Vedi iscritti">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setEditing(course); setShowForm(true) }} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" title="Modifica">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteTarget(course)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Elimina">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Dettaglio iscritti */}
      {selectedCourse && !showEnroll && (
        <Modal open={true} onClose={() => setSelectedCourse(null)} title={`Iscritti - ${selectedCourse.name}`} size="md">
          {getCourseEnrollments(selectedCourse.id).length === 0 ? (
            <p className="text-sm text-gray-500">Nessun iscritto</p>
          ) : (
            <div className="space-y-2">
              {getCourseEnrollments(selectedCourse.id).map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                  <div>
                    <p className="text-sm font-medium">{e.member?.first_name} {e.member?.last_name}</p>
                    <Badge status={e.status} />
                  </div>
                  <button onClick={() => handleRemoveEnrollment(e.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Rimuovi">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Iscrivi atleta */}
      {showEnroll && selectedCourse && (
        <Modal open={true} onClose={() => { setShowEnroll(false); setSelectedCourse(null) }} title={`Iscrivi a ${selectedCourse.name}`} size="sm">
          <div className="space-y-4">
            <select
              value={enrollMemberId}
              onChange={(e) => setEnrollMemberId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            >
              <option value="">Seleziona atleta...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.last_name} {m.first_name}</option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowEnroll(false); setSelectedCourse(null) }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Annulla</button>
              <button onClick={() => handleEnroll(selectedCourse.id)} className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700">Iscrivi</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Form corso */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Modifica Corso' : 'Nuovo Corso'} size="md">
        <CourseForm course={editing} onSaved={() => { setShowForm(false); fetchData() }} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Elimina Corso"
        message={`Sei sicuro di voler eliminare "${deleteTarget?.name}"?`}
        confirmLabel="Elimina"
        danger
      />
    </div>
  )
}

function CourseForm({ course, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: course?.name || '',
    description: course?.description || '',
    start_date: course?.start_date || '',
    end_date: course?.end_date || '',
    max_participants: course?.max_participants || '',
    price: course?.price || '',
    is_active: course?.is_active ?? true,
    is_youth: course?.is_youth ?? false,
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = { ...form }
    for (const key of Object.keys(payload)) {
      if (payload[key] === '') payload[key] = null
    }
    if (payload.max_participants) payload.max_participants = parseInt(payload.max_participants)
    if (payload.price) payload.price = parseFloat(payload.price)

    try {
      if (course?.id) {
        const { error } = await supabase.from('courses').update(payload).eq('id', course.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('courses').insert(payload)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Nome Corso *</label>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Data Inizio</label>
          <input type="date" value={form.start_date || ''} onChange={(e) => set('start_date', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Data Fine</label>
          <input type="date" value={form.end_date || ''} onChange={(e) => set('end_date', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Max Partecipanti</label>
          <input type="number" value={form.max_participants || ''} onChange={(e) => set('max_participants', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Prezzo (&euro;)</label>
          <input type="number" step="0.01" value={form.price || ''} onChange={(e) => set('price', e.target.value)} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Descrizione</label>
          <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} rows={3} className={inputClass} />
        </div>
        <div>
          <label className="flex items-center gap-3 text-sm">
            <span className="font-medium text-gray-700">Corso attivo</span>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() => set('is_active', !form.is_active)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.is_active ? 'bg-primary-600' : 'bg-gray-200'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_youth} onChange={(e) => set('is_youth', e.target.checked)} className="rounded border-gray-300 text-primary-600" />
            <span>Attività giovanile</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Annulla</button>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Salvataggio...' : course ? 'Salva' : 'Crea Corso'}
        </button>
      </div>
    </form>
  )
}
