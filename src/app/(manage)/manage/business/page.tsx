'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * Business Settings — Restaurant profile, delivery, hours.
 */
export default function BusinessPage() {
  const [restaurant, setRestaurant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      try { const { data } = await api.get('/restaurants/manage'); setRestaurant(data) }
      catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try { await api.patch('/restaurants/manage', restaurant); setMsg('Settings saved!') }
    catch { setMsg('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="animate-pulse"><div className="bg-[#1A1A1A]" style={{ height: '300px', borderRadius: '16px' }} /></div>

  const Field = ({ label, field, type = 'text', placeholder = '' }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-[#888]" style={{ fontSize: '12px', marginBottom: '6px' }}>{label}</label>
      <input type={type} value={restaurant?.[field] || ''} onChange={(e) => setRestaurant({ ...restaurant, [field]: type === 'number' ? parseFloat(e.target.value) : e.target.value })} placeholder={placeholder} className="w-full bg-[#0F0F0F] border border-[#333] text-white placeholder-[#555] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }} />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="font-heading font-bold text-white" style={{ fontSize: '28px', marginBottom: '4px' }}>Business Settings</h1>
          <p className="text-[#888]" style={{ fontSize: '14px' }}>Manage restaurant details, delivery, and operations.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="font-medium text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '40px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '10px', fontSize: '13px' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
      {msg && <p className="text-[#16A34A] font-medium" style={{ fontSize: '13px', marginBottom: '16px' }}>{msg}</p>}

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {/* Restaurant Info */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '20px' }}>Restaurant Information</h3>
          <div className="flex flex-col" style={{ gap: '14px' }}>
            <Field label="Restaurant Name" field="name" />
            <Field label="Description" field="description" />
            <Field label="Cuisine Type" field="cuisine_type" placeholder="South Indian, Chinese" />
            <Field label="Phone" field="phone" />
            <Field label="Email" field="email" type="email" />
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '20px' }}>Delivery Settings</h3>
          <div className="flex flex-col" style={{ gap: '14px' }}>
            <Field label="Delivery Radius (km)" field="delivery_radius_km" type="number" />
            <Field label="Minimum Order (₹)" field="min_order_amount" type="number" />
            <Field label="Delivery Fee (₹)" field="delivery_fee" type="number" />
            <Field label="Free Delivery Above (₹)" field="free_delivery_above" type="number" />
            <Field label="Avg Delivery Time (mins)" field="avg_delivery_time_mins" type="number" />
          </div>
        </div>

        {/* Address */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '20px' }}>Address</h3>
          <div className="flex flex-col" style={{ gap: '14px' }}>
            <Field label="Address Line 1" field="address_line1" />
            <Field label="Address Line 2" field="address_line2" />
            <Field label="City" field="city" />
            <Field label="State" field="state" />
            <Field label="Pincode" field="pincode" />
          </div>
        </div>

        {/* Operations */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '20px' }}>Operations</h3>
          <div className="flex flex-col" style={{ gap: '16px' }}>
            <div className="flex items-center justify-between">
              <span className="text-[#AAA]" style={{ fontSize: '14px' }}>Currently Online</span>
              <button onClick={() => setRestaurant({ ...restaurant, is_online: !restaurant?.is_online })} className="font-medium" style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', background: restaurant?.is_online ? '#16A34A' : '#333', color: 'white' }}>{restaurant?.is_online ? 'Online' : 'Offline'}</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#AAA]" style={{ fontSize: '14px' }}>Website Published</span>
              <button onClick={() => setRestaurant({ ...restaurant, is_published: !restaurant?.is_published })} className="font-medium" style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', background: restaurant?.is_published ? '#16A34A' : '#333', color: 'white' }}>{restaurant?.is_published ? 'Published' : 'Draft'}</button>
            </div>
            <Field label="SEO Title" field="seo_title" />
            <Field label="SEO Description" field="seo_description" />
          </div>
        </div>
      </div>
    </div>
  )
}
