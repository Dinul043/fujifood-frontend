'use client'

import { useState, useEffect } from 'react'
import api, { clearTokens } from '@/lib/api'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Staff management
  const [staffList, setStaffList] = useState<any[]>([])
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [staffForm, setStaffForm] = useState({ name: '', phone: '', password: '', role: 'restaurant_admin' })
  const [addingStaff, setAddingStaff] = useState(false)
  const [staffError, setStaffError] = useState('')
  const [lastAddedStaff, setLastAddedStaff] = useState<{ name: string; phone: string; role: string } | null>(null)

  // Custom remove-staff modal
  const [removeModal, setRemoveModal] = useState<{ id: number; name: string } | null>(null)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
        setForm(prev => ({ ...prev, name: data.name || '', phone: data.phone || '' }))
        if (data.is_owner) {
          try {
            const { data: staff } = await api.get('/staff/')
            setStaffList(staff || [])
          } catch {}
        }
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      const params = new URLSearchParams()
      if (form.name) params.set('name', form.name)
      if (form.phone) params.set('phone', form.phone)
      if (form.password) params.set('password', form.password)

      await api.patch(`/auth/profile?${params.toString()}`)
      setSaved(true)
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }))
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    clearTokens()
    window.location.href = '/login'
  }

  const handleRemoveStaff = async () => {
    if (!removeModal) return
    setRemoving(true)
    try {
      await api.delete(`/staff/${removeModal.id}`)
      setStaffList(prev => prev.map(x => x.id === removeModal.id ? { ...x, is_active: false } : x))
      setRemoveModal(null)
    } catch {} finally {
      setRemoving(false)
    }
  }

  const roleLabel = (role: string) => {
    if (role === 'delivery_staff') return 'Delivery Staff'
    if (role === 'restaurant_admin') return 'Restaurant Staff'
    return role
  }

  const roleBadgeStyle = (role: string): React.CSSProperties => ({
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 6,
    flexShrink: 0,
    background: role === 'delivery_staff' ? '#EFF6FF' : '#FDF6EC',
    color: role === 'delivery_staff' ? '#2563EB' : '#C8964B',
    textTransform: 'capitalize',
  })

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
      {/* Remove Staff Custom Modal */}
      {removeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Remove Staff Member?</h3>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{removeModal.name}</span> will no longer be able to log in. This can be reversed by reactivating them.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setRemoveModal(null)}
                style={{ flex: 1, height: 42, borderRadius: 10, border: '1px solid #E8E4DE', background: '#fff', color: '#666', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveStaff}
                disabled={removing}
                style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: '#DC2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: removing ? 'not-allowed' : 'pointer', opacity: removing ? 0.6 : 1 }}
              >
                {removing ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
          <style>{`@keyframes fadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Account</h1>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Manage your profile and security.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Profile Info */}
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 20 }}>Profile</h3>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#FDF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: '#C8964B',
            }}>
              {(user?.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: 13, color: '#AAA' }}>{user?.is_owner ? 'Restaurant Owner' : 'Staff'}</p>
            </div>
          </div>

          {/* Info fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8F8F8' }}>
              <span style={{ fontSize: 13, color: '#888' }}>Phone</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{user?.phone || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F8F8F8' }}>
              <span style={{ fontSize: 13, color: '#888' }}>Role</span>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6, background: '#FDF6EC', color: '#C8964B', textTransform: 'capitalize' }}>{user?.is_owner ? 'Owner' : 'Staff'}</span>
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 20 }}>Update Profile</h3>
          <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Name</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
            </div>

            <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 16, marginTop: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 12 }}>Change Password</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>New Password</label>
                  <input style={inputStyle} type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="New password" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Confirm Password</label>
                  <input style={inputStyle} type="password" value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm password" />
                </div>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                height: 40, borderRadius: 10, border: 'none',
                background: saved ? '#16A34A' : '#C8964B',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1, transition: 'all 0.2s ease',
              }}
            >
              {saving ? 'Saving...' : saved ? '✓ Updated' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Staff Management — Owner Only */}
      {user?.is_owner && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>Staff Members</h2>
            <button
              onClick={() => { setShowStaffForm(!showStaffForm); setStaffError('') }}
              style={{ height: 34, padding: '0 14px', borderRadius: 10, border: 'none', background: '#C8964B', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              {showStaffForm ? 'Cancel' : '+ Add Staff'}
            </button>
          </div>

          {/* Add Staff Form */}
          {showStaffForm && (
            <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>New Staff Account</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4, display: 'block' }}>Name</label>
                  <input style={inputStyle} value={staffForm.name} onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))} placeholder="Staff name" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4, display: 'block' }}>Phone (login ID)</label>
                  <input style={inputStyle} value={staffForm.phone} onChange={e => setStaffForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="10-digit phone" maxLength={10} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 4, display: 'block' }}>Password</label>
                  <input style={inputStyle} type="password" value={staffForm.password} onChange={e => setStaffForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" />
                </div>
                {/* ── Role Selector ── */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Role</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { value: 'restaurant_admin', label: 'Restaurant Staff', desc: 'Manage orders & menu', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#C8964B', bg: '#FDF6EC' },
                      { value: 'delivery_staff', label: 'Delivery Staff', desc: 'Deliver assigned orders', icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12', color: '#2563EB', bg: '#EFF6FF' },
                    ].map(opt => {
                      const selected = staffForm.role === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setStaffForm(p => ({ ...p, role: opt.value }))}
                          style={{
                            flex: 1, padding: '12px 10px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                            border: selected ? `2px solid ${opt.color}` : '1px solid #E8E4DE',
                            background: selected ? opt.bg : '#FAFAF8',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke={selected ? opt.color : '#888'} strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} />
                            </svg>
                            <span style={{ fontSize: 12, fontWeight: 600, color: selected ? opt.color : '#555' }}>{opt.label}</span>
                          </div>
                          <p style={{ fontSize: 10, color: '#AAA', lineHeight: '14px' }}>{opt.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {staffError && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>{staffError}</p>}

              <button
                id="add-staff-submit"
                onClick={async () => {
                  setStaffError('')
                  if (!staffForm.name || !staffForm.phone || !staffForm.password) { setStaffError('All fields are required'); return }
                  if (staffForm.phone.length !== 10) { setStaffError('Phone must be exactly 10 digits'); return }
                  if (staffForm.password.length < 6) { setStaffError('Password must be at least 6 characters'); return }
                  setAddingStaff(true)
                  try {
                    const saved = { name: staffForm.name, phone: staffForm.phone, role: staffForm.role }
                    await api.post('/staff/', staffForm)
                    setStaffForm({ name: '', phone: '', password: '', role: 'restaurant_admin' })
                    setShowStaffForm(false)
                    setLastAddedStaff(saved)
                    const { data: staff } = await api.get('/staff/')
                    setStaffList(staff || [])
                  } catch (e: any) { setStaffError(e.response?.data?.detail || 'Failed to add staff') }
                  finally { setAddingStaff(false) }
                }}
                disabled={addingStaff}
                style={{ height: 38, padding: '0 24px', borderRadius: 10, border: 'none', background: '#16A34A', color: '#fff', fontSize: 12, fontWeight: 600, cursor: addingStaff ? 'not-allowed' : 'pointer', opacity: addingStaff ? 0.6 : 1 }}
              >
                {addingStaff ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          )}

          {/* ── Post-add success banner ── */}
          {lastAddedStaff && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: 16, marginBottom: 12, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>{lastAddedStaff.name} added successfully!</p>
                  <p style={{ fontSize: 12, color: '#16A34A', marginTop: 2 }}>
                    {lastAddedStaff.role === 'delivery_staff'
                      ? 'They can log in using their phone number. Now assign them to a ready order below.'
                      : 'They can log in using their phone number and manage orders.'}
                  </p>
                </div>
                <button onClick={() => setLastAddedStaff(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Staff phone info — clean, no copy button */}
              <div style={{ background: '#fff', borderRadius: 8, padding: '8px 12px', marginBottom: 10, border: '1px solid #BBF7D0' }}>
                <p style={{ fontSize: 10, color: '#AAA', fontWeight: 600, marginBottom: 4, letterSpacing: 0.5 }}>LOGIN PHONE</p>
                <p style={{ fontSize: 13, color: '#1A1A1A', fontWeight: 600 }}>{lastAddedStaff.phone}</p>
                <p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>They can log in using this phone number.</p>
              </div>

              {/* Action buttons */}
              {lastAddedStaff.role === 'delivery_staff' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href="/manage/orders"
                    style={{
                      flex: 1, height: 36, borderRadius: 8, border: 'none',
                      background: '#16A34A', color: '#fff', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', textDecoration: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Go to Orders to Assign →
                  </a>
                  <button
                    onClick={() => setLastAddedStaff(null)}
                    style={{ height: 36, padding: '0 14px', borderRadius: 8, border: '1px solid #BBF7D0', background: '#fff', color: '#16A34A', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Staff List */}
          {staffList.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#AAA' }}>No staff members added yet.</p>
              <p style={{ fontSize: 12, color: '#CCC', marginTop: 4 }}>Add restaurant or delivery staff to manage operations.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {staffList.map(s => (
                <div key={s.id} style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: s.is_active ? (s.role === 'delivery_staff' ? '#EFF6FF' : '#F0FDF4') : '#FEF2F2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700,
                      color: s.is_active ? (s.role === 'delivery_staff' ? '#2563EB' : '#16A34A') : '#DC2626',
                      flexShrink: 0,
                    }}>
                      {(s.name || 'S')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: '#AAA' }}>{s.phone}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={roleBadgeStyle(s.role)}>{roleLabel(s.role)}</span>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: s.is_active ? '#F0FDF4' : '#FEF2F2', color: s.is_active ? '#16A34A' : '#DC2626' }}>
                        {s.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    {/* Role toggle — like bestseller button */}
                    {s.is_active && (
                      <button
                        onClick={async () => {
                          const newRole = s.role === 'delivery_staff' ? 'restaurant_admin' : 'delivery_staff'
                          try {
                            await api.patch(`/staff/${s.id}`, { role: newRole })
                            setStaffList(prev => prev.map(x => x.id === s.id ? { ...x, role: newRole } : x))
                          } catch {}
                        }}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid #E8E4DE',
                          background: '#FAFAF8',
                          color: '#666',
                          cursor: 'pointer',
                        }}
                        title="Toggle between Restaurant Staff and Delivery Staff"
                      >
                        {s.role === 'delivery_staff' ? 'Make Staff' : 'Make Delivery'}
                      </button>
                    )}
                    {s.is_active ? (
                      <button
                        onClick={() => setRemoveModal({ id: s.id, name: s.name })}
                        style={{ fontSize: 11, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          try {
                            await api.patch(`/staff/${s.id}`, { is_active: true })
                            setStaffList(prev => prev.map(x => x.id === s.id ? { ...x, is_active: true } : x))
                          } catch {}
                        }}
                        style={{ fontSize: 11, color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Logout */}
      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleLogout}
          style={{
            height: 40, borderRadius: 10, border: '1px solid #FEE2E2',
            background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600,
            padding: '0 24px', cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
