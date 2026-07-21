'use client'

/**
 * Restaurant Homepage
 *
 * Desktop (768px+): Premium full-width sections
 * Mobile (<768px): Compact, app-like experience
 *
 * Both rendered in the DOM, visibility controlled via CSS (no hydration mismatch).
 */
import { HeroSection } from '@/components/storefront/hero/HeroSection'
import { FeaturesBar } from '@/components/storefront/hero/FeaturesBar'
import { BestsellersSection } from '@/components/storefront/menu/BestsellersSection'
import { PromoBanner } from '@/components/storefront/promotions/PromoBanner'
import { HowItWorks } from '@/components/storefront/hero/HowItWorks'
import { WhyChooseUs } from '@/components/storefront/hero/WhyChooseUs'
import { ReviewsSection } from '@/components/storefront/reviews/ReviewsSection'
import { MobileHomePage } from '@/components/mobile/MobileHomePage'

export default function HomePage() {
  return (
    <>
      {/* Desktop version — hidden on mobile */}
      <div className="hidden md:block w-full">
        <HeroSection />
        <FeaturesBar />
        {/* Delivery radius info */}
        <div style={{ width: '100%', background: '#FDF6EC', padding: '14px 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#8B6A2F' }}>We deliver within 5 km of our restaurant. Free delivery on orders above ₹299.</p>
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
