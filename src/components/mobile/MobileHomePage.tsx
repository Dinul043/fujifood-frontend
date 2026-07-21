'use client'

import { useState, useEffect } from 'react'
import { addToCart } from '@/hooks/useCart'
import api from '@/lib/api'
import { resolveImageUrl } from '@/lib/image'
import { MobileReviews } from '@/components/mobile/MobileReviews'

/**
 * MobileHomePage — Complete mobile homepage (320-425px).
 *
 * Sections:
 *   1. Hero (stacked: text + image below)
 *   2. Features (2x2 grid, compact)
 *   3. Customer Favorites (vertical list with thumbnails) — fetched from API
 *   4. Promo banner (compact dark card)
 *   5. How It Works (numbered vertical list)
 *   6. Bottom navigation bar
 *
 * Same gold/dark theme. Completely different layout from desktop.
 * All padding: 20px horizontal (matches mobile header).
 */

interface MenuItem {
  id: number
  name: string
  price: number
  image_url?: string
}

export function MobileHomePage() {
  const [favorites, setFavorites] = useState<MenuItem[]>([])
  const [restaurant, setRestaurant] = useState<any>(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/menu/storefront/a2b')
        const allItems: MenuItem[] = []
        if (data.categories && Array.isArray(data.categories)) {
          data.categories.forEach((cat: any) => {
            if (cat.items && Array.isArray(cat.items)) {
              cat.items.forEach((item: any) => {
                if (item.is_available !== false) allItems.push(item)
              })
            }
          })
        }
        setFavorites(allItems.slice(0, 5))
      } catch {}
      try {
        const { data } = await api.get('/restaurants/storefront/a2b')
        setRestaurant(data)
      } catch {}
    })()
  }, [])
  return (
    <div style={{ paddingTop: '96px' }}>
      {/* ─── Hero ──────────────────────────────────────────────── */}
      <section style={{ padding: '24px 20px 32px' }}>
        <h1 style={{ marginBottom: '12px' }}>
          <span
            className="block font-heading font-bold text-[#1A1A1A]"
            style={{ fontSize: '32px', lineHeight: '38px', letterSpacing: '-0.02em' }}
          >
            Authentic Taste.
          </span>
          <span
            className="block font-heading font-bold text-[#C8964B]"
            style={{ fontSize: '32px', lineHeight: '38px', letterSpacing: '-0.02em' }}
          >
            Timeless Tradition.
          </span>
        </h1>
        <p className="text-[#666]" style={{ fontSize: '14px', lineHeight: '22px', marginBottom: '20px' }}>
          Experience the rich flavors of South India, crafted with love and the finest ingredients.
        </p>
        {/* CTA */}
        <div className="flex" style={{ gap: '12px' }}>
          <a
            href="/menu"
            className="flex-1 inline-flex items-center justify-center font-semibold text-white bg-[#C8964B]"
            style={{ height: '48px', borderRadius: '12px', fontSize: '14px' }}
          >
            Order Now
          </a>
          <a
            href="/menu"
            className="flex-1 inline-flex items-center justify-center font-semibold text-[#1A1A1A] border-[1.5px] border-[#1A1A1A]"
            style={{ height: '48px', borderRadius: '12px', fontSize: '14px' }}
          >
            View Menu
          </a>
        </div>

        {/* Hero image */}
        <div className="flex justify-center" style={{ marginTop: '24px' }}>
          <div className="relative" style={{ width: '240px', height: '240px' }}>
            <div className="absolute inset-0 rounded-full bg-[#C8964B]/8" />
            <img
              src="/images/food/dish-1.png"
              alt="South Indian food"
              className="relative w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </section>

      {/* ─── Features (2x2 grid) ───────────────────────────────── */}
      <section className="bg-white border-y border-[#E8E4DE]" style={{ padding: '20px' }}>
        <div className="grid grid-cols-2" style={{ gap: '16px' }}>
          {[
            { title: 'Pure Vegetarian', sub: '100% Pure veg' },
            { title: 'Hygienic Kitchen', sub: 'Safe & clean' },
            { title: 'Fast Delivery', sub: 'On-time delivery' },
            { title: 'Best Quality', sub: 'Fresh ingredients' },
          ].map((f) => (
            <div key={f.title} className="flex items-center" style={{ gap: '10px' }}>
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full bg-[#C8964B]/10 text-[#C8964B]"
                style={{ width: '36px', height: '36px' }}
              >
                <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '12px', lineHeight: '16px' }}>{f.title}</p>
                <p className="text-[#888]" style={{ fontSize: '10px', lineHeight: '14px' }}>{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Delivery Info ──────────────────────────────────────── */}
      <div style={{ margin: '0 20px', padding: '10px 14px', borderRadius: 10, background: '#FDF6EC', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>
        <p style={{ fontSize: 11, fontWeight: 500, color: '#8B6A2F' }}>We deliver within {restaurant?.delivery_radius_km || 5} km. Free delivery above ₹{restaurant?.free_delivery_above || 299}.</p>
      </div>

      {/* ─── Customer Favorites (vertical list) ────────────────── */}
      <section style={{ padding: '32px 20px' }}>
        <div className="flex items-end justify-between" style={{ marginBottom: '20px' }}>
          <div>
            <p className="font-semibold uppercase text-[#C8964B]" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '4px' }}>
              Our Specials
            </p>
            <h2 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '20px' }}>
              Customer Favorites
            </h2>
          </div>
          <a href="/menu" className="font-semibold text-[#C8964B]" style={{ fontSize: '12px' }}>View All</a>
        </div>

        <div className="flex flex-col" style={{ gap: '12px' }}>
          {favorites.map((item) => (
            <div
              key={item.id}
              className="flex items-center bg-white"
              style={{ gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #EEEAE5' }}
            >
              <img
                src={resolveImageUrl(item.image_url, item.id)}
                alt={item.name}
                className="flex-shrink-0 object-cover"
                style={{ width: '56px', height: '56px', borderRadius: '10px' }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#1A1A1A] truncate" style={{ fontSize: '14px', marginBottom: '4px' }}>
                  {item.name}
                </h3>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <span className="font-bold text-[#C8964B]" style={{ fontSize: '14px' }}>&#8377;{item.price}</span>
                </div>
              </div>
              <button
                onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: resolveImageUrl(item.image_url, item.id) })}
                className="flex-shrink-0 flex items-center justify-center rounded-full bg-[#C8964B] text-white"
                style={{ width: '32px', height: '32px' }}
                aria-label={`Add ${item.name}`}
              >
                <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          ))}
          {favorites.length === 0 && (
            <p className="text-center text-[#AAA]" style={{ fontSize: '13px', padding: '20px 0' }}>Loading menu...</p>
          )}
        </div>
      </section>

      {/* ─── Promo Banner ──────────────────────────────────────── */}
      <section style={{ padding: '0 20px 32px' }}>
        <div
          className="relative overflow-hidden bg-[#1A1A1A]"
          style={{ borderRadius: '16px', padding: '24px' }}
        >
          <div className="absolute rounded-full bg-[#C8964B]/8" style={{ width: '160px', height: '160px', top: '-60px', right: '-40px' }} aria-hidden="true" />
          <p className="font-semibold uppercase text-[#D4A853]" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '8px' }}>
            Today&apos;s Special Offer
          </p>
          <h3 className="font-heading font-extrabold text-white" style={{ fontSize: '28px', marginBottom: '4px' }}>
            20% OFF
          </h3>
          <p className="text-[#AAA]" style={{ fontSize: '13px', marginBottom: '4px' }}>
            On Orders Above &#8377;249
          </p>
          <p className="text-[#777]" style={{ fontSize: '12px', marginBottom: '16px' }}>
            Use Code: <span className="font-bold text-[#D4A853]">A2BSPECIAL</span>
          </p>
          <a
            href="/menu"
            className="inline-flex items-center justify-center font-semibold text-white bg-[#C8964B]"
            style={{ height: '40px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '10px', fontSize: '13px' }}
          >
            Order Now
          </a>
        </div>
      </section>

      {/* ─── Customer Reviews ──────────────────────────────────── */}
      <MobileReviews />

      {/* ─── How It Works ──────────────────────────────────────── */}
      <section className="bg-white" style={{ padding: '32px 20px' }}>
        <h2 className="font-heading font-bold text-[#1A1A1A] text-center" style={{ fontSize: '20px', marginBottom: '24px' }}>
          How It Works
        </h2>
        <div className="flex flex-col" style={{ gap: '20px' }}>
          {[
            { n: 1, title: 'Choose Your Food', desc: 'Browse our delicious menu.' },
            { n: 2, title: 'Place Your Order', desc: 'Add to cart and checkout.' },
            { n: 3, title: 'We Prepare', desc: 'Fresh & hygienic cooking.' },
            { n: 4, title: 'Get It Delivered', desc: 'Enjoy at your doorstep.' },
          ].map((step) => (
            <div key={step.n} className="flex items-start" style={{ gap: '16px' }}>
              <span
                className="flex-shrink-0 flex items-center justify-center rounded-full bg-[#C8964B] text-white font-bold"
                style={{ width: '32px', height: '32px', fontSize: '13px' }}
              >
                {step.n}
              </span>
              <div>
                <h3 className="font-semibold text-[#1A1A1A]" style={{ fontSize: '14px', marginBottom: '2px' }}>{step.title}</h3>
                <p className="text-[#888]" style={{ fontSize: '12px' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Mobile Footer ─────────────────────────────────────── */}
      <footer className="bg-[#141414]" style={{ padding: '40px 20px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <a href="/" className="inline-block" style={{ marginBottom: '16px' }}>
            <span className="block font-heading font-bold text-white" style={{ fontSize: '22px' }}>A2B</span>
            <span className="block uppercase font-semibold text-[#C8964B]" style={{ fontSize: '8px', letterSpacing: '0.18em' }}>Veg Restaurant</span>
          </a>
          {restaurant && (restaurant.address_line1 || restaurant.city) && (
            <p className="text-[#888]" style={{ fontSize: '13px', lineHeight: '22px', marginBottom: '12px' }}>
              {[restaurant.address_line1, restaurant.address_line2, restaurant.city, restaurant.state, restaurant.pincode].filter(Boolean).join(', ')}
            </p>
          )}
          <div className="flex flex-col" style={{ gap: '6px' }}>
            {restaurant?.phone && <a href={`tel:${restaurant.phone}`} className="text-[#999] hover:text-white transition-colors" style={{ fontSize: '13px' }}>{restaurant.phone}</a>}
            {restaurant?.email && <a href={`mailto:${restaurant.email}`} className="text-[#999] hover:text-white transition-colors" style={{ fontSize: '13px' }}>{restaurant.email}</a>}
          </div>
        </div>

        <div className="grid grid-cols-2" style={{ gap: '32px', marginBottom: '32px' }}>
          <div>
            <h4 className="uppercase font-semibold text-[#666]" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '16px' }}>Quick Links</h4>
            <ul className="flex flex-col" style={{ gap: '12px' }}>
              {[
                { label: 'Menu', href: '/menu' },
                { label: 'Cart', href: '/cart' },
                { label: 'My Orders', href: '/orders' },
                { label: 'Profile', href: '/profile' },
              ].map((link) => (
                <li key={link.label}><a href={link.href} className="text-[#999] hover:text-white transition-colors" style={{ fontSize: '13px' }}>{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="uppercase font-semibold text-[#666]" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '16px' }}>Legal</h4>
            <ul className="flex flex-col" style={{ gap: '12px' }}>
              {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((link) => (
                <li key={link}><span className="text-[#999]" style={{ fontSize: '13px' }}>{link}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 className="uppercase font-semibold text-[#666]" style={{ fontSize: '10px', letterSpacing: '0.15em', marginBottom: '12px' }}>Opening Hours</h4>
          <ul className="flex flex-col" style={{ gap: '8px' }}>
            <li className="flex justify-between" style={{ fontSize: '13px' }}><span className="text-[#999]">Mon — Fri</span><span className="text-[#CCC] font-medium">10:00 — 22:00</span></li>
            <li className="flex justify-between" style={{ fontSize: '13px' }}><span className="text-[#999]">Saturday</span><span className="text-[#CCC] font-medium">10:00 — 23:00</span></li>
            <li className="flex justify-between" style={{ fontSize: '13px' }}><span className="text-[#999]">Sunday</span><span className="text-[#CCC] font-medium">11:00 — 22:00</span></li>
          </ul>
        </div>

        <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '16px' }}>
          <p className="text-[#666]" style={{ fontSize: '11px' }}>&copy; 2026 A2B Veg Restaurant. All rights reserved.</p>
          <p className="text-[#555]" style={{ fontSize: '10px', marginTop: '4px' }}>
            Powered by <a href="https://www.fujisakuratech.com" className="text-[#888] hover:text-[#C8964B] transition-colors">Fuji Sakura Tech</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
