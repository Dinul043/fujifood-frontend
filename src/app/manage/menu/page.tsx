'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function MenuPage() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', category_id: '', food_type: 'veg', image_url: '' })
  const [submitting, setSubmitting] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)

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
        image_url: form.image_url || null,
      })
      setForm({ name: '', price: '', category_id: '', food_type: 'veg', image_url: '' })
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

      {/* Categories management */}
      <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>Categories</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {categories.map((cat: any) => (
            <span key={cat.id} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, background: '#F5F3EF', color: '#1A1A1A', fontWeight: 500 }}>{cat.name}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="New category name" style={{ ...inputStyle, flex: 1 }} />
          <button onClick={async () => { if (!newCatName.trim()) return; setAddingCat(true); try { await api.post('/menu/manage/categories', { name: newCatName }); setNewCatName(''); await fetchData() } catch {} finally { setAddingCat(false) } }} disabled={addingCat} style={{ height: 40, padding: '0 16px', borderRadius: 10, border: 'none', background: '#C8964B', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{addingCat ? '...' : '+ Add'}</button>
        </div>
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
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Image URL (optional)</label>
              <input style={inputStyle} value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://... or /images/food/dish.png" />
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
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
