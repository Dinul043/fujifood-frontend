'use client'

/**
 * Restaurant Homepage
 *
 * Desktop (768px+): Premium full-width sections
 * Mobile (<768px): Compact, app-like experience
 *
 * Both rendered in the DOM, visibility controlled via CSS (no hydration mismatch).
 */
import { useState, useEffect } from 'react'
import { HeroSection } from '@/components/storefront/hero/HeroSection'
import { FeaturesBar } from '@/components/storefront/hero/FeaturesBar'
import { BestsellersSection } from '@/components/storefront/menu/BestsellersSection'
import { PromoBanner } from '@/components/storefront/promotions/PromoBanner'
import { HowItWorks } from '@/components/storefront/hero/HowItWorks'
import { WhyChooseUs } from '@/components/storefront/hero/WhyChooseUs'
import { ReviewsSection } from '@/components/storefront/reviews/ReviewsSection'
import { MobileHomePage } from '@/components/mobile/MobileHomePage'
import api from '@/lib/api'

export default function HomePage() {
  const [radius, setRadius] = useState(5)
  const [freeAbove, setFreeAbove] = useState(299)
  const [deliveryTime, setDeliveryTime] = useState(30)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/restaurants/storefront/a2b')
        if (data.delivery_radius_km) setRadius(data.delivery_radius_km)
        if (data.free_delivery_above) setFreeAbove(data.free_delivery_above)
        if (data.avg_delivery_time_mins) setDeliveryTime(data.avg_delivery_time_mins)
      } catch {}
    })()
  }, [])

  return (
    <>
      {/* Desktop version — hidden on mobile */}
      <div className="hidden md:block w-full">
        <HeroSection />
        <FeaturesBar />
        {/* Delivery radius info */}
        <div style={{ width: '100%', background: '#FDF6EC', padding: '14px 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#8B6A2F' }}>We deliver within {radius} km of our restaurant</p>
            </div>
            <span style={{ color: '#D4A853', fontSize: 13 }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#8B6A2F' }}>Estimated delivery: {deliveryTime} mins</p>
            </div>
            {freeAbove > 0 && <>
              <span style={{ color: '#D4A853', fontSize: 13 }}>·</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-4.125-2.625-4.125 2.625-4.125-2.625-4.125 2.625V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.636 0c1.1.128 1.907 1.077 1.907 2.185z" /></svg>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#8B6A2F' }}>Free delivery above ₹{freeAbove}</p>
              </div>
            </>}
          </div>
        </div>
        <BestsellersSection />
        <PromoBanner />
        <ReviewsSection />
        <HowItWorks />
        <WhyChooseUs />
      </div>

      {/* Mobile version — hidden on desktop */}
      <div className="block md:hidden">
        <MobileHomePage />
      </div>
    </>
  )
}
