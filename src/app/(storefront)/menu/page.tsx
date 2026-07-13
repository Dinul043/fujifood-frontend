'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { addToCart } from '@/hooks/useCart'
import { useToast } from '@/components/ui/Toast'
import { useAuthGate } from '@/components/ui/AuthGate'
import api from '@/lib/api'

/**
 * Menu Page — Fetches from backend API, falls back to static data.
 */

const staticMenuItems = [
  { id: 1, name: 'Ghee Roast Dosa', price: 120, category: 'South Indian', rating: 4.8, img: '/images/food/dish-2.png', veg: true, bestseller: true },
  { id: 2, name: 'Masala Dosa', price: 110, category: 'South Indian', rating: 4.6, img: '/images/food/dish-3.png', veg: true, bestseller: false },
  { id: 3, name: 'Mini Tiffin Combo', price: 99, category: 'South Indian', rating: 4.5, img: '/images/food/dish-4.png', veg: true, bestseller: true },
  { id: 4, name: 'Paneer Butter Masala', price: 160, category: 'North Indian', rating: 4.7, img: '/images/food/dish-6.png', veg: true, bestseller: true },
  { id: 5, name: 'Veg Biryani', price: 150, category: 'North Indian', rating: 4.6, img: '/images/food/dish-8.png', veg: true, bestseller: true },
  { id: 6, name: 'Gobi Manchurian', price: 130, category: 'Chinese', rating: 4.4, img: '/images/food/dish-9.png', veg: true, bestseller: true },
  { id: 7, name: 'Filter Coffee', price: 50, category: 'Beverages', rating: 4.8, img: '/images/food/dish-1.png', veg: true, bestseller: true },
  { id: 8, name: 'Rava Kesari', price: 80, category: 'Sweets', rating: 4.5, img: '/images/food/dish-3.png', veg: true, bestseller: true },
]

interface MenuItem { id: number; name: string; price: number; category: string; rating: number; img: string; veg: boolean; bestseller: boolean }

export default function MenuPage() {
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const resultsRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()
  const { requireAuth } = useAuthGate()

  const [categories, setCategories] = useState<string[]>(['All', 'South Indian', 'North Indian', 'Chinese', 'Beverages', 'Sweets'])
  const [menuItems, setMenuItems] = useState<MenuItem[]>(staticMenuItems)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchMenu() {
      try {
        const { data } = await api.get('/menu/storefront/a2b')
        if (cancelled) return
        const apiCategories = ['All', ...data.categories.map((c: any) => c.name)]
        const apiItems: MenuItem[] = data.categories.flatMap((cat: any) =>
          cat.items.map((item: any) => ({
            id: item.id, name: item.name, price: item.price, category: cat.name,
            rating: 4.5, img: item.image_url || `/images/food/dish-${(item.id % 10) + 1}.png`,
            veg: item.food_type === 'veg', bestseller: item.is_bestseller,
          }))
        )
        setCategories(apiCategories)
        setMenuItems(apiItems)
      } catch { /* fallback to static */ }
      finally { if (!cancelled) setLoading(false) }
    }
    fetchMenu()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const fromHeader = searchParams.get('search')
    if (fromHeader) { setSearchQuery(fromHeader); setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100) }
  }, [searchParams])

  const handleAddToCart = (item: MenuItem) => {
    if (!requireAuth('add to cart')) return
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.img })
    showToast(item.name)
  }

  const filtered = menuItems.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  if (loading) return (
    <div className="hidden md:block" style={{ marginTop: '88px' }}>
      <div className="mx-auto animate-pulse" style={{ maxWidth: '1280px', padding: '48px' }}>
        <div className="bg-[#F0EDE8] rounded-lg" style={{ width: '200px', height: '36px', marginBottom: '40px' }} />
        <div className="grid grid-cols-3" style={{ gap: '24px' }}>
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="bg-white" style={{ borderRadius: '16px', border: '1px solid #EEEAE5' }}><div className="bg-[#F0EDE8]" style={{ aspectRatio: '4/3' }} /><div style={{ padding: '20px' }}><div className="bg-[#F0EDE8] rounded" style={{ width: '70%', height: '16px', marginBottom: '12px' }} /><div className="bg-[#F0EDE8] rounded" style={{ width: '40%', height: '18px' }} /></div></div>))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block" style={{ marginTop: '88px' }}>
        <div className="mx-auto" style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px', paddingTop: '48px', paddingBottom: '80px' }}>
          <div className="flex items-end justify-between" style={{ marginBottom: '40px' }}>
            <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '36px', letterSpacing: '-0.02em' }}>Our Menu</h1>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#999] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              <input type="search" placeholder="Search dishes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#999] outline-none focus:border-[#C8964B] transition-colors" style={{ width: '280px', height: '44px', paddingLeft: '44px', paddingRight: '16px', borderRadius: '12px', fontSize: '14px' }} />
            </div>
          </div>
          <div className="flex" style={{ gap: '8px', marginBottom: '40px' }}>
            {categories.map((cat) => (<button key={cat} onClick={() => setActiveCategory(cat)} className="font-medium transition-all duration-200" style={{ height: '40px', paddingLeft: '20px', paddingRight: '20px', borderRadius: '10px', fontSize: '13px', backgroundColor: activeCategory === cat ? '#C8964B' : 'white', color: activeCategory === cat ? 'white' : '#666', border: activeCategory === cat ? 'none' : '1px solid #E8E4DE' }}>{cat}</button>))}
          </div>
          <div ref={resultsRef} className="grid grid-cols-3" style={{ gap: '24px' }}>
            {filtered.map((item) => (
              <div key={item.id} className="group bg-white overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]" style={{ borderRadius: '16px', border: '1px solid #EEEAE5' }}>
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {item.bestseller && <span className="absolute font-semibold text-white bg-[#C8964B]" style={{ top: '12px', right: '12px', fontSize: '10px', padding: '4px 10px', borderRadius: '6px' }}>Bestseller</span>}
                  <div className="absolute flex items-center font-semibold text-[#16A34A] bg-white/90 backdrop-blur-sm" style={{ top: '12px', left: '12px', fontSize: '10px', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(22,163,74,0.2)', gap: '4px' }}><span className="w-[8px] h-[8px] rounded-full bg-[#16A34A]" />VEG</div>
                </div>
                <div style={{ padding: '20px' }}>
                  <h3 className="font-semibold text-[#1A1A1A]" style={{ fontSize: '16px', marginBottom: '8px' }}>{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#C8964B]" style={{ fontSize: '18px' }}>&#8377;{item.price}</span>
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      <span className="flex items-center text-[#888]" style={{ fontSize: '13px', gap: '4px' }}><svg className="text-[#D4A853] fill-current" width="14" height="14" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>{item.rating}</span>
                      <button onClick={() => handleAddToCart(item)} className="flex items-center justify-center rounded-full bg-[#C8964B] text-white transition-all hover:bg-[#B5843F]" style={{ width: '32px', height: '32px' }} aria-label={`Add ${item.name}`}><svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center" style={{ padding: '80px 0' }}>
              <p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '18px', marginBottom: '8px' }}>No dishes found for &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-[#888]" style={{ fontSize: '14px', marginBottom: '24px' }}>Try a different search or category.</p>
              <div className="flex justify-center flex-wrap" style={{ gap: '8px' }}>
                {['Dosa', 'Biryani', 'Paneer', 'Coffee'].map((s) => (<button key={s} onClick={() => { setSearchQuery(s); setActiveCategory('All') }} className="font-medium text-[#C8964B] bg-[#C8964B]/10 hover:bg-[#C8964B]/20 transition-colors" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>{s}</button>))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile */}
      <div className="block md:hidden" style={{ paddingTop: '96px', paddingBottom: '32px' }}>
        <div style={{ padding: '20px 20px 16px' }}>
          <h1 className="font-heading font-bold text-[#1A1A1A]" style={{ fontSize: '24px', marginBottom: '16px' }}>Our Menu</h1>
          <input type="search" placeholder="Search dishes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-[#E8E4DE] text-[#1A1A1A] placeholder-[#999] outline-none focus:border-[#C8964B]" style={{ height: '40px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '10px', fontSize: '14px' }} />
        </div>
        <div className="flex overflow-x-auto scrollbar-hide" style={{ gap: '8px', padding: '0 20px 16px' }}>
          {categories.map((cat) => (<button key={cat} onClick={() => setActiveCategory(cat)} className="flex-shrink-0 font-medium transition-all" style={{ height: '36px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '8px', fontSize: '12px', backgroundColor: activeCategory === cat ? '#C8964B' : 'white', color: activeCategory === cat ? 'white' : '#666', border: activeCategory === cat ? 'none' : '1px solid #E8E4DE' }}>{cat}</button>))}
        </div>
        <div className="flex flex-col" style={{ gap: '12px', padding: '0 20px' }}>
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center bg-white" style={{ gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid #EEEAE5' }}>
              <img src={item.img} alt={item.name} className="flex-shrink-0 object-cover" style={{ width: '64px', height: '64px', borderRadius: '10px' }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#1A1A1A] truncate" style={{ fontSize: '14px', marginBottom: '4px' }}>{item.name}</h3>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <span className="font-bold text-[#C8964B]" style={{ fontSize: '14px' }}>&#8377;{item.price}</span>
                  <span className="flex items-center text-[#888]" style={{ fontSize: '11px', gap: '3px' }}><svg className="text-[#D4A853] fill-current" width="12" height="12" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>{item.rating}</span>
                </div>
              </div>
              <button onClick={() => handleAddToCart(item)} className="flex-shrink-0 flex items-center justify-center rounded-full bg-[#C8964B] text-white" style={{ width: '32px', height: '32px' }} aria-label={`Add ${item.name}`}><svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
