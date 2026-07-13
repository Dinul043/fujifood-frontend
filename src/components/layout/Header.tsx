'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/hooks/useCart'

/**
 * Header — Premium restaurant navigation.
 * Includes search overlay and active nav detection.
 */
export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { count } = useCart()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(document.cookie.includes('fujifood_access_token'))
  }, [])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'About Us', href: '#footer' },
  ]

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#141414] border-b border-[#2A2A2A]">
      <div
        className="mx-auto flex items-center justify-between"
        style={{
          maxWidth: '1280px',
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

          {/* Location selector */}
          <button className="flex items-center gap-[12px] group" style={{ marginRight: '80px' }}>
            <svg className="w-[18px] h-[18px] text-[#C8964B] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] text-[#888]">Delivering to</span>
              <div className="flex items-center gap-[6px]">
                <span className="text-[14px] text-white font-medium group-hover:text-[#C8964B] transition-colors duration-200">
                  Anna Nagar, Chennai
                </span>
                <svg className="w-[12px] h-[12px] text-[#666]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </button>
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

    {/* Search overlay */}
    {searchOpen && (
      <div
        className="fixed left-0 right-0 z-[45] bg-[#1A1A1A] border-b border-[#333] shadow-lg"
        style={{ top: '88px' }}
      >
        <div className="mx-auto" style={{ maxWidth: '1280px', padding: '16px 48px' }}>
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
