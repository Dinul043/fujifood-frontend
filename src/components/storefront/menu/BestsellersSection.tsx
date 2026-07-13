'use client'

import { addToCart } from '@/hooks/useCart'

/**
 * BestsellersSection — Customer Favorites.
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
 *   Rating: 13px with gold star
 *   VEG badge: green, small, top-left of image
 */

const bestsellers = [
  { id: 1, name: 'Ghee Roast Dosa', price: 120, rating: 4.8, image: '/images/food/dish-2.png' },
  { id: 2, name: 'Mini Tiffin', price: 99, rating: 4.5, image: '/images/food/dish-3.png' },
  { id: 3, name: 'Paneer Butter Masala', price: 160, rating: 4.7, image: '/images/food/dish-4.png' },
  { id: 4, name: 'South Indian Thali', price: 169, rating: 4.6, image: '/images/food/dish-5.png' },
  { id: 5, name: 'Rava Kesari', price: 80, rating: 4.4, image: '/images/food/dish-6.png' },
]

export function BestsellersSection() {
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
          {bestsellers.map((item) => (
            <div
              key={item.id}
              className="group bg-white overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]"
              style={{ borderRadius: '16px', border: '1px solid #EEEAE5' }}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                <img
                  src={item.image}
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
                  <span className="flex items-center text-[#888]" style={{ fontSize: '13px', gap: '4px' }}>
                    <svg className="text-[#D4A853] fill-current" width="14" height="14" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {item.rating}
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
