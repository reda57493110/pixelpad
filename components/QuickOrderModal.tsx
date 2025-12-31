"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { addOrder, Order } from '@/lib/orders'
import { validateCoupon, incrementCouponUsage } from '@/lib/coupons'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface QuickOrderModalProps {
  product: { id: string; name: string; price: number }
  onClose: () => void
}

export default function QuickOrderModal({ product, onClose }: QuickOrderModalProps) {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const { t } = useLanguage()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [qty, setQty] = useState(1)
  const [city, setCity] = useState('')
  const moroccoCities = [
    'Casablanca','Rabat','Fès','Marrakech','Tanger','Agadir','Meknès','Oujda','Kenitra','Tétouan','Safi','Mohammedia','El Jadida','Béni Mellal','Nador','Taza','Khouribga','Skhirat-Temara','Settat','Ksar El Kebir','Larache','Khemisset','Guelmim','Laâyoune','Dakhla','Taounate'
  ]
  const [cityQuery, setCityQuery] = useState('')
  const normalizeText = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const normalizedQuery = normalizeText(cityQuery.trim())
  const filteredCities = moroccoCities.filter(c => normalizeText(c).includes(normalizedQuery))
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [orderId, setOrderId] = useState<string>('')
  const [couponError, setCouponError] = useState<string | null>(null)

  const baseTotal = product.price * qty

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const saved = localStorage.getItem('pixelpad_coupon')
        if (saved) {
          const validation = await validateCoupon(saved, baseTotal)
          if (validation.valid && validation.coupon) {
            setAppliedCode(validation.coupon.code)
            setDiscountAmount(validation.discount)
          } else {
            localStorage.removeItem('pixelpad_coupon')
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to load coupon:', error)
        }
      }
    }
    loadCoupon()
  }, [baseTotal])

  // Lock body scroll and ensure modal is visible when it opens
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY
    
    // Lock body scroll and prevent background scrolling
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    
    // Ensure modal container is at viewport top
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    
    // Cleanup: restore scroll position when modal closes
    return () => {
      const body = document.body
      const scrollY = body.style.top ? parseInt(body.style.top.replace('px', '')) * -1 : 0
      body.style.position = ''
      body.style.top = ''
      body.style.width = ''
      body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  const total = Math.max(0, baseTotal - discountAmount)

  const tryApplyCoupon = async () => {
    if (!couponInput.trim()) {
      setCouponError(t('quickOrder.enterCouponCode'))
      return
    }

    try {
      const validation = await validateCoupon(couponInput, baseTotal)
      
      if (validation.valid && validation.coupon) {
        setAppliedCode(validation.coupon.code)
        setDiscountAmount(validation.discount)
        setCouponError(null)
        try { localStorage.setItem('pixelpad_coupon', validation.coupon.code) } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to save coupon to localStorage:', error)
          }
        }
      } else {
        setAppliedCode(null)
        setDiscountAmount(0)
        setCouponError(validation.message || t('quickOrder.invalidCoupon'))
        try { localStorage.removeItem('pixelpad_coupon') } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to remove coupon from localStorage:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      setCouponError(t('quickOrder.invalidCoupon'))
    }
  }

  const clampQty = (n: number) => Math.max(1, Math.min(20, isNaN(n) ? 1 : n))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !phone || !city || qty < 1) return
    // Accept any city; suggestions are optional
    setSubmitting(true)
    
    try {
      // Increment coupon usage if applied
      if (appliedCode) {
        await incrementCouponUsage(appliedCode)
      }
      
      const finalTotal = total
      const newOrderId = `PP-${Date.now().toString(36).toUpperCase()}`
      setOrderId(newOrderId)
      const guestEmail = `guest-${Date.now()}@pixelpad.local`
      const userId = user?.email || guestEmail
      const order: Order = {
        id: newOrderId,
        date: new Date().toISOString(),
        items: [{ id: product.id, name: product.name, price: product.price, quantity: qty }],
        total: finalTotal,
        status: 'processing',
        customerName: fullName,
        customerPhone: phone,
        city
      }
      // Include email in order for guest customer creation
      const orderWithEmail = {
        ...order,
        email: user?.email || guestEmail,
      }
      await addOrder(userId, orderWithEmail as Order)
      
      // Save address to localStorage for the user (without address line since it's not collected in quick order)
      try {
        const userEmail = user?.email || guestEmail
        const STORAGE = 'pixelpad_addresses'
        const allAddresses = JSON.parse(localStorage.getItem(STORAGE) || '{}')
        const newAddress = {
          id: Date.now().toString(),
          fullName: fullName,
          phone: phone,
          city: city,
          line1: '' // Quick order doesn't collect address line
        }
        // Save or update the address (keep only one address - replace existing)
        allAddresses[userEmail] = [newAddress]
        localStorage.setItem(STORAGE, JSON.stringify(allAddresses))
      } catch (addressError) {
        console.warn('Failed to save address to localStorage:', addressError)
        // Don't fail the order if address saving fails
      }
      
      if (user) {
        await updateProfile({ orders: (user.orders || 0) + 1 })
      }
      setSubmitting(false)
      setDone(true)
      
      // After placing a quick order:
      // - Logged in users: close and show orders page success state
      // - Guests: prompt sign-in/register by opening login modal
      setTimeout(() => {
        onClose()
        if (user) {
          try { router.push(`/account/orders?success=1&orderId=${encodeURIComponent(newOrderId)}`) } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to navigate to orders page:', error)
          }
        }
      } else {
        try { router.push('/?login=1') } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to navigate to login page:', error)
          }
        }
      }
      }, 900)
    } catch (error) {
      console.error('Error submitting order:', error)
      setSubmitting(false)
      // Show error to user (you can add error state if needed)
    }
  }

  const modal = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 overflow-y-auto" onClick={onClose} style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden my-auto" onClick={(e)=>e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-base font-semibold">{t('quickOrder.title')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">{t('quickOrder.couponCode')}</label>
            <div className="flex items-center gap-2">
              <input 
                value={couponInput}
                onChange={(e)=>setCouponInput(e.target.value)}
                placeholder={t('quickOrder.enterCoupon')}
                className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
              <button type="button" onClick={tryApplyCoupon} className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">{t('quickOrder.apply')}</button>
            </div>
            {appliedCode && (
              <div className="mt-1.5 text-xs text-green-700 dark:text-green-400">
                {t('quickOrder.couponApplied')} <span className="font-semibold">{appliedCode}</span>: -{discountAmount.toFixed(2)} DH
              </div>
            )}
            {couponError && (
              <div className="mt-1.5 text-xs text-red-700 dark:text-red-400">
                {couponError}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            {t('quickOrder.product')} <span className="font-semibold">{product.name}</span>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('quickOrder.fullName')}</label>
            <input 
              value={fullName} 
              onChange={(e)=>setFullName(e.target.value)} 
              className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('quickOrder.phoneNumber')}</label>
            <input 
              value={phone} 
              onChange={(e)=>setPhone(e.target.value)} 
              inputMode="tel"
              pattern="[0-9+\-\s]{6,}"
              title={t('quickOrder.phonePlaceholder')}
              className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('quickOrder.city')}</label>
            <div className="relative">
              <input
                value={cityQuery !== '' ? cityQuery : city}
                onChange={(e)=>{
                  const v = e.target.value
                  setCityQuery(v)
                  if (!v) setCity('')
                }}
                onBlur={() => setTimeout(() => {
                  // Auto-select if typed city matches list uniquely or exactly
                  if (!city && normalizedQuery) {
                    const exact = moroccoCities.find(c => normalizeText(c) === normalizedQuery)
                    const single = filteredCities.length === 1 ? filteredCities[0] : undefined
                    const chosen = exact || single
                    if (chosen) { setCity(chosen) }
                    else { setCity(cityQuery) }
                  }
                  setCityQuery('')
                }, 120)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault()
                    setCityQuery('')
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const exact = moroccoCities.find(c => normalizeText(c) === normalizedQuery)
                    const single = filteredCities.length === 1 ? filteredCities[0] : undefined
                    const chosen = exact || single
                    if (chosen) { setCity(chosen); setCityQuery('') }
                  }
                }}
                placeholder={t('quickOrder.searchCity')}
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {normalizedQuery.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[10001]">
              {filteredCities.length > 0 ? (
                    filteredCities.map(c => (
                      <button
                        key={c}
                        type="button"
                    onClick={()=>{ setCity(c); setCityQuery('') }}
                        className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {c}
                      </button>
                    ))
                  ) : null}
                </div>
              )}
            </div>
            <input type="hidden" value={city} required readOnly />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{t('quickOrder.quantity')}</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t('cart.decreaseQuantity')}
                onClick={() => setQty(q => clampQty(q - 1))}
                disabled={qty <= 1}
                className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 text-base disabled:opacity-50"
              >
                −
              </button>
              <input 
                type="number" 
                min={1} 
                max={20} 
                value={qty} 
                onChange={(e)=>setQty(clampQty(parseInt(e.target.value, 10)))} 
                className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-center" 
                required 
              />
              <button
                type="button"
                aria-label={t('cart.increaseQuantity')}
                onClick={() => setQty(q => clampQty(q + 1))}
                disabled={qty >= 20}
                className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 text-base disabled:opacity-50"
              >
                +
              </button>
            </div>
            <p className="mt-1 text-[10px] text-gray-500">{t('quickOrder.maxUnits')}</p>
          </div>
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">{t('quickOrder.subtotal')}</div>
              <div className="text-xs font-medium">{baseTotal.toFixed(2)} DH</div>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-green-700 dark:text-green-400">
                <div className="text-xs">{t('quickOrder.discount')}</div>
                <div className="text-xs">-{discountAmount.toFixed(2)} DH</div>
              </div>
            )}
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs text-gray-500">{t('quickOrder.total')}</div>
              <div className="text-base font-bold">{total.toFixed(2)} DH</div>
            </div>
          </div>
          {done && (
            <div className="text-green-600 dark:text-green-400 text-xs">{t('quickOrder.orderSent')}</div>
          )}
          <button disabled={submitting} className="w-full px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60">
            {submitting ? t('quickOrder.sending') : t('quickOrder.sendOrder')}
          </button>
        </form>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}


