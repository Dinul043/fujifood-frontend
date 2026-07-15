'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'

const STATUS_TABS = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#FFF7ED', color: '#D97706' },
  confirmed: { bg: '#EFF6FF', color: '#2563EB' },
  preparing: { bg: '#FDF4FF', color: '#9333EA' },
  ready: { bg: '#ECFDF5', color: '#059669' },
  delivered: { bg: '#F0FDF4', color: '#16A34A' },
  cancelled: { bg: '#FEF2F2', color: '#DC2626' },
  rejected: { bg: '#FEF2F2', color: '#DC2626' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<number | null>(null)
  const [newOrderToast, setNewOrderToast] = useState<{ orderNumber: string; amount: number } | null>(null)

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/manage?page_size=100')
      setOrders(data.orders || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  // Get tenant_id for WebSocket connection
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me')
        setTenantId(data.tenant_id)
      } catch {}
    })()
  }, [])

  // WebSocket for real-time new order notifications
  const wsUrl = tenantId
    ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/v1$/, '').replace(/^http/, 'ws')}/ws/admin/${tenantId}`
    : null

  const handleWsMessage = useCallback((msg: { event: string; data: any }) => {
    if (msg.event === 'new_order') {
      // Refresh orders list
      fetchOrders()
      // Show toast
      setNewOrderToast({ orderNumber: msg.data.order_number, amount: msg.data.total_amount })
      setTimeout(() => setNewOrderToast(null), 5000)
    }
    if (msg.event === 'order_cancelled') {
      fetchOrders()
    }
  }, [])

  const { isConnected } = useWebSocket(wsUrl, handleWsMessage)

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter(o => activeTab === 'cancelled' ? ['cancelled', 'rejected'].includes(o.status) : o.status === activeTab)

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      await api.patch(`/orders/manage/${orderId}/status`, { status })
      await fetchOrders()
    } catch {
      // handle error
    } finally {
      setUpdating(null)
    }
  }

  const getActions = (order: any) => {
    switch (order.status) {
      case 'pending':
        return [
          { label: 'Accept', status: 'confirmed', bg: '#16A34A', color: '#fff' },
          { label: 'Reject', status: 'rejected', bg: '#FEF2F2', color: '#DC2626' },
        ]
      case 'confirmed':
        return [{ label: 'Start Preparing', status: 'preparing', bg: '#C8964B', color: '#fff' }]
      case 'preparing':
        return [{ label: 'Mark Ready', status: 'ready', bg: '#2563EB', color: '#fff' }]
      case 'ready':
        return [{ label: 'Mark Delivered', status: 'delivered', bg: '#16A34A', color: '#fff' }]
      default:
        return []
    }
  }

  return (
    <div>
      {/* New order notification toast */}
      {newOrderToast && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 60, animation: 'slideIn 0.3s ease', background: '#fff', borderRadius: 14, padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12, maxWidth: 340 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FDF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>New Order #{newOrderToast.orderNumber}</p>
            <p style={{ fontSize: 12, color: '#888' }}>Amount: ₹{newOrderToast.amount}</p>
          </div>
        </div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Orders</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Manage incoming and active orders.</p>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isConnected ? '#16A34A' : '#DC2626', display: 'inline-block', marginBottom: 32 }} title={isConnected ? 'Live updates connected' : 'Reconnecting...'} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }} className="scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: activeTab === tab ? 'none' : '1px solid #E8E4DE',
              background: activeTab === tab ? '#C8964B' : '#fff',
              color: activeTab === tab ? '#fff' : '#666',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#AAA', fontSize: 14 }}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#AAA', fontSize: 14 }}>No orders found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(order => (
            <div
              key={order.id}
              style={{
                background: '#fff',
                border: '1px solid #F0F0F0',
                borderRadius: 16,
                padding: 20,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              {/* Order header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>#{order.order_number}</span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '4px 10px',
                  borderRadius: 6,
                  textTransform: 'capitalize',
                  background: STATUS_COLORS[order.status]?.bg || '#F5F5F5',
                  color: STATUS_COLORS[order.status]?.color || '#666',
                }}>{order.status}</span>
              </div>

              {/* Order details */}
              <div style={{ marginBottom: 12 }}>
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                    <img src={`/images/food/dish-${((item.menu_item_id || idx) % 10) + 1}.png`} alt={item.item_name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                    <span style={{ fontSize: 13, color: '#1A1A1A', flex: 1 }}>{item.item_name} <span style={{ color: '#AAA' }}>x{item.quantity}</span></span>
                    <span style={{ fontSize: 12, color: '#888' }}>₹{item.line_total}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#888' }}>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>₹{order.total_amount}</span>
              </div>

              {/* Timestamp */}
              <p style={{ fontSize: 11, color: '#BBB', marginBottom: 12 }}>
                {order.created_at ? new Date(order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
              </p>

              {/* Actions */}
              {getActions(order).length > 0 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {getActions(order).map(action => (
                    <button
                      key={action.status}
                      onClick={() => updateStatus(order.id, action.status)}
                      disabled={updating === order.id}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 10,
                        border: action.bg === '#FEF2F2' ? '1px solid #FECACA' : 'none',
                        background: action.bg,
                        color: action.color,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: updating === order.id ? 'not-allowed' : 'pointer',
                        opacity: updating === order.id ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {updating === order.id ? '...' : action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
