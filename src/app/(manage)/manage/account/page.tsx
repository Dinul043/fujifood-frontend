'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * Account — Admin profile, change password, logout.
 */
export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try { const { data } = await api.get('/auth/me'); setUser(data) }
      catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleChangePassword = async () => {
    if (!newPass || newPass.length < 6) { setMsg('Password must be 6+ characters'); return }
    setSaving(true); setMsg('')
    try { await api.patch(`/auth/profile?password=${encodeURIComponent(newPass)}`); setMsg('Password updated!'); setOldPass(''); setNewPass('') }
    catch { setMsg('Failed to update') }
    finally { setSaving(false) }
  }

  const handleLogout = () => {
    document.cookie = 'fujifood_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'fujifood_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/login'
  }

  if (loading) return <div className="animate-pulse"><div className="bg-[#1A1A1A]" style={{ height: '200px', borderRadius: '16px' }} /></div>

  return (
    <div>
      <h1 className="font-heading font-bold text-white" style={{ fontSize: '28px', marginBottom: '32px' }}>Account</h1>

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {/* Profile info */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '20px' }}>Profile</h3>
          <div className="flex flex-col" style={{ gap: '14px' }}>
            <div><span className="block text-[#888]" style={{ fontSize: '12px' }}>Name</span><span className="text-white font-medium" style={{ fontSize: '15px' }}>{user?.name || 'Admin'}</span></div>
            <div><span className="block text-[#888]" style={{ fontSize: '12px' }}>Phone</span><span className="text-white font-medium" style={{ fontSize: '15px' }}>{user?.phone || '-'}</span></div>
            <div><span className="block text-[#888]" style={{ fontSize: '12px' }}>Email</span><span className="text-white font-medium" style={{ fontSize: '15px' }}>{user?.email || '-'}</span></div>
            <div><span className="block text-[#888]" style={{ fontSize: '12px' }}>Role</span><span className="text-[#C8964B] font-medium capitalize" style={{ fontSize: '13px' }}>{user?.role?.replace('_', ' ')}</span></div>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '20px' }}>Change Password</h3>
          {msg && <p style={{ fontSize: '12px', marginBottom: '12px', color: msg.includes('Failed') ? '#DC2626' : '#16A34A' }}>{msg}</p>}
          <div className="flex flex-col" style={{ gap: '12px' }}>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="New password (min 6 chars)" className="w-full bg-[#0F0F0F] border border-[#333] text-white placeholder-[#555] outline-none focus:border-[#C8964B]" style={{ height: '40px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }} />
            <button onClick={handleChangePassword} disabled={saving} className="self-start font-medium text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '36px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '8px', fontSize: '13px' }}>{saving ? 'Updating...' : 'Update Password'}</button>
          </div>
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #2A2A2A' }}>
            <button onClick={handleLogout} className="font-medium text-[#DC2626] hover:bg-[#DC2626]/10 transition-all" style={{ height: '36px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '8px', fontSize: '13px' }}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  )
}
