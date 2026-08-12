/**
 * FujiFood API Client
 *
 * Central HTTP client for all backend communication.
 * Handles:
 *   - Base URL configuration
 *   - JWT token attachment
 *   - Token refresh on 401
 *   - Timeout: 15s default, 30s for file uploads
 *   - Retry on network errors (1 retry)
 *   - Error normalization
 */
import axios, { type AxiosInstance, type AxiosError } from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const ACCESS_TOKEN_KEY = 'fujifood_access_token'
const REFRESH_TOKEN_KEY = 'fujifood_refresh_token'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request Interceptor: Attach JWT + handle uploads ────────────
api.interceptors.request.use((config) => {
  const token = Cookies.get(ACCESS_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  // Give file uploads more time
  if (config.headers['Content-Type'] === 'multipart/form-data') {
    config.timeout = 60000
  }
  return config
})

// ─── Response Interceptor: Handle 401 + Refresh + Network errors ─
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // 401 → try token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = Cookies.get(REFRESH_TOKEN_KEY)
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })
          setTokens(data.access_token, data.refresh_token)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return api(originalRequest)
        } catch {
          clearTokens()
          if (typeof window !== 'undefined') window.location.href = '/login'
        }
      }
    }

    // Network error or timeout → one retry (except for mutations)
    const isNetworkError = !error.response && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK')
    const isSafeToRetry = ['get', 'GET'].includes(originalRequest?.method || '')
    if (isNetworkError && isSafeToRetry && !originalRequest._networkRetry) {
      originalRequest._networkRetry = true
      // Wait 1s then retry
      await new Promise(r => setTimeout(r, 1000))
      return api(originalRequest)
    }

    return Promise.reject(error)
  }
)

// ─── Token Management ────────────────────────────────────────────
export function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    expires: 1, // 1 day (access token is short-lived, but cookie persists for refresh)
    sameSite: 'lax',
  })
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    expires: 30,
    sameSite: 'lax',
  })
}

export function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
}

export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!Cookies.get(ACCESS_TOKEN_KEY)
}

// ─── API Error Helper ────────────────────────────────────────────
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail || error.message || 'Something went wrong'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export default api
