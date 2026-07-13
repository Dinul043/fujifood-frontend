import type { ThemeConfig, ThemeCSSVariables } from '@/types/theme'
import { defaultTheme } from '@/config/themes/default'

/**
 * Converts a ThemeConfig into a flat CSS variables map.
 * These variables are injected into :root by ThemeProvider.
 *
 * Example output:
 * {
 *   '--brand-primary':  '#E85D8E',
 *   '--font-heading':   'Plus Jakarta Sans',
 *   '--r-lg':           '12px',
 *   ...
 * }
 */
export function buildCSSVariables(theme: ThemeConfig): ThemeCSSVariables {
  return {
    // Colors
    '--brand-primary':      theme.colors.primary,
    '--brand-primary-dark': theme.colors.primaryDark,
    '--brand-secondary':    theme.colors.secondary,
    '--brand-accent':       theme.colors.accent,
    '--bg':                 theme.colors.background,
    '--surface':            theme.colors.surface,
    '--border-color':       theme.colors.border,
    '--text-primary':       theme.colors.textPrimary,
    '--text-muted':         theme.colors.textMuted,

    // Typography
    '--font-heading':  `'${theme.typography.fontHeading}', ui-sans-serif, sans-serif`,
    '--font-body':     `'${theme.typography.fontBody}', ui-sans-serif, sans-serif`,
    '--font-size-base': theme.typography.fontSizeBase,

    // Border radius
    '--r-sm':   theme.radius.sm,
    '--r-md':   theme.radius.md,
    '--r-lg':   theme.radius.lg,
    '--r-xl':   theme.radius.xl,
    '--r-2xl':  theme.radius['2xl'],
    '--r-3xl':  theme.radius['3xl'],

    // Layout tokens (used by components to switch variants)
    '--hero-layout':    theme.layout.heroLayout,
    '--nav-style':      theme.layout.navStyle,
    '--card-style':     theme.layout.cardStyle,
    '--button-style':   theme.layout.buttonStyle,
    '--footer-style':   theme.layout.footerStyle,
    '--spacing-scale':  theme.layout.spacingScale,
  }
}

/**
 * Merges a partial theme override with the default theme.
 * Useful when a tenant overrides only some settings.
 */
export function resolveTheme(partial?: Partial<ThemeConfig>): ThemeConfig {
  if (!partial) return defaultTheme

  return {
    ...defaultTheme,
    ...partial,
    colors:     { ...defaultTheme.colors,     ...partial.colors },
    typography: { ...defaultTheme.typography, ...partial.typography },
    radius:     { ...defaultTheme.radius,     ...partial.radius },
    layout:     { ...defaultTheme.layout,     ...partial.layout },
  }
}

/**
 * Converts a ThemeCSSVariables map to an inline style string.
 * Used for SSR — inject into <html> or <body> style attribute.
 */
export function themeToStyleString(variables: ThemeCSSVariables): string {
  return Object.entries(variables)
    .map(([key, value]) => `${key}:${value}`)
    .join(';')
}
