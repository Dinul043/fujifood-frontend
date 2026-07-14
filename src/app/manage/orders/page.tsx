'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

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
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Orders</h1>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Manage incoming and active orders.</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: activeTab === tab ? 'none' : '1px solid #E8E4DE',
              background: activeTab === tab ? '#C8964B' : '#fff',
              color: activeTab === tab ? '#fff' : '#666',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
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
