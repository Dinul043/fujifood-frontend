'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileHeader } from '@/components/mobile/MobileHeader'

/**
 * StorefrontLayout
 *
 * Desktop (768px+): Desktop Header + content + Footer
 * Mobile (<768px): Mobile Header + content (footer is inside MobileHomePage)
 *
 * No bottom nav bar — this is a website, not an app.
 */
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Desktop Header — hidden on mobile */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Header — hidden on desktop */}
      <div className="block md:hidden">
        <MobileHeader />
      </div>

      {/* Main content */}
      <main className="min-h-screen">{children}</main>

      {/* Desktop Footer — hidden on mobile (mobile footer is in MobileHomePage) */}
      <div className="hidden md:block">
        <Footer
          restaurantName="A2B Veg Restaurant"
          restaurantPhone="+91 98765 43210"
          restaurantEmail="hello@a2b.com"
          restaurantAddress="123, Marina Beach Road, Anna Nagar, Chennai, Tamil Nadu 600001"
        />
      </div>
    </>
  )
}
