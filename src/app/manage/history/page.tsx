'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * History Page — Order history with date filtering.
 * Shows daily breakdown: orders count, revenue, status breakdown.
 */
export default function HistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedDate, setExpandedDate] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    (async () => {
      try {
        // Fetch all orders using pagination (max 500 per page)
        let allOrders: any[] = []
        let page = 1
        let hasMore = true
        while (hasMore) {
          const { data } = await api.get(`/orders/manage?page_size=500&page=${page}`)
          const ordersList = data.orders || []
          allOrders = [...allOrders, ...ordersList]
          hasMore = ordersList.length === 500
          page++
        }
        setOrders(allOrders)
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  // Filter by date range
  const filtered = orders.filter((o) => {
    if (!dateFrom && !dateTo) return true
    const d = new Date(o.created_at)
    if (dateFrom && d < new Date(dateFrom)) return false
    if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  // Group by date
  const grouped: Record<string, any[]> = {}
  filtered.forEach((o) => {
    const date = new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(o)
  })

  const summaries = Object.entries(grouped).map(([date, dayOrders]) => ({
    date,
    orders: dayOrders.length,
    revenue: dayOrders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + (Number(o.total_amount) || 0), 0),
    totalAmount: dayOrders.reduce((s: number, o: any) => s + (Number(o.total_amount) || 0), 0),
    delivered: dayOrders.filter((o: any) => o.status === 'delivered').length,
    cancelled: dayOrders.filter((o: any) => ['cancelled', 'rejected'].includes(o.status)).length,
    pending: dayOrders.filter((o: any) => !['delivered', 'cancelled', 'rejected'].includes(o.status)).length,
  }))

  const totalOrders = filtered.length
  const totalRevenue = filtered.filter(o => o.status === 'delivered').reduce((s, o) => s + (Number(o.total_amount) || 0), 0)
  const totalAmount = filtered.reduce((s, o) => s + (Number(o.total_amount) || 0), 0)

  const inputStyle: React.CSSProperties = { height: 40, borderRadius: 10, border: '1px solid #E8E4DE', padding: '0 14px', fontSize: 14, background: '#FAFAF8', outline: 'none' }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#AAA' }}>Loading...</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }} className="font-heading">Order History</h1>
        <p style={{ fontSize: 14, color: '#888' }}>View past orders grouped by date.</p>
      </div>

      {/* Date filter */}
      <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 20, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }} style={{ height: 40, padding: '0 16px', borderRadius: 10, border: '1px solid #E8E4DE', background: '#fff', color: '#888', fontSize: 12, fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-end' }}>Clear</button>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Total Orders</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#C8964B' }}>{totalOrders}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Revenue (delivered)</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#16A34A' }}>₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 14, padding: 16 }}>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Total Order Value</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#2563EB' }}>₹{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Daily breakdown */}
      {summaries.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 48, textAlign: 'center' }}>
          <p style={{ color: '#AAA', fontSize: 14 }}>No orders in this period.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {summaries.map((day) => (
            <div key={day.date}>
              <div
                onClick={() => setExpandedDate(expandedDate === day.date ? null : day.date)}
                style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{day.date}</span>
                    <span style={{ fontSize: 12, color: '#888' }}>{day.orders} orders</span>
                    {day.delivered > 0 && <span style={{ fontSize: 11, color: '#16A34A', background: '#F0FDF4', padding: '2px 8px', borderRadius: 6 }}>{day.delivered} delivered</span>}
                    {day.pending > 0 && <span style={{ fontSize: 11, color: '#D97706', background: '#FFF7ED', padding: '2px 8px', borderRadius: 6 }}>{day.pending} active</span>}
                    {day.cancelled > 0 && <span style={{ fontSize: 11, color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: 6 }}>{day.cancelled} cancelled</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: day.revenue > 0 ? '#16A34A' : '#1A1A1A' }}>₹{day.totalAmount.toLocaleString()}</span>
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#AAA" strokeWidth={2} style={{ transform: expandedDate === day.date ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </div>
                </div>
              </div>

              {expandedDate === day.date && grouped[day.date] && (
                <div style={{ padding: '8px 0 8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {grouped[day.date].map((order: any) => (
                    <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FAFAF8', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>#{order.order_number}</span>
                        <span style={{ fontSize: 11, color: '#AAA' }}>{order.items?.length || 0} items</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, textTransform: 'capitalize', background: order.status === 'delivered' ? '#F0FDF4' : order.status === 'cancelled' ? '#FEF2F2' : '#FFF7ED', color: order.status === 'delivered' ? '#16A34A' : order.status === 'cancelled' ? '#DC2626' : '#D97706' }}>{order.status}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>₹{order.total_amount}</span>
                      </div>
                    </div>
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
