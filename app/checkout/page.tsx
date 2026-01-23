"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { addOrder, Order } from '@/lib/orders'
import { createPaymentSession, updatePaymentSession } from '@/lib/payments'
import { getProductById } from '@/lib/products'
import {
  BanknotesIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'

type PaymentMethod = 'cash' | 'card' | 'mobile'
type CheckoutStep = 'auth' | 'shipping' | 'payment' | 'review'

function CheckoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateProfile, login, register } = useAuth()
  const { t, formatCurrency, isRTL } = useLanguage()
  const { items, total, clear } = useCart()
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('auth')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [orderId, setOrderId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const [showGuestRegister, setShowGuestRegister] = useState(false)
  const [guestPassword, setGuestPassword] = useState('')
  const [guestConfirmPassword, setGuestConfirmPassword] = useState('')
  const [isRegisteringGuest, setIsRegisteringGuest] = useState(false)
  const [mounted, setMounted] = useState(false)

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

  // Mark component as mounted to prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get step from URL or default to 'auth'
  useEffect(() => {
    if (!mounted) return
    const step = searchParams.get('step') as CheckoutStep
    if (step && ['auth', 'shipping', 'payment', 'review'].includes(step)) {
      setCurrentStep(step)
    } else {
      setCurrentStep('auth')
      router.replace('/checkout?step=auth')
    }
  }, [searchParams, router, mounted])

  // Load form data from localStorage on mount and pre-fill user data
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    const savedData = localStorage.getItem('checkout_form_data')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        if (data.fullName) setFullName(data.fullName)
        if (data.email) setEmail(data.email)
        if (data.phone) setPhone(data.phone)
        if (data.city) setCity(data.city)
        if (data.address) setAddress(data.address)
        if (data.paymentMethod) setPaymentMethod(data.paymentMethod)
      } catch (e) {
        console.error('Error loading checkout form data:', e)
      }
    }
    
    // Pre-fill from user profile only if no saved data exists
    if (user && !savedData) {
      if (user.name) setFullName(user.name)
      if (user.email) setEmail(user.email)
      if ((user as any).phone) setPhone((user as any).phone)
      if ((user as any).city) setCity((user as any).city)
      if ((user as any).address) setAddress((user as any).address)
    }
    
    // Auto-advance to shipping if logged in (but not if showing login/register forms)
    if (user && currentStep === 'auth' && !showLoginForm && !showRegisterForm) {
      setCurrentStep('shipping')
      router.replace('/checkout?step=shipping')
    }
  }, [user, currentStep, router, showLoginForm, showRegisterForm, mounted])

  // Redirect if cart is empty (but not if we're in the process of submitting an order)
  useEffect(() => {
    if (!mounted) return
    if (items.length === 0 && !done && !submitting) {
      router.push('/')
    }
  }, [items.length, done, submitting, router, mounted])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    const formData = {
      fullName,
      email,
      phone,
      city,
      address,
      paymentMethod
    }
    localStorage.setItem('checkout_form_data', JSON.stringify(formData))
  }, [fullName, email, phone, city, address, paymentMethod, mounted])

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step)
    router.replace(`/checkout?step=${step}`)
  }

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setIsAuthSubmitting(true)

    try {
      const success = await login(loginEmail, loginPassword)
      if (success) {
        setShowLoginForm(false)
        setLoginEmail('')
        setLoginPassword('')
        // Pre-fill shipping info from user data if available
        if (user) {
          if (user.name) setFullName(user.name)
          if (user.email) setEmail(user.email)
        }
        goToStep('shipping')
      } else {
        setAuthError('Invalid email or password. Please try again.')
      }
    } catch (error) {
      setAuthError('An error occurred. Please try again.')
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  // Handle register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (registerData.password !== registerData.confirmPassword) {
      setAuthError('Passwords do not match')
      return
    }

    if (registerData.password.length < 6) {
      setAuthError('Password must be at least 6 characters long')
      return
    }

    setIsAuthSubmitting(true)

    try {
      const success = await register(registerData.name, registerData.email, registerData.password)
      if (success) {
        // Pre-fill shipping info from registration data
        setFullName(registerData.name)
        setEmail(registerData.email)
        
        setShowRegisterForm(false)
        setRegisterData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        goToStep('shipping')
      } else {
        setAuthError('Email already exists. Please use a different email or try signing in.')
      }
    } catch (error) {
      setAuthError('An error occurred. Please try again.')
    } finally {
      setIsAuthSubmitting(false)
    }
  }

  // Handle guest registration after order
  const handleGuestRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (guestPassword !== guestConfirmPassword) {
      setAuthError('Passwords do not match')
      return
    }

    if (guestPassword.length < 6) {
      setAuthError('Password must be at least 6 characters')
      return
    }

    setIsRegisteringGuest(true)
    setAuthError('')

    try {
      const success = await register(fullName, email, guestPassword)
      if (success) {
        setShowGuestRegister(false)
        setGuestPassword('')
        setGuestConfirmPassword('')
        // Redirect to orders page
        router.push(`/account/orders?success=1&orderId=${orderId}`)
      } else {
        setAuthError('Email already exists. Please use a different email or try signing in.')
      }
    } catch (error) {
      setAuthError('An error occurred. Please try again.')
    } finally {
      setIsRegisteringGuest(false)
    }
  }

  // Validate Moroccan phone number
  const validatePhone = (phoneNumber: string): boolean => {
    // Moroccan phone numbers: 06XXXXXXXX, 07XXXXXXXX, +2126XXXXXXXX, +2127XXXXXXXX
    const cleaned = phoneNumber.replace(/\s+/g, '').replace(/-/g, '')
    const patterns = [
      /^0[67]\d{8}$/, // 06XXXXXXXX or 07XXXXXXXX
      /^\+212[67]\d{8}$/, // +2126XXXXXXXX or +2127XXXXXXXX
      /^212[67]\d{8}$/ // 2126XXXXXXXX or 2127XXXXXXXX
    ]
    return patterns.some(pattern => pattern.test(cleaned))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Prevent duplicate submissions
    if (isSubmitting || submitting || done) {
      return
    }
    
    console.log('Form submitted', { fullName, phone, city, itemsCount: items.length, total })
    
    // Validate required fields
    if (!fullName || !phone || !city || !address || items.length === 0) {
      const missingFields = []
      if (!fullName) missingFields.push('Full Name')
      if (!phone) missingFields.push('Phone')
      if (!city) missingFields.push('City')
      if (!address) missingFields.push('Address')
      if (items.length === 0) missingFields.push('Cart items')
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return
    }

    // Validate phone number format
    if (!validatePhone(phone)) {
      setError('Please enter a valid Moroccan phone number (e.g., 0612345678 or +212612345678)')
      return
    }

    setIsSubmitting(true)
    setSubmitting(true)
    console.log('Starting order submission...')
    
    let paymentSessionId: string | null = null
    
    try {
      // Step 0: Validate stock availability before creating order (skip for admins)
      // Only check role and type - remove email-based checks for security
      const isAdmin = user?.role === 'admin' && user?.type === 'user'
      
      // Validate stock for non-admin users
      if (!isAdmin) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Validating stock availability...')
        }
        const stockValidationErrors: string[] = []
        
        for (const item of items) {
          const product = await getProductById(item.productId)
          if (!product) {
            stockValidationErrors.push(`${item.name} - Product not found`)
            continue
          }
          
          // Normalize values to avoid false failures (e.g., inStock=false but stockQuantity > 0)
          const availableStock = typeof product.stockQuantity === 'number' ? product.stockQuantity : 0
          const requestedQty = Math.max(1, Number(item.quantity) || 1)
          const isAvailable = product.inStock || availableStock > 0

          // If no stock at all, block checkout
          if (!isAvailable) {
            stockValidationErrors.push(`${item.name} - Out of stock`)
            continue
          }

          // If stock exists but less than requested, show precise limit
          if (availableStock > 0 && requestedQty > availableStock) {
            stockValidationErrors.push(
              `${item.name} - Only ${availableStock} available (requested ${requestedQty})`
            )
          }
        }
        
        if (stockValidationErrors.length > 0) {
          throw new Error(`Stock validation failed:\n${stockValidationErrors.join('\n')}`)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Admin user detected - skipping stock validation')
        }
      }
      
      // For guests, use the email from the form if available, otherwise generate one
      const guestEmail = email || `guest-${Date.now()}@pixelpad.local`
      const userId = user?.email || guestEmail
      console.log('Creating payment session...', { userId, amount: total })
      
      // Step 1: Create payment session (COD)
      const paymentSession = await createPaymentSession({
        userId,
        email: email || user?.email || guestEmail, // Use form email, then user email, then temporary email
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
        throw new Error('Failed to create payment session. Please try again.')
      }

      paymentSessionId = paymentSession.sessionId
      console.log('Payment session created:', paymentSessionId)

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
        paymentStatus: 'pending'
      }
      
      // Include email in order for guest customer creation
      const orderWithEmail = {
        ...order,
        email: email || user?.email || guestEmail,
        address: address,
      }
      
      console.log('Creating order...', { orderId: newOrderId })
      const createdOrder = await addOrder(userId, orderWithEmail as Order)
      
      if (!createdOrder) {
        throw new Error('Failed to create order. Please try again.')
      }

      console.log('Order created successfully:', createdOrder.id)

      // Save address to localStorage for the user
      try {
        const userEmail = email || user?.email || guestEmail
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
      const updateSuccess = await updatePaymentSession(paymentSessionId, {
        orderId: newOrderId,
        status: paymentMethod === 'cash' ? 'pending' : 'completed',
        metadata: {
          ...paymentSession.metadata,
          orderId: newOrderId,
          orderCreated: true
        }
      })

      if (!updateSuccess) {
        console.warn('Failed to update payment session, but order was created')
      }
      
      if (user) {
        try {
          await updateProfile({ orders: (user.orders || 0) + 1 })
        } catch (profileError) {
          console.warn('Failed to update user profile:', profileError)
        }
      }
      
      setIsSubmitting(false)
      setSubmitting(false)
      setDone(true)
      
      // Clear saved form data after successful order
      localStorage.removeItem('checkout_form_data')
      
      // Clear cart
      clear()
      
      // Use replace instead of push to avoid adding to history
      if (user) {
        router.replace(`/account/orders?success=1&orderId=${encodeURIComponent(newOrderId)}`)
      } else {
        // For guests, automatically show registration form instead of redirecting
        setShowGuestRegister(true)
        // Scroll to registration form after a short delay
        setTimeout(() => {
          const formElement = document.getElementById('guest-register-form')
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 300)
      }
    } catch (error: any) {
      console.error('Error submitting order:', error)
      
      // Error recovery: Clean up payment session if order creation failed
      if (paymentSessionId) {
        try {
          await updatePaymentSession(paymentSessionId, {
            status: 'failed',
            metadata: {
              error: error?.message || 'Order creation failed',
              failedAt: new Date().toISOString()
            }
          })
          console.log('Payment session marked as failed due to order creation error')
        } catch (cleanupError) {
          console.error('Failed to cleanup payment session:', cleanupError)
        }
      }
      
      setError(error?.message || 'Failed to place order. Please try again.')
      setIsSubmitting(false)
      setSubmitting(false)
    }
  }

  const steps = [
    { id: 'auth', name: t('checkout.step.auth') || 'Authentication', icon: UserIcon },
    { id: 'shipping', name: t('checkout.step.shipping') || 'Shipping', icon: TruckIcon },
    { id: 'payment', name: t('checkout.step.payment') || 'Payment', icon: BanknotesIcon },
    { id: 'review', name: t('checkout.step.review') || 'Review', icon: CheckCircleIcon },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-20 sm:pt-28 pb-4 sm:pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 pt-20 sm:pt-28 pb-4 sm:pb-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Step Progress Bar - Like Reference */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              
              return (
                <div key={step.id} className="flex items-center">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium transition-all text-[10px] sm:text-sm ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 ${
                      index < currentStepIndex
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">

            {/* Step Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
              {currentStep === 'auth' && (
                <div className="space-y-6">
                  {/* Back Button */}
                  {(showLoginForm || showRegisterForm) && (
                    <button
                      onClick={() => {
                        setShowLoginForm(false)
                        setShowRegisterForm(false)
                        setAuthError('')
                      }}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      <span>{t('checkout.back') || 'Back'}</span>
                    </button>
                  )}

                  {showLoginForm ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                        {t('checkout.login') || 'LOGIN'}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                        * {t('checkout.allFieldsRequired') || 'All fields are required'}
                      </p>

                      {authError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 sm:p-3">
                          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{authError}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                          {t('checkout.email') || 'Email'} *
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                          {t('checkout.password') || 'Password'} *
                        </label>
                        <div className="relative">
                          <LockClosedIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowLoginForm(false)
                            setShowRegisterForm(false)
                            setAuthError('')
                            setLoginEmail('')
                            setLoginPassword('')
                          }}
                          className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                        >
                          {t('checkout.back') || 'Back'}
                        </button>
                        <button
                          type="submit"
                          disabled={isAuthSubmitting}
                          className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                        >
                          {isAuthSubmitting ? t('checkout.processing') || 'Processing...' : t('checkout.signIn') || 'Sign In'}
                        </button>
                      </div>
                      
                      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('checkout.noAccount') || "Don't have an account?"}{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setShowLoginForm(false)
                              setShowRegisterForm(true)
                              setAuthError('')
                            }}
                            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                          >
                            {t('checkout.signUp') || 'Sign Up'}
                          </button>
                        </p>
                      </div>
                    </form>
                  ) : showRegisterForm ? (
                    <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                        {t('checkout.signUp') || 'SIGN UP'}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                        * {t('checkout.allFieldsRequired') || 'All fields are required'}
                      </p>

                      {authError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                          <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                          {t('checkout.fullName') || 'Full Name'} *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <input
                            type="text"
                            value={registerData.name}
                            onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                          {t('checkout.email') || 'Email'} *
                        </label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <input
                            type="email"
                            value={registerData.email}
                            onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                          {t('checkout.password') || 'Password'} *
                        </label>
                        <div className="relative">
                          <LockClosedIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={registerData.password}
                            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                            placeholder={t('checkout.minPassword') || 'Minimum 6 characters'}
                            className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                          {t('checkout.confirmPassword') || 'Confirm Password'} *
                        </label>
                        <div className="relative">
                          <LockClosedIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                            className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRegisterForm(false)
                            setShowLoginForm(false)
                            setAuthError('')
                            setRegisterData({
                              name: '',
                              email: '',
                              password: '',
                              confirmPassword: ''
                            })
                          }}
                          className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                        >
                          {t('checkout.back') || 'Back'}
                        </button>
                        <button
                          type="submit"
                          disabled={isAuthSubmitting}
                          className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                        >
                          {isAuthSubmitting ? t('checkout.processing') || 'Processing...' : t('checkout.createAccount') || 'Create Account'}
                        </button>
                      </div>
                      
                      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('checkout.haveAccount') || 'Already have an account?'}{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setShowRegisterForm(false)
                              setShowLoginForm(true)
                              setAuthError('')
                            }}
                            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                          >
                            {t('checkout.signIn') || 'Sign In'}
                          </button>
                        </p>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                        {t('checkout.auth.title') || 'LOGIN OR SIGN UP'}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                        {t('checkout.auth.guestMessage') || 'Sign in for faster checkout'}
                      </p>
                      {!user ? (
                        <div className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                            <button
                              onClick={() => setShowLoginForm(true)}
                              className="p-3 sm:p-4 border-2 border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="text-left">
                                  <div className="font-bold text-primary-600 text-xs sm:text-sm">LOGIN</div>
                                  <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Already have an account? Sign in</div>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => setShowRegisterForm(true)}
                              className="p-3 sm:p-4 border-2 border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="text-left">
                                  <div className="font-bold text-primary-600 text-xs sm:text-sm">SIGN UP</div>
                                  <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">New customer? Create an account</div>
                                </div>
                              </div>
                            </button>
                          </div>
                          <div className="relative my-4 sm:my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-xs sm:text-sm">
                              <span className="px-3 sm:px-4 bg-white dark:bg-gray-800 text-gray-500">{t('checkout.or') || 'OR'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => goToStep('shipping')}
                            className="w-full p-3 sm:p-4 border-2 border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-primary-600 text-xs sm:text-sm">CONTINUE AS GUEST</div>
                                <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Order without creating an account</div>
                              </div>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
                          <p className="text-green-800 dark:text-green-200 font-medium mb-3 sm:mb-4 text-sm sm:text-base">
                            {t('checkout.auth.signedIn') || 'Signed in as'} {user.name || user.email}
                          </p>
                          <button
                            onClick={() => goToStep('shipping')}
                            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-xs sm:text-sm"
                          >
                            {t('checkout.continue') || 'Continue'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {currentStep === 'shipping' && (
                <form onSubmit={(e) => { e.preventDefault(); goToStep('payment') }} className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                    {t('checkout.shipping.title') || 'DELIVERY INFORMATION'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">* {t('checkout.allFieldsRequired') || 'All fields are required'}</p>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                      {t('checkout.fullName') || 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                      {t('checkout.email') || 'Email'} *
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                      {t('checkout.phoneNumber') || 'Phone Number'} *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      inputMode="tel"
                      pattern="[0-9+\-\s]{6,}"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
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
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                      />
                      {normalizedQuery.length > 0 && filteredCities.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                          {filteredCities.map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => { setCity(c); setCityQuery('') }}
                              className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                      {t('checkout.address') || 'Delivery Address'} *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t('checkout.addressPlaceholder') || 'Street address, building, apartment'}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="flex justify-between gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => goToStep('auth')}
                      className="px-4 sm:px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                    >
                      {t('checkout.back') || 'Back'}
                    </button>
                    <button
                      type="submit"
                      disabled={!fullName || !email || !phone || !city || !address}
                      className="px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                    >
                      {t('checkout.continue') || 'Continue to Payment'}
                    </button>
                  </div>
                </form>
              )}

              {currentStep === 'payment' && (
                <form onSubmit={(e) => { e.preventDefault(); goToStep('review') }} className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {t('checkout.paymentMethod') || 'Payment Method'} *
                  </h2>
                  
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 sm:p-6 rounded-lg border-2 transition-all text-center max-w-xs w-full ${
                        paymentMethod === 'cash'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                      }`}
                    >
                      <BanknotesIcon className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1.5 sm:mb-2 ${
                        paymentMethod === 'cash' ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                      <div className={`text-xs sm:text-sm font-semibold ${
                        paymentMethod === 'cash' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {t('checkout.cashOnDelivery') || 'Cash on Delivery'}
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      <span>{t('checkout.secure') || 'Secure Payment'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <TruckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                      <span>{t('checkout.fastDelivery') || 'Fast Delivery'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => goToStep('shipping')}
                      className="px-4 sm:px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                    >
                      {t('checkout.back') || 'Back'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-xs sm:text-sm"
                    >
                      {t('checkout.reviewOrder') || 'Review Order'}
                    </button>
                  </div>
                </form>
              )}

              {currentStep === 'review' && (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {t('checkout.review.title') || 'Review Your Order'}
                  </h2>

                  {/* Order Summary */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      {t('checkout.orderSummary') || 'Order Summary'}
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {items.map((item, index) => (
                        <div key={`${item.productId}-${item.variantId || 'default'}-${index}`} className="flex gap-2 sm:gap-3">
                          <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 48px, 64px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                <span className="text-gray-400 text-[10px] sm:text-xs">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {item.name}
                            </h4>
                            {item.variantId && (
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {t('cart.variant') || 'Variant'}: {item.variantId}
                              </p>
                            )}
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                              {formatCurrency(item.price)} × {item.quantity}
                            </p>
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white text-right">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {t('checkout.total') || 'Total'}
                      </span>
                      <span className="text-lg sm:text-xl font-black text-primary-600 dark:text-primary-400">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                      <TruckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                      {t('checkout.shippingInfo') || 'Shipping Information'}
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            {t('checkout.fullName') || 'Full Name'}
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">{fullName || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <EnvelopeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            {t('checkout.email') || 'Email'}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{email || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            {t('checkout.phoneNumber') || 'Phone Number'}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{phone || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            {t('checkout.city') || 'City'}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{city || '—'}</p>
                          {address && (
                            <>
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 mt-1.5 sm:mt-2">
                                {t('checkout.address') || 'Address'}
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{address}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                      <BanknotesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                      {t('checkout.paymentMethod') || 'Payment Method'}
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <BanknotesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                      <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('checkout.cashOnDelivery') || 'Cash on Delivery'}
                      </p>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                      <div className="text-red-600 dark:text-red-400 font-semibold mb-1 text-xs sm:text-sm">
                        {t('checkout.error') || 'Error'}
                      </div>
                      <div className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                        {error}
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {done && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4 text-center">
                      <div className="text-green-600 dark:text-green-400 font-semibold mb-1 text-xs sm:text-sm">
                        {t('checkout.orderPlaced') || 'Order Placed Successfully!'}
                      </div>
                      <div className="text-[10px] sm:text-xs text-green-700 dark:text-green-300">
                        {t('checkout.orderId') || 'Order ID'}: {orderId}
                      </div>
                    </div>
                  )}


                  <div className="flex justify-between gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => goToStep('payment')}
                      className="px-4 sm:px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                    >
                      {t('checkout.back') || 'Back'}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || done || isSubmitting}
                      className="px-4 sm:px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('checkout.processing') || 'Processing...'}</span>
                        </>
                      ) : done ? (
                        <span>{t('checkout.orderPlaced') || 'Order Placed!'}</span>
                      ) : (
                        <span>{t('checkout.placeOrder') || 'Place Order'}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 sticky top-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {t('checkout.orderSummary') || 'ORDER SUMMARY'}
              </h2>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${item.variantId || 'default'}-${index}`} className="flex gap-2 sm:gap-3">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 48px, 64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-[10px] sm:text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Section */}
              <div className="mb-4 sm:mb-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-1.5 sm:gap-2">
                  <input
                    type="text"
                    placeholder={t('checkout.promoCode') || 'Promo code'}
                    className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-xs sm:text-sm transition-colors"
                  >
                    {t('checkout.apply') || 'Apply'}
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('checkout.subtotal') || 'Subtotal'}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(total)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('checkout.delivery') || 'Delivery'}
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {t('checkout.free') || 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">
                    {t('checkout.total') || 'TOTAL'}
                  </span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
              
              {/* Free Delivery Message */}
              <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-green-700 dark:text-green-300">
                  <TruckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{t('checkout.freeDeliveryMessage') || 'Free delivery on all orders!'}</span>
                </div>
              </div>

              {/* Guest Registration Form */}
              {done && !user && (
                <div id="guest-register-form" className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {t('checkout.guestRegister.title') || 'Create Your Account'}
                  </h3>
                  
                  <form onSubmit={handleGuestRegister} className="space-y-3 sm:space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2.5 sm:p-3">
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">
                        {t('checkout.email') || 'Email'}
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{email}</p>
                    </div>

                    {authError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5 sm:p-3">
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{authError}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                        {t('checkout.password') || 'Password'} *
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={guestPassword}
                          onChange={(e) => setGuestPassword(e.target.value)}
                          className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-700 dark:text-gray-300">
                        {t('checkout.confirmPassword') || 'Confirm Password'} *
                      </label>
                      <div className="relative">
                        <LockClosedIcon className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={guestConfirmPassword}
                          onChange={(e) => setGuestConfirmPassword(e.target.value)}
                          className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-gray-100 dark:bg-gray-800 !text-gray-900 dark:!text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isRegisteringGuest || !guestPassword || !guestConfirmPassword}
                      className="w-full px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                    >
                      {isRegisteringGuest ? t('checkout.processing') || 'Processing...' : t('checkout.guestRegister.createAccount') || 'Create Account'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const { t } = useLanguage()
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">{t('checkout.loading') || 'Loading...'}</p>
          </div>
        </div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  )
}
