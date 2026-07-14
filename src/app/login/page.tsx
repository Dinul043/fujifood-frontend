'use client'

import { useState } from 'react'
import api, { setTokens } from '@/lib/api'

/**
 * Login / Signup Page — Compact, no scroll, premium.
 * Tabs: Sign In | Sign Up
 * Sign In: Email + OTP
 * Sign Up: Name + Email + OTP
 * Admin toggle at bottom
 */

const TENANT_SLUG = 'a2b'

export default function LoginPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [mode, setMode] = useState<'customer' | 'admin'>('customer')
  const [step, setStep] = useState<'form' | 'otp' | 'complete'>('form')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devOtp, setDevOtp] = useState('')

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleSendOtp = async () => {
    setError('')
    if (!name.trim()) { setError('Name is required'); return }
    if (!email.trim()) { setError('Email is required'); return }
    if (!validateEmail(email)) { setError('Enter a valid email'); return }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/otp/send', { email, tenant_slug: TENANT_SLUG })
      const match = data.message?.match(/OTP is (\d{4})/)
      if (match) setDevOtp(match[1])
      setStep('otp')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleSignIn = async () => {
    setError('')
    if (!email.trim()) { setError('Email is required'); return }
    if (!validateEmail(email)) { setError('Enter a valid email'); return }
    if (!password.trim()) { setError('Password is required'); return }

    setLoading(true)
    try {
      // Try email+password login (uses the same endpoint but with password)
      const { data } = await api.post('/auth/customer/login', { email, password, tenant_slug: TENANT_SLUG })
      setTokens(data.access_token, data.refresh_token)
      window.location.href = '/'
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = async () => {
    setError('')
    if (otp.length !== 4) { setError('Enter 4-digit OTP'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/otp/verify', { email, otp, tenant_slug: TENANT_SLUG })
      setTokens(data.access_token, data.refresh_token)
      if (tab === 'signup') {
        setStep('complete')  // New users need to add phone + password
      } else {
        window.location.href = '/'
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handleCompleteProfile = async () => {
    setError('')
    if (!phone.trim() || phone.length < 10) { setError('Enter a valid phone number'); return }
    if (!password.trim() || password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      await api.patch(`/auth/profile?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&password=${encodeURIComponent(password)}`)
      window.location.href = '/'
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save profile')
    } finally { setLoading(false) }
  }

  const handleAdminLogin = async () => {
    setError('')
    if (!phone.trim() || phone.length < 10) { setError('Enter valid phone number'); return }
    if (!password.trim() || password.length < 6) { setError('Password must be 6+ characters'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/admin/login', { phone, password, tenant_slug: TENANT_SLUG })
      setTokens(data.access_token, data.refresh_token)
      window.location.href = '/manage'
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ padding: '24px 20px' }}>
      <div className="w-full bg-white" style={{ maxWidth: '400px', borderRadius: '20px', padding: '32px 28px', border: '1px solid #EEEAE5', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        {/* Logo */}
        <div className="text-center" style={{ marginBottom: '24px' }}>
          <a href="/"><span className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '24px' }}>A2B</span></a>
        </div>

        {/* Tabs (only for customer mode) */}
        {mode === 'customer' && step === 'form' && (
          <div className="flex" style={{ gap: '4px', marginBottom: '24px', background: '#F5F5F0', borderRadius: '10px', padding: '4px' }}>
            <button
              onClick={() => { setTab('signin'); setError('') }}
              className="flex-1 font-medium transition-all"
              style={{ height: '36px', borderRadius: '8px', fontSize: '13px', background: tab === 'signin' ? 'white' : 'transparent', color: tab === 'signin' ? '#1A1A1A' : '#888', boxShadow: tab === 'signin' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}
            >Sign In</button>
            <button
              onClick={() => { setTab('signup'); setError('') }}
              className="flex-1 font-medium transition-all"
              style={{ height: '36px', borderRadius: '8px', fontSize: '13px', background: tab === 'signup' ? 'white' : 'transparent', color: tab === 'signup' ? '#1A1A1A' : '#888', boxShadow: tab === 'signup' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}
            >Sign Up</button>
          </div>
        )}

        {/* Title */}
        {step === 'otp' && <p className="text-[#888] text-center" style={{ fontSize: '13px', marginBottom: '20px' }}>OTP sent to <strong className="text-[#1A1A1A]">{email}</strong></p>}

        {/* Error */}
        {error && <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA' }}><p className="text-[#DC2626]" style={{ fontSize: '12px', fontWeight: 500 }}>{error}</p></div>}

        {/* ─── Customer Form ───────────────────────────────── */}
        {mode === 'customer' && step === 'form' && (
          <>
            {tab === 'signup' && (
              <div style={{ marginBottom: '12px' }}>
                <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Full Name</label>
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError('') }} placeholder="Your name" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px', paddingRight: '14px' }} />
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Email</label>
              <input type="text" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} placeholder="you@email.com" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px', paddingRight: '14px' }} />
            </div>
            {tab === 'signin' && (
              <div style={{ marginBottom: '20px' }}>
                <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Password</label>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} placeholder="Enter your password" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px', paddingRight: '14px' }} />
              </div>
            )}
            {tab === 'signup' && <div style={{ marginBottom: '20px' }} />}
            <button onClick={tab === 'signin' ? handleSignIn : handleSendOtp} disabled={loading} className="w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px' }}>
              {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Send OTP'}
            </button>
          </>
        )}

        {/* ─── OTP Step ────────────────────────────────────── */}
        {mode === 'customer' && step === 'otp' && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <input type="text" value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }} placeholder="• • • •" maxLength={4} autoFocus className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#DDD] outline-none focus:border-[#C8964B] text-center transition-all" style={{ height: '52px', borderRadius: '10px', fontSize: '24px', fontWeight: 700, letterSpacing: '0.4em' }} />
              {devOtp && <p className="text-center text-[#C8964B]" style={{ fontSize: '11px', marginTop: '8px' }}>Dev: <strong>{devOtp}</strong></p>}
            </div>
            <button onClick={handleVerifyOtp} disabled={loading} className="w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', marginBottom: '12px' }}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button onClick={() => { setStep('form'); setOtp(''); setError(''); setDevOtp('') }} className="w-full text-[#888] hover:text-[#1A1A1A]" style={{ fontSize: '12px', fontWeight: 500 }}>Back</button>
          </>
        )}

        {/* ─── Complete Profile (after signup OTP) ─────────── */}
        {mode === 'customer' && step === 'complete' && (
          <>
            <p className="text-[#1A1A1A] text-center font-semibold" style={{ fontSize: '15px', marginBottom: '4px' }}>Almost done!</p>
            <p className="text-[#888] text-center" style={{ fontSize: '12px', marginBottom: '16px' }}>Set a password for your account</p>
            <div style={{ marginBottom: '12px' }}>
              <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }} placeholder="9876543210" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Set Password</label>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} placeholder="Minimum 6 characters" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
            </div>
            <button onClick={handleCompleteProfile} disabled={loading} className="w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px' }}>
              {loading ? 'Saving...' : 'Complete Sign Up'}
            </button>
          </>
        )}

        {/* ─── Admin Form ──────────────────────────────────── */}
        {mode === 'admin' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Phone</label>
              <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError('') }} placeholder="9876543210" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Password</label>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} placeholder="Enter password" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
            </div>
            <button onClick={handleAdminLogin} disabled={loading} className="w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px' }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </>
        )}

        {/* Mode toggle */}
        <div className="text-center" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F0F0F0' }}>
          {mode === 'customer' && step === 'form' && tab === 'signin' && (
            <button onClick={() => { setTab('signin'); setStep('form'); setMode('customer'); setError(''); /* navigate to forgot */ window.location.href = '/forgot-password' }} className="text-[#888] hover:text-[#1A1A1A] block w-full" style={{ fontSize: '12px', fontWeight: 500, marginBottom: '12px' }}>
              Forgot password?
            </button>
          )}
          <button onClick={() => { setMode(mode === 'customer' ? 'admin' : 'customer'); setError(''); setStep('form') }} className="text-[#C8964B] hover:underline" style={{ fontSize: '12px', fontWeight: 500 }}>
            {mode === 'admin' ? 'Customer? Sign in with OTP' : 'Restaurant Admin?'}
          </button>
        </div>
      </div>
    </div>
  )
}
