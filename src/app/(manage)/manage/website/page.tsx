'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

/**
 * Website Studio — Theme + branding + homepage content management.
 */
export default function WebsiteStudioPage() {
  const [theme, setTheme] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      try { const { data } = await api.get('/themes/manage'); setTheme(data) }
      catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try { await api.patch('/themes/manage', theme); setMsg('Theme saved!') }
    catch { setMsg('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="animate-pulse"><div className="bg-[#1A1A1A]" style={{ height: '300px', borderRadius: '16px' }} /></div>

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="font-heading font-bold text-white" style={{ fontSize: '28px', marginBottom: '4px' }}>Website Studio</h1>
          <p className="text-[#888]" style={{ fontSize: '14px' }}>Customize your restaurant website appearance.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="font-medium text-white bg-[#C8964B] hover:bg-[#B5843F] disabled:opacity-60 transition-all" style={{ height: '40px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '10px', fontSize: '13px' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
      {msg && <p className="text-[#16A34A] font-medium" style={{ fontSize: '13px', marginBottom: '16px' }}>{msg}</p>}

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {/* Colors */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '20px' }}>Colors</h3>
          <div className="flex flex-col" style={{ gap: '14px' }}>
            {[
              { key: 'color_primary', label: 'Primary Color' },
              { key: 'color_secondary', label: 'Secondary Color' },
              { key: 'color_accent', label: 'Accent Color' },
              { key: 'color_bg', label: 'Background' },
              { key: 'color_text', label: 'Text Color' },
            ].map((c) => (
              <div key={c.key} className="flex items-center justify-between">
                <span className="text-[#AAA]" style={{ fontSize: '13px' }}>{c.label}</span>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <input type="color" value={theme?.[c.key] || '#000000'} onChange={(e) => setTheme({ ...theme, [c.key]: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-none" />
                  <span className="text-[#666] font-mono" style={{ fontSize: '11px' }}>{theme?.[c.key]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography & Layout */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A]" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '20px' }}>Typography & Layout</h3>
          <div className="flex flex-col" style={{ gap: '14px' }}>
            <div>
              <label className="block text-[#888]" style={{ fontSize: '12px', marginBottom: '6px' }}>Heading Font</label>
              <select value={theme?.font_heading || ''} onChange={(e) => setTheme({ ...theme, font_heading: e.target.value })} className="w-full bg-[#0F0F0F] border border-[#333] text-white outline-none" style={{ height: '36px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }}>
                <option>Plus Jakarta Sans</option><option>Playfair Display</option><option>Merriweather</option><option>Poppins</option><option>DM Sans</option>
              </select>
            </div>
            <div>
              <label className="block text-[#888]" style={{ fontSize: '12px', marginBottom: '6px' }}>Hero Layout</label>
              <select value={theme?.hero_layout || ''} onChange={(e) => setTheme({ ...theme, hero_layout: e.target.value })} className="w-full bg-[#0F0F0F] border border-[#333] text-white outline-none" style={{ height: '36px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }}>
                <option value="split">Split</option><option value="full">Full Width</option><option value="centered">Centered</option><option value="minimal">Minimal</option>
              </select>
            </div>
            <div>
              <label className="block text-[#888]" style={{ fontSize: '12px', marginBottom: '6px' }}>Card Style</label>
              <select value={theme?.card_style || ''} onChange={(e) => setTheme({ ...theme, card_style: e.target.value })} className="w-full bg-[#0F0F0F] border border-[#333] text-white outline-none" style={{ height: '36px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }}>
                <option value="rounded">Rounded</option><option value="flat">Flat</option><option value="elevated">Elevated</option>
              </select>
            </div>
            <div>
              <label className="block text-[#888]" style={{ fontSize: '12px', marginBottom: '6px' }}>Header Style</label>
              <select value={theme?.header_style || ''} onChange={(e) => setTheme({ ...theme, header_style: e.target.value })} className="w-full bg-[#0F0F0F] border border-[#333] text-white outline-none" style={{ height: '36px', borderRadius: '8px', fontSize: '13px', paddingLeft: '12px' }}>
                <option value="glass">Glass</option><option value="solid">Solid</option><option value="minimal">Minimal</option><option value="transparent">Transparent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] col-span-2" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 className="font-semibold text-white" style={{ fontSize: '16px', marginBottom: '16px' }}>Quick Presets</h3>
          <div className="flex" style={{ gap: '12px' }}>
            {['luxury', 'traditional', 'cafe', 'modern', 'minimal'].map((preset) => (
              <button key={preset} onClick={async () => { try { const { data } = await api.post('/themes/manage/preset', { preset_name: preset }); setTheme(data); setMsg(`${preset} preset applied!`) } catch {} }} className="capitalize font-medium text-[#CCC] border border-[#333] hover:border-[#C8964B] hover:text-white transition-all" style={{ height: '36px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '8px', fontSize: '12px' }}>
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
