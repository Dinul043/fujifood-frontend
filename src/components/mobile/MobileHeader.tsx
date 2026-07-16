'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'

const LOCATION_KEY = 'fujifood_user_location'

/**
 * MobileHeader — Premium mobile navigation.
 * Header (56px) + Location bar (40px) + optional Search bar
 * Hamburger opens full-screen dark overlay menu
 */
export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { count } = useCart()
  const [location, setLocation] = useState('Detect Location')
  const [detecting, setDetecting] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(LOCATION_KEY)
    if (saved) {
      setLocation(saved)
    } else {
      detectLocation()
    }
  }, [])

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
          const g = await r.json()
          const area = g.address?.suburb || g.address?.neighbourhood || g.address?.city_district || ''
          const city = g.address?.city || g.address?.town || g.address?.state_district || ''
          const loc = area ? `${area}, ${city}` : city || 'Location detected'
          setLocation(loc)
          localStorage.setItem(LOCATION_KEY, loc)
        } catch {
          setLocation('Location unavailable')
        } finally { setDetecting(false) }
      },
      () => { setDetecting(false); setLocation('Enable Location') },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <>
      {/* Fixed header bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-[#141414]"
        style={{ height: '56px' }}
      >
        <div className="flex items-center justify-between h-full" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
          {/* Logo */}
          <a href="/" className="flex flex-col leading-none">
            <span className="text-[20px] font-heading font-bold text-white tracking-[-0.02em]">A2B</span>
            <span className="text-[8px] uppercase tracking-[0.18em] text-[#C8964B] font-semibold">Veg Restaurant</span>
          </a>

          {/* Right actions */}
          <div className="flex items-center" style={{ gap: '14px' }}>
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-[#999]"
              aria-label="Search"
            >
              <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>

            {/* Cart */}
            <a href="/cart" className="relative text-[#999]" aria-label="Cart">
              <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span className="absolute -top-[5px] -right-[5px] w-[16px] h-[16px] rounded-full bg-[#C8964B] text-white text-[9px] font-bold flex items-center justify-center" suppressHydrationWarning>
                {count}
              </span>
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className="text-white"
              aria-label="Open menu"
            >
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Location bar below header */}
      <div
        className="fixed left-0 right-0 z-40 bg-[#1E1E1E] border-b border-[#2A2A2A]"
        style={{ top: '56px', height: '40px', paddingLeft: '10px', paddingRight: '10px' }}
      >
        <button className="flex items-center h-full w-full" style={{ gap: '8px' }} onClick={detectLocation}>
          <svg className="w-[14px] h-[14px] text-[#C8964B] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
          </svg>
          <span className="text-[11px] text-[#888]">Delivering to</span>
          <span className="text-[12px] text-white font-medium" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detecting ? 'Detecting...' : location}</span>
          <svg className="w-[10px] h-[10px] text-[#666]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Search bar (slides below location) */}
      {searchOpen && (
        <div
          className="fixed left-0 right-0 z-[39] bg-[#1A1A1A] border-b border-[#333]"
          style={{ top: '96px', padding: '12px 20px' }}
        >
          <div className="relative">
            <svg className="absolute left-12 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#888] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="search"
              placeholder="Search dishes..."
              autoFocus
              className="w-full bg-[#252525] text-white placeholder-[#666] border border-[#333] outline-none focus:border-[#C8964B] transition-colors"
              style={{ height: '40px', paddingLeft: '40px', paddingRight: '40px', borderRadius: '10px', fontSize: '14px' }}
              onKeyDown={(e) => { if (e.key === 'Escape') setSearchOpen(false) }}
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]"
              aria-label="Close search"
            >
              <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Full-screen menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#141414] flex flex-col">
          {/* Menu header */}
          <div className="flex items-center justify-between" style={{ height: '56px', paddingLeft: '20px', paddingRight: '20px' }}>
            <span className="text-[20px] font-heading font-bold text-white">A2B</span>
            <button onClick={() => setMenuOpen(false)} className="text-white" aria-label="Close menu">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu links */}
          <nav className="flex-1 flex flex-col justify-center" style={{ paddingLeft: '32px', paddingRight: '32px', gap: '8px' }}>
            {[
              { label: 'Home', href: '/' },
              { label: 'Menu', href: '/menu' },
             // { label: 'Offers', href: '#offers' },
              { label: 'My Orders', href: '/orders' },
              { label: 'About Us', href: '#about' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-[#CCC] hover:text-[#C8964B] transition-colors"
                style={{ fontSize: '24px', fontWeight: 500, padding: '12px 0', borderBottom: '1px solid #2A2A2A' }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Bottom action */}
          <div style={{ padding: '24px 32px 40px' }}>
            <a
              href="/login"
              className="flex items-center justify-center w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] transition-colors"
              style={{ height: '48px', borderRadius: '12px', fontSize: '15px' }}
            >
              Login / Sign up
            </a>
          </div>
        </div>
      )}
    </>
  )
}
