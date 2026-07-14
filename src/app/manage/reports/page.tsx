'use client'

import api from '@/lib/api'

export default function ReportsPage() {
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Reports & Analytics</h1>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Insights into your business performance.</p>
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
        <div style={{ marginBottom: 16 }}><svg width={48} height={48} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg></div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>Reports & analytics coming soon</h2>
        <p style={{ fontSize: 14, color: '#AAA', maxWidth: 400, margin: '0 auto' }}>
          Revenue trends, popular items, peak hours, and more. Detailed analytics to help you grow your business.
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
