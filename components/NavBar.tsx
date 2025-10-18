'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Image from 'next/image'

export default function NavBar() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItems, setCartItems] = useState(0)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  
  const languageRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const cartRef = useRef<HTMLDivElement>(null)

  // Product categories data
  const productCategories = [
    {
      name: 'Laptops',
      icon: '💻',
      href: '/shop/laptops',
      subcategories: ['Gaming Laptops', 'Business Laptops', 'Ultrabooks', '2-in-1 Laptops']
    },
    {
      name: 'Desktops',
      icon: '🖥️',
      href: '/shop/desktops',
      subcategories: ['Gaming PCs', 'Workstations', 'All-in-One', 'Mini PCs']
    },
    {
      name: 'Monitors',
      icon: '🖥️',
      href: '/shop/monitors',
      subcategories: ['Gaming Monitors', '4K Monitors', 'Ultrawide', 'Professional']
    },
    {
      name: 'Accessories',
      icon: '🎧',
      href: '/shop/accessories',
      subcategories: ['Keyboards', 'Mice', 'Webcams', 'Speakers']
    },
    {
      name: 'Components',
      icon: '⚙️',
      href: '/shop/components',
      subcategories: ['CPUs', 'GPUs', 'RAM', 'Storage']
    },
    {
        name: 'Services',
        icon: '🛠️',
        href: '/services',
        subcategories: [
          { name: 'Office Setup', href: '/office-setup' },
          { name: 'IT Support', href: '/services?service=it-support' },
          { name: 'Network Installation', href: '/services?service=network' },
          { name: 'System Maintenance', href: '/services?service=maintenance' }
        ]
    }
  ]

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (productsRef.current && !productsRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false)
      }
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false)
      }
    }

    const handleTouchOutside = (event: TouchEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (productsRef.current && !productsRef.current.contains(event.target as Node)) {
        setIsProductsOpen(false)
      }
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleTouchOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleTouchOutside)
    }
  }, [])

  // Close products menu when clicking on a link
  const handleLinkClick = () => {
    setIsProductsOpen(false)
  }

  return (
    <>
      {/* Animated Top Promotional Banner */}
      <div 
        className="relative bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white text-center py-2 lg:py-3 text-xs lg:text-sm font-bold overflow-hidden cursor-pointer hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 transition-all duration-300"
        onClick={() => window.location.href = '/products'}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-white rounded-full animate-ping delay-2000"></div>
          <div className="absolute bottom-0 right-1/4 w-3 h-3 bg-white rounded-full animate-ping delay-3000"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-10 w-1 h-1 bg-white rounded-full animate-bounce delay-500"></div>
          <div className="absolute top-1/2 right-20 w-1 h-1 bg-white rounded-full animate-bounce delay-1500"></div>
          <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-white rounded-full animate-bounce delay-2500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-center space-x-2 lg:space-x-4">
            <span className="animate-bounce text-sm lg:text-lg">🔥</span>
            <span className="animate-pulse font-extrabold text-xs lg:text-base">VENTE FLASH - JUSQU'À -70% SUR TOUT!</span>
            <span className="animate-bounce text-sm lg:text-lg">🔥</span>
            <span className="hidden lg:inline animate-pulse">•</span>
            <span className="hidden lg:inline animate-pulse">LIVRAISON RAPIDE AU MAROC</span>
            <span className="hidden lg:inline animate-pulse">•</span>
            <span className="hidden lg:inline animate-pulse">OFFRE LIMITÉE - FINIT BIENTÔT!</span>
          </div>
        </div>
        
        {/* Animated Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
      </div>

      {/* Enhanced Animated Promotional Navbar */}
      <nav className="relative bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 dark:from-gray-900 dark:via-black dark:to-gray-900 shadow-2xl border-b-2 border-red-500 sticky top-0 z-[100]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-10 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          <div className="absolute top-4 right-20 w-1 h-1 bg-orange-500 rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-2 left-1/3 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping delay-2000"></div>
          <div className="absolute bottom-4 right-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping delay-3000"></div>
        </div>
        
        {/* Floating Gradient Orbs */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/3 w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 lg:h-16">
            {/* Enhanced Animated Logo with Promotional Badge */}
            <div className="flex-shrink-0 relative">
              <Link href="/" className="text-2xl font-bold text-white dark:text-primary-400 flex items-center group">
                <div className="relative">
                  <Image 
                    src="/images/pixel-pad-logo-new.png" 
                    alt="Pixel Pad Logo" 
                    width={48} 
                    height={48} 
                    className="mr-2 lg:mr-3 brightness-110 contrast-125 dark:brightness-100 dark:contrast-100 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 w-8 h-8 lg:w-16 lg:h-16"
                  />
                  {/* Animated Promotional Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-lg">
                    <span className="animate-pulse">HOT</span>
                  </div>
                  
                  {/* Rotating Ring Animation */}
                  <div className="absolute inset-0 border-2 border-transparent border-t-red-500 border-r-orange-500 rounded-full animate-spin opacity-30"></div>
                  
                  {/* Pulsing Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm lg:text-2xl font-bold group-hover:animate-pulse">PIXEL PAD</span>
                  <span className="text-xs text-yellow-400 font-semibold animate-pulse hidden lg:block">#1 TECH STORE</span>
                </div>
              </Link>
            </div>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link 
                  href="/" 
                  className="relative text-white dark:text-gray-300 hover:text-primary-400 dark:hover:text-primary-400 px-2 py-2 text-sm font-medium transition-all duration-500 hover:scale-110 group"
                >
                  <span className="relative z-10 group-hover:animate-pulse">{t('nav.home')}</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 group-hover:w-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                
                {/* Enhanced Products Mega Menu */}
                <div className="relative" ref={productsRef}>
                  <button
                    onClick={() => setIsProductsOpen(!isProductsOpen)}
                    className="relative text-white dark:text-gray-300 hover:text-primary-400 dark:hover:text-primary-400 px-2 py-2 text-sm font-medium transition-all duration-500 hover:scale-110 flex items-center group"
                  >
                    <span className="flex items-center relative z-10">
                      <span className="group-hover:animate-pulse">Products</span>
                      <span className="ml-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-1 py-0.5 rounded-full animate-bounce shadow-lg">
                        SALE
                      </span>
                    </span>
                    <svg className={`ml-1 h-4 w-4 transition-all duration-500 ${isProductsOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 group-hover:w-full"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  {isProductsOpen && (
                    <div 
                      className="absolute left-0 mt-2 w-screen max-w-6xl bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-2xl shadow-2xl border-2 border-red-200 dark:border-red-800 py-8 z-[9998] animate-in slide-in-from-top-2 duration-300"
                    >
                      {/* Promotional Header */}
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-2 mb-6 rounded-t-2xl">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="animate-bounce">🔥</span>
                          <span className="font-bold">PRODUITS EN PROMOTION - JUSQU'À -70%!</span>
                          <span className="animate-bounce">🔥</span>
                        </div>
                      </div>
                      
                      {/* View All Products Button */}
                      <div className="text-center mb-6">
                        <Link
                          href="/products"
                          onClick={handleLinkClick}
                          className="inline-flex items-center bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <span className="mr-2">🛍️</span>
                          View All Products
                          <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">NEW!</span>
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-8 px-6">
                        {productCategories.map((category, index) => (
                          <div key={index} className="space-y-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                            <Link 
                              href={category.href}
                              onClick={handleLinkClick}
                              className="flex items-center space-x-3 text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 hover:scale-105 group"
                            >
                              <span className="text-2xl group-hover:animate-bounce">{category.icon}</span>
                              <div className="flex flex-col">
                                <span>{category.name}</span>
                                <span className="text-xs text-red-600 font-bold">-50% OFF</span>
                              </div>
                            </Link>
                            <div className="space-y-2">
                              {category.subcategories.map((sub, subIndex) => {
                                const subHref = typeof sub === 'string' 
                                  ? `${category.href}?category=${sub.toLowerCase().replace(/\s+/g, '-')}`
                                  : sub.href
                                const subName = typeof sub === 'string' ? sub : sub.name
                                
                                return (
                                  <Link
                                    key={subIndex}
                                    href={subHref}
                                    onClick={handleLinkClick}
                                    className="block text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                  >
                                    {subName}
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link 
                  href="/about" 
                  className="relative text-white dark:text-gray-300 hover:text-primary-400 dark:hover:text-primary-400 px-2 py-2 text-sm font-medium transition-all duration-500 hover:scale-110 group"
                >
                  <span className="relative z-10 group-hover:animate-pulse">{t('nav.about')}</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 group-hover:w-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link 
                  href="/contacts" 
                  className="relative text-white dark:text-gray-300 hover:text-primary-400 dark:hover:text-primary-400 px-2 py-2 text-sm font-medium transition-all duration-500 hover:scale-110 group"
                >
                  <span className="flex items-center relative z-10">
                    <span className="group-hover:animate-pulse">{t('nav.contacts')}</span>
                    <span className="ml-1 bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-bold px-1 py-0.5 rounded-full animate-pulse shadow-lg">
                      EXPERT
                    </span>
                    <span className="ml-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-1 py-0.5 rounded-full animate-bounce shadow-lg">
                      EXPERT
                    </span>
                  </span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 group-hover:w-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1">

              {/* Simple User Icon */}
              <button className="p-1.5 lg:p-2 text-white hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-700 touch-manipulation">
                <UserIcon className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>

              {/* Language Switcher */}
              <div className="relative" ref={languageRef}>
                <button 
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="p-1.5 lg:p-2 text-white hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-700 touch-manipulation"
                >
                  <span className="text-xs lg:text-sm font-bold">
                    {language === 'en' ? '🇬🇧' : language === 'fr' ? '🇫🇷' : '🇸🇦'}
                  </span>
                </button>
                
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <button
                      onClick={() => {
                        setLanguage('en')
                        setIsLanguageOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg flex items-center space-x-2 ${
                        language === 'en' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>🇬🇧</span>
                      <span>English</span>
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('fr')
                        setIsLanguageOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${
                        language === 'fr' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>🇫🇷</span>
                      <span>Français</span>
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ar')
                        setIsLanguageOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg flex items-center space-x-2 ${
                        language === 'ar' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>🇸🇦</span>
                      <span>العربية</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Enhanced Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-1.5 lg:p-2 text-white hover:text-primary-400 transition-all duration-300 rounded-lg hover:bg-gray-700 touch-manipulation active:scale-95"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <div className="relative">
                  {theme === 'light' ? (
                    <MoonIcon className="h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-300 hover:rotate-12" />
                  ) : (
                    <SunIcon className="h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-300 hover:rotate-12" />
                  )}
                  {/* Animated ring effect */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent hover:border-primary-400/30 transition-all duration-300"></div>
                </div>
              </button>

              {/* Simple Cart Button */}
              <button className="relative p-1.5 lg:p-2 text-white hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-700 touch-manipulation">
                <ShoppingCartIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </button>

              {/* Enhanced Mobile menu button */}
              <div className="lg:hidden ml-1">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white hover:text-primary-400 p-2 rounded-lg hover:bg-gray-700 transition-all duration-300 touch-manipulation active:scale-95"
                  aria-label="Toggle mobile menu"
                >
                  <div className="relative">
                    {isMobileMenuOpen ? (
                      <XMarkIcon className="h-5 w-5 transition-transform duration-300 rotate-180" />
                    ) : (
                      <Bars3Icon className="h-5 w-5 transition-transform duration-300" />
                    )}
                    {/* Animated background */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-gray-800 dark:bg-gray-900 border-t border-gray-600 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300 max-h-[80vh] overflow-y-auto z-50">
            <div className="px-3 py-2">
              {/* Main Navigation - Compact */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Link 
                  href="/"
                  className="flex items-center justify-center px-3 py-3 text-sm font-medium text-white hover:text-primary-400 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">🏠</span>
                  <span className="ml-2">{t('nav.home')}</span>
                </Link>
                
                <Link 
                  href="/products"
                  className="flex items-center justify-center px-3 py-3 text-sm font-medium text-white hover:text-primary-400 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">🛍️</span>
                  <span className="ml-2">Products</span>
                </Link>
                
                <Link 
                  href="/about"
                  className="flex items-center justify-center px-3 py-3 text-sm font-medium text-white hover:text-primary-400 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">ℹ️</span>
                  <span className="ml-2">{t('nav.about')}</span>
                </Link>
                
                <Link 
                  href="/contacts"
                  className="flex items-center justify-center px-3 py-3 text-sm font-medium text-white hover:text-primary-400 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">📞</span>
                  <span className="ml-2">{t('nav.contacts')}</span>
                </Link>
                
                <Link 
                  href="/test"
                  className="flex items-center justify-center px-3 py-3 text-sm font-medium text-white hover:text-primary-400 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation active:scale-95"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-lg">🧪</span>
                  <span className="ml-2">Test Page</span>
                </Link>
              </div>

              {/* Quick Actions - Horizontal */}
              <div className="border-t border-gray-600 dark:border-gray-700 pt-3">
                <div className="flex items-center justify-between">
                  {/* Language Switcher - Compact */}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setLanguage('en')
                        setIsMobileMenuOpen(false)
                      }}
                      className={`p-2 rounded-md transition-all duration-300 ${
                        language === 'en' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      🇬🇧
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('fr')
                        setIsMobileMenuOpen(false)
                      }}
                      className={`p-2 rounded-md transition-all duration-300 ${
                        language === 'fr' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      🇫🇷
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('ar')
                        setIsMobileMenuOpen(false)
                      }}
                      className={`p-2 rounded-md transition-all duration-300 ${
                        language === 'ar' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      🇸🇦
                    </button>
                  </div>

                  {/* Theme Toggle - Compact */}
                  <button 
                    onClick={() => {
                      toggleTheme()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center px-3 py-2 text-sm font-medium text-white hover:text-primary-400 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-md transition-all duration-300"
                  >
                    {theme === 'light' ? (
                      <MoonIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <SunIcon className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-xs">{theme === 'light' ? 'Dark' : 'Light'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Product Categories - Compact */}
              <div className="border-t border-gray-600 dark:border-gray-700 pt-3 mt-3">
                <div className="text-xs text-gray-400 mb-2 px-1">Quick Categories</div>
                <div className="grid grid-cols-3 gap-1">
                  {productCategories.slice(0, 6).map((category, index) => (
                    <Link
                      key={index}
                      href={category.href}
                      className="flex flex-col items-center p-2 text-xs text-gray-300 hover:text-primary-400 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-md transition-colors touch-manipulation active:scale-95"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-lg mb-1">{category.icon}</span>
                      <span className="text-center leading-tight">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}