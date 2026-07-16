'use client'

/**
 * useCart — Global cart state with localStorage persistence.
 * Scoped per user: each logged-in user has their own cart.
 * Hydration-safe: renders 0 on server, syncs from localStorage on client mount.
 */
import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  qty: number
}

const CART_PREFIX = 'fujifood_cart_'

function getCartKey(): string {
  // Use access token hash or a simple identifier to scope cart per user
  const token = Cookies.get('fujifood_access_token')
  if (token) {
    // Use first 8 chars of token as user identifier
    return CART_PREFIX + token.slice(-8)
  }
  return CART_PREFIX + 'guest'
}

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(getCartKey())
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(getCartKey(), JSON.stringify(items))
}

// Global state + listeners for cross-component reactivity
let _items: CartItem[] = []
let _listeners: Set<() => void> = new Set()
let _hydrated = false

function notify() {
  _listeners.forEach((l) => l())
}

export function addToCart(item: Omit<CartItem, 'qty'>) {
  const existing = _items.find((i) => i.id === item.id)
  if (existing) {
    _items = _items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
  } else {
    _items = [..._items, { ...item, qty: 1 }]
  }
  saveToStorage(_items)
  notify()
}

export function removeFromCart(id: number) {
  _items = _items.filter((i) => i.id !== id)
  saveToStorage(_items)
  notify()
}

export function updateQty(id: number, qty: number) {
  if (qty <= 0) { removeFromCart(id); return }
  _items = _items.map((i) => i.id === id ? { ...i, qty } : i)
  saveToStorage(_items)
  notify()
}

export function clearCart() {
  _items = []
  saveToStorage(_items)
  notify()
}

/**
 * useCart hook — hydration-safe.
 * Returns count=0 on first render (matches server).
 * After mount, syncs with localStorage and re-renders.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Load from storage on mount
    if (!_hydrated) {
      _items = loadFromStorage()
      _hydrated = true
    }
    setItems([..._items])
    setHydrated(true)

    // Subscribe to changes
    const listener = () => setItems([..._items])
    _listeners.add(listener)
    return () => { _listeners.delete(listener) }
  }, [])

  const count = items.reduce((sum, i) => sum + i.qty, 0)
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return { items, count, total, hydrated, addToCart, removeFromCart, updateQty, clearCart }
}
