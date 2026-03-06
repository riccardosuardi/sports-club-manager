import { useEffect, useState } from 'react'
import { Plus, GraduationCap, Pencil, Trash2, Columns3 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { CourseForm, ActivityBoard } from './Courses'

export default function MarketingActivities() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [boardCourse, setBoardCourse] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('courses').select('*').eq('activity_type', 'marketing').order('name')
    setCourses(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('courses').delete().eq('id', id)
    fetchData()
  }

  function formatTime(time) {
    if (!time) return ''
    return time.slice(0, 5)
  }

  const filtered = courses.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (boardCourse) {
    return <ActivityBoard course={boardCourse} onBack={() => setBoardCourse(null)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attività Marketing</h1>
          <p className="text-sm text-gray-500">{courses.length} attività</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700"
        >
          <Plus size={18} /> Nuova Attività Marketing
        </button>
      </div>

      <div className="sm:w-80">
        <SearchInput value={search} onChange={setSearch} placeholder="Cerca attività..." />
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Caricamento...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Nessuna attività marketing" description="Crea la prima attività marketing per gestire i partecipanti" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Attività</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Periodo</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Orario</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stato</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((course) => (
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
                    {course.start_time ? `${formatTime(course.start_time)}${course.end_time ? ` - ${formatTime(course.end_time)}` : ''}` : '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge status={course.is_active ? 'attivo' : 'sospeso'}>
                      {course.is_active ? 'Attivo' : 'Inattivo'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setBoardCourse(course)} className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50" title="Board partecipanti">
                        <Columns3 size={16} />
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Modifica Attività' : 'Nuova Attività Marketing'} size="md">
        <CourseForm course={editing} defaultActivityType="marketing" onSaved={() => { setShowForm(false); fetchData() }} onCancel={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Elimina Attività"
        message={`Sei sicuro di voler eliminare "${deleteTarget?.name}"?`}
        confirmLabel="Elimina"
        danger
      />
    </div>
  )
}
