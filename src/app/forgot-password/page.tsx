'use client'

import { useState } from 'react'
import api from '@/lib/api'

/**
 * Forgot Password Page
 * Flow: Enter email → Send OTP → Enter OTP + New Password → Done
 */

const TENANT_SLUG = 'a2b'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [devOtp, setDevOtp] = useState('')

  const handleSendOtp = async () => {
    setError('')
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password/send', { email, tenant_slug: TENANT_SLUG })
      const match = data.message?.match(/OTP is (\d{4})/)
      if (match) setDevOtp(match[1])
      setStep('reset')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleReset = async () => {
    setError('')
    if (otp.length !== 4) { setError('Enter 4-digit OTP'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.post(`/auth/forgot-password/reset?new_password=${encodeURIComponent(newPassword)}`, { email, otp, tenant_slug: TENANT_SLUG })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ padding: '24px 20px' }}>
        <div className="w-full bg-white text-center" style={{ maxWidth: '400px', borderRadius: '20px', padding: '40px 28px', border: '1px solid #EEEAE5' }}>
          <div className="flex justify-center" style={{ marginBottom: '16px' }}>
            <div className="flex items-center justify-center rounded-full" style={{ width: '48px', height: '48px', background: 'rgba(22,163,74,0.1)' }}>
              <svg className="text-[#16A34A]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
            </div>
          </div>
          <h2 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '20px', marginBottom: '8px' }}>Password Reset</h2>
          <p className="text-[#888]" style={{ fontSize: '14px', marginBottom: '24px' }}>Your password has been updated successfully.</p>
          <a href="/login" className="inline-flex items-center justify-center font-semibold text-white bg-[#C8964B]" style={{ height: '44px', paddingLeft: '32px', paddingRight: '32px', borderRadius: '10px', fontSize: '14px' }}>Back to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ padding: '24px 20px' }}>
      <div className="w-full bg-white" style={{ maxWidth: '400px', borderRadius: '20px', padding: '32px 28px', border: '1px solid #EEEAE5', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="text-center" style={{ marginBottom: '24px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '20px', marginBottom: '8px' }}>Forgot Password</h1>
          <p className="text-[#888]" style={{ fontSize: '13px' }}>
            {step === 'email' ? 'Enter your email to receive a reset OTP' : `Enter OTP sent to ${email}`}
          </p>
        </div>

        {error && <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA' }}><p className="text-[#DC2626]" style={{ fontSize: '12px', fontWeight: 500 }}>{error}</p></div>}

        {step === 'email' && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Email</label>
              <input type="text" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} placeholder="you@email.com" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
            </div>
            <button onClick={handleSendOtp} disabled={loading} className="w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px' }}>
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </button>
          </>
        )}

        {step === 'reset' && (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>OTP</label>
              <input type="text" value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }} placeholder="• • • •" maxLength={4} className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#DDD] outline-none focus:border-[#C8964B] text-center transition-all" style={{ height: '48px', borderRadius: '10px', fontSize: '22px', fontWeight: 700, letterSpacing: '0.4em' }} />
              {devOtp && <p className="text-center text-[#C8964B]" style={{ fontSize: '11px', marginTop: '6px' }}>Dev: <strong>{devOtp}</strong></p>}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError('') }} placeholder="Minimum 6 characters" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="block font-medium text-[#1A1A1A]" style={{ fontSize: '12px', marginBottom: '6px' }}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError('') }} placeholder="Re-enter password" className="w-full bg-[#FAFAF8] border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#CCC] outline-none focus:border-[#C8964B] transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px', paddingLeft: '14px' }} />
            </div>
            <button onClick={handleReset} disabled={loading} className="w-full font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '44px', borderRadius: '10px', fontSize: '14px' }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}

        <div className="text-center" style={{ marginTop: '20px' }}>
          <a href="/login" className="text-[#C8964B] hover:underline" style={{ fontSize: '12px', fontWeight: 500 }}>Back to Login</a>
        </div>
      </div>
    </div>
  )
}
