import { useEffect, useState } from 'react'
import { Plus, Shirt, Package } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatDateTime } from '../lib/utils'
import Badge from '../components/ui/Badge'
import SearchInput from '../components/ui/SearchInput'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function Clothing() {
  const [items, setItems] = useState([])
  const [orders, setOrders] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('catalogo')
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [itemsRes, ordersRes, membersRes] = await Promise.all([
      supabase.from('clothing_items').select('*').order('name'),
      supabase.from('clothing_orders').select('*, member:member_id(first_name, last_name), item:item_id(name, category)').order('ordered_at', { ascending: false }),
      supabase.from('users').select('id, first_name, last_name').eq('is_member', true).eq('status', 'attivo').order('last_name'),
    ])
    setItems(itemsRes.data || [])
    setOrders(ordersRes.data || [])
    setMembers(membersRes.data || [])
    setLoading(false)
  }

  async function handleDeleteItem(id) {
    await supabase.from('clothing_items').delete().eq('id', id)
    fetchData()
  }

  async function handleUpdateOrderStatus(orderId, status) {
    await supabase.from('clothing_orders').update({ status }).eq('id', orderId)
    fetchData()
  }

  const filteredItems = items.filter((i) =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredOrders = orders.filter((o) =>
    !search || (o.member?.last_name || '').toLowerCase().includes(search.toLowerCase()) || (o.item?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abbigliamento</h1>
          <p className="text-sm text-gray-500">{items.length} articoli, {orders.filter(o => o.status === 'richiesto').length} ordini in attesa</p>
        </div>
        <div className="flex gap-2">
          {tab === 'catalogo' ? (
            <button onClick={() => { setEditingItem(null); setShowItemForm(true) }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
              <Plus size={18} /> Nuovo Articolo
            </button>
          ) : (
            <button onClick={() => setShowOrderForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
              <Plus size={18} /> Nuovo Ordine
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        <button onClick={() => setTab('catalogo')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${tab === 'catalogo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Catalogo ({items.length})
        </button>
        <button onClick={() => setTab('ordini')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${tab === 'ordini' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Ordini ({orders.length})
        </button>
      </div>

      <div className="sm:w-80">
        <SearchInput value={search} onChange={setSearch} placeholder={tab === 'catalogo' ? 'Cerca articoli...' : 'Cerca ordini...'} />
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Caricamento...</div>
      ) : tab === 'catalogo' ? (
        filteredItems.length === 0 ? (
          <EmptyState icon={Shirt} title="Nessun articolo" description="Aggiungi il primo articolo al catalogo" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.category && <p className="text-xs text-gray-500">{item.category}</p>}
                  </div>
                  {item.price && <span className="text-lg font-bold text-gray-900">&euro; {Number(item.price).toFixed(2)}</span>}
                </div>
                {item.description && <p className="mb-3 text-sm text-gray-600">{item.description}</p>}
                {item.available_sizes?.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {item.available_sizes.map((s) => (
                      <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{s}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between border-t pt-3">
                  <Badge status={item.is_available ? 'attivo' : 'sospeso'}>
                    {item.is_available ? 'Disponibile' : 'Non disponibile'}
                  </Badge>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(item); setShowItemForm(true) }} className="text-xs text-gray-600 hover:text-gray-700">Modifica</button>
                    <button onClick={() => setDeleteTarget(item)} className="text-xs text-red-600 hover:text-red-700">Elimina</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredOrders.length === 0 ? (
          <EmptyState icon={Package} title="Nessun ordine" description="Crea il primo ordine" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Atleta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Articolo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Taglia</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Qt&agrave;</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Totale</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Stato</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Data</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{order.member?.first_name} {order.member?.last_name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{order.item?.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{order.size}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{order.quantity}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{order.total_price ? `€ ${Number(order.total_price).toFixed(2)}` : '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3"><Badge status={order.status} /></td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{formatDateTime(order.ordered_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                      >
                        <option value="richiesto">Richiesto</option>
                        <option value="ordinato">Ordinato</option>
                        <option value="arrivato">Arrivato</option>
                        <option value="consegnato">Consegnato</option>
                        <option value="annullato">Annullato</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Form articolo */}
      <Modal open={showItemForm} onClose={() => setShowItemForm(false)} title={editingItem ? 'Modifica Articolo' : 'Nuovo Articolo'} size="md">
        <ClothingItemForm item={editingItem} onSaved={() => { setShowItemForm(false); fetchData() }} onCancel={() => setShowItemForm(false)} />
      </Modal>

      {/* Form ordine */}
      <Modal open={showOrderForm} onClose={() => setShowOrderForm(false)} title="Nuovo Ordine" size="md">
        <OrderForm items={items} members={members} onSaved={() => { setShowOrderForm(false); fetchData() }} onCancel={() => setShowOrderForm(false)} />
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

function ClothingItemForm({ item, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || '',
    available_sizes: item?.available_sizes?.join(', ') || 'XS, S, M, L, XL',
    price: item?.price || '',
    is_available: item?.is_available ?? true,
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description || null,
      category: form.category || null,
      available_sizes: form.available_sizes ? form.available_sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      price: form.price ? parseFloat(form.price) : null,
      is_available: form.is_available,
    }
    try {
      if (item?.id) {
        const { error } = await supabase.from('clothing_items').update(payload).eq('id', item.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('clothing_items').insert(payload)
        if (error) throw error
      }
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
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
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Prezzo (&euro;)</label>
        <input type="number" step="0.01" value={form.price || ''} onChange={(e) => set('price', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Descrizione</label>
        <textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} rows={2} className={inputClass} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.is_available} onChange={(e) => set('is_available', e.target.checked)} className="rounded border-gray-300 text-primary-600" />
        <span>Disponibile</span>
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

function OrderForm({ items, members, onSaved, onCancel }) {
  const [form, setForm] = useState({ member_id: '', item_id: '', size: '', quantity: 1, notes: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  const selectedItem = items.find(i => i.id === form.item_id)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const totalPrice = selectedItem?.price ? selectedItem.price * form.quantity : null
    try {
      const { error } = await supabase.from('clothing_orders').insert({
        member_id: form.member_id,
        item_id: form.item_id,
        size: form.size,
        quantity: parseInt(form.quantity),
        total_price: totalPrice,
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
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Articolo *</label>
        <select value={form.item_id} onChange={(e) => set('item_id', e.target.value)} required className={inputClass}>
          <option value="">Seleziona...</option>
          {items.filter(i => i.is_available).map(i => <option key={i.id} value={i.id}>{i.name} {i.price ? `- € ${Number(i.price).toFixed(2)}` : ''}</option>)}
        </select>
      </div>
      {selectedItem?.available_sizes?.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Taglia *</label>
          <select value={form.size} onChange={(e) => set('size', e.target.value)} required className={inputClass}>
            <option value="">Seleziona...</option>
            {selectedItem.available_sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Quantit&agrave;</label>
        <input type="number" min={1} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className={inputClass} />
      </div>
      {selectedItem?.price && (
        <p className="text-sm font-medium text-gray-700">
          Totale: &euro; {(selectedItem.price * (form.quantity || 1)).toFixed(2)}
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Note</label>
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className={inputClass} />
      </div>
      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Annulla</button>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Salvataggio...' : 'Crea Ordine'}
        </button>
      </div>
    </form>
  )
}
