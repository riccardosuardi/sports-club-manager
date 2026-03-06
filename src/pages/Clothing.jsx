import { useEffect, useState } from 'react'
import { Plus, Shirt, Package, Pencil, Trash2, UserPlus, Undo2, ImagePlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDate, getFullName } from '../lib/utils'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function Clothing() {
  const [items, setItems] = useState([])
  const [inventory, setInventory] = useState([])
  const [assignments, setAssignments] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('inventario')
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [assignItem, setAssignItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [itemsRes, inventoryRes, assignmentsRes, membersRes] = await Promise.all([
        supabase.from('clothing_items').select('*').order('name'),
        supabase.from('clothing_inventory').select('*'),
        supabase.from('clothing_assignments').select('*, member:member_id(first_name, last_name), item:item_id(name, category)').order('assigned_at', { ascending: false }),
        supabase.from('users').select('id, first_name, last_name').eq('is_member', true).eq('status', 'attivo').order('last_name'),
      ])
      setItems(itemsRes.data || [])
      setInventory(inventoryRes.data || [])
      setAssignments(assignmentsRes.data || [])
      setMembers(membersRes.data || [])
    } catch (err) {
      console.error('Clothing fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteItem(id) {
    await supabase.from('clothing_items').delete().eq('id', id)
    fetchData()
  }

  async function handleReturnAssignment(assignmentId) {
    await supabase.from('clothing_assignments').update({ returned_at: new Date().toISOString().slice(0, 10) }).eq('id', assignmentId)
    fetchData()
  }

  function getItemInventory(itemId) {
    return inventory.filter(inv => inv.item_id === itemId)
  }

  function getItemAssignments(itemId) {
    return assignments.filter(a => a.item_id === itemId && !a.returned_at)
  }

  function getTotalQuantity(itemId) {
    return getItemInventory(itemId).reduce((sum, inv) => sum + inv.quantity, 0)
  }

  function getAssignedCount(itemId) {
    return getItemAssignments(itemId).length
  }

  const filteredItems = items.filter((i) =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredAssignments = assignments.filter((a) =>
    !search || (a.member?.last_name || '').toLowerCase().includes(search.toLowerCase()) || (a.item?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abbigliamento</h1>
          <p className="text-sm text-gray-500">
            {items.length} articoli, {assignments.filter(a => !a.returned_at).length} capi assegnati
          </p>
        </div>
        <div className="flex gap-2">
          {tab === 'inventario' && (
            <button onClick={() => { setEditingItem(null); setShowItemForm(true) }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
              <Plus size={18} /> Nuovo Articolo
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button onClick={() => setTab('inventario')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${tab === 'inventario' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Inventario ({items.length})
        </button>
        <button onClick={() => setTab('assegnazioni')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${tab === 'assegnazioni' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Assegnazioni ({assignments.filter(a => !a.returned_at).length})
        </button>
      </div>

      <div className="sm:w-80">
        <SearchInput value={search} onChange={setSearch} placeholder={tab === 'inventario' ? 'Cerca articoli...' : 'Cerca assegnazioni...'} />
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Caricamento...</div>
      ) : tab === 'inventario' ? (
        filteredItems.length === 0 ? (
          <EmptyState icon={Shirt} title="Nessun articolo" description="Aggiungi il primo articolo all'inventario" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => {
              const itemInv = getItemInventory(item.id)
              const totalQty = getTotalQuantity(item.id)
              const assignedCount = getAssignedCount(item.id)
              return (
                <div key={item.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                  <div className="cursor-pointer" onClick={() => setSelectedItem(item)}>
                    {item.image_url && (
                      <div className="h-40 w-full bg-gray-100">
                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="px-5 pt-5 pb-2">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 break-words">{item.name}</h3>
                          {item.category && <p className="text-xs text-gray-500">{item.category}</p>}
                        </div>
                        {item.price && <span className="shrink-0 text-lg font-bold text-gray-900">&euro; {Number(item.price).toFixed(2)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                  {item.description && <p className="mb-3 text-sm text-gray-600">{item.description}</p>}

                  {/* Taglie con quantit\u00e0 */}
                  {item.available_sizes?.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-1.5 text-xs font-medium text-gray-500">Taglie disponibili</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.available_sizes.map((size) => {
                          const inv = itemInv.find(i => i.size === size)
                          const qty = inv ? inv.quantity : 0
                          return (
                            <span key={size} className={`rounded-md px-2 py-1 text-xs font-medium ${qty > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-400'}`}>
                              {size} <span className="font-bold">({qty})</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mb-3 flex gap-4 text-xs text-gray-500">
                    <span>Totale: <strong className="text-gray-700">{totalQty}</strong></span>
                    <span>Assegnati: <strong className="text-gray-700">{assignedCount}</strong></span>
                    <span>Disponibili: <strong className={totalQty - assignedCount > 0 ? 'text-green-700' : 'text-red-600'}>{totalQty - assignedCount}</strong></span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <Badge status={item.is_available ? 'attivo' : 'sospeso'}>
                      {item.is_available ? 'Disponibile' : 'Non disponibile'}
                    </Badge>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setAssignItem(item); setShowAssignForm(true) }}
                        className="rounded-lg p-1.5 text-primary-600 hover:bg-primary-50"
                        title="Assegna ad atleta"
                      >
                        <UserPlus size={16} />
                      </button>
                      <button onClick={() => { setEditingItem(item); setShowItemForm(true) }} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100" title="Modifica">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(item)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Elimina">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Assegnazioni tab */
        filteredAssignments.length === 0 ? (
          <EmptyState icon={Package} title="Nessuna assegnazione" description="Assegna capi di abbigliamento agli atleti dall'inventario" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Atleta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Articolo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Taglia</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Data Assegnazione</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stato</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Note</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{a.member ? `${a.member.first_name} ${a.member.last_name}` : '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{a.item?.name || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{a.size}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{formatDate(a.assigned_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {a.returned_at ? (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Restituito {formatDate(a.returned_at)}</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Assegnato</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{a.notes || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {!a.returned_at && (
                        <button
                          onClick={() => handleReturnAssignment(a.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-orange-600 hover:bg-orange-50"
                          title="Segna come restituito"
                        >
                          <Undo2 size={14} /> Restituisci
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Dettaglio articolo */}
      {selectedItem && (
        <Modal open={true} onClose={() => setSelectedItem(null)} title={`Dettaglio - ${selectedItem.name}`} size="md">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Assegnazioni attive</h4>
              {getItemAssignments(selectedItem.id).length === 0 ? (
                <p className="text-sm text-gray-500">Nessuna assegnazione attiva</p>
              ) : (
                <div className="space-y-2">
                  {getItemAssignments(selectedItem.id).map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                      <div>
                        <p className="text-sm font-medium">{a.member ? `${a.member.first_name} ${a.member.last_name}` : '-'}</p>
                        <p className="text-xs text-gray-500">Taglia: {a.size} - Assegnato il {formatDate(a.assigned_at)}</p>
                      </div>
                      <button onClick={() => { handleReturnAssignment(a.id) }} className="text-xs text-orange-600 hover:text-orange-700">Restituisci</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Form articolo */}
      <Modal open={showItemForm} onClose={() => setShowItemForm(false)} title={editingItem ? 'Modifica Articolo' : 'Nuovo Articolo'} size="md">
        <ClothingItemForm
          item={editingItem}
          inventory={editingItem ? getItemInventory(editingItem.id) : []}
          onSaved={() => { setShowItemForm(false); fetchData() }}
          onCancel={() => setShowItemForm(false)}
        />
      </Modal>

      {/* Form assegnazione */}
      <Modal open={showAssignForm} onClose={() => setShowAssignForm(false)} title={`Assegna - ${assignItem?.name || ''}`} size="sm">
        {assignItem && (
          <AssignForm
            item={assignItem}
            members={members}
            onSaved={() => { setShowAssignForm(false); fetchData() }}
            onCancel={() => setShowAssignForm(false)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDeleteItem(deleteTarget?.id)}
        title="Elimina Articolo"
        message={`Eliminare "${deleteTarget?.name}"?`}
        confirmLabel="Elimina"
        danger
      />
    </div>
  )
}

function ClothingItemForm({ item, inventory, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    available_sizes: item?.available_sizes?.join(', ') || 'XS, S, M, L, XL',
    price: item?.price || '',
    is_available: item?.is_available ?? true,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(item?.image_url || null)

  // Inventory quantities per size
  const [sizeQuantities, setSizeQuantities] = useState(() => {
    const q = {}
    if (item?.available_sizes) {
      item.available_sizes.forEach(s => {
        const inv = inventory.find(i => i.size === s)
        q[s] = inv ? inv.quantity : 0
      })
    }
    return q
  })

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const parsedSizes = form.available_sizes ? form.available_sizes.split(',').map(s => s.trim()).filter(Boolean) : []

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    let imageUrl = item?.image_url || null
    // Upload image if selected
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const filePath = `clothing/${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('images').upload(filePath, imageFile)
      if (uploadErr) {
        setError('Errore upload immagine: ' + uploadErr.message)
        setSaving(false)
        return
      }
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath)
      imageUrl = urlData.publicUrl
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      category: form.category || null,
      available_sizes: parsedSizes,
      price: form.price ? parseFloat(form.price) : null,
      is_available: form.is_available,
      image_url: imageUrl,
    }
    try {
      let itemId = item?.id
      if (item?.id) {
        const { error } = await supabase.from('clothing_items').update(payload).eq('id', item.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('clothing_items').insert(payload).select('id').single()
        if (error) throw error
        itemId = data.id
      }

      // Update inventory for each size
      for (const size of parsedSizes) {
        const qty = parseInt(sizeQuantities[size]) || 0
        // Try upsert, fallback to manual update/insert
        const { error: upsertErr } = await supabase.from('clothing_inventory').upsert(
          { item_id: itemId, size, quantity: qty },
          { onConflict: 'item_id,size' }
        )
        if (upsertErr) {
          const { data: existing } = await supabase.from('clothing_inventory')
            .select('id').eq('item_id', itemId).eq('size', size).maybeSingle()
          if (existing) {
            const { error: e } = await supabase.from('clothing_inventory').update({ quantity: qty }).eq('id', existing.id)
            if (e) throw e
          } else {
            const { error: e } = await supabase.from('clothing_inventory').insert({ item_id: itemId, size, quantity: qty })
            if (e) throw e
          }
        }
      }

      // Remove inventory for sizes no longer listed
      const { data: allInv } = await supabase.from('clothing_inventory').select('id, size').eq('item_id', itemId)
      if (allInv) {
        for (const inv of allInv.filter(i => !parsedSizes.includes(i.size))) {
          await supabase.from('clothing_inventory').delete().eq('id', inv.id)
        }
      }

      onSaved()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {/* Image upload */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Immagine</label>
        <div className="flex items-center gap-4">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover border border-gray-200" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              <ImagePlus size={24} className="text-gray-400" />
            </div>
          )}
          <div>
            <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Carica immagine
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nome *</label>
        <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Categoria</label>
        <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
          <option value="">--</option>
          <option value="Maglia">Maglia</option>
          <option value="Pantaloncini">Pantaloncini</option>
          <option value="Tuta">Tuta</option>
          <option value="Felpa">Felpa</option>
          <option value="Giacca">Giacca</option>
          <option value="Calzettoni">Calzettoni</option>
          <option value="Accessori">Accessori</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Taglie disponibili</label>
        <input type="text" value={form.available_sizes} onChange={(e) => set('available_sizes', e.target.value)} placeholder="XS, S, M, L, XL" className={inputClass} />
        <p className="mt-1 text-xs text-gray-400">Separare le taglie con virgola</p>
      </div>

      {/* Quantit\u00e0 per taglia */}
      {parsedSizes.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Quantit&agrave; per taglia</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {parsedSizes.map(size => (
              <div key={size} className="text-center">
                <label className="mb-1 block text-xs font-medium text-gray-500">{size}</label>
                <input
                  type="number"
                  min="0"
                  value={sizeQuantities[size] ?? 0}
                  onChange={(e) => setSizeQuantities(prev => ({ ...prev, [size]: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-center text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Prezzo (&euro;)</label>
        <input type="number" step="0.01" value={form.price || ''} onChange={(e) => set('price', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Descrizione</label>
        <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} rows={2} className={inputClass} />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <span className="font-medium text-gray-700">Disponibile</span>
        <button
          type="button"
          role="switch"
          aria-checked={form.is_available}
          onClick={() => set('is_available', !form.is_available)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.is_available ? 'bg-primary-600' : 'bg-gray-200'}`}
        >
          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${form.is_available ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </label>
      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Annulla</button>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Salvataggio...' : item ? 'Salva' : 'Crea'}
        </button>
      </div>
    </form>
  )
}

function AssignForm({ item, members, onSaved, onCancel }) {
  const [form, setForm] = useState({ member_id: '', size: '', notes: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase.from('clothing_assignments').insert({
        item_id: item.id,
        member_id: form.member_id,
        size: form.size,
        notes: form.notes || null,
      })
      if (error) throw error
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Atleta *</label>
        <select value={form.member_id} onChange={(e) => set('member_id', e.target.value)} required className={inputClass}>
          <option value="">Seleziona...</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.last_name} {m.first_name}</option>)}
        </select>
      </div>
      {item.available_sizes?.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Taglia *</label>
          <select value={form.size} onChange={(e) => set('size', e.target.value)} required className={inputClass}>
            <option value="">Seleziona...</option>
            {item.available_sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Note</label>
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className={inputClass} />
      </div>
      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Annulla</button>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Salvataggio...' : 'Assegna'}
        </button>
      </div>
    </form>
  )
}
