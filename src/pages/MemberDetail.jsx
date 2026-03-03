import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, User, Calendar, Shield, Phone, Mail, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, calculateAge, isCertificateExpired, isCertificateExpiringSoon, getFullName } from '../lib/utils'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import MemberForm from '../components/members/MemberForm'

export default function MemberDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [children, setChildren] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    setLoading(true)
    const [memberRes, childrenRes, enrollRes, allRes] = await Promise.all([
      supabase.from('users').select('*, parent:parent_id(id, first_name, last_name)').eq('id', id).single(),
      supabase.from('users').select('id, first_name, last_name, date_of_birth, status').eq('parent_id', id),
      supabase.from('enrollments').select('*, course:course_id(name, sport, schedule)').eq('member_id', id),
      supabase.from('users').select('id, first_name, last_name, is_minor'),
    ])
    if (memberRes.data) setMember(memberRes.data)
    setChildren(childrenRes.data || [])
    setEnrollments(enrollRes.data || [])
    setAllMembers(allRes.data || [])
    setLoading(false)
  }

  if (loading) return <div className="py-12 text-center text-gray-500">Caricamento...</div>
  if (!member) return <div className="py-12 text-center text-gray-500">Atleta non trovato</div>

  const age = calculateAge(member.date_of_birth)
  const certExpired = isCertificateExpired(member.medical_certificate_expiry)
  const certExpiring = isCertificateExpiringSoon(member.medical_certificate_expiry)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/atleti')} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{getFullName(member)}</h1>
          <p className="text-sm text-gray-500">Tessera: {member.membership_number || 'N/A'}</p>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Edit size={16} /> Modifica
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info principali */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Informazioni Personali</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={User} label="Nome completo" value={getFullName(member)} />
            <InfoRow icon={Calendar} label="Data di nascita" value={member.date_of_birth ? `${formatDate(member.date_of_birth)} (${age} anni)` : '-'} />
            <InfoRow icon={Mail} label="Email" value={member.email || '-'} />
            <InfoRow icon={Phone} label="Telefono" value={member.phone || '-'} />
            <InfoRow icon={MapPin} label="Indirizzo" value={[member.address, member.city, member.province, member.zip_code].filter(Boolean).join(', ') || '-'} />
            <InfoRow icon={User} label="Codice Fiscale" value={member.fiscal_code || '-'} />
          </div>
        </div>

        {/* Stato */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Stato</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Stato atleta</p>
                <Badge status={member.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Iscrizione</p>
                <p className="text-sm">{formatDate(member.membership_start)} - {formatDate(member.membership_end)}</p>
              </div>
              {member.is_minor && (
                <div>
                  <p className="text-xs text-gray-500">Minorenne</p>
                  <p className="text-sm">Genitore: {member.parent ? getFullName(member.parent) : 'Non assegnato'}</p>
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-lg border p-6 ${certExpired ? 'border-red-200 bg-red-50' : certExpiring ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              <Shield size={18} className="mr-2 inline" />
              Certificato Medico
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Scadenza</p>
                <p className={`text-sm font-medium ${certExpired ? 'text-red-700' : certExpiring ? 'text-yellow-700' : 'text-gray-900'}`}>
                  {member.medical_certificate_expiry ? formatDate(member.medical_certificate_expiry) : 'Non inserito'}
                  {certExpired && ' - SCADUTO'}
                  {certExpiring && ' - In scadenza'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tipo</p>
                <p className="text-sm capitalize">{member.medical_certificate_type?.replace('_', ' ') || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Figli */}
      {children.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Figli/Minori associati</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => navigate(`/atleti/${child.id}`)}
                className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                  {child.first_name[0]}{child.last_name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{getFullName(child)}</p>
                  <p className="text-xs text-gray-500">
                    {child.date_of_birth ? `${calculateAge(child.date_of_birth)} anni` : ''} <Badge status={child.status} />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Corsi iscritti */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Corsi Iscritti</h3>
        {enrollments.length === 0 ? (
          <p className="text-sm text-gray-500">Nessuna iscrizione a corsi</p>
        ) : (
          <div className="space-y-3">
            {enrollments.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{e.course?.name}</p>
                  <p className="text-xs text-gray-500">{e.course?.sport} - {e.course?.schedule}</p>
                </div>
                <Badge status={e.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Modifica Atleta" size="lg">
        <MemberForm member={member} members={allMembers} onSaved={() => { setShowEdit(false); fetchData() }} onCancel={() => setShowEdit(false)} />
      </Modal>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  )
}
