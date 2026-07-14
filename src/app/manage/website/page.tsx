'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

const PRESETS = ['luxury', 'traditional', 'cafe', 'modern', 'minimal']
const FONT_OPTIONS = ['Playfair Display', 'Inter', 'Poppins', 'Lora', 'Montserrat', 'Roboto']
const HERO_LAYOUTS = ['centered', 'left-aligned', 'split', 'minimal', 'full-width']
const CARD_STYLES = ['elevated', 'flat', 'bordered', 'rounded', 'minimal']
const HEADER_STYLES = ['transparent', 'solid', 'gradient', 'minimal', 'floating']

export default function WebsitePage() {
  const [theme, setTheme] = useState<any>({
    primary_color: '#C8964B',
    secondary_color: '#1A1A1A',
    accent_color: '#D4A574',
    background_color: '#FFFFFF',
    text_color: '#1A1A1A',
    font_family: 'Playfair Display',
    hero_layout: 'centered',
    card_style: 'elevated',
    header_style: 'transparent',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/themes/manage')
        if (data) setTheme((prev: any) => ({ ...prev, ...data }))
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  const saveTheme = async () => {
    setSaving(true)
    try {
      await api.patch('/themes/manage', theme)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
    finally { setSaving(false) }
  }

  const applyPreset = async (preset: string) => {
    try {
      const { data } = await api.post('/themes/manage/preset', { preset_name: preset })
      if (data) setTheme((prev: any) => ({ ...prev, ...data }))
    } catch {}
  }

  const inputStyle: React.CSSProperties = {
    height: 40,
    borderRadius: 10,
    border: '1px solid #E8E4DE',
    padding: '0 14px',
    fontSize: 14,
    background: '#FAFAF8',
    width: '100%',
    outline: 'none',
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#AAA' }}>Loading theme...</div>

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>Website Theme</h1>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>Customize how your storefront looks.</p>
      </div>

      {/* Presets */}
      <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Quick Presets</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              style={{
                height: 40,
                borderRadius: 10,
                border: '1px solid #E8E4DE',
                background: '#FAFAF8',
                color: '#1A1A1A',
                fontSize: 13,
                fontWeight: 600,
                padding: '0 20px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#C8964B'; (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = '#C8964B' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF8'; (e.currentTarget as HTMLElement).style.color = '#1A1A1A'; (e.currentTarget as HTMLElement).style.borderColor = '#E8E4DE' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Colors</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { key: 'primary_color', label: 'Primary' },
            { key: 'secondary_color', label: 'Secondary' },
            { key: 'accent_color', label: 'Accent' },
            { key: 'background_color', label: 'Background' },
            { key: 'text_color', label: 'Text' },
          ].map(c => (
            <div key={c.key}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>{c.label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="color"
                  value={theme[c.key] || '#000000'}
                  onChange={e => setTheme((p: any) => ({ ...p, [c.key]: e.target.value }))}
                  style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid #E8E4DE', cursor: 'pointer', padding: 2 }}
                />
                <input
                  style={inputStyle}
                  value={theme[c.key] || ''}
                  onChange={e => setTheme((p: any) => ({ ...p, [c.key]: e.target.value }))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout & Typography */}
      <div style={{ background: '#fff', border: '1px solid #F0F0F0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Layout & Typography</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Font Family</label>
            <select style={{ ...inputStyle, appearance: 'auto' }} value={theme.font_family || ''} onChange={e => setTheme((p: any) => ({ ...p, font_family: e.target.value }))}>
              {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Hero Layout</label>
            <select style={{ ...inputStyle, appearance: 'auto' }} value={theme.hero_layout || ''} onChange={e => setTheme((p: any) => ({ ...p, hero_layout: e.target.value }))}>
              {HERO_LAYOUTS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Card Style</label>
            <select style={{ ...inputStyle, appearance: 'auto' }} value={theme.card_style || ''} onChange={e => setTheme((p: any) => ({ ...p, card_style: e.target.value }))}>
              {CARD_STYLES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 6, display: 'block' }}>Header Style</label>
            <select style={{ ...inputStyle, appearance: 'auto' }} value={theme.header_style || ''} onChange={e => setTheme((p: any) => ({ ...p, header_style: e.target.value }))}>
              {HEADER_STYLES.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={saveTheme}
          disabled={saving}
          style={{
            height: 44,
            borderRadius: 10,
            border: 'none',
            background: saved ? '#16A34A' : '#C8964B',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            padding: '0 32px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
