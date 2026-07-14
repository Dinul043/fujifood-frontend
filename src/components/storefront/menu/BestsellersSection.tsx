'use client'

import { useState, useEffect } from 'react'
import { addToCart } from '@/hooks/useCart'
import api from '@/lib/api'

/**
 * BestsellersSection — Customer Favorites.
 * Fetches real menu items from the API and displays up to 5.
 *
 * Specs (8px grid):
 *   Section padding: 80px top, 80px bottom
 *   Container: max-width 1280px, padding 48px horizontal
 *   Header → Cards gap: 48px
 *   Cards: 5 columns, 24px gap
 *   Card border-radius: 16px
 *   Card image: aspect-square, border-radius top 16px
 *   Card content padding: 20px
 *   Card shadow on hover: elevated
 *   Name: 15px, weight 600
 *   Price: 16px, weight 700, gold color
 *   VEG badge: green, small, top-left of image
 */

interface MenuItem {
  id: number
  name: string
  price: number
  image_url?: string
  is_available?: boolean
}

export function BestsellersSection() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/menu/storefront/a2b')
        // Flatten all categories' items and pick first 5 available
        const allItems: MenuItem[] = []
        if (data.categories && Array.isArray(data.categories)) {
          data.categories.forEach((cat: any) => {
            if (cat.items && Array.isArray(cat.items)) {
              cat.items.forEach((item: any) => {
                if (item.is_available !== false) {
                  allItems.push(item)
                }
              })
            }
          })
        }
        setItems(allItems.slice(0, 5))
      } catch {
        // If API fails, show nothing
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading || items.length === 0) return null

  return (
    <section className="bg-[#FAFAF8]" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="mx-auto" style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px' }}>

        {/* Section header */}
        <div className="flex items-end justify-between" style={{ marginBottom: '48px' }}>
          <div>
            <p
              className="font-semibold uppercase text-[#C8964B]"
              style={{ fontSize: '11px', letterSpacing: '0.18em', marginBottom: '8px' }}
            >
              Our Specials
            </p>
            <h2
              className="font-heading font-bold text-[#1A1A1A]"
              style={{ fontSize: '32px', lineHeight: '40px', letterSpacing: '-0.02em' }}
            >
              Customer Favorites
            </h2>
          </div>
          <a
            href="/menu"
            className="font-semibold text-[#C8964B] hover:underline transition-all duration-200"
            style={{ fontSize: '14px' }}
          >
            View All
          </a>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-5" style={{ gap: '24px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]"
              style={{ borderRadius: '16px', border: '1px solid #EEEAE5' }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                <img
                  src={item.image_url || `/images/food/dish-${(item.id % 10) + 1}.png`}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* VEG badge */}
                <div
                  className="absolute flex items-center font-semibold text-[#16A34A] bg-white/90 backdrop-blur-sm"
                  style={{
                    top: '12px',
                    left: '12px',
                    fontSize: '10px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(22,163,74,0.2)',
                    gap: '4px',
                  }}
                >
                  <span className="w-[8px] h-[8px] rounded-full bg-[#16A34A]" />
                  VEG
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <h3
                  className="font-semibold text-[#1A1A1A] truncate"
                  style={{ fontSize: '15px', lineHeight: '20px', marginBottom: '8px' }}
                >
                  {item.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#C8964B]" style={{ fontSize: '16px' }}>
                    &#8377;{item.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
