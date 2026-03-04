import { useEffect, useState } from 'react'
import { GraduationCap, Users, Clock, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'

export default function YouthCourses() {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.sport || '').toLowerCase().includes(search.toLowerCase())
  )

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

      <div className="sm:w-80">
        <SearchInput value={search} onChange={setSearch} placeholder="Cerca attività..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nessuna attività giovanile"
          description="Crea un'attività e contrassegnala come 'Attività giovanile' nella sezione Attività"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(course => {
            const count = getEnrollmentCount(course.id)
            return (
              <div key={course.id} className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.name}</h3>
                    {course.sport && <p className="text-xs text-gray-500">{course.sport}</p>}
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Giovanile</span>
                    <Badge status={course.is_active ? 'attivo' : 'sospeso'}>
                      {course.is_active ? 'Attivo' : 'Inattivo'}
                    </Badge>
                  </div>
                </div>
                {course.description && <p className="mb-3 text-sm text-gray-600">{course.description}</p>}
                <div className="space-y-1.5 text-sm text-gray-500">
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
