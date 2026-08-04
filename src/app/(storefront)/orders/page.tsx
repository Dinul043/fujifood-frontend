'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { useWebSocket } from '@/hooks/useWebSocket'

/**
 * Orders Page — Shows customer's order history with real-time WebSocket updates.
 * Fetches from GET /orders/my-orders
 * WebSocket: ws://host/ws/customer/{user_id} for live status changes
 */

interface OrderItem { item_name: string; item_price: number; quantity: number; line_total: number; menu_item_id?: number }
interface Order { id: number; order_number: string; status: string; total_amount: number; items: OrderItem[]; created_at: string; estimated_delivery_time: number | null; payment_status?: string }

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FFF7ED', text: '#D97706' },
  confirmed: { bg: '#EFF6FF', text: '#2563EB' },
  preparing: { bg: '#F0FDF4', text: '#16A34A' },
  ready: { bg: '#F0FDF4', text: '#16A34A' },
  delivered: { bg: '#F0FDF4', text: '#16A34A' },
  cancelled: { bg: '#FEF2F2', text: '#DC2626' },
  rejected: { bg: '#FEF2F2', text: '#DC2626' },
}

export default function OrdersPage() {
  const [newOrder, setNewOrder] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<number | null>(null)
  const [cancelModal, setCancelModal] = useState<{ id: number; orderNumber: string; items: string } | null>(null)
  const [cancelError, setCancelError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [orderingAgain, setOrderingAgain] = useState<number | null>(null)

  const handleOrderAgain = async (order: Order) => {
    setOrderingAgain(order.id)
    try {
      const { addToCart } = await import('@/hooks/useCart')
      for (const item of order.items) {
        if (item.menu_item_id) {
          await addToCart({ id: item.menu_item_id, name: item.item_name, price: item.item_price, image: '' })
        }
      }
      window.location.href = '/cart'
    } catch {} finally { setOrderingAgain(null) }
  }
  const [reviewModal, setReviewModal] = useState<{ orderId: number; orderNumber: string; items: string } | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewedOrders, setReviewedOrders] = useState<Set<number>>(new Set())

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setNewOrder(params.get('new'))

    async function fetchOrders() {
      try {
        const { data: me } = await api.get('/auth/me')
        setUserId(me.id)
        const { data } = await api.get('/orders/my-orders')
        setOrders(data.orders || [])
        // Fetch reviewed orders
        try {
          const { data: reviews } = await api.get('/reviews/my-reviews')
          setReviewedOrders(new Set((reviews || []).map((r: any) => r.order_id)))
        } catch {}
      } catch {}
      finally { setLoading(false) }
    }
    fetchOrders()
  }, [])

  // WebSocket for real-time order status updates
  const wsUrl = userId
    ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/v1$/, '').replace(/^http/, 'ws')}/ws/customer/${userId}`
    : null

  const handleWsMessage = useCallback((msg: { event: string; data: any }) => {
    if (msg.event === 'order_status_updated') {
      const { order_id, status } = msg.data
      setOrders(prev => prev.map(o => o.id === order_id ? { ...o, status } : o))
    }
  }, [])

  const { isConnected } = useWebSocket(wsUrl, handleWsMessage)

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block" style={{ marginTop: '88px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingLeft: '48px', paddingRight: '48px', paddingTop: '48px', paddingBottom: '80px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '32px', marginBottom: '40px' }}>My Orders</h1>

          {/* New order success banner */}
          {newOrder && (
            <div style={{ marginBottom: '24px', padding: '16px 24px', borderRadius: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div className="flex items-center" style={{ gap: '12px' }}>
                <svg className="text-[#16A34A]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                <div>
                  <p className="font-semibold text-[#16A34A]" style={{ fontSize: '14px' }}>Order placed successfully!</p>
                  <p className="text-[#666]" style={{ fontSize: '13px' }}>Order #{newOrder} — We&apos;ll notify you when it&apos;s confirmed.</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="animate-pulse flex flex-col" style={{ gap: '16px' }}>
              {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="bg-white" style={{ height: '120px', borderRadius: '16px', border: '1px solid #EEEAE5' }} />))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center" style={{ padding: '80px 0' }}>
              <p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '18px', marginBottom: '8px' }}>No orders yet</p>
              <p className="text-[#888]" style={{ fontSize: '14px', marginBottom: '24px' }}>Your order history will appear here.</p>
              <a href="/menu" className="inline-flex items-center justify-center font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] transition-all" style={{ height: '48px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '12px', fontSize: '14px' }}>Browse Menu</a>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: '16px' }}>
              {orders.map((order) => {
                const sc = statusColors[order.status] || statusColors.pending
                return (
                  <div key={order.id} className="bg-white" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #EEEAE5' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                      <div>
                        <p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '15px' }}>#{order.order_number}</p>
                        <p className="text-[#888]" style={{ fontSize: '12px', marginTop: '2px' }}>{new Date(order.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex items-center" style={{ gap: '16px' }}>
                        <span className="font-semibold capitalize" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', background: sc.bg, color: sc.text }}>{order.status}</span>
                        <span className="font-bold text-[#1A1A1A]" style={{ fontSize: '18px' }}>&#8377;{order.total_amount}</span>
                      </div>
                    </div>
                    {/* Items list */}
                    <div style={{ marginBottom: '12px' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                          <img src={`/images/food/dish-${((item.menu_item_id || idx) % 10) + 1}.png`} alt={item.item_name} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                          <span style={{ fontSize: '13px', color: '#1A1A1A' }}>{item.item_name} <span style={{ color: '#AAA' }}>x{item.quantity}</span></span>
                        </div>
                      ))}
                    </div>
                    {/* Premium Status Timeline */}
                    {!['cancelled', 'rejected'].includes(order.status) && (() => {
                      const steps = [
                        { key: 'pending', label: 'Placed' },
                        { key: 'confirmed', label: 'Confirmed' },
                        { key: 'preparing', label: 'Preparing' },
                        { key: 'ready', label: 'Ready' },
                        { key: 'delivered', label: 'Delivered' },
                      ]
                      const currentIdx = steps.findIndex(s => s.key === order.status)
                      return (
                        <div style={{ marginBottom: 12, padding: '12px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {steps.map((step, idx) => {
                              const done = idx <= currentIdx
                              const active = idx === currentIdx
                              return (
                                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                                  {idx < steps.length - 1 && (
                                    <div style={{ position: 'absolute', top: 10, left: '50%', width: '100%', height: 2, background: idx < currentIdx ? '#C8964B' : '#E8E4DE', zIndex: 0 }} />
                                  )}
                                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? '#C8964B' : '#F0EDE8', border: `2px solid ${done ? '#C8964B' : '#E8E4DE'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, transition: 'all 0.3s' }}>
                                    {done && <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                                  </div>
                                  <p style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: done ? '#C8964B' : '#AAA', marginTop: 4, textAlign: 'center', whiteSpace: 'nowrap' }}>{step.label}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Delivered: review + order again */}
                    {order.status === 'delivered' && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        {!reviewedOrders.has(order.id) ? (
                          <button onClick={() => { setReviewModal({ orderId: order.id, orderNumber: order.order_number, items: order.items.map((i: any) => i.item_name).join(', ') }); setReviewRating(0); setReviewComment(''); setReviewError('') }} style={{ flex: 1, height: 36, fontSize: 12, fontWeight: 600, color: '#C8964B', background: '#FDF6EC', border: '1px solid #F0E6D3', borderRadius: 8, cursor: 'pointer' }}>
                            Write Review
                          </button>
                        ) : (
                          <div style={{ flex: 1 }} />
                        )}
                        <button onClick={() => handleOrderAgain(order)} disabled={orderingAgain === order.id} style={{ flex: 1, height: 36, fontSize: 12, fontWeight: 600, color: '#fff', background: '#C8964B', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: orderingAgain === order.id ? 0.6 : 1 }}>
                          {orderingAgain === order.id ? 'Adding...' : 'Order Again'}
                        </button>
                      </div>
                    )}

                    {/* Cancel button for pending/confirmed orders */}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        onClick={() => { setCancelModal({ id: order.id, orderNumber: order.order_number, items: order.items.map(i => i.item_name).join(', ') }); setCancelError('') }}
                        style={{ marginTop: 4, fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                      >
                        Cancel Order
                      </button>
                    )}
                    {order.status === 'cancelled' && order.payment_status === 'refunded' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: '#FEF2F2', marginTop: 8 }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#DC2626' }}>Refund processed</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="block md:hidden" style={{ paddingTop: '96px', paddingBottom: '32px' }}>
        <div style={{ padding: '20px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '22px', marginBottom: '20px' }}>My Orders</h1>
          {newOrder && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <p className="font-semibold text-[#16A34A]" style={{ fontSize: '13px' }}>Order #{newOrder} placed!</p>
            </div>
          )}
          {loading ? <div className="animate-pulse"><div className="bg-[#F0EDE8]" style={{ height: '100px', borderRadius: '12px', marginBottom: '12px' }} /><div className="bg-[#F0EDE8]" style={{ height: '100px', borderRadius: '12px' }} /></div> : orders.length === 0 ? (
            <div className="text-center" style={{ padding: '60px 0' }}>
              <p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '16px', marginBottom: '8px' }}>No orders yet</p>
              <a href="/menu" className="inline-flex items-center justify-center font-semibold text-white bg-[#C8964B]" style={{ height: '40px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '10px', fontSize: '13px', marginTop: '16px' }}>Browse Menu</a>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: '12px' }}>
              {orders.map((order) => {
                const sc = statusColors[order.status] || statusColors.pending
                const steps = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']
                const currentIdx = steps.indexOf(order.status)
                const isActive = !['cancelled', 'rejected'].includes(order.status)
                return (
                  <div key={order.id} className="bg-white" style={{ padding: '14px', borderRadius: '12px', border: '1px solid #EEEAE5' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>#{order.order_number}</p>
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: sc.bg, color: sc.text, fontWeight: 600, textTransform: 'capitalize' }}>{order.status}</span>
                    </div>
                    {/* Items */}
                    <p style={{ fontSize: 11, color: '#888', marginBottom: 8, lineHeight: '16px' }}>{order.items.map(i => `${i.item_name} x${i.quantity}`).join(', ')}</p>
                    {/* Timeline — compact for mobile */}
                    {isActive && (
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 2 }}>
                        {steps.map((step, idx) => {
                          const done = idx <= currentIdx
                          return (
                            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <div style={{ width: 14, height: 14, borderRadius: '50%', background: done ? '#C8964B' : '#E8E4DE', border: `2px solid ${done ? '#C8964B' : '#E8E4DE'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {done && <svg width={7} height={7} fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                              </div>
                              {idx < steps.length - 1 && <div style={{ flex: 1, height: 2, background: idx < currentIdx ? '#C8964B' : '#E8E4DE' }} />}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: '#BBB' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#C8964B' }}>₹{order.total_amount}</span>
                    </div>
                    {/* Order Again for delivered */}
                    {order.status === 'delivered' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        {!reviewedOrders.has(order.id) && (
                          <button onClick={() => { setReviewModal({ orderId: order.id, orderNumber: order.order_number, items: order.items.map((i: any) => i.item_name).join(', ') }); setReviewRating(0); setReviewComment(''); setReviewError('') }} style={{ flex: 1, height: 32, fontSize: 11, fontWeight: 600, color: '#C8964B', background: '#FDF6EC', border: '1px solid #F0E6D3', borderRadius: 8, cursor: 'pointer' }}>Review</button>
                        )}
                        <button onClick={() => handleOrderAgain(order)} disabled={orderingAgain === order.id} style={{ flex: 1, height: 32, fontSize: 11, fontWeight: 600, color: '#fff', background: '#C8964B', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                          {orderingAgain === order.id ? '...' : 'Order Again'}
                        </button>
                      </div>
                    )}
                    {/* Cancel */}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button onClick={() => { setCancelModal({ id: order.id, orderNumber: order.order_number, items: order.items.map(i => i.item_name).join(', ') }); setCancelError('') }} style={{ marginTop: 8, width: '100%', height: 30, fontSize: 11, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, cursor: 'pointer', fontWeight: 500 }}>Cancel Order</button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 380, width: '90%', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 4, textAlign: 'center' }}>Rate Your Order</h3>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 4, textAlign: 'center' }}>{reviewModal.items}</p>
            <p style={{ fontSize: 11, color: '#BBB', marginBottom: 20, textAlign: 'center' }}>Order #{reviewModal.orderNumber}</p>

            {/* Star rating */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setReviewRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <svg width={32} height={32} viewBox="0 0 24 24" fill={star <= reviewRating ? '#C8964B' : 'none'} stroke={star <= reviewRating ? '#C8964B' : '#DDD'} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Comment */}
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your experience (optional)"
              style={{ width: '100%', height: 80, borderRadius: 10, border: '1px solid #E8E4DE', padding: '12px 14px', fontSize: 13, background: '#FAFAF8', outline: 'none', resize: 'none', marginBottom: 12 }}
            />

            {reviewError && <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 12, textAlign: 'center' }}>{reviewError}</p>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setReviewModal(null)} style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #E8E4DE', background: '#fff', color: '#666', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  if (reviewRating === 0) { setReviewError('Please select a rating'); return }
                  setReviewError('')
                  setSubmittingReview(true)
                  try {
                    await api.post('/reviews/', { order_id: reviewModal.orderId, rating: reviewRating, comment: reviewComment || null })
                    setReviewedOrders(prev => new Set([...prev, reviewModal.orderId]))
                    setReviewModal(null)
                  } catch (e: any) {
                    setReviewError(e.response?.data?.detail || 'Failed to submit review')
                  }
                  finally { setSubmittingReview(false) }
                }}
                disabled={submittingReview}
                style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', background: '#C8964B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: submittingReview ? 'not-allowed' : 'pointer', opacity: submittingReview ? 0.6 : 1 }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px', maxWidth: 380, width: '90%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width={28} height={28} fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Cancel Order?</h3>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
              Are you sure you want to cancel <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{cancelModal.items}</span>? This action cannot be undone.
            </p>
            {cancelError && <p style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8, marginBottom: 16 }}>{cancelError}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setCancelModal(null)}
                style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #E8E4DE', background: '#fff', color: '#666', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Keep Order
              </button>
              <button
                onClick={async () => {
                  setCancelling(true)
                  setCancelError('')
                  try {
                    await api.post(`/orders/my-orders/${cancelModal.id}/cancel`)
                    setOrders(prev => prev.map(o => o.id === cancelModal.id ? { ...o, status: 'cancelled' } : o))
                    setCancelModal(null)
                  } catch (e: any) {
                    setCancelError(e.response?.data?.detail || 'Could not cancel. Order may already be preparing.')
                  } finally { setCancelling(false) }
                }}
                disabled={cancelling}
                style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', background: '#DC2626', color: '#fff', fontSize: 14, fontWeight: 600, cursor: cancelling ? 'not-allowed' : 'pointer', opacity: cancelling ? 0.6 : 1 }}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
      )}
    </>
  )
}
