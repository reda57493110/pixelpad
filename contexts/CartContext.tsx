'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  productId: string
  variantId?: string
  name: string
  price: number // Price snapshot at time of adding to cart
  quantity: number
  image?: string
  variantInfo?: string // Human-readable variant information (e.g., "16 GB - 256 GB SSD")
}

interface CartContextType {
  items: CartItem[]
  count: number
  total: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (productId: string, variantId?: string) => void
  setQuantity: (productId: string, variantId: string | undefined, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize with localStorage data if available (client-side only)
  const getInitialItems = (): CartItem[] => {
    if (typeof window === 'undefined') return []

    try {
      const saved = localStorage.getItem('pixelpad_cart')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Migrate old cart format to new format if needed
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            // Handle old format with 'id' instead of 'productId'
            if (item.id && !item.productId) {
              return {
                productId: item.id,
                variantId: item.variantId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                variantInfo: item.variantInfo
              }
            }
            // Ensure all required fields exist
            return {
              productId: item.productId || item.id,
              variantId: item.variantId,
              name: item.name || '',
              price: item.price || 0,
              quantity: item.quantity || 1,
              image: item.image,
              variantInfo: item.variantInfo
            }
          }).filter((item: CartItem) => item.productId && item.name && item.price > 0)
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error)
      // Clear corrupted data
      try {
        localStorage.removeItem('pixelpad_cart')
    } catch {}
    }
    
    return []
  }

  const [items, setItems] = useState<CartItem[]>(getInitialItems)
  const [isOpen, setIsOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Don't auto-open cart on page load - only when user adds items
  useEffect(() => {
    // Close cart on initial load to prevent it from showing on page load
    if (!isHydrated) {
      setIsOpen(false)
    }
  }, [isHydrated])

  // Mark as hydrated after first render
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever items change (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem('pixelpad_cart', JSON.stringify(items))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [items, isHydrated])

  // Helper to find item index by productId and variantId
  const findItemIndex = (items: CartItem[], productId: string, variantId?: string) => {
    return items.findIndex(
      item => item.productId === productId && item.variantId === variantId
    )
  }

  const addItem = (item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    setItems(prev => {
      const idx = findItemIndex(prev, item.productId, item.variantId)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty }
        return copy
      }
      return [...prev, { ...item, quantity: qty }]
    })
    setIsOpen(true) // Open cart when item is added
  }

  const removeItem = (productId: string, variantId?: string) => {
    setItems(prev => prev.filter(
      i => !(i.productId === productId && i.variantId === variantId)
    ))
  }

  const setQuantity = (productId: string, variantId: string | undefined, qty: number) => {
    setItems(prev => prev.map(
      i => (i.productId === productId && i.variantId === variantId)
        ? { ...i, quantity: Math.max(1, qty) }
        : i
    ))
  }

  const clear = () => {
    setItems([])
    setIsOpen(false)
    // Also clear localStorage immediately
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('pixelpad_cart')
      } catch (error) {
        console.error('Error clearing cart from localStorage:', error)
      }
    }
  }
  const openCart = () => {
    setIsOpen(true)
  }
  const closeCart = () => {
    setIsOpen(false)
  }

  const value: CartContextType = {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    setQuantity,
    clear
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}


