'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * Profile Page — Edit name/phone/email + manage delivery addresses + logout.
 */
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

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [addrLabel, setAddrLabel] = useState('Home')
  const [addrLine1, setAddrLine1] = useState('')
  const [addrLine2, setAddrLine2] = useState('')
  const [addrCity, setAddrCity] = useState('Chennai')
  const [addrState, setAddrState] = useState('Tamil Nadu')
  const [addrPincode, setAddrPincode] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
        setName(data.name || '')
        setPhone(data.phone || '')
      } catch { window.location.href = '/login' }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      await api.patch(`/auth/profile?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`)
      setMsg('Profile updated!')
      setEditing(false)
      setUser((u) => u ? { ...u, name, phone } : u)
    } catch { setMsg('Failed to update') }
    finally { setSaving(false) }
  }

  const handleLogout = () => {
    document.cookie = 'fujifood_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'fujifood_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/'
  }

  if (loading) return <div style={{ marginTop: '88px', padding: '80px', textAlign: 'center' }}><p className="text-[#888]">Loading...</p></div>
  if (!user) return null

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block" style={{ marginTop: '88px' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px', paddingTop: '48px', paddingBottom: '80px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '32px', marginBottom: '40px' }}>My Profile</h1>

          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
            {/* Personal Info */}
            <div className="bg-white" style={{ padding: '32px', borderRadius: '20px', border: '1px solid #EEEAE5' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                <h3 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '18px' }}>Personal Information</h3>
                {!editing && <button onClick={() => setEditing(true)} className="font-medium text-[#C8964B] hover:underline" style={{ fontSize: '13px' }}>Edit</button>}
              </div>

              {msg && <p className="text-[#16A34A] font-medium" style={{ fontSize: '13px', marginBottom: '16px' }}>{msg}</p>}

              {editing ? (
                <div className="flex flex-col" style={{ gap: '16px' }}>
                  <div>
                    <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
                  </div>
                  <div>
                    <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
                  </div>
                  <div>
                    <label className="block font-medium text-[#888]" style={{ fontSize: '12px', marginBottom: '6px' }}>Email (cannot be changed)</label>
                    <p className="text-[#1A1A1A]" style={{ fontSize: '14px', padding: '12px 0' }}>{user.email}</p>
                  </div>
                  <div className="flex" style={{ gap: '12px', marginTop: '8px' }}>
                    <button onClick={handleSave} disabled={saving} className="font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '40px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '10px', fontSize: '13px' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
                    <button onClick={() => { setEditing(false); setName(user.name || ''); setPhone(user.phone || '') }} className="font-medium text-[#888] hover:text-[#1A1A1A]" style={{ fontSize: '13px' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col" style={{ gap: '20px' }}>
                  <div><label className="block text-[#888]" style={{ fontSize: '12px', marginBottom: '4px' }}>Name</label><p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '15px' }}>{user.name || 'Not set'}</p></div>
                  <div><label className="block text-[#888]" style={{ fontSize: '12px', marginBottom: '4px' }}>Email</label><p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '15px' }}>{user.email || 'Not set'}</p></div>
                  <div><label className="block text-[#888]" style={{ fontSize: '12px', marginBottom: '4px' }}>Phone</label><p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '15px' }}>{user.phone || 'Not set'}</p></div>
                </div>
              )}

              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F0F0F0' }}>
                {user.role === 'restaurant_admin' && (
                  <a href="/manage" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '40px', padding: '0 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: '#C8964B', color: '#fff', textDecoration: 'none', marginRight: '12px', transition: 'all 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B5843F' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C8964B' }}>Manage Restaurant</a>
                )}
                <button onClick={handleLogout} className="font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-all" style={{ height: '40px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '10px', fontSize: '13px', border: '1px solid #FECACA' }}>Sign Out</button>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white" style={{ padding: '32px', borderRadius: '20px', border: '1px solid #EEEAE5' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                <h3 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '18px' }}>Saved Addresses</h3>
                <button onClick={() => setShowAddAddress(!showAddAddress)} className="font-medium text-[#C8964B] hover:underline" style={{ fontSize: '13px' }}>{showAddAddress ? 'Cancel' : '+ Add New'}</button>
              </div>

              {showAddAddress && (
                <div className="flex flex-col" style={{ gap: '12px', marginBottom: '24px', padding: '20px', borderRadius: '12px', background: '#FAFAF8', border: '1px solid #E8E4DE' }}>
                  <div className="flex" style={{ gap: '8px' }}>
                    {['Home', 'Work', 'Other'].map((l) => (
                      <button key={l} onClick={() => setAddrLabel(l)} className="font-medium transition-all" style={{ height: '32px', paddingLeft: '14px', paddingRight: '14px', borderRadius: '8px', fontSize: '12px', background: addrLabel === l ? '#C8964B' : 'white', color: addrLabel === l ? 'white' : '#666', border: addrLabel === l ? 'none' : '1px solid #E8E4DE' }}>{l}</button>
                    ))}
                  </div>
                  <input value={addrLine1} onChange={(e) => setAddrLine1(e.target.value)} placeholder="Address Line 1 *" className="w-full bg-white border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }} />
                  <input value={addrLine2} onChange={(e) => setAddrLine2(e.target.value)} placeholder="Landmark, Area" className="w-full bg-white border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }} />
                  <div className="grid grid-cols-3" style={{ gap: '8px' }}>
                    <input value={addrCity} onChange={(e) => setAddrCity(e.target.value)} placeholder="City" className="w-full bg-white border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }} />
                    <input value={addrState} onChange={(e) => setAddrState(e.target.value)} placeholder="State" className="w-full bg-white border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }} />
                    <input value={addrPincode} onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode" className="w-full bg-white border border-[#E8E4DE] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }} />
                  </div>
                  <button className="self-start font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] transition-all" style={{ height: '36px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '8px', fontSize: '13px', marginTop: '4px' }}>Save Address</button>
                </div>
              )}

              {addresses.length === 0 && !showAddAddress && (
                <div className="text-center" style={{ padding: '32px 0' }}>
                  <p className="text-[#888]" style={{ fontSize: '14px' }}>No saved addresses yet.</p>
                  <p className="text-[#AAA]" style={{ fontSize: '12px', marginTop: '4px' }}>Add an address for faster checkout.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="block md:hidden" style={{ paddingTop: '96px', paddingBottom: '32px' }}>
        <div style={{ padding: '20px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '22px', marginBottom: '20px' }}>My Profile</h1>
          <div className="bg-white" style={{ padding: '20px', borderRadius: '16px', border: '1px solid #EEEAE5', marginBottom: '16px' }}>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <div><label className="block text-[#888]" style={{ fontSize: '11px' }}>Name</label><p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '14px' }}>{user.name || 'Not set'}</p></div>
              <div><label className="block text-[#888]" style={{ fontSize: '11px' }}>Email</label><p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '14px' }}>{user.email || 'Not set'}</p></div>
              <div><label className="block text-[#888]" style={{ fontSize: '11px' }}>Phone</label><p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '14px' }}>{user.phone || 'Not set'}</p></div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full font-semibold text-[#DC2626]" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', border: '1px solid #FECACA' }}>Sign Out</button>
        </div>
      </div>
    </>
  )
}
