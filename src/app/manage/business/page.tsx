'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function BusinessPage() {
  const [restaurant, setRestaurant] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/restaurants/manage')
        setRestaurant(data || {})
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.patch('/restaurants/manage', restaurant)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }

  const toggleOnline = async () => {
    setToggling(true)
    try {
      if (restaurant.is_online) {
        await api.post('/restaurants/manage/go-offline')
        setRestaurant((p: any) => ({ ...p, is_online: false }))
      } else {
        await api.post('/restaurants/manage/go-online')
        setRestaurant((p: any) => ({ ...p, is_online: true }))
      }
    } catch {}
    finally { setToggling(false) }
  }

  const updateField = (key: string, value: any) => {
    setRestaurant((p: any) => ({ ...p, [key]: value }))
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

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#AAA' }}>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Business Settings</h1>
          <p style={{ fontSize: 14, color: '#888' }}>Manage your restaurant information and delivery settings.</p>
        </div>
        {/* Online Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: restaurant.is_online ? '#16A34A' : '#DC2626' }}>
            {restaurant.is_online ? '● Online' : '● Offline'}
          </span>
          <button
            onClick={toggleOnline}
            disabled={toggling}
            style={{
              width: 52,
              height: 28,
              borderRadius: 14,
              border: 'none',
              background: restaurant.is_online ? '#16A34A' : '#E0E0E0',
              cursor: toggling ? 'not-allowed' : 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 3,
              left: restaurant.is_online ? 27 : 3,
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Restaurant Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {[
            { key: 'name', label: 'Restaurant Name', type: 'text' },
            { key: 'cuisine', label: 'Cuisine Type', type: 'text' },
            { key: 'phone', label: 'Phone', type: 'tel' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'address', label: 'Address', type: 'text' },
            { key: 'city', label: 'City', type: 'text' },
            { key: 'pincode', label: 'Pincode', type: 'text' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>{field.label}</label>
              <input
                style={inputStyle}
                type={field.type}
                value={restaurant[field.key] || ''}
                onChange={e => updateField(field.key, e.target.value)}
                placeholder={field.label}
              />
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Description</label>
            <textarea
              style={{ ...inputStyle, height: 80, padding: '10px 14px', resize: 'vertical' }}
              value={restaurant.description || ''}
              onChange={e => updateField('description', e.target.value)}
              placeholder="Brief description of your restaurant"
            />
          </div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Delivery Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { key: 'delivery_radius', label: 'Delivery Radius (km)', type: 'number' },
            { key: 'min_order_amount', label: 'Min Order Amount (₹)', type: 'number' },
            { key: 'delivery_fee', label: 'Delivery Fee (₹)', type: 'number' },
            { key: 'free_delivery_above', label: 'Free Delivery Above (₹)', type: 'number' },
            { key: 'avg_delivery_time', label: 'Avg Delivery Time (min)', type: 'number' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>{field.label}</label>
              <input
                style={inputStyle}
                type={field.type}
                value={restaurant[field.key] || ''}
                onChange={e => updateField(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            height: 44,
            borderRadius: 10,
            border: 'none',
            background: saved ? '#16A34A' : '#C8964B',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            padding: '0 32px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
