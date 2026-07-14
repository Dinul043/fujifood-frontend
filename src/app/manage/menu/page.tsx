'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function MenuPage() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', category_id: '', food_type: 'veg' })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        api.get('/menu/manage/items'),
        api.get('/menu/manage/categories'),
      ])
      setItems(itemsRes.data.items || itemsRes.data || [])
      setCategories(catsRes.data.categories || catsRes.data || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const toggleAvailability = async (item: any) => {
    try {
      await api.post(`/menu/manage/items/${item.id}/toggle?is_available=${!item.is_available}`)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
    } catch {}
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/menu/manage/items/${id}`)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {}
  }

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category_id) return
    setSubmitting(true)
    try {
      await api.post('/menu/manage/items', {
        name: form.name,
        price: parseFloat(form.price),
        category_id: parseInt(form.category_id),
        food_type: form.food_type,
      })
      setForm({ name: '', price: '', category_id: '', food_type: 'veg' })
      setShowForm(false)
      await fetchData()
    } catch {}
    finally { setSubmitting(false) }
  }

  const getCategoryName = (catId: number) => {
    const cat = categories.find((c: any) => c.id === catId)
    return cat?.name || 'Uncategorized'
  }

  const inputStyle: React.CSSProperties = {
    height: 40,
    borderRadius: 10,
    border: '1px solid #E8E4DE',
    padding: '0 14px',
    fontSize: 14,
    background: '#FAFAF8',
    width: '100%',
    outline: 'none',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Menu</h1>
          <p style={{ fontSize: 14, color: '#888' }}>Manage your restaurant menu items.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            height: 40,
            borderRadius: 10,
            border: 'none',
            background: '#C8964B',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            padding: '0 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        >
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Add New Item</h3>
          <form onSubmit={addItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Name</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Item name" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Price (₹)</label>
              <input style={inputStyle} type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Category</label>
              <select style={{ ...inputStyle, appearance: 'auto' }} value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                <option value="">Select category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Food Type</label>
              <select style={{ ...inputStyle, appearance: 'auto' }} value={form.food_type} onChange={e => setForm(p => ({ ...p, food_type: e.target.value }))}>
                <option value="veg">Veg</option>
                <option value="non_veg">Non-Veg</option>
                <option value="egg">Egg</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  height: 40,
                  borderRadius: 10,
                  border: 'none',
                  background: '#C8964B',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '0 24px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                  width: '100%',
                }}
              >
                {submitting ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#AAA', fontSize: 14 }}>Loading menu...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#AAA', fontSize: 14 }}>No menu items yet. Add your first item!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                background: '#fff',
                border: '1px solid #F0F0F0',
                borderRadius: 16,
                padding: 20,
                transition: 'all 0.2s ease',
                opacity: item.is_available ? 1 : 0.6,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: item.food_type === 'veg' ? '#16A34A' : item.food_type === 'egg' ? '#EAB308' : '#DC2626',
                    }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#AAA' }}>{getCategoryName(item.category_id)}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#C8964B' }}>₹{item.price}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Toggle */}
                <button
                  onClick={() => toggleAvailability(item)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    border: 'none',
                    background: item.is_available ? '#C8964B' : '#E0E0E0',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    left: item.is_available ? 23 : 3,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteItem(item.id)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: '1px solid #FEE2E2',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    cursor: 'pointer',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
