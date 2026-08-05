'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import api from '@/lib/api'

const LOCATION_KEY = 'fujifood_user_location'
const LOCATION_COORDS_KEY = 'fujifood_location_coords'
const LOCATION_CHECKED_KEY = 'fujifood_location_checked'

/**
 * Check delivery availability using stored coordinates.
 * Called on every page load if coords exist.
 */
async function checkStoredCoords(
  setOutOfRange: (v: boolean) => void,
  setOutOfRangeMsg: (v: string) => void
) {
  try {
    const stored = localStorage.getItem(LOCATION_COORDS_KEY)
    if (!stored) return
    const { lat, lng } = JSON.parse(stored)
    // Use api instance (handles baseURL correctly)
    const { default: api } = await import('@/lib/api')
    const { data } = await api.post('/geo/check-delivery', { latitude: lat, longitude: lng })
    if (!data.deliverable) {
      setOutOfRangeMsg(data.message)
      setOutOfRange(true)
    }
  } catch {}
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { count } = useCart()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [location, setLocation] = useState('Select Location')
  const [detecting, setDetecting] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [outOfRange, setOutOfRange] = useState(false)
  const [outOfRangeMsg, setOutOfRangeMsg] = useState('')
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isAuth = document.cookie.includes('fujifood_access_token')
    setIsLoggedIn(isAuth)

    // Load saved location text
    const saved = localStorage.getItem(LOCATION_KEY)
    if (saved) setLocation(saved)

    // Auto-detect ONLY on very first visit (no coords stored at all)
    if (!localStorage.getItem(LOCATION_CHECKED_KEY) && !localStorage.getItem(LOCATION_COORDS_KEY)) {
      localStorage.setItem(LOCATION_CHECKED_KEY, '1')
      detectLocation()
    } else if (localStorage.getItem(LOCATION_COORDS_KEY) && !sessionStorage.getItem('zone_checked')) {
      // Coords exist but not checked this session → silently verify zone
      sessionStorage.setItem('zone_checked', '1')
      checkStoredCoords(setOutOfRange, setOutOfRangeMsg)
    }

    // Load saved addresses if logged in
    if (isAuth) {
      api.get('/addresses/').then(({ data }) => setSavedAddresses(data || [])).catch(() => {})
    }

    // Listen for address updates from profile page
    const refreshAddresses = () => {
      api.get('/addresses/').then(({ data }) => setSavedAddresses(data || [])).catch(() => {})
    }
    window.addEventListener('addresses-updated', refreshAddresses)

    // Close dropdown on outside click
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('addresses-updated', refreshAddresses)
    }
  }, [])

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    setDropdownOpen(false)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        // Save coords for future zone checks
        localStorage.setItem(LOCATION_COORDS_KEY, JSON.stringify({ lat: latitude, lng: longitude }))
        sessionStorage.setItem('zone_checked', '1')
        try {
          const { data: check } = await api.post('/geo/check-delivery', { latitude, longitude })
          if (!check.deliverable) { setOutOfRangeMsg(check.message); setOutOfRange(true) }
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
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

  const selectAddress = async (a: any) => {
    const label = `${a.label} — ${a.address_line1}, ${a.city}`
    setLocation(label)
    localStorage.setItem(LOCATION_KEY, label)
    setDropdownOpen(false)
    try {
      const { data } = await api.post('/geo/check-delivery-address', {
        address: a.address_line1,
        city: a.city,
        pincode: a.pincode || '',
      })
      sessionStorage.setItem('zone_checked', '1')
      if (!data.deliverable) { setOutOfRangeMsg(data.message); setOutOfRange(true) }
    } catch {
      // Backend unreachable — show warning
      setOutOfRangeMsg('Could not verify delivery area. Please ensure you are within our delivery zone.')
      setOutOfRange(true)
    }
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Orders', href: '/orders' },
    { label: 'About Us', href: '#footer' },
  ]

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#141414] border-b border-[#2A2A2A]">
      <div
        className="flex items-center justify-between"
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          height: '88px',
          paddingLeft: '48px',
          paddingRight: '48px',
        }}
      >
        {/* ─── Left: Logo + Location ─────────────────────────── */}
        <div className="flex items-center">
          {/* Logo block */}
          <a href="/" className="flex flex-col leading-none" style={{ marginRight: '32px' }}>
            <span className="text-[26px] font-heading font-bold text-white tracking-[-0.03em]">
              A2B
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#C8964B] font-semibold">
              Veg Restaurant
            </span>
          </a>

          {/* Divider */}
          <div className="w-[1px] h-[40px] bg-[#333]" style={{ marginRight: '32px' }} />

          {/* Location selector with dropdown */}
          <div ref={dropRef} style={{ position: 'relative', marginRight: '80px' }}>
            <button
              className="flex items-center gap-[12px] group"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <svg className="w-[18px] h-[18px] text-[#C8964B] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] text-[#888]">Delivering to</span>
                <div className="flex items-center gap-[6px]">
                  <span className="text-[14px] text-white font-medium group-hover:text-[#C8964B] transition-colors duration-200" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {detecting ? 'Detecting...' : location}
                  </span>
                  <svg className="w-[12px] h-[12px] text-[#666] transition-transform duration-200" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 12, width: 280, background: '#1E1E1E', border: '1px solid #333', borderRadius: 14, boxShadow: '0 16px 40px rgba(0,0,0,0.4)', zIndex: 60, overflow: 'hidden' }}>
                {/* Detect location option */}
                <button onClick={detectLocation} disabled={detecting} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', borderBottom: '1px solid #2A2A2A', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#252525')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#C8964B" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#C8964B' }}>{detecting ? 'Detecting...' : 'Use My Location'}</span>
                </button>
                {/* Saved addresses */}
                {savedAddresses.length > 0 && (
                  <>
                    <p style={{ fontSize: 10, color: '#555', padding: '8px 16px 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Saved Addresses</p>
                    {savedAddresses.map(a => (
                      <button key={a.id} onClick={() => selectAddress(a)} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', borderBottom: '1px solid #222', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#252525')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#888" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#DDD' }}>{a.label}</p>
                          <p style={{ fontSize: 11, color: '#666' }}>{a.address_line1}, {a.city}</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
                {savedAddresses.length === 0 && (
                  <p style={{ fontSize: 12, color: '#555', padding: '12px 16px', textAlign: 'center' }}>
                    <a href="/profile" style={{ color: '#C8964B', textDecoration: 'none' }}>Add saved addresses</a> for quick selection
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Center: Navigation ────────────────────────────── */}
        <nav aria-label="Main navigation">
          <ul className="flex items-center" style={{ gap: '48px' }}>
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              const isHashLink = link.href.startsWith('#')
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={isHashLink ? (e) => {
                      e.preventDefault()
                      const el = document.getElementById('site-footer')
                      if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY - 88
                        window.scrollTo({ top, behavior: 'smooth' })
                      }
                    } : undefined}
                    className="transition-colors duration-200 hover:text-[#C8964B]"
                    style={{ fontSize: '14px', fontWeight: 500, color: isActive && !isHashLink ? '#FFFFFF' : '#999' }}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* ─── Right: Search + Cart + Login ──────────────────── */}
        <div className="flex items-center">
          {/* Search — only show on homepage */}
          {pathname === '/' && (
            <button
              className="text-[#999] hover:text-white transition-colors duration-200"
              aria-label="Search menu"
              style={{ marginRight: '32px' }}
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          )}

          {/* Cart */}
          <a
            href="/cart"
            className="relative text-[#999] hover:text-white transition-colors duration-200"
            aria-label="View cart"
            style={{ marginRight: '24px' }}
          >
            <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {/* Cart count badge */}
            <span className="absolute -top-[8px] -right-[8px] min-w-[18px] h-[18px] rounded-full bg-[#C8964B] text-white text-[10px] font-bold flex items-center justify-center px-[5px]" suppressHydrationWarning>
              {count}
            </span>
          </a>

          {/* Login / Sign out */}
          {isLoggedIn && (
            <a href="/profile" className="text-[#999] hover:text-white transition-colors duration-200" aria-label="Profile" style={{ marginRight: '16px' }}>
              <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </a>
          )}
          <a
            href={isLoggedIn ? '#' : '/login'}
            onClick={(e) => {
              if (isLoggedIn) {
                e.preventDefault()
                document.cookie = 'fujifood_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                document.cookie = 'fujifood_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
                window.location.href = '/'
              }
            }}
            className="inline-flex items-center justify-center whitespace-nowrap text-[13px] font-semibold text-[#C8964B] border-[1.5px] border-[#C8964B] hover:bg-[#C8964B] hover:text-white transition-all duration-200"
            style={{ height: '48px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '12px' }}
          >
            {isLoggedIn ? 'Sign out' : 'Login / Sign up'}
          </a>
        </div>
      </div>
    </header>

    {/* Out-of-range modal */}
    {outOfRange && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
        <div style={{ background: '#141414', borderRadius: 24, padding: 40, maxWidth: 420, width: '90%', textAlign: 'center', border: '1px solid #2A2A2A', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width={28} height={28} fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Outside Delivery Zone</h2>
          <p style={{ fontSize: 14, color: '#888', lineHeight: '22px', marginBottom: 28 }}>{outOfRangeMsg || 'Your selected location is outside our delivery area.'}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setOutOfRange(false); setDropdownOpen(true) }} style={{ flex: 1, height: 44, borderRadius: 10, border: '1px solid #333', background: 'transparent', color: '#CCC', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Change Location
            </button>
            <button onClick={() => setOutOfRange(false)} style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', background: '#C8964B', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Search overlay */}
    {searchOpen && (
      <div
        className="fixed left-0 right-0 z-[45] bg-[#1A1A1A] border-b border-[#333] shadow-lg"
        style={{ top: '88px' }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 48px' }}>
          <div className="relative flex items-center">
            <svg className="absolute w-[18px] h-[18px] text-[#888] pointer-events-none" style={{ left: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="search"
              placeholder="Search dishes, categories..."
              autoFocus
              className="w-full bg-[#252525] text-white placeholder-[#666] border border-[#333] outline-none focus:border-[#C8964B] transition-colors"
              style={{ height: '48px', paddingLeft: '48px', paddingRight: '48px', borderRadius: '12px', fontSize: '15px' }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchOpen(false)
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value
                  if (val.trim()) {
                    window.location.href = `/menu?search=${encodeURIComponent(val.trim())}`
                  }
                }
              }}
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute text-[#888] hover:text-white transition-colors"
              style={{ right: '16px' }}
              aria-label="Close search"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Backdrop to close search */}
    {searchOpen && (
      <div className="fixed inset-0 z-[44] bg-black/30" onClick={() => setSearchOpen(false)} />
    )}
    </>
  )
}
