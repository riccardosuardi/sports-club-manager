import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Baby, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getFullName, calculateAge, formatDate } from '../lib/utils'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'

export default function YouthAthletes() {
  const navigate = useNavigate()
  const [minors, setMinors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('*, parent:parent_id(id, first_name, last_name)')
      .eq('is_member', true)
      .eq('is_minor', true)
      .order('last_name')
    setMinors(data || [])
    setLoading(false)
  }

  const filtered = minors.filter(m =>
    !search || getFullName(m).toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="py-12 text-center text-gray-500">Caricamento...</div>

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Atleti</h1>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">Attività Giovanile</span>
        </div>
        <p className="text-sm text-gray-500">{minors.length} atleti minorenni</p>
      </div>

      <div className="sm:w-80">
        <SearchInput value={search} onChange={setSearch} placeholder="Cerca atleti..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Baby} title="Nessun atleta minorenne trovato" description="Non ci sono atleti minorenni registrati" />
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
              {filtered.map(m => {
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
      )}
    </div>
  )
}
