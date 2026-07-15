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
      <div className="hidden md:block ">
        <HeroSection />
        <FeaturesBar />
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
