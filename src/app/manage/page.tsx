'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  useEffect(() => { (async () => { try { const { data } = await api.get('/orders/manage?page_size=50'); setOrders(data.orders || []) } catch {} })() }, [])

  const today = new Date().toDateString()
  const td = orders.filter(o => new Date(o.created_at).toDateString() === today)

  const stats = [
    { label: "Today's Orders", val: td.length, sub: '+12% from yesterday', color: '#C8964B', bg: '#FDF6EC', icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z' },
    { label: 'Pending', val: td.filter(o => o.status === 'pending').length, sub: 'Needs attention', color: '#D97706', bg: '#FFF7ED', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Preparing', val: td.filter(o => ['confirmed','preparing'].includes(o.status)).length, sub: 'In progress', color: '#2563EB', bg: '#EFF6FF', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
    { label: 'Delivered', val: td.filter(o => o.status === 'delivered').length, sub: 'Completed', color: '#16A34A', bg: '#F0FDF4', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Cancelled', val: td.filter(o => ['cancelled','rejected'].includes(o.status)).length, sub: 'Cancelled', color: '#DC2626', bg: '#FEF2F2', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Revenue', val: `₹${td.filter(o => o.status === 'delivered').reduce((s: number,o: any) => s + o.total_amount, 0).toLocaleString()}`, sub: '+9.5% from yesterday', color: '#16A34A', bg: '#F0FDF4', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }} className="font-heading">Dashboard</h1>
          <p style={{ fontSize: 14, color: '#888' }}>Here&apos;s what&apos;s happening today.</p>
        </div>
        <span style={{ fontSize: 13, color: '#AAA' }} className="hidden sm:block">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 20, transition: 'all 0.2s ease', cursor: 'default' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.bg }}>
                <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke={s.color} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
              </div>
              <span style={{ fontSize: 12, color: '#888' }}>{s.label}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.val}</p>
            <p style={{ fontSize: 11, color: '#BBB' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Two column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 24, transition: 'all 0.2s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>Recent Orders</h2>
            <a href="/manage/orders" style={{ fontSize: 12, color: '#C8964B', fontWeight: 500, textDecoration: 'none' }}>View All</a>
          </div>
          {orders.length === 0 ? <p style={{ color: '#BBB', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>No orders yet.</p> : orders.slice(0,5).map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F8F8F8' }}>
              <div><p style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A' }}>#{o.order_number}</p><p style={{ fontSize: 11, color: '#AAA', marginTop: 2 }}>{o.items?.length || 0} items</p></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, textTransform: 'capitalize', background: o.status==='pending'?'#FFF7ED':o.status==='delivered'?'#F0FDF4':'#EFF6FF', color: o.status==='pending'?'#D97706':o.status==='delivered'?'#16A34A':'#2563EB' }}>{o.status}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>₹{o.total_amount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top Items */}
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 24, transition: 'all 0.2s ease' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>Top Selling Items</h2>
            <a href="/manage/menu" style={{ fontSize: 12, color: '#C8964B', fontWeight: 500, textDecoration: 'none' }}>View All</a>
          </div>
          {[{n:'Ghee Roast Dosa',o:45,r:'₹4,050',i:'/images/food/dish-2.png'},{n:'Masala Dosa',o:32,r:'₹2,880',i:'/images/food/dish-3.png'},{n:'Paneer Butter Masala',o:28,r:'₹2,240',i:'/images/food/dish-4.png'},{n:'Filter Coffee',o:25,r:'₹1,500',i:'/images/food/dish-1.png'},{n:'Rava Kesari',o:20,r:'₹2,000',i:'/images/food/dish-5.png'}].map((item, idx) => (
            <div key={item.n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F8F8F8' }}>
              <span style={{ color: '#C8964B', fontWeight: 700, fontSize: 14, width: 20 }}>{idx+1}</span>
              <img src={item.i} alt={item.n} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.n}</p><p style={{ fontSize: 11, color: '#AAA' }}>{item.o} orders</p></div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{item.r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
