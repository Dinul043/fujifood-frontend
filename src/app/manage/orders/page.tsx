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

interface DeliveryStaff {
  id: number
  name: string
  phone: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [deliveryStaff, setDeliveryStaff] = useState<DeliveryStaff[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  // Per-order assignment state
  const [assigningOrder, setAssigningOrder] = useState<number | null>(null)
  const [assignedToast, setAssignedToast] = useState<string | null>(null)

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

  useEffect(() => {
    fetchOrders()
    // Check if owner and load delivery staff
    ;(async () => {
      try {
        const { data: me } = await api.get('/auth/me')
        if (me.is_owner) {
          setIsOwner(true)
          try {
            const { data: staff } = await api.get('/delivery/staff-list')
            setDeliveryStaff(staff || [])
          } catch {}
        }
        setCurrentUserId(me.id)
        setCurrentUserRole(me.role)
      } catch {}
    })()
  }, [])

  // Auto-refresh orders every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter(o => activeTab === 'cancelled' ? ['cancelled', 'rejected'].includes(o.status) : o.status === activeTab)

  const updateStatus = async (orderId: number, newStatus: string) => {
    setUpdating(orderId)
    try {
      await api.patch(`/orders/manage/${orderId}/status`, { status: newStatus })
      await fetchOrders()
    } catch {} finally {
      setUpdating(null)
    }
  }

  const assignStaff = async (orderId: number, staffId: number, staffName: string) => {
    setAssigningOrder(orderId)
    try {
      await api.post(`/delivery/assign/${orderId}`, { staff_id: staffId })
      setAssignedToast(`${staffName} assigned successfully`)
      setTimeout(() => setAssignedToast(null), 3000)
      await fetchOrders()
    } catch (e: any) {
      setAssignedToast(e.response?.data?.detail || 'Failed to assign staff')
      setTimeout(() => setAssignedToast(null), 3000)
    } finally {
      setAssigningOrder(null)
    }
  }

  const selfAssign = async (orderId: number) => {
    setAssigningOrder(orderId)
    try {
      await api.post(`/delivery/claim/${orderId}`)
      setAssignedToast('You are assigned for this delivery')
      setTimeout(() => setAssignedToast(null), 3000)
      await fetchOrders()
    } catch (e: any) {
      setAssignedToast(e.response?.data?.detail || 'Could not assign')
      setTimeout(() => setAssignedToast(null), 3000)
    } finally {
      setAssigningOrder(null)
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
        return [
          { label: 'Start Preparing', status: 'preparing', bg: '#C8964B', color: '#fff' },
          { label: 'Cancel', status: 'cancelled', bg: '#FEF2F2', color: '#DC2626' },
        ]
      case 'preparing':
        return [
          { label: 'Mark Ready', status: 'ready', bg: '#2563EB', color: '#fff' },
          { label: 'Cancel', status: 'cancelled', bg: '#FEF2F2', color: '#DC2626' },
        ]
      case 'ready':
        return [{ label: 'Mark Delivered', status: 'delivered', bg: '#16A34A', color: '#fff' }]
      default:
        return []
    }
  }

  return (
    <div>
      {/* Toast notification */}
      {assignedToast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: '#1A1A1A', color: '#fff', borderRadius: 12,
          padding: '12px 24px', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
          animation: 'toastIn 0.25s ease',
        }}>
          {assignedToast}
        </div>
      )}
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>

      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Orders</h1>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Manage incoming and active orders.</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
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
                <div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>#{order.order_number}</span>
                  {order.customer_name && <p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{order.customer_name}</p>}
                  {order.customer_phone && (
                    <a href={`tel:${order.customer_phone}`} style={{ fontSize: 11, color: '#C8964B', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-.54.198-1.065.567-1.478l1.38-1.516A1.875 1.875 0 015.75 2.625h12.5a1.875 1.875 0 011.553.719l1.38 1.516c.37.412.567.938.567 1.478v13.5a1.875 1.875 0 01-1.875 1.875H4.125A1.875 1.875 0 012.25 19.838V6.338z" /></svg>
                      {order.customer_phone}
                    </a>
                  )}
                </div>
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

              {/* Delivery Address */}
              {order.delivery_address && (
                <div style={{ marginBottom: 12, padding: '8px 10px', borderRadius: 8, background: '#F8F8F6' }}>
                  <p style={{ fontSize: 10, color: '#AAA', marginBottom: 2, fontWeight: 500 }}>DELIVER TO</p>
                  <p style={{ fontSize: 12, color: '#444', lineHeight: '17px' }}>
                    {[order.delivery_address.line1, order.delivery_address.line2, order.delivery_address.city, order.delivery_address.pincode].filter(Boolean).join(', ')}
                  </p>
                  {order.delivery_address.phone && (
                    <a href={`tel:${order.delivery_address.phone}`} style={{ fontSize: 11, color: '#C8964B', fontWeight: 500, textDecoration: 'none' }}>{order.delivery_address.phone}</a>
                  )}
                </div>
              )}

              {/* ── Assigned staff badge ── */}
              {order.assigned_staff_name && (
                <div style={{ marginBottom: 12, padding: '8px 10px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, color: '#16A34A', fontWeight: 600 }}>ASSIGNED STAFF</p>
                    <p style={{ fontSize: 12, color: '#166534', fontWeight: 500 }}>{order.assigned_staff_name}</p>
                  </div>
                  {order.assigned_staff_phone && (
                    <a href={`tel:${order.assigned_staff_phone}`} style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, textDecoration: 'none' }}>
                      {order.assigned_staff_phone}
                    </a>
                  )}
                </div>
              )}

              {/* ── Self-assign: staff can take a delivery ── */}
              {!isOwner && order.status === 'ready' && !order.assigned_staff_id && (
                <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid #BFDBFE', background: '#EFF6FF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8', marginBottom: 2 }}>Order ready for delivery</p>
                      <p style={{ fontSize: 11, color: '#3B82F6' }}>Click to assign this delivery to yourself</p>
                    </div>
                    <button
                      onClick={() => selfAssign(order.id)}
                      disabled={assigningOrder === order.id}
                      style={{ height: 34, padding: '0 14px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0, opacity: assigningOrder === order.id ? 0.6 : 1 }}
                    >
                      {assigningOrder === order.id ? 'Assigning...' : 'Take Delivery'}
                    </button>
                  </div>
                </div>
              )}

              {/* My assignment indicator for non-owner */}
              {!isOwner && order.assigned_staff_id === currentUserId && order.status === 'ready' && (
                <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid #BBF7D0', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>You are assigned for this delivery</p>
                  </div>
                  <button
                    onClick={async () => {
                      setAssigningOrder(order.id)
                      try {
                        await api.post(`/delivery/orders/${order.id}/picked-up`)
                        setAssignedToast('Order marked as out for delivery')
                        setTimeout(() => setAssignedToast(null), 3000)
                        await fetchOrders()
                      } catch (e: any) {
                        setAssignedToast(e.response?.data?.detail || 'Failed')
                        setTimeout(() => setAssignedToast(null), 3000)
                      } finally { setAssigningOrder(null) }
                    }}
                    disabled={assigningOrder === order.id}
                    style={{ height: 32, padding: '0 12px', borderRadius: 8, border: 'none', background: '#C8964B', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >
                    {assigningOrder === order.id ? '...' : 'Mark Picked Up'}
                  </button>
                </div>
              )}

              {/* ── Assign Staff Section (owner + active orders) ── */}
              {isOwner && ['confirmed', 'preparing', 'ready'].includes(order.status) && (                <div style={{ marginBottom: 12, padding: '12px 12px', borderRadius: 10, border: '1px dashed #E8C987', background: '#FFFDF5' }}>
                  {deliveryStaff.length > 0 ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
                        <p style={{ fontSize: 11, color: '#B8860B', fontWeight: 700, letterSpacing: 0.3 }}>ASSIGN DELIVERY STAFF</p>
                      </div>
                      <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
                        {order.assigned_staff_name
                          ? `Currently: ${order.assigned_staff_name} — change below`
                          : order.status === 'ready'
                            ? 'Order is ready — assign a delivery staff now.'
                            : 'Pre-assign delivery staff. They will be notified when ready.'}
                      </p>
                      <select
                        id={`assign-staff-${order.id}`}
                        defaultValue=""
                        disabled={assigningOrder === order.id}
                        onChange={e => {
                          const val = e.target.value
                          if (!val) return
                          const staff = deliveryStaff.find(s => s.id === parseInt(val))
                          if (staff) assignStaff(order.id, staff.id, staff.name)
                          e.target.value = ''
                        }}
                        style={{
                          width: '100%', height: 40, borderRadius: 8,
                          border: '1.5px solid #C8964B',
                          padding: '0 36px 0 12px', fontSize: 13, fontWeight: 500,
                          background: '#FAFAF8', color: '#1A1A1A',
                          cursor: assigningOrder === order.id ? 'not-allowed' : 'pointer',
                          outline: 'none', appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C8964B' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                        }}
                      >
                        <option value="">
                          {assigningOrder === order.id ? 'Assigning...' : (order.assigned_staff_name ? '↕ Change staff...' : '↓ Choose delivery staff')}
                        </option>
                        {deliveryStaff.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}{s.phone ? ` · ${s.phone}` : ''}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <p style={{ fontSize: 11, color: '#92400E' }}>
                        <span style={{ fontWeight: 600 }}>No delivery staff yet.</span> Add one to assign deliveries.
                      </p>
                      <a href="/manage/account" style={{ fontSize: 11, color: '#fff', background: '#C8964B', fontWeight: 700, padding: '5px 10px', borderRadius: 6, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>+ Add Staff →</a>
                    </div>
                  )}
                </div>
              )}

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
