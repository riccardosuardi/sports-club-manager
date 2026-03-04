import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, GraduationCap, AlertTriangle, Megaphone, Calendar, Cake } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, isCertificateExpired, isCertificateExpiringSoon, getFullName, calculateAge } from '../lib/utils'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentMembers, setRecentMembers] = useState([])
  const [expiringCerts, setExpiringCerts] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [upcomingCompetitions, setUpcomingCompetitions] = useState([])
  const [todayBirthdays, setTodayBirthdays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboard() }, [])

  async function fetchDashboard() {
    setLoading(true)
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
    const todayDay = String(today.getDate()).padStart(2, '0')

    const [
      membersRes,
      recentMembersRes,
      expiringCertsRes,
      birthdayRes,
      coursesRes,
      enrollmentsRes,
      contactsRes,
      ordersRes,
      competitionsRes,
    ] = await Promise.all([
      // Only fetch fields needed for stats
      supabase.from('users').select('id, status, is_minor, medical_certificate_expiry').eq('is_member', true),
      // Recent 5 members
      supabase.from('users').select('id, first_name, last_name, email, status, created_at').eq('is_member', true).order('created_at', { ascending: false }).limit(5),
      // Expiring certs (next 30 days + already expired)
      supabase.from('users').select('id, first_name, last_name, medical_certificate_expiry').eq('is_member', true).not('medical_certificate_expiry', 'is', null).lte('medical_certificate_expiry', new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0]).order('medical_certificate_expiry').limit(10),
      // Today birthdays
      supabase.from('users').select('id, first_name, last_name, date_of_birth').eq('is_member', true).like('date_of_birth', `%-${todayMonth}-${todayDay}`),
      supabase.from('courses').select('id, is_active'),
      supabase.from('enrollments').select('id, status'),
      supabase.from('users').select('id, contact_status').eq('is_member', false),
      supabase.from('clothing_orders').select('*, member:member_id(first_name, last_name), item:item_id(name)').in('status', ['richiesto', 'ordinato']).order('ordered_at', { ascending: false }).limit(5),
      supabase.from('competitions').select('id, name, competition_date, status, location, city, sport').gte('competition_date', todayStr).order('competition_date').limit(5),
    ])

    const members = membersRes.data || []
    const courses = coursesRes.data || []
    const enrollments = enrollmentsRes.data || []
    const contacts = contactsRes.data || []

    setStats({
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'attivo').length,
      minors: members.filter(m => m.is_minor).length,
      activeCourses: courses.filter(c => c.is_active).length,
      activeEnrollments: enrollments.filter(e => e.status === 'attivo').length,
      newContacts: contacts.filter(c => c.contact_status === 'nuovo').length,
      expiredCerts: members.filter(m => isCertificateExpired(m.medical_certificate_expiry)).length,
      expiringSoon: members.filter(m => isCertificateExpiringSoon(m.medical_certificate_expiry)).length,
    })

    setRecentMembers(recentMembersRes.data || [])

    const certData = expiringCertsRes.data || []
    setExpiringCerts(
      certData
        .filter(m => isCertificateExpired(m.medical_certificate_expiry) || isCertificateExpiringSoon(m.medical_certificate_expiry))
        .slice(0, 5)
    )

    setTodayBirthdays(birthdayRes.data || [])
    setPendingOrders(ordersRes.data || [])
    setUpcomingCompetitions(competitionsRes.data || [])
    setLoading(false)
  }

  if (loading) return <div className="py-12 text-center text-gray-500">Caricamento dashboard...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Panoramica dell'associazione sportiva</p>
      </div>

      {/* Compleanni di oggi */}
      {todayBirthdays.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Cake className="text-yellow-600" size={20} />
            <h3 className="text-sm font-semibold text-yellow-800">
              Compleanni di oggi ({todayBirthdays.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {todayBirthdays.map(m => (
              <button
                key={m.id}
                onClick={() => navigate(`/atleti/${m.id}`)}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm hover:shadow"
              >
                <span className="font-medium text-gray-900">{getFullName(m)}</span>
                {m.date_of_birth && (
                  <span className="text-xs text-gray-500">{calculateAge(m.date_of_birth)} anni</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Statistiche */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Atleti Attivi" value={stats.activeMembers} subtext={`${stats.totalMembers} totali, ${stats.minors} minori`} color="primary" />
        <StatCard icon={GraduationCap} label="Corsi Attivi" value={stats.activeCourses} subtext={`${stats.activeEnrollments} iscrizioni attive`} color="green" />
        <StatCard icon={AlertTriangle} label="Certificati Scaduti" value={stats.expiredCerts} subtext={`${stats.expiringSoon} in scadenza`} color="red" />
        <StatCard icon={Megaphone} label="Nuovi Contatti" value={stats.newContacts} color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Ultimi atleti */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Ultimi Atleti Aggiunti</h3>
            <button onClick={() => navigate('/atleti')} className="text-sm text-primary-600 hover:text-primary-700">Vedi tutti</button>
          </div>
          {recentMembers.length === 0 ? (
            <p className="text-sm text-gray-500">Nessun atleta ancora</p>
          ) : (
            <div className="space-y-3">
              {recentMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/atleti/${m.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                      {m.first_name[0]}{m.last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getFullName(m)}</p>
                      <p className="text-xs text-gray-500">Aggiunto {formatDate(m.created_at)}</p>
                    </div>
                  </div>
                  <Badge status={m.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificati in scadenza */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Certificati Medici</h3>
            <button onClick={() => navigate('/atleti')} className="text-sm text-primary-600 hover:text-primary-700">Gestisci</button>
          </div>
          {expiringCerts.length === 0 ? (
            <p className="text-sm text-green-600">Tutti i certificati sono in regola</p>
          ) : (
            <div className="space-y-3">
              {expiringCerts.map(m => {
                const expired = isCertificateExpired(m.medical_certificate_expiry)
                return (
                  <div key={m.id} className={`flex items-center justify-between rounded-lg p-3 ${expired ? 'bg-red-50' : 'bg-yellow-50'}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getFullName(m)}</p>
                      <p className="text-xs text-gray-500">Scadenza: {formatDate(m.medical_certificate_expiry)}</p>
                    </div>
                    <span className={`text-xs font-medium ${expired ? 'text-red-600' : 'text-yellow-600'}`}>
                      {expired ? 'Scaduto' : 'In scadenza'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Prossime gare */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Prossime Gare</h3>
            <button onClick={() => navigate('/gare')} className="text-sm text-primary-600 hover:text-primary-700">Calendario</button>
          </div>
          {upcomingCompetitions.length === 0 ? (
            <p className="text-sm text-gray-500">Nessuna gara in programma</p>
          ) : (
            <div className="space-y-3">
              {upcomingCompetitions.map(c => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-700">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(c.competition_date)}
                        {c.city && ` · ${c.city}`}
                        {c.sport && ` · ${c.sport}`}
                      </p>
                    </div>
                  </div>
                  <Badge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ordini abbigliamento in attesa */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Ordini Abbigliamento in Attesa</h3>
            <button onClick={() => navigate('/abbigliamento')} className="text-sm text-primary-600 hover:text-primary-700">Vedi tutti</button>
          </div>
          {pendingOrders.length === 0 ? (
            <p className="text-sm text-gray-500">Nessun ordine in attesa</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Atleta</th>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Articolo</th>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Stato</th>
                    <th className="pb-2 text-left text-xs font-medium text-gray-500">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingOrders.map(o => (
                    <tr key={o.id}>
                      <td className="py-2 text-sm">{o.member?.first_name} {o.member?.last_name}</td>
                      <td className="py-2 text-sm">{o.item?.name} ({o.size})</td>
                      <td className="py-2"><Badge status={o.status} /></td>
                      <td className="py-2 text-sm text-gray-500">{formatDate(o.ordered_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
