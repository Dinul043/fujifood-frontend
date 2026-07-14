'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * Manage Menu — CRUD for categories and menu items.
 */

export default function ManageMenuPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddItem, setShowAddItem] = useState(false)

  // New item form
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newFoodType, setNewFoodType] = useState('veg')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get('/menu/manage/categories?include_inactive=true'),
          api.get('/menu/manage/items'),
        ])
        setCategories(catRes.data)
        setItems(itemRes.data)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleAddItem = async () => {
    setError('')
    if (!newName.trim()) { setError('Name is required'); return }
    if (!newPrice || parseFloat(newPrice) <= 0) { setError('Valid price is required'); return }
    if (!newCategory) { setError('Select a category'); return }

    setSaving(true)
    try {
      await api.post('/menu/manage/items', {
        category_id: parseInt(newCategory),
        name: newName,
        price: parseFloat(newPrice),
        food_type: newFoodType,
      })
      // Refresh items
      const { data } = await api.get('/menu/manage/items')
      setItems(data)
      setShowAddItem(false)
      setNewName(''); setNewPrice(''); setNewCategory(''); setNewFoodType('veg')
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to add item') }
    finally { setSaving(false) }
  }

  const handleToggleAvailability = async (itemId: number, current: boolean) => {
    try {
      await api.post(`/menu/manage/items/${itemId}/toggle?is_available=${!current}`)
      setItems(items.map((i) => i.id === itemId ? { ...i, is_available: !current } : i))
    } catch {}
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/menu/manage/items/${itemId}`)
      setItems(items.filter((i) => i.id !== itemId))
    } catch {}
  }

  if (loading) return <div className="animate-pulse"><div className="bg-[#1A1A1A]" style={{ height: '200px', borderRadius: '16px' }} /></div>

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="font-heading font-bold text-white" style={{ fontSize: '28px', marginBottom: '4px' }}>Menu Management</h1>
          <p className="text-[#888]" style={{ fontSize: '14px' }}>{categories.length} categories, {items.length} items</p>
        </div>
        <button onClick={() => setShowAddItem(!showAddItem)} className="font-medium text-white bg-[#C8964B] hover:bg-[#B5843F] transition-all" style={{ height: '40px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '10px', fontSize: '13px' }}>
          {showAddItem ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add item form */}
      {showAddItem && (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
          <h3 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '16px' }}>Add New Item</h3>
          {error && <p className="text-[#DC2626]" style={{ fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
          <div className="grid grid-cols-2" style={{ gap: '12px', marginBottom: '16px' }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Item name" className="bg-[#0F0F0F] border border-[#333] text-white placeholder-[#666] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }} />
            <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="Price (₹)" type="number" className="bg-[#0F0F0F] border border-[#333] text-white placeholder-[#666] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }} />
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="bg-[#0F0F0F] border border-[#333] text-white outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={newFoodType} onChange={(e) => setNewFoodType(e.target.value)} className="bg-[#0F0F0F] border border-[#333] text-white outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }}>
              <option value="veg">Vegetarian</option>
              <option value="non_veg">Non-Vegetarian</option>
              <option value="egg">Contains Egg</option>
            </select>
          </div>
          <button onClick={handleAddItem} disabled={saving} className="font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '36px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '8px', fontSize: '13px' }}>
            {saving ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      )}

      {/* Items table */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden" style={{ borderRadius: '16px' }}>
        <div className="grid" style={{ gridTemplateColumns: '1fr 120px 100px 100px 80px', padding: '12px 20px', borderBottom: '1px solid #2A2A2A' }}>
          <span className="text-[#888]" style={{ fontSize: '12px', fontWeight: 600 }}>ITEM</span>
          <span className="text-[#888]" style={{ fontSize: '12px', fontWeight: 600 }}>CATEGORY</span>
          <span className="text-[#888]" style={{ fontSize: '12px', fontWeight: 600 }}>PRICE</span>
          <span className="text-[#888]" style={{ fontSize: '12px', fontWeight: 600 }}>STATUS</span>
          <span className="text-[#888]" style={{ fontSize: '12px', fontWeight: 600 }}>ACTIONS</span>
        </div>
        {items.map((item) => (
          <div key={item.id} className="grid items-center" style={{ gridTemplateColumns: '1fr 120px 100px 100px 80px', padding: '14px 20px', borderBottom: '1px solid #1E1E1E' }}>
            <div>
              <p className="font-medium text-white" style={{ fontSize: '14px' }}>{item.name}</p>
              <p className="text-[#666]" style={{ fontSize: '11px' }}>{item.food_type === 'veg' ? 'Veg' : 'Non-Veg'}{item.is_bestseller ? ' • Bestseller' : ''}</p>
            </div>
            <span className="text-[#888]" style={{ fontSize: '13px' }}>{categories.find((c) => c.id === item.category_id)?.name || '-'}</span>
            <span className="font-semibold text-[#C8964B]" style={{ fontSize: '14px' }}>₹{item.price}</span>
            <button onClick={() => handleToggleAvailability(item.id, item.is_available)} className="font-medium" style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', background: item.is_available ? '#F0FDF4' : '#FEF2F2', color: item.is_available ? '#16A34A' : '#DC2626', width: 'fit-content' }}>
              {item.is_available ? 'Available' : 'Sold Out'}
            </button>
            <button onClick={() => handleDeleteItem(item.id)} className="text-[#666] hover:text-[#DC2626] transition-colors" style={{ fontSize: '12px' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
