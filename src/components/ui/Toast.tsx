'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'

/**
 * Toast — Premium notification system.
 * Slides in from top-right, shows gold accent, auto-dismisses after 2.5s.
 */

interface ToastData {
  id: number
  message: string
}

interface ToastContextValue {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

let toastId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((message: string) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — top right, aligned to right edge */}
      <div className="fixed z-[100]" style={{ top: '104px', right: '32px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-[slide-in-right_0.3s_ease]"
            style={{
              background: '#1A1A1A',
              borderRadius: '12px',
              padding: '14px 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              minWidth: '240px',
            }}
          >
            <div className="flex items-center" style={{ gap: '12px' }}>
              {/* Gold checkmark */}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full"
                style={{ width: '28px', height: '28px', background: 'rgba(200,150,75,0.15)' }}
              >
                <svg className="text-[#C8964B]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              {/* Message */}
              <div>
                <p className="font-semibold text-white" style={{ fontSize: '13px', lineHeight: '18px' }}>
                  Added to cart
                </p>
                <p className="text-[#999]" style={{ fontSize: '12px', lineHeight: '16px', marginTop: '2px' }}>
                  {toast.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
