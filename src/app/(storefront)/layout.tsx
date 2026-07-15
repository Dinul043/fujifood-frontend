'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileHeader } from '@/components/mobile/MobileHeader'
import api from '@/lib/api'

/**
 * StorefrontLayout
 *
 * Desktop (768px+): Desktop Header + content + Footer
 * Mobile (<768px): Mobile Header + content (footer is inside MobileHomePage)
 *
 * Fetches restaurant data from API for footer details.
 */
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [restaurant, setRestaurant] = useState<any>(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/restaurants/storefront/a2b')
        setRestaurant(data)
      } catch {}
    })()
  }, [])

  // Build address from restaurant data
  const buildAddress = () => {
    if (!restaurant) return ''
    const parts = [
      restaurant.address_line1,
      restaurant.address_line2,
      restaurant.city,
      restaurant.state,
      restaurant.pincode,
    ].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <>
      {/* Desktop Header — hidden on mobile */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Mobile Header — hidden on desktop */}
      <div className="block md:hidden ">
        <MobileHeader />
      </div>

      {/* Main content */}
      <main className="min-h-screen w-full">{children}</main>

      {/* Desktop Footer — hidden on mobile (mobile footer is in MobileHomePage) */}
      <div className="hidden md:block" id="site-footer">
        <Footer
          restaurantName={restaurant?.name || 'A2B Veg Restaurant'}
          restaurantPhone={restaurant?.phone || ''}
          restaurantEmail={restaurant?.email || ''}
          restaurantAddress={buildAddress()}
        />
      </div>
    </>
  )
}
