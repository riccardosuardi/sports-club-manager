import { useEffect, useState } from 'react'
import { GraduationCap, Users, Calendar, List, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, UserPlus, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns'
import { it } from 'date-fns/locale'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export default function YouthCourses() {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [coursesRes, enrollRes] = await Promise.all([
      supabase.from('courses').select('*').eq('is_youth', true).order('name'),
      supabase.from('enrollments').select('id, course_id, status').eq('status', 'attivo'),
    ])
    setCourses(coursesRes.data || [])
    setEnrollments(enrollRes.data || [])
    setLoading(false)
  }

  function getEnrollmentCount(courseId) {
    return enrollments.filter(e => e.course_id === courseId).length
  }

  const filtered = courses.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

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

  if (loading) return <div className="py-12 text-center text-gray-500">Caricamento...</div>

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Attività</h1>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">Attività Giovanile</span>
        </div>
        <p className="text-sm text-gray-500">{courses.length} attività giovanili</p>
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
          <SearchInput value={search} onChange={setSearch} placeholder="Cerca attività..." />
        </div>
      </div>

      {viewMode === 'calendar' ? (
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
                      <div key={c.id} className="block w-full truncate rounded px-1 py-0.5 text-left text-xs font-medium bg-blue-100 text-blue-800" title={c.name}>
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
        <EmptyState
          icon={GraduationCap}
          title="Nessuna attività giovanile"
          description="Crea un'attività e contrassegnala come 'Attività giovanile' nella sezione Attività"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Corso</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Periodo</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Iscritti</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Prezzo</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(course => {
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
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Giovanile</span>
                        <Badge status={course.is_active ? 'attivo' : 'sospeso'}>
                          {course.is_active ? 'Attivo' : 'Inattivo'}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
