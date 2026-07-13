'use client'

/**
 * useAuth — Authentication hook
 *
 * Manages:
 *   - Current user state
 *   - OTP flow (send → verify)
 *   - Admin login
 *   - Logout
 *   - Token persistence
 */
import { useState, useEffect, useCallback } from 'react'
import api, { setTokens, clearTokens, isAuthenticated, getAccessToken } from '@/lib/api'
import type { User, TokenResponse, OTPSendResponse } from '@/types/user'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Tenant slug — in production this comes from the domain/subdomain
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG || 'a2b'

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // ─── Load user on mount ──────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCurrentUser()
    } else {
      setState({ user: null, isLoading: false, isAuthenticated: false })
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const { data } = await api.get<User>('/auth/me')
      setState({ user: data, isLoading: false, isAuthenticated: true })
    } catch {
      clearTokens()
      setState({ user: null, isLoading: false, isAuthenticated: false })
    }
  }

  // ─── Send OTP ──────────────────────────────────────────────────
  const sendOTP = useCallback(async (phone: string): Promise<OTPSendResponse> => {
    const { data } = await api.post<OTPSendResponse>('/auth/otp/send', {
      phone,
      tenant_slug: TENANT_SLUG,
    })
    return data
  }, [])

  // ─── Verify OTP ────────────────────────────────────────────────
  const verifyOTP = useCallback(async (phone: string, otp: string): Promise<User> => {
    const { data } = await api.post<TokenResponse>('/auth/otp/verify', {
      phone,
      otp,
      tenant_slug: TENANT_SLUG,
    })
    setTokens(data.access_token, data.refresh_token)
    setState({ user: data.user, isLoading: false, isAuthenticated: true })
    return data.user
  }, [])

  // ─── Admin Login ───────────────────────────────────────────────
  const adminLogin = useCallback(async (phone: string, password: string): Promise<User> => {
    const { data } = await api.post<TokenResponse>('/auth/admin/login', {
      phone,
      password,
      tenant_slug: TENANT_SLUG,
    })
    setTokens(data.access_token, data.refresh_token)
    setState({ user: data.user, isLoading: false, isAuthenticated: true })
    return data.user
  }, [])

  // ─── Logout ────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearTokens()
    setState({ user: null, isLoading: false, isAuthenticated: false })
  }, [])

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    sendOTP,
    verifyOTP,
    adminLogin,
    logout,
  }
}
