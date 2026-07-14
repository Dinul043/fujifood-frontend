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
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
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
