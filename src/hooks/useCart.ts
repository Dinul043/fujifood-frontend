'use client'

/**
 * useCart — Database-backed cart with API calls.
 * Cart persists across sessions and devices.
 * Falls back to localStorage for guests (not logged in).
 */
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export interface CartItem {
  id: number
  menu_item_id?: number
  name: string
  price: number
  image: string
  qty: number
}

const GUEST_CART_KEY = 'fujifood_cart_guest'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function getToken(): string | undefined {
  return Cookies.get('fujifood_access_token')
}

function isLoggedIn(): boolean {
  return !!getToken()
}

// API helpers
async function apiGet(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } })
  if (!res.ok) return []
  return res.json()
}

async function apiPost(path: string, body: any): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function apiPatch(path: string, body: any): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function apiDelete(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },
  })
  return res.json()
}

// Guest cart (localStorage fallback)
function loadGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]') } catch { return [] }
}
function saveGuestCart(items: CartItem[]) {
  if (typeof window !== 'undefined') localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

// Global state + listeners
let _items: CartItem[] = []
let _listeners: Set<() => void> = new Set()
let _hydrated = false

function notify() { _listeners.forEach(l => l()) }

export async function addToCart(item: { id: number; name: string; price: number; image?: string }) {
  if (isLoggedIn()) {
    await apiPost('/cart/add', { menu_item_id: item.id, quantity: 1 })
    // Refresh from API
    const data = await apiGet('/cart/')
    _items = (data || []).map((i: any) => ({ id: i.menu_item_id, menu_item_id: i.menu_item_id, name: i.name, price: i.price, image: i.image_url || `/images/food/dish-${(i.menu_item_id % 10) + 1}.png`, qty: i.quantity }))
  } else {
    const existing = _items.find(i => i.id === item.id)
    if (existing) { _items = _items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) }
    else { _items = [..._items, { id: item.id, name: item.name, price: item.price, image: item.image || '', qty: 1 }] }
    saveGuestCart(_items)
  }
  notify()
}

export async function updateQty(id: number, qty: number) {
  if (qty <= 0) { await removeFromCart(id); return }
  if (isLoggedIn()) {
    await apiPatch('/cart/update', { menu_item_id: id, quantity: qty })
    const data = await apiGet('/cart/')
    _items = (data || []).map((i: any) => ({ id: i.menu_item_id, menu_item_id: i.menu_item_id, name: i.name, price: i.price, image: i.image_url || `/images/food/dish-${(i.menu_item_id % 10) + 1}.png`, qty: i.quantity }))
  } else {
    _items = _items.map(i => i.id === id ? { ...i, qty } : i)
    saveGuestCart(_items)
  }
  notify()
}

export async function removeFromCart(id: number) {
  if (isLoggedIn()) {
    await apiDelete(`/cart/remove/${id}`)
    const data = await apiGet('/cart/')
    _items = (data || []).map((i: any) => ({ id: i.menu_item_id, menu_item_id: i.menu_item_id, name: i.name, price: i.price, image: i.image_url || `/images/food/dish-${(i.menu_item_id % 10) + 1}.png`, qty: i.quantity }))
  } else {
    _items = _items.filter(i => i.id !== id)
    saveGuestCart(_items)
  }
  notify()
}

export async function clearCart() {
  if (isLoggedIn()) {
    await apiDelete('/cart/clear')
  }
  _items = []
  saveGuestCart([])
  notify()
}

/**
 * useCart hook — loads from API if logged in, localStorage if guest.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    async function load() {
      if (isLoggedIn()) {
        try {
          const data = await apiGet('/cart/')
          _items = (data || []).map((i: any) => ({ id: i.menu_item_id, menu_item_id: i.menu_item_id, name: i.name, price: i.price, image: i.image_url || `/images/food/dish-${(i.menu_item_id % 10) + 1}.png`, qty: i.quantity }))
        } catch { _items = [] }
      } else {
        _items = loadGuestCart()
      }
      _hydrated = true
      setItems([..._items])
      setHydrated(true)
    }

    if (!_hydrated) load()
    else { setItems([..._items]); setHydrated(true) }

    const listener = () => setItems([..._items])
    _listeners.add(listener)
    return () => { _listeners.delete(listener) }
  }, [])

  const count = items.reduce((sum, i) => sum + i.qty, 0)
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return { items, count, total, hydrated, addToCart, removeFromCart, updateQty, clearCart }
}
