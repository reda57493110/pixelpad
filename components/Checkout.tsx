"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { addOrder, Order } from '@/lib/orders'
import { createPaymentSession, updatePaymentSession } from '@/lib/payments'
import {
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { CartItem } from '@/contexts/CartContext'

interface CheckoutProps {
  items: CartItem[]
  total: number
  onClose: () => void
}

type PaymentMethod = 'cash' | 'card' | 'mobile'

export default function Checkout({ items, total, onClose }: CheckoutProps) {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const { t, formatCurrency, isRTL } = useLanguage()
  const { clear } = useCart()
  
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [orderId, setOrderId] = useState<string>('')

  const moroccoCities = [
    'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès', 'Oujda',
    'Kenitra', 'Tétouan', 'Safi', 'Mohammedia', 'El Jadida', 'Béni Mellal', 'Nador',
    'Taza', 'Khouribga', 'Skhirat-Temara', 'Settat', 'Ksar El Kebir', 'Larache',
    'Khemisset', 'Guelmim', 'Laâyoune', 'Dakhla', 'Taounate'
  ]
  const [cityQuery, setCityQuery] = useState('')
  const normalizeText = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const normalizedQuery = normalizeText(cityQuery.trim())
  const filteredCities = moroccoCities.filter(c => normalizeText(c).includes(normalizedQuery))

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFullName(user.name || '')
      setPhone((user as any).phone || '')
      setCity((user as any).city || '')
      setAddress((user as any).address || '')
    }
  }, [user])

  // Lock body scroll when checkout is open
  useEffect(() => {
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !phone || !city || items.length === 0) return

    setSubmitting(true)
    
    try {
      // For guests, generate an email if not logged in
      const guestEmail = `guest-${Date.now()}@pixelpad.local`
      const userId = user?.email || guestEmail
      
      // Step 1: Create payment session (COD)
      const paymentSession = await createPaymentSession({
        userId,
        email: user?.email || guestEmail,
        amount: total,
        currency: 'MAD',
        paymentMethod: paymentMethod,
        customerName: fullName,
        customerPhone: phone,
        city: city,
        address: address,
        metadata: {
          items: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        }
      })

      if (!paymentSession) {
        throw new Error('Failed to create payment session')
      }

      // Step 2: Create order with payment session reference
      const newOrderId = `PP-${Date.now().toString(36).toUpperCase()}`
      setOrderId(newOrderId)
      
      const order: Order = {
        id: newOrderId,
        date: new Date().toISOString(),
        items: items.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: total,
        status: 'processing',
        customerName: fullName,
        customerPhone: phone,
        city: city,
        paymentSessionId: paymentSession.sessionId,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending' // For COD, will be completed on delivery
      }
      
      // Include email in order for guest customer creation
      const orderWithEmail = {
        ...order,
        email: user?.email || guestEmail,
        address: address,
      }
      
      const createdOrder = await addOrder(userId, orderWithEmail as Order)
      
      if (!createdOrder) {
        throw new Error('Failed to create order')
      }

      // Save address to localStorage for the user
      try {
        const userEmail = user?.email || guestEmail
        const STORAGE = 'pixelpad_addresses'
        const allAddresses = JSON.parse(localStorage.getItem(STORAGE) || '{}')
        const newAddress = {
          id: Date.now().toString(),
          fullName: fullName,
          phone: phone,
          city: city,
          line1: address
        }
        // Save or update the address (keep only one address - replace existing)
        allAddresses[userEmail] = [newAddress]
        localStorage.setItem(STORAGE, JSON.stringify(allAddresses))
      } catch (addressError) {
        console.warn('Failed to save address to localStorage:', addressError)
        // Don't fail the order if address saving fails
      }

      // Step 3: Update payment session with order ID
      await updatePaymentSession(paymentSession.sessionId, {
        orderId: newOrderId,
        status: paymentMethod === 'cash' ? 'pending' : 'completed', // COD is pending until delivery
        metadata: {
          ...paymentSession.metadata,
          orderId: newOrderId,
          orderCreated: true
        }
      })
      
      if (user) {
        await updateProfile({ orders: (user.orders || 0) + 1 })
      }
      
      setSubmitting(false)
      setDone(true)
      clear() // Clear cart after successful order
      
      setTimeout(() => {
        onClose()
        if (user) {
          try {
            router.push(`/account/orders?success=1&orderId=${encodeURIComponent(newOrderId)}`)
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Failed to navigate to orders page:', error)
            }
          }
        } else {
          try {
            router.push('/?login=1')
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Failed to navigate to login page:', error)
            }
          }
        }
      }, 2000)
    } catch (error) {
      console.error('Error submitting order:', error)
      setSubmitting(false)
      // You could add error state here to show user-friendly error message
    }
  }

  if (typeof document === 'undefined') return null

  const modal = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden my-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('checkout.title') || 'Checkout & Payment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label={t('common.close') || 'Close'}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {t('checkout.orderSummary') || 'Order Summary'}
            </h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={`${item.productId}-${item.variantId || 'default'}-${index}`} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.name} {item.quantity > 1 && `× ${item.quantity}`}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {t('checkout.total') || 'Total'}
              </span>
              <span className="text-xl font-black text-primary-600 dark:text-primary-400">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('checkout.customerInfo') || 'Customer Information'}
            </h3>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('checkout.fullName') || 'Full Name'} *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('checkout.phoneNumber') || 'Phone Number'} *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                pattern="[0-9+\-\s]{6,}"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('checkout.city') || 'City (Morocco)'} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cityQuery !== '' ? cityQuery : city}
                  onChange={(e) => {
                    const v = e.target.value
                    setCityQuery(v)
                    if (!v) setCity('')
                  }}
                  onBlur={() => setTimeout(() => {
                    if (!city && normalizedQuery) {
                      const exact = moroccoCities.find(c => normalizeText(c) === normalizedQuery)
                      const single = filteredCities.length === 1 ? filteredCities[0] : undefined
                      const chosen = exact || single
                      if (chosen) { setCity(chosen) }
                      else { setCity(cityQuery) }
                    }
                    setCityQuery('')
                  }, 120)}
                  placeholder={t('checkout.searchCity') || 'Search or add your city'}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {normalizedQuery.length > 0 && filteredCities.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    {filteredCities.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setCity(c); setCityQuery('') }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input type="hidden" value={city} required readOnly />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                {t('checkout.address') || 'Delivery Address'} (Optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('checkout.addressPlaceholder') || 'Street address, building, apartment'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t('checkout.paymentMethod') || 'Payment Method'} *
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'cash'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                }`}
              >
                <BanknotesIcon className={`h-8 w-8 mx-auto mb-2 ${
                  paymentMethod === 'cash' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <div className={`text-sm font-semibold ${
                  paymentMethod === 'cash' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {t('checkout.cashOnDelivery') || 'Cash on Delivery'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                }`}
              >
                <CreditCardIcon className={`h-8 w-8 mx-auto mb-2 ${
                  paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <div className={`text-sm font-semibold ${
                  paymentMethod === 'card' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {t('checkout.card') || 'Credit Card'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('mobile')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'mobile'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                }`}
              >
                <DevicePhoneMobileIcon className={`h-8 w-8 mx-auto mb-2 ${
                  paymentMethod === 'mobile' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <div className={`text-sm font-semibold ${
                  paymentMethod === 'mobile' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {t('checkout.mobilePayment') || 'Mobile Payment'}
                </div>
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="h-4 w-4 text-green-600" />
              <span>{t('checkout.secure') || 'Secure Payment'}</span>
            </div>
            <div className="flex items-center gap-1">
              <TruckIcon className="h-4 w-4 text-blue-600" />
              <span>{t('checkout.fastDelivery') || 'Fast Delivery'}</span>
            </div>
          </div>

          {/* Success Message */}
          {done && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
              <div className="text-green-600 dark:text-green-400 font-semibold mb-1">
                {t('checkout.orderPlaced') || 'Order Placed Successfully!'}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">
                {t('checkout.orderId') || 'Order ID'}: {orderId}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || done}
            className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('checkout.processing') || 'Processing...'}</span>
              </>
            ) : done ? (
              <span>{t('checkout.orderPlaced') || 'Order Placed!'}</span>
            ) : (
              <span>{t('checkout.placeOrder') || 'Place Order'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

