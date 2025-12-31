'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon, 
  SunIcon, 
  MoonIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ComputerDesktopIcon,
  XCircleIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  EnvelopeIcon,
  LockClosedIcon,
  HomeIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useNavigationLoading } from '@/contexts/NavigationLoadingContext'
import { getUserOrders } from '@/lib/orders'
import Image from 'next/image'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function NavBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const { count: cartCount, items: cartItems, openCart } = useCart()
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t, isRTL } = useLanguage()
  const { user, isLoggedIn, logout } = useAuth()
  const { startLoading } = useNavigationLoading()
  const [ordersCount, setOrdersCount] = useState<number>(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering client-side content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle scroll effect for navbar - optimized to prevent janky movement
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
      setIsScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
    }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const update = async () => {
      if (isLoggedIn && user) {
        try {
          // Exclude cancelled orders from the count
          const allOrders = await getUserOrders(user.email)
          const activeOrders = allOrders.filter(order => order.status !== 'cancelled')
          setOrdersCount(activeOrders.length)
        } catch (error) {
          console.error('Error loading orders count:', error)
          setOrdersCount(0)
        }
      } else {
        setOrdersCount(0)
      }
    }
    update()
    const handler = () => update()
    window.addEventListener('pixelpad_orders_changed', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('pixelpad_orders_changed', handler)
      window.removeEventListener('storage', handler)
    }
  }, [isLoggedIn, user])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  // Auto-open login modal when ?login=1 is present
  useEffect(() => {
    if (!searchParams) return
    const shouldOpenLogin = searchParams.get('login') === '1'
    if (shouldOpenLogin) {
      setShowLoginForm(true)
      // Clean the URL but preserve admin and return parameters for LoginForm
      try {
        const admin = searchParams.get('admin')
        const returnUrl = searchParams.get('return')
        const newParams = new URLSearchParams()
        if (admin) newParams.set('admin', admin)
        if (returnUrl) newParams.set('return', returnUrl)
        const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname
        router.replace(newUrl)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to replace route:', error)
        }
      }
    }
  }, [searchParams, pathname, router])
  
  // Simple fallback for translation
  const translate = (key: string) => {
    try {
      return t(key) || key
    } catch (error) {
      return key
    }
  }

  const languageFlag = {
    en: '/flags/flag-for-flag-united-kingdom.svg',
    fr: '/flags/flag-for-flag-france.svg',
    ar: '/flags/flag-for-flag-saudi-arabia.svg'
  } as const

  const cycleLanguage = () => {
    const next = language === 'en' ? 'fr' : language === 'fr' ? 'ar' : 'en'
    setLanguage(next)
  }

  const desktopLinks = [
    { href: '/', label: translate('nav.home'), icon: HomeIcon },
    { href: '/products', label: translate('nav.shop') || translate('nav.products') || 'Shop', icon: ShoppingBagIcon },
    { href: '/more/about', label: translate('nav.about'), icon: HeartIcon },
    { href: '/contacts', label: translate('nav.contacts'), icon: EnvelopeIcon },
    { href: '/services', label: translate('nav.services') || 'Our services', icon: WrenchScrewdriverIcon, accent: true }
  ]
  
  const userMenuRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // User menu functions
  const handleLogin = () => {
    setIsUserMenuOpen(false)
    setShowLoginForm(true)
  }

  const handleRegister = () => {
    setIsUserMenuOpen(false)
    setShowRegisterForm(true)
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
  }

  const closeForms = () => {
    setShowLoginForm(false)
    setShowRegisterForm(false)
  }


  return (
    <>

      {/* Main Navigation - Green pill style */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-transparent text-white transition-all duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-2">
            {/* Desktop navigation pill */}
            <div className="hidden lg:flex items-center gap-3 rounded-full bg-gradient-to-r from-slate-800/90 via-slate-700/90 to-slate-800/90 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-md border border-white/20 dark:border-white/10 text-white shadow-2xl px-4 sm:px-6 py-3 transition-all duration-200">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center gap-2">
                  <Image 
                    src="/images/pixel-pad-logo-new.png" 
                    alt="Pixel Pad Logo" 
                    width={140} 
                    height={60} 
                    className="h-12 w-auto sm:h-14"
                  />
                </Link>
              </div>

              {/* Desktop navigation */}
              <div className="flex-1 items-center justify-center gap-2 hidden lg:flex">
                {desktopLinks.map((item, index) => {
                  const isActive = item.href === '/products'
                    ? pathname === '/products' || pathname.startsWith('/products')
                    : pathname === item.href

                  return (
                    <div key={`${item.href}-${index}`} className="flex items-center gap-2">
                      <Link 
                        href={item.href}
                        prefetch={true}
                        onClick={() => {
                          if (!isActive) {
                            startLoading()
                          }
                          setIsUserMenuOpen(false)
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                          item.accent
                            ? 'bg-[#ffc847] text-[#2a1a00] hover:bg-[#ffd76d] dark:bg-[#f7b733] dark:text-[#0d1412] dark:hover:bg-[#ffc44f]'
                            : isActive
                              ? 'bg-white/20 text-white'
                              : 'hover:bg-white/10 text-white/90'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 ${item.accent ? 'text-[#2a1a00] dark:text-[#0d1412]' : 'text-white'}`} />
                        <span>{item.label}</span>
                      </Link>
                      {index < desktopLinks.length - 1 && (
                        <span className="hidden xl:block h-6 w-px bg-white/20" />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Desktop actions */}
              <div className="flex items-center gap-3" dir="ltr">
                {/* Language */}
                <div className="relative" ref={languageMenuRef}>
                  <button
                    onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                    className="hidden lg:flex items-center justify-center w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-all duration-300 hover:scale-105 cursor-pointer dark:bg-white/10 dark:hover:bg-white/20"
                    aria-label={`Current language: ${language.toUpperCase()}. Click to select language`}
                  >
                      <Image 
                      src={languageFlag[language]}
                      alt={language}
                        width={24} 
                        height={24} 
                        className="w-6 h-6 xl:w-7 xl:h-7 rounded object-cover"
                      />
                  </button>
                  
                  {isLanguageMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40" 
                        onClick={() => setIsLanguageMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                        <div className="p-2">
                          {[
                            { code: 'en' as const, flag: '/flags/flag-for-flag-united-kingdom.svg', name: 'English' },
                            { code: 'fr' as const, flag: '/flags/flag-for-flag-france.svg', name: 'Français' },
                            { code: 'ar' as const, flag: '/flags/flag-for-flag-saudi-arabia.svg', name: 'العربية' }
                          ].map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setLanguage(lang.code)
                                setIsLanguageMenuOpen(false)
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                language === lang.code
                                  ? 'bg-green-50 text-green-700'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                                <Image 
                                  src={lang.flag} 
                                  alt={lang.name} 
                                  width={24} 
                                  height={24} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              <span className="text-sm font-medium flex-1 text-left">
                                {lang.name}
                              </span>
                              
                              {language === lang.code && (
                                <svg className="w-4 h-4 text-green-700 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
                  >
                    <div className="relative">
                      {isLoggedIn && user ? (
                        <div className="w-8 h-8 lg:w-9 lg:h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <UserIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                      )}
                    </div>
                    <span className="hidden xl:inline text-sm font-semibold">
                      {isLoggedIn ? translate('nav.myAccount') || 'My account' : translate('nav.login') || 'My account'}
                    </span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="fixed left-1/2 transform -translate-x-1/2 top-20 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-top duration-200">
                      {isLoggedIn ? (
                        // Logged in user menu
                        <div className="p-6">
                          {/* User Profile Header */}
                          <div className="text-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            {/* Pixel Pad Logo */}
                            <div className="flex items-center justify-center mb-4">
                              <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                                <Image 
                                  src="/images/pixel-pad-logo-new.png"
                                  alt="Pixel Pad Logo"
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center space-y-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {user?.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-center">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{user?.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* User Stats */}
                          <div className="grid grid-cols-1 gap-4 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3 text-center">
                              <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">{mounted ? ordersCount : 0}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{translate('userMenu.orders')}</div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="space-y-2">
                            <Link 
                              href="/account/profile" 
                              className="flex items-center justify-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{translate('userMenu.myProfile')}</span>
                            </Link>
                            
                            <Link 
                              href="/account" 
                              className="flex items-center justify-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <ArrowRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{translate('userMenu.accountDashboard')}</span>
                            </Link>
                            
                            {/* Admin Link - Only show for admin */}
                            {user?.email === 'admin@pixelpad.com' && (
                            <Link 
                                href="/admin" 
                                className="flex items-center justify-center space-x-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/20 transition-colors text-center border-t border-gray-200 dark:border-gray-700 mt-2 pt-2"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                                <ShieldCheckIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-400 font-semibold">{translate('nav.admin')}</span>
                            </Link>
                            )}
                            
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                              <button 
                                onClick={handleLogout}
                                className="flex items-center justify-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-center"
                              >
                                <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <span className="text-red-600 dark:text-red-400">{translate('userMenu.logout')}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Guest user menu
                        <div className="p-6">
                          <div className="text-center mb-6">
                            <div className="flex items-center justify-center mb-4">
                              <div className="w-20 h-20 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                                <Image 
                                  src="/images/pixel-pad-logo-new.png"
                                  alt="Pixel Pad Logo"
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Welcome to Pixel Pad</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-center">Sign in to access your account and enjoy personalized shopping</p>
                          </div>

                          <div className="space-y-3 flex flex-col items-center">
                            <button 
                              onClick={handleLogin}
                              className="w-full max-w-xs bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-center"
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <LockClosedIcon className="h-5 w-5" />
                                <span>Sign In</span>
                              </div>
                            </button>
                            
                            <button 
                              onClick={handleRegister}
                              className="w-full max-w-xs border-2 border-slate-600 text-slate-600 hover:bg-slate-600 hover:text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-center"
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <UserPlusIcon className="h-5 w-5" />
                                <span>Create Account</span>
                              </div>
                            </button>
                            
                          </div>

                          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="space-y-2 text-center">
                              <Link 
                                href="/contacts" 
                                className="inline-flex items-center justify-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <EnvelopeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-900 dark:text-white">Contact Us</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                      </div>
                    </>
                  )}
                </div>

                {/* Cart */}
                <button
                  onClick={openCart}
                  className="relative px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 dark:bg-white/15 dark:hover:bg-white/25"
                  aria-label="Cart"
                >
                  <div className="relative">
                    <ShoppingCartIcon className="h-5 w-5 lg:h-6 lg:w-6" />
                  </div>
                  {/* Cart items badge - RED - only shows actual cart items */}
                  {mounted && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 min-w-[1.25rem] flex items-center justify-center z-10 shadow-lg">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                  {/* Orders badge - GRAY - only shows when cart is empty and user has orders */}
                  {mounted && ordersCount > 0 && cartCount === 0 && (
                    <span className="absolute top-0 right-0 bg-slate-700 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center z-10 shadow-md">
                      {ordersCount}
                    </span>
                  )}
                </button>

                {/* Mobile toggle */}
                <div className="lg:hidden ml-1" dir="ltr">
                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="relative text-white px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 dark:bg-white/15 dark:hover:bg-white/25"
                    aria-label="Toggle mobile menu"
                    style={{ position: 'relative', transform: 'translateZ(0)' }}
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile navigation pill */}
            <div className="lg:hidden w-full">
              <div className="flex items-center justify-between rounded-full bg-gradient-to-r from-slate-800/90 via-slate-700/90 to-slate-800/90 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-900/95 backdrop-blur-md border border-white/20 dark:border-white/10 text-white shadow-2xl px-3 py-2">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsUserMenuOpen(false)}>
                  <Image 
                    src="/images/pixel-pad-logo-new.png" 
                    alt="Pixel Pad Logo" 
                    width={140} 
                    height={60} 
                    className="h-14 w-auto"
                  />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isLoggedIn && user) {
                        router.push('/account')
                      } else {
                        handleLogin()
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all duration-200 active:scale-95"
                    aria-label="Account"
                  >
                    {isLoggedIn && user ? (
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      openCart()
                      setIsUserMenuOpen(false)
                    }}
                    className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all duration-200 active:scale-95"
                    aria-label="Cart"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    {mounted && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={cycleLanguage}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all duration-200 active:scale-95 overflow-hidden"
                    aria-label={`Switch language from ${language.toUpperCase()}`}
                  >
                    <Image 
                      src={languageFlag[language]}
                      alt={language}
                      width={22}
                      height={22}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  </button>

                  <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all duration-200 active:scale-95"
                    aria-label="Toggle mobile menu"
                    style={{ position: 'relative', transform: 'translateZ(0)' }}
                  >
                    <Bars3Icon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Backdrop - matching QuickOrderModal exactly */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[9999] pointer-events-none">
            {/* Mobile Menu Panel - Optimized for RTL */}
            <div 
              className={`fixed ${isRTL ? 'left-0' : 'right-0'} top-0 h-[70vh] w-64 max-w-[75vw] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl overflow-hidden ${isRTL ? 'rounded-r-2xl border-r' : 'rounded-l-2xl border-l'} border-gray-200 dark:border-gray-700 pointer-events-auto flex flex-col`}
              style={isRTL ? {
                left: 0,
                right: 'auto',
                animation: 'slide-in-from-left 0.25s ease-out',
                willChange: 'transform',
                direction: 'rtl'
              } : {
                right: 0,
                left: 'auto',
                animation: 'slide-in-from-right 0.25s ease-out',
                willChange: 'transform',
                direction: 'ltr'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Simple Hero Section */}
              <div className="relative flex-shrink-0 bg-gradient-to-br from-slate-700/20 via-slate-600/20 to-slate-700/20 dark:from-slate-800/30 dark:via-slate-700/30 dark:to-slate-800/30 border-b border-slate-500/30 dark:border-slate-400/40">
                {/* Main Content Container */}
                <div className="px-3 py-2.5">
                  {/* Top Row - Logo and Actions */}
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {/* Simple Logo Section */}
                    <Link href="/" className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} group cursor-pointer flex-shrink-0 flex-1 min-w-0 focus:outline-none focus:ring-0 active:outline-none`} onClick={() => setIsMobileMenuOpen(false)}>
                      {/* Simple logo container */}
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                        <Image 
                          src="/images/pixel-pad-logo-new.png" 
                          alt="Pixel Pad Logo" 
                          width={48} 
                          height={48} 
                          className="w-12 h-12 brightness-110 contrast-125 dark:brightness-100 dark:contrast-100"
                        />
                      </div>
                      
                    </Link>
                    
                    {/* Centered Action Buttons - Enhanced */}
                    <div className={`flex items-center justify-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'} flex-shrink-0`}>
                      {/* Enhanced Language Switcher - Mobile (shows current, opens menu in mobile menu section) */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          // Scroll to language section in mobile menu
                          const langSection = document.getElementById('mobile-language-section')
                          if (langSection) {
                            langSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            // Highlight it briefly
                            langSection.classList.add('ring-2', 'ring-slate-500')
                            setTimeout(() => {
                              langSection.classList.remove('ring-2', 'ring-slate-500')
                            }, 2000)
                          }
                        }}
                        className="p-1.5 bg-white/20 dark:bg-gray-800/40 hover:bg-white/30 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-300 border border-gray-300/30 dark:border-gray-600/40 flex items-center justify-center group hover:scale-110 active:scale-95"
                        aria-label={`Current language: ${language.toUpperCase()}. Tap to change`}
                      >
                        <div className="w-5 h-5 rounded overflow-hidden shadow-sm">
                          {language === 'en' && (
                            <Image 
                              src="/flags/flag-for-flag-united-kingdom.svg" 
                              alt="English" 
                              width={20} 
                              height={20} 
                              className="w-full h-full object-cover"
                            />
                          )}
                          {language === 'fr' && (
                            <Image 
                              src="/flags/flag-for-flag-france.svg" 
                              alt="Français" 
                              width={20} 
                              height={20} 
                              className="w-full h-full object-cover"
                            />
                          )}
                          {language === 'ar' && (
                            <Image 
                              src="/flags/flag-for-flag-saudi-arabia.svg" 
                              alt="العربية" 
                              width={20} 
                              height={20} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </button>
                      
                      {/* Enhanced Theme Toggle - Mobile */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleTheme()
                          setIsMobileMenuOpen(false)
                        }}
                        className="p-1.5 bg-white/20 dark:bg-gray-800/40 hover:bg-white/30 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-300 border border-gray-300/30 dark:border-gray-600/40 flex items-center justify-center group hover:scale-110 active:scale-95 relative overflow-hidden"
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                      >
                        <div className="relative w-4 h-4 z-10">
                          {theme === 'light' ? (
                            <MoonIcon className="w-full h-full text-gray-700 dark:text-gray-300 group-hover:text-slate-600 transition-colors duration-300" />
                          ) : (
                            <SunIcon className="w-full h-full text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300" />
                          )}
                        </div>
                        {/* Animated background */}
                        <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                          theme === 'light' 
                            ? 'bg-gradient-to-br from-slate-600/20 to-slate-700/20 opacity-0 group-active:opacity-100' 
                            : 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 opacity-0 group-active:opacity-100'
                        }`}></div>
                      </button>
                      
                      {/* Simple Close Button */}
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-1.5 bg-white/20 dark:bg-gray-800/40 hover:bg-red-500/30 dark:hover:bg-red-500/40 rounded-lg transition-colors border border-gray-300/30 dark:border-gray-600/40 flex items-center justify-center"
                        aria-label="Close menu"
                      >
                        <XMarkIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content - Optimized for smooth scrolling */}
              <div 
                className="overflow-y-auto flex-1 min-h-0"
                style={{
                  transform: 'translateZ(0)',
                  willChange: 'scroll-position',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                  contain: 'layout style paint'
                }}
              >
                <div className="px-2.5 py-1.5 space-y-1.5 pb-3">
                  
                  {/* Main Navigation - More Compact */}
                  <div className="space-y-1">
                    <div className={`flex items-center justify-between px-1 mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h4 className="text-[9px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">{translate('mobileMenu.navigation')}</h4>
                      <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-slate-500 via-slate-400 via-slate-500 to-transparent ${isRTL ? 'mr-2' : 'ml-2'}`}></div>
                    </div>
                    {[
                      { href: '/', label: t('nav.home'), icon: HomeIcon, description: translate('mobileMenu.homeDescription') },
                      { href: '/products', label: t('nav.products'), icon: ShoppingBagIcon, description: translate('mobileMenu.productsDescription') || 'Browse our products' },
                      { href: '/services', label: t('nav.services'), icon: WrenchScrewdriverIcon, description: translate('mobileMenu.servicesDescription') || 'Our services' },
                      { href: '/contacts', label: t('nav.contacts'), icon: PhoneIcon, description: translate('mobileMenu.contactDescription') },
                    ].map((item, index) => {
                      const isActive = pathname === item.href || 
                        (item.href === '/products' && pathname.startsWith('/products'))
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center p-2 rounded-2xl transition-colors duration-200 relative overflow-hidden touch-manipulation ${isRTL ? 'flex-row-reverse' : ''} ${
                            isActive 
                              ? 'bg-gradient-to-r from-slate-700/90 via-slate-600/90 to-slate-700/90 border border-white/20 shadow-lg shadow-black/20' 
                              : 'bg-gradient-to-r from-slate-800/70 via-slate-700/70 to-slate-800/70 border border-white/10 hover:from-slate-700/85 hover:via-slate-600/85 hover:to-slate-700/85 active:from-slate-700/90 active:via-slate-600/90 active:to-slate-700/90'
                          }`}
                          onClick={(e) => {
                            // Prevent navigation if already on the same page
                            if (isActive) {
                              e.preventDefault()
                            } else {
                              startLoading()
                            }
                            setIsMobileMenuOpen(false)
                          }}
                          style={{ 
                            transform: 'translateZ(0)',
                            willChange: 'transform'
                          }}
                        >
                          {/* Icon Container */}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isRTL ? 'ml-2' : 'mr-2'} bg-white/10 border border-white/15`}>
                            <item.icon className="w-5 h-5 text-white" style={{ direction: 'ltr' }} />
                          </div>
                          
                          {/* Content - More Compact */}
                          <div className="flex-1 relative z-10 min-w-0">
                            <div className={`font-semibold text-sm mb-0 transition-all duration-300 ${isRTL ? 'text-right' : ''} ${
                              isActive 
                                ? 'text-white' 
                                : 'text-white/90'
                            }`}>
                              {item.label}
                            </div>
                            <div className={`text-[11px] transition-all duration-300 ${isRTL ? 'text-right' : ''} ${
                              isActive 
                                ? 'text-white/80' 
                                : 'text-white/70'
                            }`}>
                              {item.description}
                            </div>
                          </div>
                          
                          {/* Arrow */}
                          <div className={`${isRTL ? 'mr-1' : 'ml-1'} flex-shrink-0`}>
                            <div className="w-6 h-6 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                              <ArrowRightIcon className={`h-3.5 w-3.5 text-white ${isRTL ? 'rotate-180' : ''}`} style={{ direction: 'ltr', transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {/* More Section */}
                  <div className="space-y-1 pt-2 border-t border-gray-300 dark:border-gray-700/50">
                    <div className={`flex items-center justify-between px-1 mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h4 className="text-[9px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">{translate('nav.more')}</h4>
                      <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-slate-500 via-slate-400 via-slate-500 to-transparent ${isRTL ? 'mr-2' : 'ml-2'}`}></div>
                    </div>
                    {[
                      { href: '/more/about', label: t('nav.about'), icon: InformationCircleIcon },
                      { href: '/more/faq', label: t('nav.faq'), icon: QuestionMarkCircleIcon },
                      { href: '/more/warranty', label: t('nav.warranty'), icon: ShieldCheckIcon },
                      { href: '/more/return', label: t('nav.return'), icon: ArrowRightIcon },
                    ].map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center p-2 rounded-2xl transition-colors duration-200 relative overflow-hidden touch-manipulation ${isRTL ? 'flex-row-reverse' : ''} ${
                            isActive 
                              ? 'bg-gradient-to-r from-slate-700/90 via-slate-600/90 to-slate-700/90 border border-white/20 shadow-lg shadow-black/20' 
                              : 'bg-gradient-to-r from-slate-800/70 via-slate-700/70 to-slate-800/70 border border-white/10 hover:from-slate-700/85 hover:via-slate-600/85 hover:to-slate-700/85 active:from-slate-700/90 active:via-slate-600/90 active:to-slate-700/90'
                          }`}
                          onClick={() => {
                            if (!isActive) {
                              startLoading()
                            }
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isRTL ? 'ml-2' : 'mr-2'} bg-white/10 border border-white/15`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className={`flex-1 font-semibold text-sm ${
                            isActive 
                              ? 'text-white' 
                              : 'text-white/90'
                          }`}>
                            {item.label}
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Ultra Premium User Account Section - Maximum Enhancement */}
                  {isLoggedIn && user && (
                    <div className="space-y-2 pt-2 border-t border-gray-300 dark:border-gray-700/50">
                      {/* Enhanced Section Header with Animated Accent */}
                      <div className={`flex items-center justify-between px-1 mb-2 relative ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center ${isRTL ? 'gap-1.5 flex-row-reverse' : 'gap-1.5'}`}>
                          <div className="w-0.5 h-4 bg-gradient-to-b from-slate-400 via-slate-300 via-slate-400 to-slate-500 rounded-full shadow-lg shadow-slate-500/50"></div>
                          <h4 className="text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest">{translate('mobileMenu.account')}</h4>
                        </div>
                        <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-slate-500/80 via-slate-400/80 via-slate-500/80 to-transparent ${isRTL ? 'mr-2' : 'ml-2'} relative`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-50 animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Simple Account Card */}
                      <Link
                        href="/account"
                        className={`group flex items-center p-3 rounded-xl bg-gradient-to-br from-slate-700/20 via-slate-600/20 to-slate-700/20 dark:from-slate-800/30 dark:via-slate-700/30 dark:to-slate-800/30 border border-slate-500/40 dark:border-slate-400/50 hover:border-slate-500/60 dark:hover:border-slate-400/70 transition-all duration-200 shadow-md hover:shadow-lg ${isRTL ? 'flex-row-reverse' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {/* Simple Icon */}
                        <div className={`bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center ${isRTL ? 'ml-3' : 'mr-3'} flex-shrink-0 w-10 h-10`}>
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        
                        {/* User Info - All Text Visible */}
                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                            {translate('mobileMenu.myAccount')}
                          </div>
                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5 break-words">
                            {user.name}
                          </div>
                          <div className="text-[10px] text-gray-600 dark:text-gray-300 mb-1.5 break-all">
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Simple Active Status */}
                            <span className="inline-flex items-center px-2 py-0.5 bg-slate-500/20 dark:bg-slate-500/30 rounded-md border border-slate-400/50 dark:border-slate-400/60">
                              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full mr-1.5"></span>
                              <span className="text-[9px] font-semibold text-slate-700 dark:text-slate-300">
                                {translate('mobileMenu.active')}
                              </span>
                            </span>
                            {/* Simple Order Count */}
                            {mounted && ordersCount > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-slate-500/20 dark:bg-slate-500/30 rounded-md border border-slate-400/50 dark:border-slate-400/60">
                                <ClipboardDocumentListIcon className="w-3 h-3 mr-1 text-slate-600 dark:text-slate-400" />
                                <span className="text-[9px] font-semibold text-slate-700 dark:text-slate-300">
                                  {ordersCount} {ordersCount === 1 ? translate('mobileMenu.order') : translate('mobileMenu.orders')}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      
                      {/* Enhanced Quick Account Actions Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { href: '/account/messages', label: translate('account.messages.title'), icon: ChatBubbleLeftRightIcon, color: 'from-slate-500 via-slate-400 to-slate-600', bgColor: 'from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-800/30', borderColor: 'border-slate-300 dark:border-slate-600' },
                          { href: '/account/service-requests', label: translate('account.serviceRequests.title'), icon: WrenchScrewdriverIcon, color: 'from-slate-600 via-slate-500 to-slate-700', bgColor: 'from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-800/30', borderColor: 'border-slate-300 dark:border-slate-600' },
                        ].map((item, index) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`group/action flex flex-col items-center justify-center p-2 rounded-lg bg-gradient-to-br ${item.bgColor} border ${item.borderColor} hover:border-opacity-80 dark:hover:border-opacity-70 transition-all duration-300 relative overflow-hidden touch-manipulation shadow-sm hover:shadow-md hover:scale-105`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {/* Hover Background Glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover/action:opacity-10 transition-opacity duration-300 rounded-lg`}></div>
                            
                            {/* Compact Icon Container */}
                            <div className={`relative w-9 h-9 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-1.5 shadow-md group-hover/action:scale-110 group-hover/action:rotate-3 transition-all duration-300 relative z-10`}>
                              <item.icon className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
                              {/* Icon shine effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/15 to-transparent rounded-lg"></div>
                              {/* Glow ring on hover */}
                              <div className={`absolute -inset-0.5 bg-gradient-to-br ${item.color} rounded-lg blur-sm opacity-0 group-hover/action:opacity-50 transition-opacity duration-300`}></div>
                            </div>
                            
                            {/* Compact Label */}
                            <span className="text-[10px] font-semibold text-gray-900 dark:text-white group-hover/action:text-slate-700 dark:group-hover/action:text-slate-300 transition-colors duration-300 text-center relative z-10 leading-tight">
                              {item.label}
                            </span>
                            
                            {/* Shimmer effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/action:translate-x-full transition-transform duration-700 rounded-lg"></div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions Section - More Compact */}
                  <div className="space-y-1.5 pt-2 border-top border-gray-300 dark:border-gray-700/50">
                      <div className={`flex items-center justify-between px-1 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h4 className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{translate('mobileMenu.quickActions')}</h4>
                      <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent ${isRTL ? 'mr-2' : 'ml-2'}`}></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          openCart()
                          setIsMobileMenuOpen(false)
                        }}
                        className="group flex items-center gap-2 p-2 rounded-2xl bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border border-white/10 hover:from-slate-700/90 hover:via-slate-600/90 hover:to-slate-700/90 active:from-slate-700/95 active:via-slate-600/95 active:to-slate-700/95 transition-all duration-200"
                        aria-label="Cart"
                      >
                        <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center relative">
                          <ShoppingCartIcon className="w-5 h-5 text-white" />
                    {mounted && cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-md">
                        {cartCount}
                      </span>
                    )}
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-semibold text-white">{translate('mobileMenu.cart')}</span>
                        {mounted && cartCount > 0 && (
                            <span className="text-[10px] text-white/80">{cartCount} {translate('mobileMenu.items')}</span>
                        )}
                        </div>
                      </button>
                      
                      {!isLoggedIn && (
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false)
                            handleLogin()
                          }}
                          className="group flex items-center gap-2 p-2 rounded-2xl bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border border-white/10 hover:from-slate-700/90 hover:via-slate-600/90 hover:to-slate-700/90 active:from-slate-700/95 active:via-slate-600/95 active:to-slate-700/95 transition-all duration-200"
                        >
                          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex flex-col leading-tight text-left">
                            <span className="text-sm font-semibold text-white">{translate('mobileMenu.signIn')}</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Language Section */}
                  <div id="mobile-language-section" className="space-y-2 pt-2 border-t border-gray-300 dark:border-gray-700/50">
                    <div className={`flex items-center justify-between px-1 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h4 className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{translate('mobileMenu.preferences')}</h4>
                      <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent ${isRTL ? 'mr-2' : 'ml-2'}`}></div>
                    </div>
                    
                    {/* Language Switcher Card */}
                    <div className="rounded-2xl p-3 bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border border-white/10">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-white">🌐</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-white block">{translate('mobileMenu.language')}</span>
                          <span className="text-[11px] text-white/70">{translate('mobileMenu.chooseLanguage')}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { code: 'en' as const, flag: '/flags/flag-for-flag-united-kingdom.svg', name: 'EN', fullName: 'English' },
                          { code: 'fr' as const, flag: '/flags/flag-for-flag-france.svg', name: 'FR', fullName: 'Français' },
                          { code: 'ar' as const, flag: '/flags/flag-for-flag-saudi-arabia.svg', name: 'AR', fullName: 'العربية' }
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code)
                            }}
                            className={`flex flex-col items-center justify-center space-y-1.5 p-2.5 rounded-xl text-xs font-medium transition-all duration-200 touch-manipulation relative overflow-hidden ${
                              language === lang.code 
                                ? 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white border border-white/15 shadow-md scale-[1.02]' 
                                : 'bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 text-white/80 border border-white/10 hover:from-slate-700 hover:via-slate-600 hover:to-slate-700 active:from-slate-700 active:via-slate-600 active:to-slate-700'
                            }`}
                            style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20">
                              <Image 
                                src={lang.flag} 
                                alt={lang.fullName} 
                                width={36} 
                                height={36} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[10px] font-semibold">{lang.name}</span>
                            {language === lang.code && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                                <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Form Modal */}
      {showLoginForm && (
        <LoginForm 
          onClose={closeForms}
          onSwitchToRegister={() => {
            setShowLoginForm(false)
            setShowRegisterForm(true)
          }}
        />
      )}

      {/* Register Form Modal */}
      {showRegisterForm && (
        <RegisterForm 
          onClose={closeForms}
          onSwitchToLogin={() => {
            setShowRegisterForm(false)
            setShowLoginForm(true)
          }}
        />
      )}
    </>
  )
}