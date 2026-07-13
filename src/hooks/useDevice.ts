'use client'

import { useState, useEffect } from 'react'

/**
 * useDevice — Detects if the current viewport is mobile (<768px).
 * Used to conditionally render completely different UI layouts.
 */
export function useDevice() {
  const [isMobile, setIsMobile] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    setIsHydrated(true)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return { isMobile, isHydrated }
}
