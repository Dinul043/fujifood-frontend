'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * ReviewsSection — Customer reviews displayed on homepage.
 * Shows 3 reviews initially, "View More" loads all.
 * Desktop: 3-column grid. Mobile: vertical stack.
 */

interface Review {
  id: number
  rating: number
  comment: string | null
  customer_name: string | null
  created_at: string | null
}

export function ReviewsSection() {
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

  const visible = showAll ? reviews : reviews.slice(0, 3)
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <section style={{ paddingTop: 64, paddingBottom: 48, background: '#fff', width: '100%' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingLeft: 48, paddingRight: 48 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#C8964B', marginBottom: 8 }}>
            What Our Customers Say
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Customer Reviews
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <svg key={s} width={18} height={18} viewBox="0 0 24 24" fill={s <= Math.round(Number(avgRating)) ? '#C8964B' : '#E8E4DE'} stroke="none">
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              ))}
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>{avgRating}</span>
            <span style={{ fontSize: 14, color: '#888' }}>({reviews.length} reviews)</span>
          </div>
        </div>

        {/* Reviews Grid — auto-fit columns based on count */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(visible.length, 3)}, 1fr)`, gap: 20, maxWidth: visible.length === 1 ? 400 : undefined, margin: visible.length === 1 ? '0 auto' : undefined }}>
          {visible.map(r => (
            <div key={r.id} style={{ background: '#FAFAF8', border: '1px solid #F0EDE8', borderRadius: 14, padding: 20, transition: 'all 0.25s ease', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(200,150,75,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = '#E8DFD4' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = '#F0EDE8' }}
            >
              {/* Stars */}
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} width={16} height={16} viewBox="0 0 24 24" fill={s <= r.rating ? '#C8964B' : '#E8E4DE'} stroke="none">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                ))}
              </div>
              {/* Comment */}
              {r.comment && (
                <p style={{ fontSize: 14, color: '#444', lineHeight: '22px', marginBottom: 12 }}>
                  {r.comment.length > 120 ? r.comment.slice(0, 120) + '...' : r.comment}
                </p>
              )}
              {/* Customer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FDF6EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#C8964B' }}>
                  {(r.customer_name || 'C')[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{r.customer_name || 'Customer'}</p>
                  {r.created_at && <p style={{ fontSize: 11, color: '#BBB' }}>{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        {!showAll && reviews.length > 3 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              onClick={() => setShowAll(true)}
              style={{ height: 44, padding: '0 28px', borderRadius: 10, border: '1.5px solid #C8964B', background: 'transparent', color: '#C8964B', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#C8964B'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#C8964B' }}
            >
              View All {reviews.length} Reviews
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
