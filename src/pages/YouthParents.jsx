import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Phone, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getFullName } from '../lib/utils'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'

export default function YouthParents() {
  const navigate = useNavigate()
  const [parents, setParents] = useState([])
  const [minors, setMinors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data: allMembers } = await supabase
      .from('users')
      .select('*')
      .eq('is_member', true)
      .order('last_name')

    const members = allMembers || []
    const minorsList = members.filter(m => m.is_minor)
    setMinors(minorsList)

    const parentIds = new Set(minorsList.filter(m => m.parent_id).map(m => m.parent_id))
    setParents(members.filter(m => parentIds.has(m.id) || m.member_type === 'genitore'))
    setLoading(false)
  }

  function getMinorChildren(parentId) {
    return minors.filter(m => m.parent_id === parentId)
  }

  const filtered = parents.filter(m =>
    !search || getFullName(m).toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="py-12 text-center text-gray-500">Caricamento...</div>

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Genitori</h1>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">Attività Giovanile</span>
        </div>
        <p className="text-sm text-gray-500">{parents.length} genitori registrati</p>
      </div>

      <div className="sm:w-80">
        <SearchInput value={search} onChange={setSearch} placeholder="Cerca genitori..." />
      </div>

      {filtered.length === 0 ? (
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
              {filtered.map(p => {
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
                      <button onClick={() => navigate(`/atleti/${p.id}`)} className="text-sm text-primary-600 hover:text-primary-700">
                        Dettagli
                      </button>
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
