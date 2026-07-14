'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * Admin Dashboard — Overview of restaurant business.
 */

interface DashboardData {
  totalOrders: number
  pendingOrders: number
  preparingOrders: number
  completedOrders: number
  cancelledOrders: number
  revenue: number
  avgOrderValue: number
  recentOrders: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const { data: orders } = await api.get('/orders/manage?page_size=100')
        const allOrders = orders.orders || []
        const today = new Date().toDateString()
        const todayOrders = allOrders.filter((o: any) => new Date(o.created_at).toDateString() === today)

        setData({
          totalOrders: todayOrders.length,
          pendingOrders: todayOrders.filter((o: any) => o.status === 'pending').length,
          preparingOrders: todayOrders.filter((o: any) => o.status === 'preparing' || o.status === 'confirmed').length,
          completedOrders: todayOrders.filter((o: any) => o.status === 'delivered').length,
          cancelledOrders: todayOrders.filter((o: any) => o.status === 'cancelled' || o.status === 'rejected').length,
          revenue: todayOrders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + o.total_amount, 0),
          avgOrderValue: todayOrders.length > 0 ? Math.round(todayOrders.reduce((s: number, o: any) => s + o.total_amount, 0) / todayOrders.length) : 0,
          recentOrders: allOrders.slice(0, 5),
        })
      } catch { setData({ totalOrders: 0, pendingOrders: 0, preparingOrders: 0, completedOrders: 0, cancelledOrders: 0, revenue: 0, avgOrderValue: 0, recentOrders: [] }) }
      finally { setLoading(false) }
    }
    fetchDashboard()
  }, [])

  if (loading) return <div className="animate-pulse"><div className="bg-[#1A1A1A] rounded-xl" style={{ height: '200px' }} /></div>

  const stats = [
    { label: "Today's Orders", value: data?.totalOrders || 0, color: '#C8964B' },
    { label: 'Pending', value: data?.pendingOrders || 0, color: '#D97706' },
    { label: 'Preparing', value: data?.preparingOrders || 0, color: '#2563EB' },
    { label: 'Delivered', value: data?.completedOrders || 0, color: '#16A34A' },
    { label: 'Cancelled', value: data?.cancelledOrders || 0, color: '#DC2626' },
    { label: 'Revenue', value: `₹${data?.revenue || 0}`, color: '#C8964B' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="font-heading font-bold text-white" style={{ fontSize: '28px', marginBottom: '4px' }}>Dashboard</h1>
        <p className="text-[#888]" style={{ fontSize: '14px' }}>Welcome back. Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3" style={{ gap: '16px', marginBottom: '32px' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '24px', borderRadius: '16px' }}>
            <p className="text-[#888]" style={{ fontSize: '13px', marginBottom: '8px' }}>{stat.label}</p>
            <p className="font-bold text-white" style={{ fontSize: '28px', color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '16px' }}>Quick Actions</h2>
        <div className="flex" style={{ gap: '12px' }}>
          <a href="/manage/orders" className="inline-flex items-center font-medium text-white bg-[#C8964B] hover:bg-[#B5843F] transition-all" style={{ height: '40px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '10px', fontSize: '13px', gap: '8px' }}>
            <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>
            View Orders
          </a>
          <a href="/manage/menu" className="inline-flex items-center font-medium text-[#CCC] border border-[#333] hover:border-[#C8964B] hover:text-white transition-all" style={{ height: '40px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '10px', fontSize: '13px', gap: '8px' }}>
            <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Menu Item
          </a>
        </div>
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '16px' }}>Recent Orders</h2>
        {data?.recentOrders.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] text-center" style={{ padding: '40px', borderRadius: '16px' }}>
            <p className="text-[#888]" style={{ fontSize: '14px' }}>No orders yet. They&apos;ll appear here when customers start ordering.</p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: '8px' }}>
            {data?.recentOrders.map((order: any) => (
              <div key={order.id} className="bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-between" style={{ padding: '16px 20px', borderRadius: '12px' }}>
                <div>
                  <p className="font-medium text-white" style={{ fontSize: '14px' }}>#{order.order_number}</p>
                  <p className="text-[#888]" style={{ fontSize: '12px', marginTop: '2px' }}>{order.items?.length || 0} items</p>
                </div>
                <div className="flex items-center" style={{ gap: '16px' }}>
                  <span className="capitalize font-medium" style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', background: order.status === 'pending' ? '#FFF7ED' : order.status === 'delivered' ? '#F0FDF4' : '#EFF6FF', color: order.status === 'pending' ? '#D97706' : order.status === 'delivered' ? '#16A34A' : '#2563EB' }}>{order.status}</span>
                  <span className="font-bold text-[#C8964B]" style={{ fontSize: '15px' }}>₹{order.total_amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
