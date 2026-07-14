'use client'

import api from '@/lib/api'

export default function CustomersPage() {
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Customers</h1>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>View and manage your customer base.</p>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #F0F0F0',
          borderRadius: 16,
          padding: 60,
          textAlign: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
      >
        <div style={{ marginBottom: 16 }}><svg width={48} height={48} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg></div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>Customer management coming soon</h2>
        <p style={{ fontSize: 14, color: '#AAA', maxWidth: 400, margin: '0 auto' }}>
          Track customer orders, preferences, and build loyalty programs. This feature is currently under development.
        </p>
        <div style={{
          marginTop: 24,
          display: 'inline-block',
          padding: '8px 20px',
          borderRadius: 10,
          background: '#FDF6EC',
          color: '#C8964B',
          fontSize: 12,
          fontWeight: 600,
        }}>
          Coming Soon
        </div>
      </div>
    </div>
  )
}
