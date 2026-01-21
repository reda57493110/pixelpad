"use client"

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import {
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'

export default function CartSidebar() {
  const router = useRouter()
  const { items, count, total, isOpen, closeCart, removeItem, setQuantity } = useCart()
  const { t, formatCurrency, isRTL } = useLanguage()
  const [scrollTop, setScrollTop] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Mark component as mounted to prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  // Track scroll position and prevent body scroll when cart is open
  useEffect(() => {
    if (!mounted) return
    
    if (isOpen && typeof window !== 'undefined') {
      // Capture current scroll position when cart opens
      const scrollY = window.scrollY
      setScrollTop(scrollY)
      
      // Prevent body scroll when cart is open
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.left = '0'
      document.body.style.right = '0'
    } else if (typeof window !== 'undefined') {
      // Restore body scroll when cart is closed
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.left = ''
      document.body.style.right = ''
      
      // Restore scroll position
      if (scrollY) {
        const scrollPosition = parseInt(scrollY.replace('px', '') || '0') * -1
        window.scrollTo(0, scrollPosition)
      }
    }
    
    return () => {
      // Cleanup: restore body scroll on unmount
      if (typeof window !== 'undefined') {
        const scrollY = document.body.style.top
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.left = ''
        document.body.style.right = ''
        if (scrollY) {
          const scrollPosition = parseInt(scrollY.replace('px', '') || '0') * -1
          window.scrollTo(0, scrollPosition)
        }
      }
    }
  }, [isOpen, mounted])

  // Fixed Sidebar - Positioned at current viewport position when opened, then scrolls with page
  // Cart visibility is controlled by isOpen state (auto-opens when items are added via CartContext)
  return (
    <>
      {/* Backdrop overlay - only shown when cart is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] transition-opacity duration-300"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            closeCart()
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            closeCart()
          }}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed ${isRTL ? 'left-0' : 'right-0'} w-[85%] max-w-[320px] sm:w-full sm:max-w-md bg-white dark:bg-gray-800 shadow-2xl z-[10000] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : (isRTL ? '-translate-x-full' : 'translate-x-full')
        }`}
        style={{
          top: isOpen ? `${scrollTop}px` : (isRTL ? '-100%' : '100%'),
          height: '100vh',
          maxHeight: '100vh',
          pointerEvents: isOpen ? 'auto' : 'none',
          visibility: isOpen ? 'visible' : 'hidden',
          display: isOpen ? 'flex' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 bg-white dark:bg-gray-800 sticky top-0 z-10">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <ShoppingBagIcon className="h-4 w-4 sm:h-6 sm:w-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">
              {t('cart.title') || 'Shopping Cart'}
            </h2>
            {mounted && count > 0 && (
              <span className="bg-primary-600 text-white text-[9px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-6 sm:w-6 flex items-center justify-center flex-shrink-0">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeCart()
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1.5 sm:p-1 touch-manipulation active:scale-95 flex-shrink-0"
            aria-label={t('common.close') || 'Close'}
            type="button"
          >
            <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6 sm:py-12">
              <ShoppingBagIcon className="h-10 w-10 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mb-2 sm:mb-4" />
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                {t('cart.empty') || 'Your cart is empty'}
              </h3>
              <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 px-3 sm:px-4">
                {t('cart.emptyDescription') || 'Add some products to get started!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.variantId || 'default'}-${index}`}
                  className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  {/* Product Image */}
                  <div className="relative w-12 h-12 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 48px, 80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <ShoppingBagIcon className="h-5 w-5 sm:h-8 sm:w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] sm:text-sm font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    {item.variantId && (
                      <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">
                        {t('cart.variant') || 'Variant'}: {item.variantId}
                      </p>
                    )}
                    <p className="text-[11px] sm:text-sm font-bold text-primary-600 dark:text-primary-400 mb-1.5 sm:mb-2">
                      {formatCurrency(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            setQuantity(item.productId, item.variantId, item.quantity - 1)
                          }
                        }}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 sm:w-7 sm:h-7 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation active:scale-95"
                        aria-label={t('cart.decreaseQuantity') || 'Decrease quantity'}
                        type="button"
                      >
                        <MinusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      <span className="text-[11px] sm:text-sm font-semibold text-gray-900 dark:text-white w-5 sm:w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="w-7 h-7 sm:w-7 sm:h-7 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation active:scale-95"
                        aria-label={t('cart.increaseQuantity') || 'Increase quantity'}
                        type="button"
                      >
                        <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="ml-auto p-1.5 sm:p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors touch-manipulation active:scale-95"
                        aria-label={t('cart.remove') || 'Remove item'}
                        type="button"
                      >
                        <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-base font-semibold text-gray-900 dark:text-white">
                {t('cart.subtotal') || 'Subtotal'}
              </span>
              <span className="text-sm sm:text-lg font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(total)}
              </span>
            </div>
            <button
              onClick={() => {
                router.push('/checkout?step=auth')
                closeCart()
              }}
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 touch-manipulation active:scale-95"
              type="button"
            >
              <span>{t('cart.checkout') || 'Proceed to Checkout'}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeCart()
              }}
              className="w-full py-2 sm:py-2 text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors touch-manipulation active:scale-95"
              type="button"
            >
              {t('cart.continueShopping') || 'Continue Shopping'}
            </button>
          </div>
        )}
      </div>

    </>
  )
}

