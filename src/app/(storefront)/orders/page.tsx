'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * Orders Page — Shows customer's order history.
 * Fetches from GET /orders/my-orders
 */

interface OrderItem { item_name: string; item_price: number; quantity: number; line_total: number }
interface Order { id: number; order_number: string; status: string; total_amount: number; items: OrderItem[]; created_at: string; estimated_delivery_time: number | null }

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

  useEffect(() => {
    // Get new order param from URL (without useSearchParams)
    const params = new URLSearchParams(window.location.search)
    setNewOrder(params.get('new'))

    async function fetchOrders() {
      try {
        const { data } = await api.get('/orders/my-orders')
        setOrders(data.orders || [])
      } catch { /* not logged in or error */ }
      finally { setLoading(false) }
    }
    fetchOrders()
  }, [])

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block" style={{ marginTop: '88px' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px', paddingTop: '48px', paddingBottom: '80px' }}>
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
                    <div className="flex flex-wrap" style={{ gap: '8px' }}>
                      {order.items.map((item, idx) => (
                        <span key={idx} className="text-[#666] bg-[#F5F5F0]" style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}>{item.item_name} x{item.quantity}</span>
                      ))}
                    </div>
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
                return (
                  <div key={order.id} className="bg-white" style={{ padding: '16px', borderRadius: '12px', border: '1px solid #EEEAE5' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
                      <p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '13px' }}>#{order.order_number}</p>
                      <span className="font-semibold capitalize" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: sc.bg, color: sc.text }}>{order.status}</span>
                    </div>
                    <p className="text-[#888]" style={{ fontSize: '11px', marginBottom: '8px' }}>{order.items.map((i) => `${i.item_name} x${i.quantity}`).join(', ')}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[#888]" style={{ fontSize: '11px' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span className="font-bold text-[#C8964B]" style={{ fontSize: '15px' }}>&#8377;{order.total_amount}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
