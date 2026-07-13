/**
 * FujiFood Theme System Types
 *
 * ThemeConfig is loaded from the database per tenant and
 * applied as CSS variables at request time.
 *
 * No code changes or redeployments needed to change a restaurant's theme.
 */

export type HeroLayout = 'split' | 'full-bleed' | 'centered' | 'video'
export type NavStyle   = 'glass' | 'solid' | 'minimal' | 'transparent'
export type CardStyle  = 'rounded' | 'flat' | 'elevated' | 'image-heavy'
export type ButtonStyle = 'pill' | 'rounded' | 'sharp'
export type FooterStyle = 'minimal' | 'full' | 'dark' | 'branded'
export type SpacingScale = 'compact' | 'comfortable' | 'spacious'

export interface ThemeColors {
  primary:      string  // Main brand color (CTAs, active states)
  primaryDark:  string  // Darker shade for hover states
  secondary:    string  // Secondary brand color
  accent:       string  // Accent / highlight color (gold, etc.)
  background:   string  // Page background
  surface:      string  // Card / component background
  border:       string  // Border color
  textPrimary:  string  // Main body text
  textMuted:    string  // Secondary / muted text
}

export interface ThemeTypography {
  fontHeading: string   // Google Fonts name or system font
  fontBody:    string
  fontSizeBase: string  // '16px' | '15px'
}

export interface ThemeRadius {
  sm:  string  // '4px'
  md:  string  // '8px'
  lg:  string  // '12px'
  xl:  string  // '16px'
  '2xl': string
  '3xl': string
}

export interface ThemeLayout {
  heroLayout:    HeroLayout
  navStyle:      NavStyle
  cardStyle:     CardStyle
  buttonStyle:   ButtonStyle
  footerStyle:   FooterStyle
  spacingScale:  SpacingScale
}

export interface ThemeConfig {
  /** Unique identifier for the theme preset */
  id: string

  /** Display name */
  name: string

  /** Short description of the theme's personality */
  description?: string

  /** Color palette */
  colors: ThemeColors

  /** Typography settings */
  typography: ThemeTypography

  /** Border radius scale */
  radius: ThemeRadius

  /** Layout and component style choices */
  layout: ThemeLayout

  /** Custom CSS injected at the end (Enterprise plan only) */
  customCss?: string
}

/**
 * CSS variable map — the runtime representation of a ThemeConfig.
 * Applied to :root by ThemeProvider.
 */
export type ThemeCSSVariables = Record<string, string>
