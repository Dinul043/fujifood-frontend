'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import api from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'

const nav = [
  { label: 'Dashboard', href: '/manage', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', ownerOnly: false },
  { label: 'Orders', href: '/manage/orders', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', ownerOnly: false },
  { label: 'Menu', href: '/manage/menu', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', ownerOnly: false },
  { label: 'Website Studio', href: '/manage/website', d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', ownerOnly: true },
  { label: 'Business', href: '/manage/business', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', ownerOnly: true },
  { label: 'Reviews', href: '/manage/customers', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', ownerOnly: true },
  { label: 'Reports', href: '/manage/reports', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', ownerOnly: true },
  { label: 'History', href: '/manage/history', d: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z', ownerOnly: true },
  { label: 'Account', href: '/manage/account', d: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z', ownerOnly: false },
]

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const [ok, setOk] = useState(false)
  const [load, setLoad] = useState(true)
  const [nm, setNm] = useState('R')
  const [drawer, setDrawer] = useState(false)
  const [tenantId, setTenantId] = useState<number | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [globalToast, setGlobalToast] = useState<{ message: string; orderNumber: string } | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => { (async () => { try { const { data } = await api.get('/auth/me'); if (data.role === 'restaurant_admin') { setOk(true); setNm(data.name?.[0] || 'R'); setTenantId(data.tenant_id); setIsOwner(data.is_owner || false) } else window.location.href = '/' } catch { window.location.href = '/login' } finally { setLoad(false) } })() }, [])
  useEffect(() => { if (drawer) setDrawer(false) }, [path])

  // Route protection: redirect non-owners from owner-only pages
  useEffect(() => {
    if (!ok || load) return
    const ownerRoutes = ['/manage/website', '/manage/business', '/manage/customers', '/manage/reports', '/manage/history']
    if (!isOwner && ownerRoutes.some(r => path.startsWith(r))) {
      window.location.href = '/manage'
    }
  }, [path, isOwner, ok, load])

  // Fetch pending order count for badge
  useEffect(() => {
    if (!ok) return
    ;(async () => {
      try {
        const { data } = await api.get('/orders/manage?page_size=100&status=pending')
        setPendingCount(data.total || 0)
      } catch {}
    })()
  }, [ok])

  // Global WebSocket — works on ALL admin pages
  const wsUrl = tenantId
    ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/v1$/, '').replace(/^http/, 'ws')}/ws/admin/${tenantId}`
    : null

  const handleWsMessage = useCallback((msg: { event: string; data: any }) => {
    if (msg.event === 'new_order') {
      setPendingCount(prev => prev + 1)
      setGlobalToast({ message: 'New order received!', orderNumber: msg.data.order_number })
      setTimeout(() => setGlobalToast(null), 5000)
    }
    if (msg.event === 'order_cancelled') {
      setPendingCount(prev => Math.max(0, prev - 1))
    }
  }, [])

  useWebSocket(wsUrl, handleWsMessage)

  if (load) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}><p style={{ color: '#aaa', fontSize: 14 }}>Loading...</p></div>
  if (!ok) return null

  const NavItems = () => (<>
    {nav.filter(n => !n.ownerOnly || isOwner).map(n => {
      const a = n.href === '/manage' ? path === '/manage' : path.startsWith(n.href)
      const showBadge = n.label === 'Orders' && pendingCount > 0
      return <a key={n.href} href={n.href} onClick={() => setDrawer(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, fontSize: 14, fontWeight: a ? 600 : 400, color: a ? '#C8964B' : '#666', background: a ? '#FDF6EC' : 'transparent', textDecoration: 'none', marginBottom: 2, transition: 'all 0.15s', position: 'relative' }} onMouseEnter={e => { if (!a) { (e.currentTarget as HTMLElement).style.background = '#F8F8F6'; (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)' } }} onMouseLeave={e => { if (!a) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.transform = 'translateX(0)' } }}><svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 2 : 1.5}><path strokeLinecap="round" strokeLinejoin="round" d={n.d} /></svg>{n.label}{showBadge && <span style={{ marginLeft: 'auto', minWidth: 20, height: 20, borderRadius: 10, background: '#DC2626', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{pendingCount}</span>}</a>
    })}
  </>)

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Global new order notification toast */}
      {globalToast && (
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 100, animation: 'toastSlide 0.3s ease', background: '#fff', borderRadius: 14, padding: '16px 20px', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', border: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 14, maxWidth: 360 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FDF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{globalToast.message}</p>
            <p style={{ fontSize: 12, color: '#C8964B', fontWeight: 500 }}>Order #{globalToast.orderNumber}</p>
          </div>
          <button onClick={() => setGlobalToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: 8 }}>
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#AAA" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
      <style>{`@keyframes toastSlide { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      {/* ════ DESKTOP (min-width 1024px) ════ */}
      <div className="hidden lg:block">
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar */}
          <div style={{ width: 240, background: '#fff', borderRight: '1px solid #EBEBEB', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#C8964B,#D4A853)', color: '#fff', fontSize: 11, fontWeight: 700 }}>A2B</div>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>A2B Restaurant</div><div style={{ fontSize: 9, color: '#C8964B', letterSpacing: 1 }}>MANAGEMENT</div></div>
          </div>
          <div style={{ flex: 1, padding: '16px 12px', overflow: 'auto' }}><NavItems /></div>
          <div style={{ padding: '12px 12px', borderTop: '1px solid #F0F0F0' }}>
            <a href="/" style={{ fontSize: 12, color: '#999', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, transition: 'all 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C8964B'; (e.currentTarget as HTMLElement).style.background = '#FDF6EC' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#999'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              View Storefront
            </a>
          </div>
        </div>
        {/* Content */}
        <div style={{ flex: 1, padding: '32px 40px', maxWidth: 1200 }}>
          {children}
        </div>
        </div>
      </div>

      {/* ════ MOBILE (below 1024px) ════ */}
      <div className="block lg:hidden">
        {/* Header */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: '#fff', borderBottom: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 40 }}>
          <button onClick={() => setDrawer(true)} style={{ background: 'none', border: 'none' }}><svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#1A1A1A" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>A2B Restaurant</div>
          <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#C8964B,#D4A853)', color: '#fff', fontSize: 11, fontWeight: 700 }}>{nm}</div>
        </div>
        {/* Drawer */}
        {drawer && <>
          <div onClick={() => setDrawer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 50 }} />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, background: '#fff', zIndex: 51, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
            <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#C8964B,#D4A853)', color: '#fff', fontSize: 10, fontWeight: 700 }}>A2B</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>A2B Restaurant</div>
              </div>
              <button onClick={() => setDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke="#666" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ flex: 1, padding: '16px 12px', overflow: 'auto' }}><NavItems /></div>
          </div>
        </>}
        {/* Content */}
        <div style={{ paddingTop: 56, padding: '72px 16px 32px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
