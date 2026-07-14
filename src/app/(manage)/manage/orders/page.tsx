'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * Manage Orders — Live orders list with status management.
 * Admin can: confirm, prepare, mark ready, deliver, reject orders.
 */

const statusActions: Record<string, { next: string; label: string; color: string }[]> = {
  pending: [{ next: 'confirmed', label: 'Accept', color: '#16A34A' }, { next: 'rejected', label: 'Reject', color: '#DC2626' }],
  confirmed: [{ next: 'preparing', label: 'Start Preparing', color: '#2563EB' }],
  preparing: [{ next: 'ready', label: 'Mark Ready', color: '#C8964B' }],
  ready: [{ next: 'delivered', label: 'Mark Delivered', color: '#16A34A' }],
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchOrders = async () => {
    try {
      const params = filter === 'all' ? '' : `?status=${filter}`
      const { data } = await api.get(`/orders/manage${params}`)
      setOrders(data.orders || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [filter])

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/orders/manage/${orderId}/status`, { status: newStatus })
      fetchOrders()
    } catch (err: any) { alert(err.response?.data?.detail || 'Failed to update') }
  }

  const filters = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="font-heading font-bold text-white" style={{ fontSize: '28px', marginBottom: '4px' }}>Orders</h1>
          <p className="text-[#888]" style={{ fontSize: '14px' }}>Manage incoming orders in real-time.</p>
        </div>
        <button onClick={fetchOrders} className="font-medium text-[#CCC] border border-[#333] hover:border-[#C8964B] transition-all" style={{ height: '36px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '8px', fontSize: '13px' }}>Refresh</button>
      </div>

      {/* Filter tabs */}
      <div className="flex" style={{ gap: '8px', marginBottom: '24px' }}>
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="capitalize font-medium transition-all" style={{ height: '36px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '8px', fontSize: '12px', background: filter === f ? '#C8964B' : '#1A1A1A', color: filter === f ? 'white' : '#888', border: filter === f ? 'none' : '1px solid #2A2A2A' }}>{f}</button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? <div className="animate-pulse"><div className="bg-[#1A1A1A]" style={{ height: '100px', borderRadius: '12px', marginBottom: '12px' }} /><div className="bg-[#1A1A1A]" style={{ height: '100px', borderRadius: '12px' }} /></div> : orders.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] text-center" style={{ padding: '60px', borderRadius: '16px' }}>
          <p className="text-[#888]" style={{ fontSize: '15px' }}>No {filter === 'all' ? '' : filter} orders.</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {orders.map((order) => (
            <div key={order.id} className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '20px 24px', borderRadius: '14px' }}>
              <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
                <div>
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <p className="font-semibold text-white" style={{ fontSize: '15px' }}>#{order.order_number}</p>
                    <span className="capitalize font-medium" style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: order.status === 'pending' ? '#FFF7ED' : order.status === 'delivered' ? '#F0FDF4' : order.status === 'cancelled' ? '#FEF2F2' : '#EFF6FF', color: order.status === 'pending' ? '#D97706' : order.status === 'delivered' ? '#16A34A' : order.status === 'cancelled' ? '#DC2626' : '#2563EB' }}>{order.status}</span>
                  </div>
                  <p className="text-[#888]" style={{ fontSize: '12px', marginTop: '4px' }}>{new Date(order.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                </div>
                <span className="font-bold text-[#C8964B]" style={{ fontSize: '18px' }}>₹{order.total_amount}</span>
              </div>
              {/* Items */}
              <div className="flex flex-wrap" style={{ gap: '6px', marginBottom: '12px' }}>
                {order.items?.map((item: any, idx: number) => (
                  <span key={idx} className="text-[#AAA] bg-[#222]" style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}>{item.item_name} x{item.quantity}</span>
                ))}
              </div>
              {/* Actions */}
              {statusActions[order.status] && (
                <div className="flex" style={{ gap: '8px' }}>
                  {statusActions[order.status].map((action) => (
                    <button key={action.next} onClick={() => handleStatusChange(order.id, action.next)} className="font-medium text-white transition-all hover:opacity-90" style={{ height: '32px', paddingLeft: '14px', paddingRight: '14px', borderRadius: '8px', fontSize: '12px', background: action.color }}>{action.label}</button>
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
