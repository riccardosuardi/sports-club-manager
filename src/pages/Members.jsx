import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, AlertTriangle, Upload, Download, Eye, Pencil, Trash2 } from 'lucide-react'
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
  const fileInputRef = useRef()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('tutti')
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*, parent:parent_id(id, first_name, last_name)')
      .eq('is_member', true)
      .order('last_name')
    if (!error) setMembers(data || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    await supabase.from('users').delete().eq('id', id)
    fetchMembers()
  }

  function handleExport() {
    const headers = ['Cognome', 'Nome', 'Codice Fiscale', 'Data Nascita', 'Genere', 'Tipologia', 'Tessera', 'Email', 'Telefono', 'Indirizzo', 'Città', 'CAP', 'Provincia', 'Stato', 'Scadenza Cert. Medico', 'Tipo Cert. Medico', 'Note']
    const rows = members.map(m => [
      m.last_name || '', m.first_name || '', m.fiscal_code || '', m.date_of_birth || '',
      m.gender || '', m.member_type || '', m.membership_number || '', m.email || '',
      m.phone || '', m.address || '', m.city || '', m.zip_code || '', m.province || '',
      m.status || '', m.medical_certificate_expiry || '', m.medical_certificate_type || '', m.notes || '',
    ])
    const csv = [headers.join(';'), ...rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(';'))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `atleti_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleBulkImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length < 2) throw new Error('Il file deve avere almeno una riga di intestazione e una di dati')

      const sep = lines[0].includes(';') ? ';' : ','
      const headers = lines[0].split(sep).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase())

      const colMap = {
        cognome: 'last_name', nome: 'first_name', 'codice fiscale': 'fiscal_code',
        'data nascita': 'date_of_birth', genere: 'gender', tipologia: 'member_type',
        tessera: 'membership_number', email: 'email', telefono: 'phone',
        indirizzo: 'address', 'città': 'city', cap: 'zip_code', provincia: 'province',
        stato: 'status', note: 'notes',
      }

      let imported = 0
      let errors = 0

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(sep).map(v => v.replace(/^"|"$/g, '').trim())
        const row = {}
        headers.forEach((h, idx) => {
          const field = colMap[h]
          if (field && vals[idx]) row[field] = vals[idx]
        })

        if (!row.first_name && !row.last_name) { errors++; continue }

        row.is_member = true
        row.status = row.status || 'attivo'

        const { error } = await supabase.from('users').insert(row)
        if (error) errors++
        else imported++
      }

      setImportResult({ imported, errors })
      fetchMembers()
    } catch (err) {
      setImportResult({ imported: 0, errors: 0, message: err.message })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Atleti</h1>
          <p className="text-sm text-gray-500">{stats.total} atleti registrati, {stats.active} attivi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download size={16} /> Esporta
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Upload size={16} /> {importing ? 'Importazione...' : 'Importa CSV'}
            <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleBulkImport} className="hidden" disabled={importing} />
          </label>
          <button
            onClick={() => { setEditingMember(null); setShowForm(true) }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus size={18} /> Nuovo Atleta
          </button>
        </div>
      </div>

      {/* Risultato importazione */}
      {importResult && (
        <div className={`rounded-lg p-3 text-sm ${importResult.message ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {importResult.message
            ? `Errore: ${importResult.message}`
            : `Importazione completata: ${importResult.imported} atleti importati${importResult.errors > 0 ? `, ${importResult.errors} errori` : ''}`
          }
          <button onClick={() => setImportResult(null)} className="ml-2 underline">Chiudi</button>
        </div>
      )}

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
          title="Nessun atleta trovato"
          description={search ? 'Prova con una ricerca diversa' : 'Aggiungi il primo atleta'}
          action={
            !search && (
              <button
                onClick={() => { setEditingMember(null); setShowForm(true) }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus size={16} /> Aggiungi Atleta
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
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Tipo</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 md:table-cell">Età</th>
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
                    <td className="hidden whitespace-nowrap px-4 py-3 text-sm capitalize text-gray-600 md:table-cell">
                      {member.member_type || '-'}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-gray-600 md:table-cell">
                      {age !== null ? `${age} anni` : '-'}
                      {member.is_minor && <span className="ml-1 text-xs text-blue-600">(giovanile)</span>}
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
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => navigate(`/atleti/${member.id}`)}
                          className="rounded-lg p-1.5 text-primary-600 hover:bg-primary-50"
                          title="Dettagli"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => { setEditingMember(member); setShowForm(true) }}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                          title="Modifica"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(member)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          title="Elimina"
                        >
                          <Trash2 size={16} />
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
        title={editingMember ? 'Modifica Atleta' : 'Nuovo Atleta'}
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
        title="Elimina Atleta"
        message={`Sei sicuro di voler eliminare ${deleteTarget ? getFullName(deleteTarget) : ''}? Questa azione non può essere annullata.`}
        confirmLabel="Elimina"
        danger
      />
    </div>
  )
}
