'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * MobileReviews — Customer reviews for mobile homepage.
 * Shows 2 reviews initially, "View More" expands.
 * Vertical stack, fits 320-425px screens.
 */

interface Review {
  id: number
  rating: number
  comment: string | null
  customer_name: string | null
  created_at: string | null
}

export function MobileReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/reviews/storefront/a2b')
        setReviews(data || [])
      } catch {}
    })()
  }, [])

  if (reviews.length === 0) return null

  const visible = showAll ? reviews : reviews.slice(0, 2)
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <section style={{ padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C8964B', marginBottom: 4 }}>
          What Customers Say
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
          Reviews
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <svg key={s} width={14} height={14} viewBox="0 0 24 24" fill={s <= Math.round(Number(avgRating)) ? '#C8964B' : '#E8E4DE'} stroke="none">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            ))}
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{avgRating}</span>
          <span style={{ fontSize: 12, color: '#888' }}>({reviews.length})</span>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.map(r => (
          <div key={r.id} style={{ background: '#FAFAF8', border: '1px solid #F0EDE8', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FDF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#C8964B' }}>
                  {(r.customer_name || 'C')[0].toUpperCase()}
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{r.customer_name || 'Customer'}</p>
              </div>
              <div style={{ display: 'flex', gap: 1 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} width={12} height={12} viewBox="0 0 24 24" fill={s <= r.rating ? '#C8964B' : '#E8E4DE'} stroke="none">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                ))}
              </div>
            </div>
            {r.comment && (
              <p style={{ fontSize: 13, color: '#555', lineHeight: '20px' }}>
                {r.comment.length > 100 ? r.comment.slice(0, 100) + '...' : r.comment}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* View More */}
      {!showAll && reviews.length > 2 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => setShowAll(true)}
            style={{ height: 36, padding: '0 20px', borderRadius: 8, border: '1.5px solid #C8964B', background: 'transparent', color: '#C8964B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            View All {reviews.length} Reviews
          </button>
        </div>
      )}
    </section>
  )
}
