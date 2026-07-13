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
    primary:     '#C8964B',
    primaryDark: '#A67B3D',
    secondary:   '#1A1A1A',
    accent:      '#D4A853',
    background:  '#FAFAF8',
    surface:     '#FFFFFF',
    border:      '#E8E4DE',
    textPrimary: '#1A1A1A',
    textMuted:   '#6B6B6B',
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
