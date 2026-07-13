import type { ThemeConfig } from '@/types/theme'

/**
 * Default Theme — FujiFood base theme
 * Used when no tenant-specific theme is configured.
 */
export const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'Default',
  description: 'Clean modern design suitable for most restaurants',

  colors: {
    primary:     '#E85D8E',
    primaryDark: '#c2185b',
    secondary:   '#18181B',
    accent:      '#F59E0B',
    background:  '#FAFAFA',
    surface:     '#FFFFFF',
    border:      '#E5E5E5',
    textPrimary: '#171717',
    textMuted:   '#737373',
  },

  typography: {
    fontHeading:  'Plus Jakarta Sans',
    fontBody:     'Inter',
    fontSizeBase: '16px',
  },

  radius: {
    sm:    '4px',
    md:    '8px',
    lg:    '12px',
    xl:    '16px',
    '2xl': '20px',
    '3xl': '24px',
  },

  layout: {
    heroLayout:   'split',
    navStyle:     'glass',
    cardStyle:    'rounded',
    buttonStyle:  'pill',
    footerStyle:  'full',
    spacingScale: 'comfortable',
  },
}
