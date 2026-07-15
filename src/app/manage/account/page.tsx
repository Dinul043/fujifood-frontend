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
  const [staffForm, setStaffForm] = useState({ name: '', phone: '', password: '' })
  const [addingStaff, setAddingStaff] = useState(false)
  const [staffError, setStaffError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
        setForm(prev => ({ ...prev, name: data.name || '', phone: data.phone || '' }))
        // Fetch staff list if owner
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
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Account</h1>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Manage your profile and security.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Profile Info */}
        <div
          style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 20 }}
        >
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
        <div
          style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 20 }}
        >
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
                height: 40,
                borderRadius: 10,
                border: 'none',
                background: saved ? '#16A34A' : '#C8964B',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                transition: 'all 0.2s ease',
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
              onClick={() => setShowStaffForm(!showStaffForm)}
              style={{ height: 34, padding: '0 14px', borderRadius: 10, border: 'none', background: '#C8964B', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              {showStaffForm ? 'Cancel' : '+ Add Staff'}
            </button>
          </div>

          {/* Add Staff Form */}
          {showStaffForm && (
            <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
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
              </div>
              {staffError && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 8 }}>{staffError}</p>}
              <button
                onClick={async () => {
                  setStaffError('')
                  if (!staffForm.name || !staffForm.phone || !staffForm.password) { setStaffError('All fields are required'); return }
                  if (staffForm.phone.length !== 10) { setStaffError('Phone must be exactly 10 digits'); return }
                  if (staffForm.password.length < 6) { setStaffError('Password must be at least 6 characters'); return }
                  setAddingStaff(true)
                  try {
                    await api.post('/staff/', staffForm)
                    setStaffForm({ name: '', phone: '', password: '' })
                    setShowStaffForm(false)
                    const { data: staff } = await api.get('/staff/')
                    setStaffList(staff || [])
                  } catch (e: any) { setStaffError(e.response?.data?.detail || 'Failed to add staff') }
                  finally { setAddingStaff(false) }
                }}
                disabled={addingStaff}
                style={{ height: 36, padding: '0 20px', borderRadius: 10, border: 'none', background: '#16A34A', color: '#fff', fontSize: 12, fontWeight: 600, cursor: addingStaff ? 'not-allowed' : 'pointer', opacity: addingStaff ? 0.6 : 1 }}
              >
                {addingStaff ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          )}

          {/* Staff List */}
          {staffList.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#AAA' }}>No staff members added yet.</p>
              <p style={{ fontSize: 12, color: '#CCC', marginTop: 4 }}>Staff can login with phone + password to manage orders and menu.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {staffList.map(s => (
                <div key={s.id} style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.is_active ? '#F0FDF4' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: s.is_active ? '#16A34A' : '#DC2626', flexShrink: 0 }}>
                      {(s.name || 'S')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                      <p style={{ fontSize: 11, color: '#AAA' }}>{s.phone}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: s.is_active ? '#F0FDF4' : '#FEF2F2', color: s.is_active ? '#16A34A' : '#DC2626', flexShrink: 0 }}>
                      {s.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {s.is_active ? (
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Remove ${s.name} from staff?`)) return
                          try {
                            await api.delete(`/staff/${s.id}`)
                            setStaffList(prev => prev.map(x => x.id === s.id ? { ...x, is_active: false } : x))
                          } catch {}
                        }}
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
            height: 40,
            borderRadius: 10,
            border: '1px solid #FEE2E2',
            background: '#FEF2F2',
            color: '#DC2626',
            fontSize: 13,
            fontWeight: 600,
            padding: '0 24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
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
