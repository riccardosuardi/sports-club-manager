import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, AlertTriangle, UserCheck, UserX } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, isCertificateExpired, isCertificateExpiringSoon, getFullName, calculateAge } from '../lib/utils'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import MemberForm from '../components/members/MemberForm'

export default function Members() {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('tutti')
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('members')
      .select('*, parent:parent_id(id, first_name, last_name)')
      .order('last_name')
    if (!error) setMembers(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('members').delete().eq('id', id)
    fetchMembers()
  }

  const filtered = members.filter((m) => {
    const matchesSearch =
      !search ||
      getFullName(m).toLowerCase().includes(search.toLowerCase()) ||
      (m.fiscal_code || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.membership_number || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'tutti' || m.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === 'attivo').length,
    expiredCerts: members.filter((m) => isCertificateExpired(m.medical_certificate_expiry)).length,
    expiringSoon: members.filter((m) => isCertificateExpiringSoon(m.medical_certificate_expiry)).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soci</h1>
          <p className="text-sm text-gray-500">{stats.total} soci registrati, {stats.active} attivi</p>
        </div>
        <button
          onClick={() => { setEditingMember(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus size={18} /> Nuovo Socio
        </button>
      </div>

      {/* Avvisi certificati */}
      {(stats.expiredCerts > 0 || stats.expiringSoon > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats.expiredCerts > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              <AlertTriangle size={16} />
              {stats.expiredCerts} certificati medici scaduti
            </div>
          )}
          {stats.expiringSoon > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
              <AlertTriangle size={16} />
              {stats.expiringSoon} certificati in scadenza (30 gg)
            </div>
          )}
        </div>
      )}

      {/* Filtri */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="sm:w-80">
          <SearchInput value={search} onChange={setSearch} placeholder="Cerca per nome, CF, tessera..." />
        </div>
        <div className="flex gap-2">
          {['tutti', 'attivo', 'sospeso', 'scaduto', 'cancellato'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`rounded-lg px-3 py-2 text-sm font-medium capitalize ${
                filterStatus === s
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tabella */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Caricamento...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nessun socio trovato"
          description={search ? 'Prova con una ricerca diversa' : 'Aggiungi il primo socio'}
          action={
            !search && (
              <button
                onClick={() => { setEditingMember(null); setShowForm(true) }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus size={16} /> Aggiungi Socio
              </button>
            )
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tessera</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Et&agrave;</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 lg:table-cell">Genitore</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stato</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Cert. Medico</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((member) => {
                const age = calculateAge(member.date_of_birth)
                const certExpired = isCertificateExpired(member.medical_certificate_expiry)
                const certExpiring = isCertificateExpiringSoon(member.medical_certificate_expiry)
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{getFullName(member)}</p>
                        {member.email && <p className="text-xs text-gray-500">{member.email}</p>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {member.membership_number || '-'}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 md:table-cell">
                      {age !== null ? `${age} anni` : '-'}
                      {member.is_minor && <span className="ml-1 text-xs text-orange-600">(minore)</span>}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 lg:table-cell">
                      {member.parent ? getFullName(member.parent) : '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge status={member.status} />
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 md:table-cell">
                      {member.medical_certificate_expiry ? (
                        <span className={`text-sm ${certExpired ? 'font-medium text-red-600' : certExpiring ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {formatDate(member.medical_certificate_expiry)}
                          {certExpired && ' (scaduto)'}
                          {certExpiring && ' (in scadenza)'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/soci/${member.id}`)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Dettagli
                        </button>
                        <button
                          onClick={() => { setEditingMember(member); setShowForm(true) }}
                          className="text-sm text-gray-600 hover:text-gray-700"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => setDeleteTarget(member)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Elimina
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

      {/* Modal form */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingMember ? 'Modifica Socio' : 'Nuovo Socio'}
        size="lg"
      >
        <MemberForm
          member={editingMember}
          members={members}
          onSaved={() => { setShowForm(false); fetchMembers() }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Conferma eliminazione */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Elimina Socio"
        message={`Sei sicuro di voler eliminare ${deleteTarget ? getFullName(deleteTarget) : ''}? Questa azione non può essere annullata.`}
        confirmLabel="Elimina"
        danger
      />
    </div>
  )
}
