'use client'

/**
 * useCart — Shopping cart state management
 *
 * Cart is stored in localStorage so it persists across page navigations.
 * No login required to add items to cart.
 */
import { useState, useEffect, useCallback } from 'react'
import type { CartItem } from '@/types/order'

const CART_STORAGE_KEY = 'fujifood_cart'

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setItems(loadCart())
    setIsHydrated(true)
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      saveCart(items)
    }
  }, [items, isHydrated])

  const addItem = useCallback((menuItem: CartItem['menuItem'], quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem.id === menuItem.id)
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { menuItem, quantity }]
    })
  }, [])

  const removeItem = useCallback((menuItemId: number) => {
    setItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId))
  }, [])

  const updateQuantity = useCallback((menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId))
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, quantity } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const subtotal = items.reduce((sum, i) => {
    const price = i.menuItem.discount_price ?? i.menuItem.price
    return sum + price * i.quantity
  }, 0)

  return {
    items,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isHydrated,
  }
}
