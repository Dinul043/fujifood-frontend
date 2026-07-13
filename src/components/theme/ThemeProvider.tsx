'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ThemeConfig } from '@/types/theme'
import { buildCSSVariables, resolveTheme } from '@/lib/theme'
import { defaultTheme } from '@/config/themes/default'

interface ThemeContextValue {
  theme: ThemeConfig
  setTheme: (theme: Partial<ThemeConfig>) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: Partial<ThemeConfig>
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>(() => resolveTheme(initialTheme))

  const setTheme = (partial: Partial<ThemeConfig>) => {
    setThemeState(resolveTheme(partial))
  }

  useEffect(() => {
    const variables = buildCSSVariables(theme)
    const root = document.documentElement

    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    return () => {
      Object.keys(variables).forEach((key) => {
        root.style.removeProperty(key)
      })
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
