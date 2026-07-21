'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface UserProfile { id: number; name: string | null; phone: string; email: string | null; role: string }
interface Address { id: number; label: string; address_line1: string; address_line2: string | null; city: string; state: string; pincode: string; is_default: boolean }

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [addrForm, setAddrForm] = useState({ label: 'Home', address_line1: '', address_line2: '', city: 'Chennai', state: 'Tamil Nadu', pincode: '' })
  const [addrSaving, setAddrSaving] = useState(false)
  const [addrError, setAddrError] = useState('')
  const [editingAddr, setEditingAddr] = useState<number | null>(null)
  const [detecting, setDetecting] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me')
        setUser(data); setName(data.name || ''); setPhone(data.phone || '')
        const { data: addrs } = await api.get('/addresses/')
        setAddresses(addrs || [])
      } catch { window.location.href = '/login' }
      finally { setLoading(false) }
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      await api.patch(`/auth/profile?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`)
      setMsg('Profile updated!'); setEditing(false)
      setUser(u => u ? { ...u, name, phone } : u)
    } catch { setMsg('Failed to update') }
    finally { setSaving(false) }
  }

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
        const g = await r.json()
        if (g.address) {
          setAddrForm(p => ({
            ...p,
            address_line1: [g.address.road, g.address.neighbourhood].filter(Boolean).join(', ') || p.address_line1,
            address_line2: g.address.suburb || '',
            city: g.address.city || g.address.town || g.address.state_district || p.city,
            state: g.address.state || p.state,
            pincode: g.address.postcode || p.pincode,
          }))
        }
      } catch {} finally { setDetecting(false) }
    }, () => setDetecting(false), { enableHighAccuracy: true, timeout: 10000 })
  }

  const saveAddress = async () => {
    setAddrError('')
    if (!addrForm.address_line1.trim()) { setAddrError('Address line 1 required'); return }
    if (!addrForm.city.trim()) { setAddrError('City required'); return }
    if (!addrForm.pincode || addrForm.pincode.length < 5) { setAddrError('Valid pincode required'); return }
    setAddrSaving(true)
    try {
      if (editingAddr) {
        await api.patch(`/addresses/${editingAddr}`, addrForm)
      } else {
        await api.post('/addresses/', addrForm)
      }
      const { data } = await api.get('/addresses/')
      setAddresses(data || [])
      setShowForm(false); setEditingAddr(null)
      setAddrForm({ label: 'Home', address_line1: '', address_line2: '', city: 'Chennai', state: 'Tamil Nadu', pincode: '' })
    } catch (e: any) { setAddrError(e.response?.data?.detail || 'Failed to save') }
    finally { setAddrSaving(false) }
  }

  const deleteAddress = async (id: number) => {
    try {
      await api.delete(`/addresses/${id}`)
      setAddresses(prev => prev.filter(a => a.id !== id))
    } catch {}
  }

  const handleLogout = () => {
    document.cookie = 'fujifood_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'fujifood_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/'
  }

  const inputStyle: React.CSSProperties = { height: 40, borderRadius: 8, border: '1px solid #E8E4DE', padding: '0 12px', fontSize: 13, background: '#FAFAF8', width: '100%', outline: 'none' }

  if (loading) return <div style={{ marginTop: 88, padding: 80, textAlign: 'center' }}><p style={{ color: '#888' }}>Loading...</p></div>
  if (!user) return null

  const AddressForm = () => (
    <div style={{ padding: 16, borderRadius: 12, background: '#FAFAF8', border: '1px solid #E8E4DE', marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['Home', 'Work', 'Other'].map(l => (
          <button key={l} onClick={() => setAddrForm(p => ({ ...p, label: l }))} style={{ height: 30, padding: '0 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: addrForm.label === l ? '#C8964B' : '#fff', color: addrForm.label === l ? '#fff' : '#666', border: addrForm.label === l ? 'none' : '1px solid #E8E4DE', cursor: 'pointer' }}>{l}</button>
        ))}
      </div>
      <button onClick={detectLocation} disabled={detecting} style={{ marginBottom: 10, height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid #C8964B', background: '#FDF6EC', color: '#C8964B', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>
        {detecting ? 'Detecting...' : 'Use My Location'}
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input style={inputStyle} value={addrForm.address_line1} onChange={e => setAddrForm(p => ({ ...p, address_line1: e.target.value }))} placeholder="Address Line 1 *" />
        <input style={inputStyle} value={addrForm.address_line2} onChange={e => setAddrForm(p => ({ ...p, address_line2: e.target.value }))} placeholder="Landmark, Area" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <input style={inputStyle} value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} placeholder="City" />
          <input style={inputStyle} value={addrForm.state} onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))} placeholder="State" />
          <input style={inputStyle} value={addrForm.pincode} onChange={e => setAddrForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="Pincode" />
        </div>
      </div>
      {addrError && <p style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>{addrError}</p>}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={saveAddress} disabled={addrSaving} style={{ height: 34, padding: '0 16px', borderRadius: 8, border: 'none', background: '#C8964B', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: addrSaving ? 0.6 : 1 }}>{addrSaving ? 'Saving...' : editingAddr ? 'Update' : 'Save Address'}</button>
        <button onClick={() => { setShowForm(false); setEditingAddr(null) }} style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  )

  const AddressList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {addresses.map(a => (
        <div key={a.id} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #F0EDE8', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#C8964B' }}>{a.label}{a.is_default ? ' (Default)' : ''}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { setEditingAddr(a.id); setAddrForm({ label: a.label, address_line1: a.address_line1, address_line2: a.address_line2 || '', city: a.city, state: a.state, pincode: a.pincode }); setShowForm(true) }} style={{ fontSize: 11, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
              <button onClick={() => deleteAddress(a.id)} style={{ fontSize: 11, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#1A1A1A', lineHeight: '18px' }}>{a.address_line1}{a.address_line2 ? ', ' + a.address_line2 : ''}</p>
          <p style={{ fontSize: 11, color: '#888' }}>{a.city}, {a.state} {a.pincode}</p>
        </div>
      ))}
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block" style={{ marginTop: 88 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 48px 80px' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 40 }}>My Profile</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            {/* Personal Info */}
            <div style={{ padding: 32, borderRadius: 20, border: '1px solid #EEEAE5', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>Personal Information</h3>
                {!editing && <button onClick={() => setEditing(true)} style={{ fontSize: 13, color: '#C8964B', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>}
              </div>
              {msg && <p style={{ fontSize: 13, color: '#16A34A', marginBottom: 12 }}>{msg}</p>}
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div><label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Name</label><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} /></div>
                  <div><label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Phone</label><input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
                  <p style={{ fontSize: 12, color: '#888' }}>Email: {user.email} (cannot change)</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleSave} disabled={saving} style={{ height: 36, padding: '0 20px', borderRadius: 8, background: '#C8964B', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                    <button onClick={() => { setEditing(false); setName(user.name || ''); setPhone(user.phone || '') }} style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div><span style={{ fontSize: 12, color: '#888' }}>Name</span><p style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A' }}>{user.name || 'Not set'}</p></div>
                  <div><span style={{ fontSize: 12, color: '#888' }}>Email</span><p style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A' }}>{user.email}</p></div>
                  <div><span style={{ fontSize: 12, color: '#888' }}>Phone</span><p style={{ fontSize: 15, fontWeight: 500, color: '#1A1A1A' }}>{user.phone || 'Not set'}</p></div>
                </div>
              )}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #F0F0F0', display: 'flex', gap: 10 }}>
                {user.role === 'restaurant_admin' && <a href="/manage" style={{ height: 36, padding: '0 16px', borderRadius: 8, background: '#C8964B', color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>Manage Restaurant</a>}
                <button onClick={handleLogout} style={{ height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #FECACA', color: '#DC2626', fontSize: 12, fontWeight: 600, background: '#FEF2F2', cursor: 'pointer' }}>Sign Out</button>
              </div>
            </div>

            {/* Addresses */}
            <div style={{ padding: 32, borderRadius: 20, border: '1px solid #EEEAE5', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>Saved Addresses</h3>
                {!showForm && <button onClick={() => { setShowForm(true); setEditingAddr(null); setAddrForm({ label: 'Home', address_line1: '', address_line2: '', city: 'Chennai', state: 'Tamil Nadu', pincode: '' }) }} style={{ fontSize: 12, color: '#C8964B', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add New</button>}
              </div>
              {showForm && <AddressForm />}
              {addresses.length > 0 ? <AddressList /> : !showForm && <p style={{ fontSize: 13, color: '#AAA', textAlign: 'center', padding: '24px 0' }}>No saved addresses yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="block md:hidden" style={{ paddingTop: 96, paddingBottom: 32 }}>
        <div style={{ padding: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 20 }}>My Profile</h1>
          {/* Info card */}
          <div style={{ padding: 16, borderRadius: 14, border: '1px solid #EEEAE5', background: '#fff', marginBottom: 16 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
                <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Phone" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSave} disabled={saving} style={{ height: 34, padding: '0 16px', borderRadius: 8, background: '#C8964B', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{saving ? '...' : 'Save'}</button>
                  <button onClick={() => setEditing(false)} style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{user.name || 'User'}</span>
                  <button onClick={() => setEditing(true)} style={{ fontSize: 11, color: '#C8964B', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                </div>
                <p style={{ fontSize: 12, color: '#888' }}>{user.email}</p>
                <p style={{ fontSize: 12, color: '#888' }}>{user.phone}</p>
              </>
            )}
          </div>

          {/* Addresses */}
          <div style={{ padding: 16, borderRadius: 14, border: '1px solid #EEEAE5', background: '#fff', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>Addresses</span>
              {!showForm && <button onClick={() => { setShowForm(true); setEditingAddr(null); setAddrForm({ label: 'Home', address_line1: '', address_line2: '', city: 'Chennai', state: 'Tamil Nadu', pincode: '' }) }} style={{ fontSize: 11, color: '#C8964B', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>+ Add</button>}
            </div>
            {showForm && <AddressForm />}
            {addresses.length > 0 ? <AddressList /> : !showForm && <p style={{ fontSize: 12, color: '#AAA', textAlign: 'center', padding: 16 }}>No addresses saved.</p>}
          </div>

          <button onClick={handleLogout} style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #FECACA', color: '#DC2626', fontSize: 13, fontWeight: 600, background: '#FEF2F2', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>
    </>
  )
}
