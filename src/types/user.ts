/**
 * User types — authentication and profile
 */

export interface User {
  id: number
  tenant_id: number
  name: string | null
  phone: string
  email: string | null
  role: 'customer' | 'restaurant_admin'
  status: 'active' | 'suspended'
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface OTPSendResponse {
  success: boolean
  message: string
  phone: string
  expires_in_seconds: number
}
