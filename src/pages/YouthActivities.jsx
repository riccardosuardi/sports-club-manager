import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Baby, Users, GraduationCap, Phone, Mail, Clock, MapPin, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getFullName, calculateAge, formatDate } from '../lib/utils'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'

export default function YouthActivities() {
  const navigate = useNavigate()
  const [minors, setMinors] = useState([])
  const [parents, setParents] = useState([])
  const [youthCourses, setYouthCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('minorenni')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [membersRes, coursesRes, enrollRes] = await Promise.all([
        supabase.from('users').select('*, parent:parent_id(id, first_name, last_name)').eq('is_member', true).order('last_name'),
        supabase.from('courses').select('*').eq('is_youth', true).order('name'),
        supabase.from('enrollments').select('*, member:member_id(id, first_name, last_name, is_minor), course:course_id(id, name, is_youth)').eq('status', 'attivo'),
      ])
      const allMembers = membersRes.data || []
      const minorsList = allMembers.filter(m => m.is_minor)
      setMinors(minorsList)

      const parentIds = new Set(minorsList.filter(m => m.parent_id).map(m => m.parent_id))
      setParents(allMembers.filter(m => parentIds.has(m.id) || m.member_type === 'genitore'))

      setYouthCourses(coursesRes.data || [])
      setEnrollments(enrollRes.data || [])
    } catch (err) {
      console.error('YouthActivities fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMinors = minors.filter(m =>
    !search || getFullName(m).toLowerCase().includes(search.toLowerCase())
  )

  const filteredParents = parents.filter(m =>
    !search || getFullName(m).toLowerCase().includes(search.toLowerCase())
  )

  const filteredCourses = youthCourses.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.sport || '').toLowerCase().includes(search.toLowerCase())
  )

  function getYouthEnrollmentCount(courseId) {
    return enrollments.filter(e => e.course_id === courseId).length
  }

  function getMinorChildren(parentId) {
    return minors.filter(m => m.parent_id === parentId)
  }

  if (loading) return <div className="py-12 text-center text-gray-500">Caricamento...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attività Giovanile</h1>
        <p className="text-sm text-gray-500">
          {minors.length} minorenni, {parents.length} genitori, {youthCourses.length} corsi giovanili
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {[
          { id: 'minorenni', label: `Minorenni (${minors.length})`, icon: Baby },
          { id: 'genitori', label: `Genitori (${parents.length})`, icon: Users },
          { id: 'corsi', label: `Corsi Giovanili (${youthCourses.length})`, icon: GraduationCap },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSearch('') }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            <t.icon size={16} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.split(' (')[0]}</span>
          </button>
        ))}
      </div>

      <div className="sm:w-80">
        <SearchInput value={search} onChange={setSearch} placeholder="Cerca..." />
      </div>

      {/* Tab: Minorenni */}
      {tab === 'minorenni' && (
        filteredMinors.length === 0 ? (
          <EmptyState icon={Baby} title="Nessun minorenne trovato" description="Non ci sono atleti minorenni registrati" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Atleta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Età</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Genitore</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Cert. Medico</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stato</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMinors.map(m => {
                  const age = calculateAge(m.date_of_birth)
                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium text-gray-900">{getFullName(m)}</p>
                        {m.membership_number && <p className="text-xs text-gray-500">Tessera: {m.membership_number}</p>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {age !== null ? `${age} anni` : '-'}
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 md:table-cell">
                        {m.parent ? (
                          <button onClick={() => navigate(`/atleti/${m.parent.id}`)} className="text-primary-600 hover:text-primary-700">
                            {getFullName(m.parent)}
                          </button>
                        ) : '-'}
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-sm md:table-cell">
                        {m.medical_certificate_expiry ? (
                          <span className={`${new Date(m.medical_certificate_expiry) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            {formatDate(m.medical_certificate_expiry)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge status={m.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button onClick={() => navigate(`/atleti/${m.id}`)} className="rounded-lg p-1.5 text-primary-600 hover:bg-primary-50" title="Dettagli">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Tab: Genitori */}
      {tab === 'genitori' && (
        filteredParents.length === 0 ? (
          <EmptyState icon={Users} title="Nessun genitore trovato" description="Non ci sono genitori registrati" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Genitore</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Contatti</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Figli</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParents.map(p => {
                  const children = getMinorChildren(p.id)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium text-gray-900">{getFullName(p)}</p>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
                        <div className="space-y-1 text-sm text-gray-600">
                          {p.email && <div className="flex items-center gap-1"><Mail size={12} /> {p.email}</div>}
                          {p.phone && <div className="flex items-center gap-1"><Phone size={12} /> {p.phone}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {children.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {children.map(c => (
                              <button
                                key={c.id}
                                onClick={() => navigate(`/atleti/${c.id}`)}
                                className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 hover:bg-primary-200"
                              >
                                {getFullName(c)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button onClick={() => navigate(`/atleti/${p.id}`)} className="rounded-lg p-1.5 text-primary-600 hover:bg-primary-50" title="Dettagli">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Tab: Corsi Giovanili */}
      {tab === 'corsi' && (
        filteredCourses.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Nessun corso giovanile"
            description="Crea un corso e contrassegnalo come 'Attività giovanile' nella sezione Corsi"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map(course => {
              const count = getYouthEnrollmentCount(course.id)
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
        )
      )}
    </div>
  )
}
