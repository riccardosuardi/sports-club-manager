import { useEffect, useState, useRef } from 'react'
import { Plus, Users, AlertTriangle, Upload, Download, Eye, Pencil, Trash2, X, FileDown, CheckCircle2, AlertCircle, Calendar, Shield, Phone, Mail, MapPin, User, Trophy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, isCertificateExpired, isCertificateExpiringSoon, getFullName, calculateAge } from '../lib/utils'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Drawer from '../components/ui/Drawer'
import MemberForm from '../components/members/MemberForm'

const IMPORT_COLUMNS = [
  { header: 'Cognome', field: 'last_name' },
  { header: 'Nome', field: 'first_name' },
  { header: 'Codice Fiscale', field: 'fiscal_code' },
  { header: 'Data Nascita', field: 'date_of_birth' },
  { header: 'Genere', field: 'gender' },
  { header: 'Tipologia', field: 'member_type' },
  { header: 'Tessera', field: 'membership_number' },
  { header: 'Email', field: 'email' },
  { header: 'Telefono', field: 'phone' },
  { header: 'Indirizzo', field: 'address' },
  { header: 'Citt\u00e0', field: 'city' },
  { header: 'CAP', field: 'zip_code' },
  { header: 'Provincia', field: 'province' },
  { header: 'Stato', field: 'status' },
  { header: 'Scadenza Cert. Medico', field: 'medical_certificate_expiry' },
  { header: 'Tipo Cert. Medico', field: 'medical_certificate_type' },
  { header: 'Note', field: 'notes' },
]

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('tutti')
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [drawerMember, setDrawerMember] = useState(null)
  const [drawerData, setDrawerData] = useState({ enrollments: [], competitions: [], children: [] })

  useEffect(() => {
    fetchMembers()
  }, [])

  async function fetchMembers() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, fiscal_code, membership_number, member_type, date_of_birth, is_minor, status, medical_certificate_expiry, phone, gender, address, city, zip_code, province, notes, medical_certificate_type, created_at, parent_id, parent:parent_id(id, first_name, last_name)')
        .eq('is_member', true)
        .order('last_name')
      if (!error) setMembers(data || [])
    } catch (err) {
      console.error('Members fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function openDrawer(member) {
    setDrawerMember(member)
    const [enrollRes, compRes, childRes] = await Promise.all([
      supabase.from('enrollments').select('*, course:course_id(name, sport, schedule)').eq('member_id', member.id),
      supabase.from('competition_registrations').select('*, competition:competition_id(name, competition_date, location)').eq('member_id', member.id),
      supabase.from('users').select('id, first_name, last_name, date_of_birth, status').eq('parent_id', member.id),
    ])
    setDrawerData({
      enrollments: enrollRes.data || [],
      competitions: compRes.data || [],
      children: childRes.data || [],
    })
  }

  async function handleDelete(id) {
    await supabase.from('users').delete().eq('id', id)
    fetchMembers()
  }

  function handleExport() {
    const dateFields = ['date_of_birth', 'medical_certificate_expiry']
    const headers = IMPORT_COLUMNS.map(c => c.header)
    const rows = members.map(m => IMPORT_COLUMNS.map(c => {
      const val = m[c.field] || ''
      // Convert YYYY-MM-DD to DD/MM/YYYY for export
      if (dateFields.includes(c.field) && val && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        const [y, mo, d] = val.split('-')
        return `${d}/${mo}/${y}`
      }
      return val
    }))
    const csv = [headers.join(';'), ...rows.map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(';'))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `atleti_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Upload size={16} /> Importa CSV
          </button>
          <button
            onClick={() => { setEditingMember(null); setShowForm(true) }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus size={18} /> Nuovo Atleta
          </button>
        </div>
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
                          onClick={() => openDrawer(member)}
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

      {/* Modal importazione */}
      <Modal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importa Atleti da CSV"
        size="lg"
      >
        <ImportAtletiModal
          onDone={() => { setShowImportModal(false); fetchMembers() }}
          onCancel={() => setShowImportModal(false)}
        />
      </Modal>

      {/* Conferma eliminazione */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Elimina Atleta"
        message={`Sei sicuro di voler eliminare ${deleteTarget ? getFullName(deleteTarget) : ''}? Questa azione non pu\u00f2 essere annullata.`}
        confirmLabel="Elimina"
        danger
      />

      {/* Drawer dettaglio */}
      <Drawer open={!!drawerMember} onClose={() => setDrawerMember(null)} title={drawerMember ? getFullName(drawerMember) : ''} width="max-w-xl">
        {drawerMember && (
          <MemberDrawerContent
            member={drawerMember}
            enrollments={drawerData.enrollments}
            competitions={drawerData.competitions}
            children={drawerData.children}
            onEdit={() => { setEditingMember(drawerMember); setShowForm(true) }}
            onOpenChild={(child) => openDrawer(child)}
          />
        )}
      </Drawer>
    </div>
  )
}

function MemberDrawerContent({ member, enrollments, competitions, children: memberChildren, onEdit, onOpenChild }) {
  const age = calculateAge(member.date_of_birth)
  const certExpired = isCertificateExpired(member.medical_certificate_expiry)
  const certExpiring = isCertificateExpiringSoon(member.medical_certificate_expiry)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Tessera: {member.membership_number || 'N/A'}</p>
          <div className="mt-1 flex gap-2">
            <Badge status={member.status} />
            {member.member_type && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">{member.member_type}</span>}
          </div>
        </div>
        <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700">
          <Pencil size={14} /> Modifica
        </button>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-700">Informazioni</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {member.date_of_birth && <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /><span>{formatDate(member.date_of_birth)} ({age} anni)</span></div>}
          {member.email && <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span>{member.email}</span></div>}
          {member.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /><span>{member.phone}</span></div>}
          {(member.address || member.city) && <div className="flex items-center gap-2 col-span-2"><MapPin size={14} className="text-gray-400" /><span>{[member.address, member.city, member.province].filter(Boolean).join(', ')}</span></div>}
        </div>
      </div>

      {/* Certificato Medico */}
      <div className={`rounded-lg border p-4 ${certExpired ? 'border-red-200 bg-red-50' : certExpiring ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Shield size={14} /> Certificato Medico
        </h4>
        <p className={`text-sm ${certExpired ? 'text-red-700 font-medium' : certExpiring ? 'text-yellow-700' : 'text-gray-600'}`}>
          {member.medical_certificate_expiry ? formatDate(member.medical_certificate_expiry) : 'Non inserito'}
          {certExpired && ' - SCADUTO'}
          {certExpiring && ' - In scadenza'}
        </p>
      </div>

      {/* Figli */}
      {memberChildren.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Figli / Minori ({memberChildren.length})</h4>
          <div className="space-y-2">
            {memberChildren.map(c => (
              <button key={c.id} onClick={() => onOpenChild(c)} className="flex w-full items-center justify-between rounded-lg border border-gray-100 p-2 text-left hover:bg-gray-50">
                <span className="text-sm font-medium">{getFullName(c)}</span>
                <span className="text-xs text-gray-500">{c.date_of_birth ? `${calculateAge(c.date_of_birth)} anni` : ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Corsi */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-700">Corsi Iscritti ({enrollments.length})</h4>
        {enrollments.length === 0 ? (
          <p className="text-sm text-gray-400">Nessuna iscrizione</p>
        ) : (
          <div className="space-y-2">
            {enrollments.map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-2">
                <div>
                  <p className="text-sm font-medium">{e.course?.name}</p>
                  <p className="text-xs text-gray-500">{e.course?.sport} - {e.course?.schedule}</p>
                </div>
                <Badge status={e.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gare */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Trophy size={14} /> Gare ({competitions.length})
        </h4>
        {competitions.length === 0 ? (
          <p className="text-sm text-gray-400">Nessuna gara</p>
        ) : (
          <div className="space-y-2">
            {competitions.map(r => (
              <div key={r.id} className="rounded-lg border border-gray-100 p-2">
                <p className="text-sm font-medium">{r.competition?.name}</p>
                <p className="text-xs text-gray-500">
                  {r.competition?.competition_date ? formatDate(r.competition.competition_date) : ''} - {r.competition?.location || ''}
                </p>
                {r.result && <p className="mt-1 text-xs text-primary-600">Risultato: {r.result}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ImportAtletiModal({ onDone, onCancel }) {
  const fileInputRef = useRef()
  const [step, setStep] = useState('upload') // upload | importing | done
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [results, setResults] = useState({ imported: 0, errors: [] })

  function handleDownloadTemplate() {
    const headers = IMPORT_COLUMNS.map(c => c.header)
    const exampleRow = ['Rossi', 'Mario', 'RSSMRA90A01H501Z', '01/01/1990', 'M', 'adulto', '001', 'mario@email.com', '3331234567', 'Via Roma 1', 'Milano', '20100', 'MI', 'attivo', '31/12/2025', 'agonistico', '']
    const csv = [headers.join(';'), exampleRow.map(v => `"${v}"`).join(';')].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_atleti.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setStep('importing')
    const errorsList = []
    let imported = 0

    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length < 2) {
        setResults({ imported: 0, errors: [{ row: 0, message: 'Il file deve avere almeno una riga di intestazione e una di dati' }] })
        setStep('done')
        return
      }

      const sep = lines[0].includes(';') ? ';' : ','
      const headers = lines[0].split(sep).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase())

      const colMap = {}
      for (const col of IMPORT_COLUMNS) {
        colMap[col.header.toLowerCase()] = col.field
      }
      // Extra aliases
      colMap['cognome'] = 'last_name'
      colMap['nome'] = 'first_name'
      colMap['codice fiscale'] = 'fiscal_code'
      colMap['data nascita'] = 'date_of_birth'
      colMap['genere'] = 'gender'
      colMap['tipologia'] = 'member_type'
      colMap['tessera'] = 'membership_number'
      colMap['telefono'] = 'phone'
      colMap['indirizzo'] = 'address'
      colMap['citt\u00e0'] = 'city'
      colMap['cap'] = 'zip_code'
      colMap['provincia'] = 'province'
      colMap['stato'] = 'status'
      colMap['note'] = 'notes'

      const totalRows = lines.length - 1
      setProgress({ current: 0, total: totalRows })

      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(sep).map(v => v.replace(/^"|"$/g, '').trim())
        const row = {}
        headers.forEach((h, idx) => {
          const field = colMap[h]
          if (field && vals[idx]) row[field] = vals[idx]
        })

        if (!row.first_name && !row.last_name) {
          errorsList.push({ row: i + 1, message: 'Nome e cognome mancanti' })
          setProgress({ current: i, total: totalRows })
          continue
        }

        // Parse European date format DD/MM/YYYY to YYYY-MM-DD for date fields
        for (const dateField of ['date_of_birth', 'medical_certificate_expiry']) {
          if (row[dateField]) {
            const val = row[dateField].trim()
            const ddmmyyyy = val.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
            if (ddmmyyyy) {
              row[dateField] = `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`
            }
            // If already YYYY-MM-DD, leave as is
          }
        }

        row.is_member = true
        row.status = row.status || 'attivo'

        const { error } = await supabase.from('users').insert(row)
        if (error) {
          errorsList.push({ row: i + 1, message: error.message })
        } else {
          imported++
        }
        setProgress({ current: i, total: totalRows })
      }
    } catch (err) {
      errorsList.push({ row: 0, message: err.message })
    }

    setResults({ imported, errors: errorsList })
    setStep('done')
  }

  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="space-y-4">
      {step === 'upload' && (
        <>
          <p className="text-sm text-gray-600">
            Importa i tuoi atleti da un file CSV. Scarica prima il template per vedere il formato corretto delle colonne.
          </p>
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <button
              onClick={handleDownloadTemplate}
              className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FileDown size={16} /> Scarica Template CSV
            </button>
            <div className="text-sm text-gray-500 mb-4">
              <p>Colonne supportate:</p>
              <p className="text-xs text-gray-400 mt-1">{IMPORT_COLUMNS.map(c => c.header).join(' | ')}</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
              <Upload size={16} /> Seleziona file CSV
              <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileSelected} className="hidden" />
            </label>
          </div>
          <div className="flex justify-end">
            <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Annulla</button>
          </div>
        </>
      )}

      {step === 'importing' && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Importazione in corso...</p>
          <div className="w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-primary-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">
            {progress.current} / {progress.total} righe elaborate ({progressPercent}%)
          </p>
        </div>
      )}

      {step === 'done' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
            <CheckCircle2 size={20} className="text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Importazione completata: {results.imported} atleti importati
              </p>
              {results.errors.length > 0 && (
                <p className="text-sm text-red-600">{results.errors.length} errori riscontrati</p>
              )}
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-red-200 bg-red-50">
              <div className="p-3">
                <p className="mb-2 text-sm font-medium text-red-800">Dettaglio errori:</p>
                <div className="space-y-1">
                  {results.errors.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-red-700">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>
                        {err.row > 0 ? `Riga ${err.row}: ` : ''}{err.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={onDone}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
