import { useEffect, useState } from 'react'
import { Plus, GraduationCap, Users, Clock, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

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
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.sport || '').toLowerCase().includes(search.toLowerCase())
  )

  function getEnrollmentCount(courseId) {
    return enrollments.filter((e) => e.course_id === courseId && e.status === 'attivo').length
  }

  function getCourseEnrollments(courseId) {
    return enrollments.filter((e) => e.course_id === courseId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Corsi e Attivit&agrave;</h1>
          <p className="text-sm text-gray-500">{courses.length} corsi, {courses.filter(c => c.is_active).length} attivi</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus size={18} /> Nuovo Corso
        </button>
      </div>

      <div className="sm:w-80">
        <SearchInput value={search} onChange={setSearch} placeholder="Cerca corsi..." />
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Caricamento...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Nessun corso trovato" description="Crea il primo corso" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => {
            const count = getEnrollmentCount(course.id)
            return (
              <div key={course.id} className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.name}</h3>
                    {course.sport && <p className="text-xs text-gray-500">{course.sport}</p>}
                  </div>
                  <div className="flex gap-1.5">
                    {course.is_youth && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Giovanile</span>
                    )}
                    <Badge status={course.is_active ? 'attivo' : 'sospeso'}>
                      {course.is_active ? 'Attivo' : 'Inattivo'}
                    </Badge>
                  </div>
                </div>

                {course.description && <p className="mb-3 text-sm text-gray-600">{course.description}</p>}

                <div className="mb-4 space-y-1.5 text-sm text-gray-500">
                  {course.schedule && (
                    <div className="flex items-center gap-2"><Clock size={14} /> {course.schedule}</div>
                  )}
                  {course.location && (
                    <div className="flex items-center gap-2"><MapPin size={14} /> {course.location}</div>
                  )}
                  {course.instructor_name && (
                    <div className="flex items-center gap-2"><Users size={14} /> {course.instructor_name}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    {count}{course.max_participants ? ` / ${course.max_participants}` : ''} iscritti
                  </div>
                  {course.price && <p className="text-sm font-medium text-gray-700">&euro; {Number(course.price).toFixed(2)}</p>}
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <button onClick={() => { setSelectedCourse(course); setShowEnroll(true) }} className="text-xs text-primary-600 hover:text-primary-700">Iscrivi atleta</button>
                  <button onClick={() => setSelectedCourse(course)} className="text-xs text-gray-600 hover:text-gray-700">Iscritti</button>
                  <button onClick={() => { setEditing(course); setShowForm(true) }} className="text-xs text-gray-600 hover:text-gray-700">Modifica</button>
                  <button onClick={() => setDeleteTarget(course)} className="text-xs text-red-600 hover:text-red-700">Elimina</button>
                </div>
              </div>
            )
          })}
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
                  <button onClick={() => handleRemoveEnrollment(e.id)} className="text-xs text-red-600">Rimuovi</button>
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
    sport: course?.sport || '',
    instructor_name: course?.instructor_name || '',
    schedule: course?.schedule || '',
    location: course?.location || '',
    max_participants: course?.max_participants || '',
    season: course?.season || '',
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Sport</label>
          <input type="text" value={form.sport || ''} onChange={(e) => set('sport', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Istruttore</label>
          <input type="text" value={form.instructor_name || ''} onChange={(e) => set('instructor_name', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Orario</label>
          <input type="text" value={form.schedule || ''} onChange={(e) => set('schedule', e.target.value)} placeholder="Es. Lun/Mer 17:00-18:30" className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Luogo</label>
          <input type="text" value={form.location || ''} onChange={(e) => set('location', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Max Partecipanti</label>
          <input type="number" value={form.max_participants || ''} onChange={(e) => set('max_participants', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Stagione</label>
          <input type="text" value={form.season || ''} onChange={(e) => set('season', e.target.value)} placeholder="Es. 2025/2026" className={inputClass} />
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="rounded border-gray-300 text-primary-600" />
            <span>Corso attivo</span>
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
