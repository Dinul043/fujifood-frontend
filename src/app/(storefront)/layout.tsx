'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import { useWebSocket } from '@/hooks/useWebSocket'
import api from '@/lib/api'

/**
 * StorefrontLayout — wraps all customer pages.
 * Includes global WebSocket for order status notifications + review prompt.
 */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<any>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; status: string } | null>(null)
  const [reviewPrompt, setReviewPrompt] = useState<{ orderId: number; orderNumber: string } | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')

  useEffect(() => {
    (async () => {
      try { const { data } = await api.get('/restaurants/storefront/a2b'); setRestaurant(data) } catch {}
      try { const { data } = await api.get('/auth/me'); setUserId(data.id) } catch {}
    })()
  }, [])

  // Global WebSocket for customer — order status updates on any page
  const wsUrl = userId
    ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/v1$/, '').replace(/^http/, 'ws')}/ws/customer/${userId}`
    : null

  const handleWsMessage = useCallback((msg: { event: string; data: any }) => {
    if (msg.event === 'order_status_updated') {
      const { status, order_number, order_id } = msg.data
      const messages: Record<string, string> = {
        confirmed: 'Order confirmed by restaurant',
        preparing: 'Your food is being prepared',
        ready: 'Your order is ready',
        delivered: 'Order delivered',
        cancelled: 'Order has been cancelled',
        rejected: 'Order was rejected',
      }
      setToast({ message: messages[status] || `Status: ${status}`, status })
      setTimeout(() => setToast(null), 4000)

      // If delivered → prompt review after a short delay
      if (status === 'delivered') {
        setTimeout(() => {
          setReviewPrompt({ orderId: order_id, orderNumber: order_number })
        }, 2000)
      }
    }
  }, [])

  useWebSocket(wsUrl, handleWsMessage)

  const buildAddress = () => {
    if (!restaurant) return ''
    return [restaurant.address_line1, restaurant.address_line2, restaurant.city, restaurant.state, restaurant.pincode].filter(Boolean).join(', ')
  }

  return (
    <>
      {/* Small toast notification for order status — top-right, compact */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 200, maxWidth: 300, padding: '12px 16px', borderRadius: 10, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 10, animation: 'toastIn 0.25s ease' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: toast.status === 'delivered' ? '#16A34A' : toast.status === 'cancelled' || toast.status === 'rejected' ? '#DC2626' : '#C8964B', flexShrink: 0 }} />
          <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A', margin: 0 }}>{toast.message}</p>
        </div>
      )}

      {/* Review prompt popup — appears after delivery */}
      {reviewPrompt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 340, width: '90%', textAlign: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>Order Delivered</h3>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>How was your order #{reviewPrompt.orderNumber}?</p>

            {/* Star rating inline */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setReviewRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <svg width={28} height={28} viewBox="0 0 24 24" fill={star <= reviewRating ? '#C8964B' : 'none'} stroke={star <= reviewRating ? '#C8964B' : '#DDD'} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              ))}
            </div>

            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience (optional)" style={{ width: '100%', height: 60, borderRadius: 8, border: '1px solid #E8E4DE', padding: '10px 12px', fontSize: 12, background: '#FAFAF8', outline: 'none', resize: 'none', marginBottom: 12 }} />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setReviewPrompt(null)} style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid #E8E4DE', background: '#fff', color: '#888', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Later</button>
              <button
                onClick={async () => {
                  if (reviewRating === 0) return
                  try {
                    await api.post('/reviews/', { order_id: reviewPrompt.orderId, rating: reviewRating, comment: reviewComment || null })
                    setReviewPrompt(null)
                    setReviewRating(0)
                    setReviewComment('')
                  } catch {}
                }}
                style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', background: reviewRating > 0 ? '#C8964B' : '#E8E4DE', color: reviewRating > 0 ? '#fff' : '#AAA', fontSize: 13, fontWeight: 600, cursor: reviewRating > 0 ? 'pointer' : 'default' }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes toastIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      {/* Desktop Header */}
      <div className="hidden md:block"><Header /></div>
      {/* Mobile Header */}
      <div className="block md:hidden"><MobileHeader /></div>

      {/* Main content */}
      <main className="min-h-screen w-full">{children}</main>

      {/* Desktop Footer */}
      <div className="hidden md:block" id="site-footer">
        <Footer
          restaurantName={restaurant?.name || 'A2B Veg Restaurant'}
          restaurantPhone={restaurant?.phone || ''}
          restaurantEmail={restaurant?.email || ''}
          restaurantAddress={buildAddress()}
        />
      </div>
    </>
  )
}
