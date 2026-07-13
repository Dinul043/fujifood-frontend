'use client'

import { useState, createContext, useContext, useCallback } from 'react'

/**
 * AuthGate — Shows a premium sign-in popup when unauthenticated users
 * try to perform protected actions (like adding to cart).
 */

interface AuthGateContextValue {
  requireAuth: (action?: string) => boolean  // returns true if authenticated
}

const AuthGateContext = createContext<AuthGateContextValue>({ requireAuth: () => true })

export function useAuthGate() {
  return useContext(AuthGateContext)
}

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const [showModal, setShowModal] = useState(false)
  const [actionLabel, setActionLabel] = useState('')

  const requireAuth = useCallback((action?: string): boolean => {
    // Check if user is logged in (has access token cookie)
    const hasToken = document.cookie.includes('fujifood_access_token')
    if (hasToken) return true

    // Not logged in — show modal
    setActionLabel(action || 'continue')
    setShowModal(true)
    return false
  }, [])

  return (
    <AuthGateContext.Provider value={{ requireAuth }}>
      {children}

      {/* Auth required modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed z-[91] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full" style={{ maxWidth: '380px', padding: '0 20px' }}>
            <div className="bg-white" style={{ borderRadius: '20px', padding: '40px 32px', boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}>
              {/* Icon */}
              <div className="flex justify-center" style={{ marginBottom: '20px' }}>
                <div className="flex items-center justify-center rounded-full" style={{ width: '56px', height: '56px', background: 'rgba(200,150,75,0.1)' }}>
                  <svg className="text-[#C8964B]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
              </div>

              <h2 className="font-heading font-bold text-[#1A1A1A] text-center" style={{ fontSize: '20px', marginBottom: '8px' }}>
                Sign in to {actionLabel}
              </h2>
              <p className="text-[#888] text-center" style={{ fontSize: '14px', lineHeight: '22px', marginBottom: '28px' }}>
                Create an account or sign in to add items to your cart and place orders.
              </p>

              <a
                href="/login"
                className="flex items-center justify-center w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] transition-all"
                style={{ height: '48px', borderRadius: '12px', fontSize: '15px', marginBottom: '12px' }}
              >
                Sign In / Sign Up
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="w-full text-[#888] hover:text-[#1A1A1A] font-medium transition-colors"
                style={{ height: '40px', fontSize: '14px' }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </>
      )}
    </AuthGateContext.Provider>
  )
}
