'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import api from '@/lib/api'

/**
 * Manage Layout — Restaurant Admin Panel.
 *
 * - Role-gated: only restaurant_admin can access
 * - Dark sidebar with navigation
 * - Admin can still visit storefront via "View Storefront" link
 * - Premium dark theme matching the brand
 */

const sidebarLinks = [
  { label: 'Dashboard', href: '/manage', icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z' },
  { label: 'Orders', href: '/manage/orders', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z' },
  { label: 'Menu', href: '/manage/menu', icon: 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25' },
  { label: 'Website Studio', href: '/manage/website', icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42' },
  { label: 'Business', href: '/manage/business', icon: 'M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z' },
  { label: 'Customers', href: '/manage/customers', icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z' },
  { label: 'Reports', href: '/manage/reports', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' },
  { label: 'Account', href: '/manage/account', icon: 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' },
]

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await api.get('/auth/me')
        if (data.role === 'restaurant_admin') {
          setAuthorized(true)
          setAdminName(data.name || 'Admin')
        } else {
          window.location.href = '/'
        }
      } catch { window.location.href = '/login' }
      finally { setLoading(false) }
    }
    checkAuth()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      <div className="text-center">
        <span className="font-heading font-bold text-white" style={{ fontSize: '24px' }}>A2B</span>
        <p className="text-[#888]" style={{ fontSize: '13px', marginTop: '8px' }}>Loading admin panel...</p>
      </div>
    </div>
  )
  if (!authorized) return null

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#141414] border-r border-[#1E1E1E] flex flex-col fixed top-0 left-0 bottom-0 z-40">
        {/* Logo */}
        <div style={{ padding: '28px 24px', borderBottom: '1px solid #1E1E1E' }}>
          <div className="flex items-center" style={{ gap: '12px' }}>
            <div className="flex items-center justify-center rounded-[8px] bg-[#C8964B]" style={{ width: '36px', height: '36px' }}>
              <span className="font-heading font-bold text-white" style={{ fontSize: '14px' }}>A2B</span>
            </div>
            <div>
              <span className="block font-heading font-bold text-white" style={{ fontSize: '16px' }}>A2B Restaurant</span>
              <span className="block text-[#C8964B]" style={{ fontSize: '10px', letterSpacing: '0.1em' }}>MANAGEMENT</span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: '16px 12px' }}>
          <div className="flex flex-col" style={{ gap: '4px' }}>
            {sidebarLinks.map((link) => {
              const isActive = link.href === '/manage' ? pathname === '/manage' : pathname.startsWith(link.href)
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center transition-all duration-150"
                  style={{
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#FFFFFF' : '#888',
                    background: isActive ? 'rgba(200,150,75,0.12)' : 'transparent',
                    borderLeft: isActive ? '3px solid #C8964B' : '3px solid transparent',
                  }}
                >
                  <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: isActive ? '#C8964B' : '#666' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                  </svg>
                  {link.label}
                </a>
              )
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1E1E1E' }}>
          <a href="/" className="flex items-center text-[#888] hover:text-[#C8964B] transition-colors" style={{ gap: '10px', padding: '10px 14px', fontSize: '13px', borderRadius: '8px' }}>
            <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            View Storefront
          </a>
          <div className="flex items-center" style={{ gap: '10px', padding: '10px 14px', marginTop: '8px' }}>
            <div className="flex items-center justify-center rounded-full bg-[#C8964B]/20 text-[#C8964B]" style={{ width: '28px', height: '28px', fontSize: '11px', fontWeight: 700 }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[#CCC]" style={{ fontSize: '13px', fontWeight: 500 }}>{adminName}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1" style={{ marginLeft: '260px', padding: '32px 40px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
