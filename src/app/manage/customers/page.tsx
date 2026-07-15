'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function CustomersPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/reviews/manage')
        setReviews(data || [])
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  const deleteReview = async (id: number) => {
    try {
      await api.delete(`/reviews/manage/${id}`)
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Customer Reviews</h1>
        <p style={{ fontSize: 14, color: '#888' }}>Manage customer feedback and ratings.</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 14, padding: 16, minWidth: 120 }}>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Total Reviews</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#C8964B' }}>{reviews.length}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 14, padding: 16, minWidth: 120 }}>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Average Rating</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="#C8964B" stroke="none"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>{avgRating}</p>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#AAA', fontSize: 14 }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#AAA' }}>No reviews yet.</p>
          <p style={{ fontSize: 12, color: '#CCC', marginTop: 4 }}>Reviews will appear here after customers rate their delivered orders.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', marginBottom: 2 }}>{r.customer_name || 'Customer'}</p>
                  {r.order_items && <p style={{ fontSize: 11, color: '#AAA', marginBottom: 4 }}>{r.order_items}</p>}
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <svg key={s} width={14} height={14} viewBox="0 0 24 24" fill={s <= r.rating ? '#C8964B' : '#E8E4DE'} stroke="none"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { if (window.confirm('Delete this review?')) deleteReview(r.id) }}
                  style={{ fontSize: 11, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}
                >
                  Delete
                </button>
              </div>
              {r.comment && <p style={{ fontSize: 13, color: '#666', lineHeight: '20px' }}>{r.comment}</p>}
              <p style={{ fontSize: 11, color: '#BBB', marginTop: 6 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
