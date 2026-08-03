'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import api from '@/lib/api'

const LOCATION_KEY = 'fujifood_user_location'
const LOCATION_COORDS_KEY = 'fujifood_location_coords'
const LOCATION_CHECKED_KEY = 'fujifood_location_checked'

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [locationSheetOpen, setLocationSheetOpen] = useState(false)
  const { count } = useCart()
  const [location, setLocation] = useState('Select Location')
  const [detecting, setDetecting] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [outOfRange, setOutOfRange] = useState(false)
  const [outOfRangeMsg, setOutOfRangeMsg] = useState('')

  useEffect(() => {
    const isAuth = document.cookie.includes('fujifood_access_token')
    const saved = localStorage.getItem(LOCATION_KEY)
    if (saved) setLocation(saved)

    // First visit: auto-detect
    if (!localStorage.getItem(LOCATION_CHECKED_KEY) && !localStorage.getItem(LOCATION_COORDS_KEY)) {
      localStorage.setItem(LOCATION_CHECKED_KEY, '1')
      detectLocation()
    } else if (localStorage.getItem(LOCATION_COORDS_KEY) && !sessionStorage.getItem('zone_checked')) {
      // Coords exist, check zone once per session
      sessionStorage.setItem('zone_checked', '1')
      checkZone()
    }

    if (isAuth) {
      api.get('/addresses/').then(({ data }) => setSavedAddresses(data || [])).catch(() => {})
    }
  }, [])

  const checkZone = async () => {
    try {
      const stored = localStorage.getItem(LOCATION_COORDS_KEY)
      if (!stored) return
      const { lat, lng } = JSON.parse(stored)
      const { data } = await api.post('/geo/check-delivery', { latitude: lat, longitude: lng })
      if (!data.deliverable) { setOutOfRangeMsg(data.message); setOutOfRange(true) }
    } catch {}
  }

  const detectLocation = () => {
    if (!navigator.geolocation) return
    setDetecting(true)
    setLocationSheetOpen(false)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
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
        } catch { setLocation('Location unavailable') }
        finally { setDetecting(false) }
      },
      () => { setDetecting(false); setLocation('Enable Location') },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const selectAddress = async (a: any) => {
    const label = `${a.label} — ${a.address_line1}, ${a.city}`
    setLocation(label)
    localStorage.setItem(LOCATION_KEY, label)
    setLocationSheetOpen(false)
    try {
      const { data } = await api.post('/geo/check-delivery-address', { address: a.address_line1, city: a.city, pincode: a.pincode })
      if (!data.deliverable) { setOutOfRangeMsg(data.message); setOutOfRange(true) }
    } catch {}
  }

  return (
    <>
      {/* Fixed header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#141414]" style={{ height: '56px' }}>
        <div className="flex items-center justify-between h-full" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
          <a href="/" className="flex flex-col leading-none">
            <span className="text-[20px] font-heading font-bold text-white tracking-[-0.02em]">A2B</span>
            <span className="text-[8px] uppercase tracking-[0.18em] text-[#C8964B] font-semibold">Veg Restaurant</span>
          </a>
          <div className="flex items-center" style={{ gap: '14px' }}>
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-[#999]" aria-label="Search">
              <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            </button>
            <a href="/cart" className="relative text-[#999]" aria-label="Cart">
              <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
              <span className="absolute -top-[5px] -right-[5px] w-[16px] h-[16px] rounded-full bg-[#C8964B] text-white text-[9px] font-bold flex items-center justify-center" suppressHydrationWarning>{count}</span>
            </a>
            <button onClick={() => setMenuOpen(true)} className="text-white" aria-label="Open menu">
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Location bar */}
      <div className="fixed left-0 right-0 z-40 bg-[#1E1E1E] border-b border-[#2A2A2A]" style={{ top: '56px', height: '40px', paddingLeft: '10px', paddingRight: '10px' }}>
        <button className="flex items-center h-full w-full" style={{ gap: '8px' }} onClick={() => setLocationSheetOpen(true)}>
          <svg className="w-[14px] h-[14px] text-[#C8964B] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" /></svg>
          <span className="text-[11px] text-[#888]">Delivering to</span>
          <span className="text-[12px] text-white font-medium flex-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detecting ? 'Detecting...' : location}</span>
          <svg className="w-[10px] h-[10px] text-[#666]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
        </button>
      </div>

      {/* Location bottom sheet */}
      {locationSheetOpen && (
        <>
          <div className="fixed inset-0 z-[70] bg-black/50" onClick={() => setLocationSheetOpen(false)} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 71, background: '#1A1A1A', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', boxShadow: '0 -8px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#333', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Choose Location</h3>
            <button onClick={detectLocation} disabled={detecting} style={{ width: '100%', height: 44, borderRadius: 10, border: '1px solid #C8964B', background: 'transparent', color: '#C8964B', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>
              {detecting ? 'Detecting...' : 'Use My Location'}
            </button>
            {savedAddresses.length > 0 && (
              <>
                <p style={{ fontSize: 10, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Saved Addresses</p>
                {savedAddresses.map(a => (
                  <button key={a.id} onClick={() => selectAddress(a)} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #2A2A2A', background: 'none', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8, textAlign: 'left' }}>
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="#888" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#DDD' }}>{a.label}</p>
                      <p style={{ fontSize: 11, color: '#666' }}>{a.address_line1}, {a.city}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
            {savedAddresses.length === 0 && (
              <p style={{ fontSize: 12, color: '#555', textAlign: 'center', marginTop: 8 }}>
                <a href="/profile" style={{ color: '#C8964B' }}>Add addresses</a> for quick selection
              </p>
            )}
          </div>
        </>
      )}

      {/* Out-of-range modal */}
      {outOfRange && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: '20px' }}>
          <div style={{ background: '#141414', borderRadius: 20, padding: 28, width: '100%', maxWidth: 340, textAlign: 'center', border: '1px solid #2A2A2A' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width={24} height={24} fill="none" viewBox="0 0 24 24" stroke="#DC2626" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Outside Delivery Zone</h2>
            <p style={{ fontSize: 13, color: '#888', lineHeight: '20px', marginBottom: 20 }}>{outOfRangeMsg || 'Your location is outside our delivery area.'}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setOutOfRange(false); setLocationSheetOpen(true) }} style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid #333', background: 'transparent', color: '#CCC', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Change Location</button>
              <button onClick={() => setOutOfRange(false)} style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', background: '#C8964B', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Browse Menu</button>
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      {searchOpen && (
        <div className="fixed left-0 right-0 z-[39] bg-[#1A1A1A] border-b border-[#333]" style={{ top: '96px', padding: '12px 20px' }}>
          <div className="relative">
            <svg className="absolute left-12 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#888] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input type="search" placeholder="Search dishes..." autoFocus className="w-full bg-[#252525] text-white placeholder-[#666] border border-[#333] outline-none focus:border-[#C8964B] transition-colors" style={{ height: '40px', paddingLeft: '40px', paddingRight: '40px', borderRadius: '10px', fontSize: '14px' }} onKeyDown={(e) => { if (e.key === 'Escape') setSearchOpen(false) }} />
            <button onClick={() => setSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]" aria-label="Close search"><svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
      )}

      {/* Full-screen menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#141414] flex flex-col">
          <div className="flex items-center justify-between" style={{ height: '56px', paddingLeft: '20px', paddingRight: '20px' }}>
            <span className="text-[20px] font-heading font-bold text-white">A2B</span>
            <button onClick={() => setMenuOpen(false)} className="text-white" aria-label="Close menu"><svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
          </div>
          <nav className="flex-1 flex flex-col justify-center" style={{ paddingLeft: '32px', paddingRight: '32px', gap: '8px' }}>
            {[{ label: 'Home', href: '/' }, { label: 'Menu', href: '/menu' }, { label: 'My Orders', href: '/orders' }, { label: 'Profile', href: '/profile' }].map(link => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block text-[#CCC] hover:text-[#C8964B] transition-colors" style={{ fontSize: '24px', fontWeight: 500, padding: '12px 0', borderBottom: '1px solid #2A2A2A' }}>{link.label}</a>
            ))}
          </nav>
          <div style={{ padding: '24px 32px 40px' }}>
            <a href="/login" className="flex items-center justify-center w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] transition-colors" style={{ height: '48px', borderRadius: '12px', fontSize: '15px' }}>Login / Sign up</a>
          </div>
        </div>
      )}
    </>
  )
}
