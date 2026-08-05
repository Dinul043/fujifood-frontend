'use client'

import { useState, useEffect, useCallback } from 'react'
import api, { clearTokens } from '@/lib/api'

interface DeliveryOrder {
  id: number
  order_number: string
  status: string
  total_amount: number
  delivery_address: {
    line1?: string
    line2?: string
    city?: string
    pincode?: string
    phone?: string
  } | null
  customer_phone: string | null
  items: { name: string; qty: number }[]
  created_at: string
  picked_up_at?: string | null
}

type Tab = 'available' | 'mine' | 'delivered'

export default function DeliveryPage() {
  const [myOrders, setMyOrders] = useState<DeliveryOrder[]>([])
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState<number | null>(null)
  const [claimingId, setClaimingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('available')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAll = useCallback(async () => {
    try {
      const [mine, available] = await Promise.allSettled([
        api.get('/delivery/my-orders'),
        api.get('/delivery/available-orders'),
      ])
      if (mine.status === 'fulfilled') setMyOrders(mine.value.data || [])
      if (available.status === 'fulfilled') setAvailableOrders(available.value.data || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 10000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const handleClaim = async (orderId: number, orderNumber: string) => {
    setClaimingId(orderId)
    try {
      await api.post(`/delivery/claim/${orderId}`)
      showToast(`Order #${orderNumber} claimed! Customer notified.`, 'success')
      // Move to my orders tab after claiming
      setActiveTab('mine')
      await fetchAll()
    } catch (e: any) {
      showToast(e.response?.data?.detail || 'Already claimed by another staff', 'error')
    } finally {
      setClaimingId(null)
    }
  }

  const handlePickedUp = async (orderId: number) => {
    setMarkingId(orderId)
    try {
      await api.post(`/delivery/orders/${orderId}/picked-up`)
      showToast('Order is out for delivery! Customer notified.', 'success')
      await fetchAll()
    } catch (e: any) {
      showToast(e.response?.data?.detail || 'Failed to update order', 'error')
    } finally {
      setMarkingId(null)
    }
  }

  const myReady = myOrders.filter(o => o.status === 'ready')
  const myDelivered = myOrders.filter(o => o.status === 'delivered')

  const formatAddress = (addr: DeliveryOrder['delivery_address']) => {
    if (!addr) return '—'
    return [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(', ')
  }

  const tabCounts: Record<Tab, number> = {
    available: availableOrders.length,
    mine: myReady.length,
    delivered: myDelivered.length,
  }

  const TABS: { key: Tab; label: string; color: string }[] = [
    { key: 'available', label: 'Available', color: '#D97706' },
    { key: 'mine', label: 'My Deliveries', color: '#C8964B' },
    { key: 'delivered', label: 'Delivered', color: '#16A34A' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 300,
          background: toast.type === 'success' ? '#1A1A1A' : '#DC2626',
          color: '#fff', borderRadius: 12,
          padding: '12px 24px', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)', whiteSpace: 'nowrap',
          animation: 'toastIn 0.25s ease',
        }}>
          {toast.msg}
        </div>
      )}
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
      `}</style>

      {/* ── DESKTOP (lg and above) ── */}
      <div className="hidden lg:block">
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', minHeight: '100vh' }}>

          {/* Minimal sidebar */}
          <div style={{
            width: 240, background: '#fff', borderRight: '1px solid #EBEBEB',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
            position: 'sticky', top: 0, height: '100vh',
          }}>
            <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#C8964B,#D4A853)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TruckIcon size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>Delivery Panel</div>
                <div style={{ fontSize: 9, color: '#C8964B', letterSpacing: 1 }}>STAFF VIEW</div>
              </div>
            </div>

            {/* Sidebar Nav */}
            <div style={{ flex: 1, padding: '20px 12px' }}>
              {TABS.map(t => {
                const active = activeTab === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 10, border: 'none', marginBottom: 4,
                      background: active ? '#FDF6EC' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? t.color : '#666' }}>
                      {t.label}
                    </span>
                    {tabCounts[t.key] > 0 && (
                      <span style={{
                        minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px',
                        background: active ? t.color : '#E8E4DE',
                        color: active ? '#fff' : '#888',
                        fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: t.key === 'available' && tabCounts.available > 0 ? 'pulse 2s infinite' : 'none',
                      }}>
                        {tabCounts[t.key]}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F0F0' }}>
              <button
                onClick={() => { clearTokens(); window.location.href = '/login' }}
                style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, padding: '32px 40px' }}>
            <DesktopContent
              activeTab={activeTab}
              available={availableOrders}
              myReady={myReady}
              myDelivered={myDelivered}
              loading={loading}
              claimingId={claimingId}
              markingId={markingId}
              handleClaim={handleClaim}
              handlePickedUp={handlePickedUp}
              formatAddress={formatAddress}
            />
          </div>
        </div>
      </div>

      {/* ── MOBILE (below lg) ── */}
      <div className="block lg:hidden">
        {/* Fixed header */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 56,
          background: '#fff', borderBottom: '1px solid #EBEBEB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#C8964B,#D4A853)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TruckIcon size={13} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>Delivery Panel</span>
          </div>
          <button
            onClick={() => { clearTokens(); window.location.href = '/login' }}
            style={{ fontSize: 11, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '4px 10px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>

        {/* Mobile tabs */}
        <div style={{
          position: 'fixed', top: 56, left: 0, right: 0, zIndex: 39,
          background: '#fff', borderBottom: '1px solid #F0F0F0',
          display: 'flex', padding: '0 12px',
        }}>
          {TABS.map(t => {
            const active = activeTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  flex: 1, padding: '10px 4px', border: 'none', background: 'none', cursor: 'pointer',
                  borderBottom: active ? `2px solid ${t.color}` : '2px solid transparent',
                  color: active ? t.color : '#888', fontSize: 12, fontWeight: active ? 700 : 400,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                {t.label}
                {tabCounts[t.key] > 0 && (
                  <span style={{
                    minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
                    background: active ? t.color : '#E8E4DE',
                    color: active ? '#fff' : '#888', fontSize: 10, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {tabCounts[t.key]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div style={{ paddingTop: 112, padding: '116px 16px 40px' }}>
          <MobileContent
            activeTab={activeTab}
            available={availableOrders}
            myReady={myReady}
            myDelivered={myDelivered}
            loading={loading}
            claimingId={claimingId}
            markingId={markingId}
            handleClaim={handleClaim}
            handlePickedUp={handlePickedUp}
            formatAddress={formatAddress}
          />
        </div>
      </div>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────
function TruckIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  )
}

// ── Desktop Content ────────────────────────────────────────────────────────
function DesktopContent({ activeTab, available, myReady, myDelivered, loading, claimingId, markingId, handleClaim, handlePickedUp, formatAddress }: any) {
  const titleMap: Record<Tab, string> = {
    available: 'Available Orders',
    mine: 'My Deliveries',
    delivered: 'Completed Deliveries',
  }
  const subtitleMap: Record<Tab, string> = {
    available: 'Unassigned orders ready for pickup — claim one to start delivering.',
    mine: 'Orders assigned to you. Pick them up and mark out for delivery.',
    delivered: 'Your completed deliveries.',
  }
  const orders: DeliveryOrder[] = activeTab === 'available' ? available : activeTab === 'mine' ? myReady : myDelivered

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{titleMap[activeTab as Tab]}</h1>
        <p style={{ fontSize: 14, color: '#888' }}>{subtitleMap[activeTab as Tab]}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Available', value: available.length, bg: '#FFF7ED', color: '#D97706' },
          { label: 'Assigned to Me', value: myReady.length, bg: '#FDF6EC', color: '#C8964B' },
          { label: 'Completed', value: myDelivered.length, bg: '#F0FDF4', color: '#16A34A' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '14px 18px', minWidth: 110 }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 11, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#AAA', fontSize: 14 }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <EmptyState tab={activeTab as Tab} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {orders.map((order: DeliveryOrder) => (
            <OrderCard
              key={order.id}
              order={order}
              tab={activeTab as Tab}
              claimingId={claimingId}
              markingId={markingId}
              handleClaim={handleClaim}
              handlePickedUp={handlePickedUp}
              formatAddress={formatAddress}
              isMobile={false}
            />
          ))}
        </div>
      )}
    </>
  )
}

// ── Mobile Content ─────────────────────────────────────────────────────────
function MobileContent({ activeTab, available, myReady, myDelivered, loading, claimingId, markingId, handleClaim, handlePickedUp, formatAddress }: any) {
  const orders: DeliveryOrder[] = activeTab === 'available' ? available : activeTab === 'mine' ? myReady : myDelivered
  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#AAA', fontSize: 14 }}>Loading...</div>
  if (orders.length === 0) return <EmptyState tab={activeTab as Tab} />
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {orders.map((order: DeliveryOrder) => (
        <OrderCard
          key={order.id}
          order={order}
          tab={activeTab as Tab}
          claimingId={claimingId}
          markingId={markingId}
          handleClaim={handleClaim}
          handlePickedUp={handlePickedUp}
          formatAddress={formatAddress}
          isMobile={true}
        />
      ))}
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: Tab }) {
  const msgs: Record<Tab, { title: string; sub: string }> = {
    available: { title: 'No orders available', sub: 'When orders are ready and unassigned, they appear here.' },
    mine: { title: 'No assigned deliveries', sub: 'Claim an order from Available, or wait for the owner to assign one.' },
    delivered: { title: 'No completed deliveries', sub: 'Your completed deliveries will show here.' },
  }
  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#FDF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <TruckIcon size={26} color="#C8964B" />
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>{msgs[tab].title}</p>
      <p style={{ fontSize: 13, color: '#AAA', maxWidth: 280, margin: '0 auto' }}>{msgs[tab].sub}</p>
    </div>
  )
}

// ── Order Card ─────────────────────────────────────────────────────────────
function OrderCard({ order, tab, claimingId, markingId, handleClaim, handlePickedUp, formatAddress, isMobile }: {
  order: DeliveryOrder
  tab: Tab
  claimingId: number | null
  markingId: number | null
  handleClaim: (id: number, num: string) => void
  handlePickedUp: (id: number) => void
  formatAddress: (addr: any) => string
  isMobile: boolean
}) {
  const phone = order.customer_phone || order.delivery_address?.phone
  const isAvailable = tab === 'available'
  const isMine = tab === 'mine'
  const isDelivered = tab === 'delivered'
  const isClaiming = claimingId === order.id
  const isMarking = markingId === order.id

  const borderColor = isAvailable ? '#FDE68A' : isMine ? '#F5E6D0' : '#BBF7D0'
  const bgGlow = isAvailable ? 'rgba(217,119,6,0.04)' : isMine ? 'rgba(200,150,75,0.04)' : 'transparent'

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${borderColor}`,
      borderRadius: isMobile ? 14 : 16,
      padding: isMobile ? 14 : 20,
      boxShadow: `0 2px 12px ${bgGlow}`,
      transition: 'all 0.2s ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: '#1A1A1A' }}>#{order.order_number}</span>
          <p style={{ fontSize: 10, color: '#BBB', marginTop: 2 }}>
            {new Date(order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
          background: isAvailable ? '#FFF7ED' : isMine ? '#FFF7ED' : '#F0FDF4',
          color: isAvailable ? '#D97706' : isMine ? '#D97706' : '#16A34A',
        }}>
          {isAvailable ? 'Unassigned' : isMine ? 'Ready to pick up' : 'Delivered'}
        </span>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 10 }}>
        {order.items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8964B', flexShrink: 0 }} />
            <span style={{ fontSize: isMobile ? 12 : 13, color: '#444' }}>{item.name} <span style={{ color: '#AAA' }}>×{item.qty}</span></span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #F8F8F6', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#888' }}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
        <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: '#1A1A1A' }}>₹{order.total_amount}</span>
      </div>

      {/* Delivery Address */}
      {order.delivery_address && (
        <div style={{ background: '#F8F8F6', borderRadius: 8, padding: '8px 10px', marginBottom: 12 }}>
          <p style={{ fontSize: 9, color: '#AAA', fontWeight: 600, marginBottom: 2, letterSpacing: 0.5 }}>DELIVER TO</p>
          <p style={{ fontSize: isMobile ? 11 : 12, color: '#444', lineHeight: '17px' }}>{formatAddress(order.delivery_address)}</p>
          {phone && (
            <a
              href={`tel:${phone}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                marginTop: 5, fontSize: 12, color: '#C8964B', fontWeight: 600, textDecoration: 'none',
                background: '#fff', padding: '3px 8px', borderRadius: 5, border: '1px solid #F0E6D3',
              }}
            >
              <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-.54.198-1.065.567-1.478l1.38-1.516A1.875 1.875 0 015.75 2.625h12.5a1.875 1.875 0 011.553.719l1.38 1.516c.37.412.567.938.567 1.478v13.5a1.875 1.875 0 01-1.875 1.875H4.125A1.875 1.875 0 012.25 19.838V6.338z" />
              </svg>
              Call Customer: {phone}
            </a>
          )}
        </div>
      )}

      {/* Action buttons */}
      {isAvailable && (
        <button
          onClick={() => handleClaim(order.id, order.order_number)}
          disabled={isClaiming}
          style={{
            width: '100%', height: isMobile ? 38 : 42, borderRadius: 10, border: 'none',
            background: isClaiming ? '#E8E4DE' : 'linear-gradient(135deg,#D97706,#C8964B)',
            color: isClaiming ? '#999' : '#fff', fontSize: isMobile ? 12 : 13, fontWeight: 700,
            cursor: isClaiming ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {isClaiming ? 'Claiming...' : (
            <>
              <TruckIcon size={14} color="#fff" />
              Claim This Order
            </>
          )}
        </button>
      )}

      {isMine && (
        <button
          onClick={() => handlePickedUp(order.id)}
          disabled={isMarking}
          style={{
            width: '100%', height: isMobile ? 38 : 42, borderRadius: 10, border: 'none',
            background: isMarking ? '#E8E4DE' : '#C8964B',
            color: isMarking ? '#999' : '#fff', fontSize: isMobile ? 12 : 13, fontWeight: 600,
            cursor: isMarking ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {isMarking ? 'Updating...' : (
            <>
              <TruckIcon size={14} color="#fff" />
              Mark Out for Delivery
            </>
          )}
        </button>
      )}

      {isDelivered && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#F0FDF4', borderRadius: 8 }}>
          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>Delivered successfully</span>
        </div>
      )}
    </div>
  )
}
