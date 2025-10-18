'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return [ref, isVisible] as const
}

// Sample data for demonstration
const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'MacBook Pro 16" M3 Max',
    description: 'Powerful laptop with M3 Max chip, perfect for professionals and creators.',
    price: 2499,
    originalPrice: 2799,
    category: 'laptop',
    image: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=MacBook+Pro',
    inStock: true,
    rating: 4.8,
    reviews: 124,
    features: ['M3 Max Chip', '32GB RAM', '1TB SSD', '16-inch Retina Display']
  },
  {
    id: '2',
    name: 'Dell XPS 13',
    description: 'Ultra-portable laptop with stunning 13.4-inch display and all-day battery life.',
    price: 1299,
    category: 'laptop',
    image: 'https://via.placeholder.com/300x200/059669/FFFFFF?text=Dell+XPS',
    inStock: true,
    rating: 4.6,
    reviews: 89,
    features: ['Intel i7', '16GB RAM', '512GB SSD', '13.4-inch 4K Display']
  },
  {
    id: '3',
    name: 'ASUS ROG Gaming Monitor',
    description: '27-inch 4K gaming monitor with 144Hz refresh rate and HDR support.',
    price: 599,
    category: 'monitor',
    image: 'https://via.placeholder.com/300x200/DC2626/FFFFFF?text=ASUS+Monitor',
    inStock: true,
    rating: 4.7,
    reviews: 156,
    features: ['27-inch 4K', '144Hz', 'HDR', 'G-Sync Compatible']
  },
  {
    id: '4',
    name: 'HP Pavilion Gaming',
    description: 'Gaming laptop with RTX 4060 graphics and high refresh rate display.',
    price: 1199,
    originalPrice: 1399,
    category: 'laptop',
    image: 'https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=HP+Gaming',
    inStock: true,
    rating: 4.5,
    reviews: 78,
    features: ['RTX 4060', '16GB RAM', '512GB SSD', '144Hz Display']
  },
  {
    id: '5',
    name: 'Samsung 4K Monitor',
    description: '32-inch 4K UHD monitor with HDR10+ and USB-C connectivity.',
    price: 449,
    category: 'monitor',
    image: 'https://via.placeholder.com/300x200/1E40AF/FFFFFF?text=Samsung+4K',
    inStock: true,
    rating: 4.6,
    reviews: 92,
    features: ['32-inch 4K', 'HDR10+', 'USB-C', 'FreeSync']
  },
  {
    id: '6',
    name: 'Logitech MX Master 3S',
    description: 'Premium wireless mouse with ultra-fast scrolling and precision tracking.',
    price: 99,
    category: 'accessories',
    image: 'https://via.placeholder.com/300x200/059669/FFFFFF?text=Logitech+MX',
    inStock: true,
    rating: 4.9,
    reviews: 203,
    features: ['Wireless', '70-day Battery', 'Precision Tracking', 'Multi-device']
  }
]

export default function HomePage() {
  const { t, isRTL } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [showLiveChat, setShowLiveChat] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 45
  })
  const [endTime, setEndTime] = useState<number | null>(null)

  // Debug log to confirm page is loading
  useEffect(() => {
    console.log('Home page loaded successfully!')
  }, [])
  
  // Scroll animation hooks
  const [heroRef, heroVisible] = useScrollAnimation()
  const [statsRef, statsVisible] = useScrollAnimation()
  const [carouselRef, carouselVisible] = useScrollAnimation()
  const [benefitsRef, benefitsVisible] = useScrollAnimation()
  
  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)
    }, 4000) // Change slide every 4 seconds
    
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  // Optimized mouse tracking with throttling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }, 16) // ~60fps throttling
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeoutId)
    }
  }, [])

  // Optimized scroll tracking with throttling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setScrollY(window.scrollY)
      }, 16) // ~60fps throttling
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [])

  // Page load animation
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Initialize countdown timer with localStorage persistence
  useEffect(() => {
    // Check if there's a saved end time in localStorage
    const savedEndTime = localStorage.getItem('pixelPadCountdownEndTime')
    const now = Date.now()
    
    if (savedEndTime) {
      const endTime = parseInt(savedEndTime)
      const timeRemaining = endTime - now
      
      if (timeRemaining > 0) {
        // Use the saved end time
        setEndTime(endTime)
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)
        
        setTimeLeft({ hours, minutes, seconds })
      } else {
        // Timer has expired, create a new one
        const newEndTime = now + (24 * 60 * 60 * 1000) // 24 hours from now
        localStorage.setItem('pixelPadCountdownEndTime', newEndTime.toString())
        setEndTime(newEndTime)
        setTimeLeft({ hours: 23, minutes: 59, seconds: 59 })
      }
    } else {
      // No saved time, create a new countdown
      const newEndTime = now + (24 * 60 * 60 * 1000) // 24 hours from now
      localStorage.setItem('pixelPadCountdownEndTime', newEndTime.toString())
      setEndTime(newEndTime)
      setTimeLeft({ hours: 23, minutes: 59, seconds: 45 })
    }
  }, [])

  // Countdown timer effect
  useEffect(() => {
    if (!endTime) return

    const timer = setInterval(() => {
      const now = Date.now()
      const timeRemaining = endTime - now
      
      if (timeRemaining > 0) {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)
        
        setTimeLeft({ hours, minutes, seconds })
      } else {
        // Timer has expired, create a new one
        const newEndTime = now + (24 * 60 * 60 * 1000) // 24 hours from now
        localStorage.setItem('pixelPadCountdownEndTime', newEndTime.toString())
        setEndTime(newEndTime)
        setTimeLeft({ hours: 23, minutes: 59, seconds: 59 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)
  }
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)
  }
  
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Live Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowLiveChat(!showLiveChat)}
          className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 animate-bounce"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        
        {showLiveChat && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-green-200 dark:border-green-800 p-4 w-80 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="font-bold text-gray-900 dark:text-white">Live Support</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Hi! 👋 Need help choosing the perfect tech? Our experts are here to help!
            </p>
            <div className="space-y-2">
              <button className="w-full text-left bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                💻 Laptop Recommendations
              </button>
              <button className="w-full text-left bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                🖥️ Desktop Setup Help
              </button>
              <button className="w-full text-left bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                📱 Accessories Guide
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Buy Now Button with Countdown */}
      <div className="fixed bottom-4 left-2 right-2 z-50 md:left-4 md:right-auto md:w-auto">
        <div 
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-2 rounded-full shadow-2xl animate-bounce cursor-pointer hover:from-red-600 hover:to-orange-600 transition-all duration-300"
          onClick={() => window.location.href = '/products'}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-xs">⏰</span>
              <span className="text-xs font-bold">PROMO ENDS IN:</span>
              <div className="flex items-center space-x-0.5">
                <div className="bg-red-600 text-white px-1 py-0.5 rounded text-xs font-bold">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <span className="text-xs">:</span>
                <div className="bg-red-600 text-white px-1 py-0.5 rounded text-xs font-bold">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <span className="text-xs">:</span>
                <div className="bg-red-600 text-white px-1 py-0.5 rounded text-xs font-bold">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
              </div>
            </div>
            <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-2 py-1 rounded-lg font-bold text-xs transition-all duration-300 transform hover:scale-105">
              BUY NOW
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Promotional Header with Countdown */}
      <div 
        className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-1 text-xs font-bold animate-pulse cursor-pointer hover:from-red-600 hover:to-orange-600 transition-all duration-300"
        onClick={() => window.location.href = '/products'}
      >
        <div className="flex items-center justify-center space-x-2 px-2">
          <span className="animate-bounce text-sm">🔥</span>
          <span className="hidden sm:inline">2-YEAR WARRANTY • 30-DAY RETURNS</span>
          <span className="sm:hidden">2-YEAR WARRANTY</span>
          <span className="animate-bounce text-sm">⚡</span>
        </div>
        
        {/* Top Countdown Timer */}
        <div className="mt-1 flex items-center justify-center space-x-1">
          <span className="text-xs font-bold">PROMO ENDS IN:</span>
          <div className="flex items-center space-x-0.5">
            <div className="bg-red-600 text-white px-1 py-0.5 rounded text-xs font-bold">
              {timeLeft.hours.toString().padStart(2, '0')}H
            </div>
            <div className="bg-red-600 text-white px-1 py-0.5 rounded text-xs font-bold">
              {timeLeft.minutes.toString().padStart(2, '0')}M
            </div>
            <div className="bg-red-600 text-white px-1 py-0.5 rounded text-xs font-bold">
              {timeLeft.seconds.toString().padStart(2, '0')}S
            </div>
          </div>
          <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-1.5 py-0.5 rounded text-xs font-bold transition-all duration-300 transform hover:scale-105">
            BUY NOW
          </button>
        </div>
      </div>


      {/* Optimized Static Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30" />

      {/* Loading Animation */}
      {!isLoaded && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-[9999] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white text-xl font-bold animate-pulse">PIXEL PAD</div>
            <div className="text-gray-400 text-sm animate-bounce">Loading amazing experience...</div>
          </div>
        </div>
      )}
      {/* Enhanced Animated Promotional Banners */}
      <section 
        className="relative bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white py-4 overflow-hidden z-10 cursor-pointer hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 transition-all duration-300"
        onClick={() => window.location.href = '/products'}
      >
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-2 right-20 w-2 h-2 bg-white rounded-full animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3 group">
              <span className="text-2xl animate-bounce group-hover:animate-spin transition-all duration-300">🔥</span>
              <p className="font-extrabold text-sm md:text-base animate-pulse">
                {t('promo.flashSale')}
              </p>
            </div>
            <div className="hidden md:block w-px h-6 bg-white opacity-50 animate-pulse"></div>
            <div className="flex items-center gap-3 group">
              <span className="text-2xl animate-pulse group-hover:animate-bounce transition-all duration-300">⚡</span>
              <p className="font-extrabold text-sm md:text-base animate-pulse">
                {t('promo.limitedTime')}
              </p>
            </div>
            <div className="hidden md:block w-px h-6 bg-white opacity-50 animate-pulse"></div>
            <div className="flex items-center gap-3 group">
              <span className="text-2xl animate-spin group-hover:animate-bounce transition-all duration-300">⏰</span>
              <p className="font-extrabold text-sm md:text-base animate-pulse">
                {t('promo.limitedTime')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Animated Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
      </section>

      {/* Enhanced Animated Countdown Timer Banner */}
      <section 
        className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-3 overflow-hidden cursor-pointer hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 transition-all duration-300"
        onClick={() => window.location.href = '/products'}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1 left-20 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          <div className="absolute top-2 right-30 w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-1 left-1/2 w-2 h-2 bg-yellow-500 rounded-full animate-ping delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-semibold animate-pulse">⏰ {t('promo.countdown')}</span>
            <div className="flex gap-2">
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-3 py-1 rounded text-sm font-bold animate-bounce shadow-lg">{timeLeft.hours.toString().padStart(2, '0')}</div>
              <span className="text-sm animate-pulse">{t('promo.hours').charAt(0)}</span>
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-3 py-1 rounded text-sm font-bold animate-bounce delay-100 shadow-lg">{timeLeft.minutes.toString().padStart(2, '0')}</div>
              <span className="text-sm animate-pulse">{t('promo.minutes').charAt(0)}</span>
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-3 py-1 rounded text-sm font-bold animate-bounce delay-200 shadow-lg">{timeLeft.seconds.toString().padStart(2, '0')}</div>
              <span className="text-sm animate-pulse">{t('promo.seconds').charAt(0)}</span>
            </div>
            <Link href="/shop" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg animate-pulse">
              {t('promo.buyNow')}
            </Link>
          </div>
        </div>
        
        {/* Animated Border */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
      </section>

      {/* Hero Section */}
      <section ref={heroRef} className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden z-10 transition-all duration-500 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-bounce delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-bounce delay-1500"></div>
          <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-bounce delay-2000"></div>
        </div>
        

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-4 lg:space-y-8 animate-in slide-in-from-left duration-1000">
              {/* Enhanced Promotional Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg animate-bounce group hover:animate-pulse">
                <span className="animate-spin group-hover:animate-bounce">🔥</span>
                <span className="mx-2">FLASH SALE - 70% OFF ENDS TODAY!</span>
                <span className="animate-spin group-hover:animate-bounce">🔥</span>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2">
                <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                  ✅ 10,000+ Happy Customers
                </div>
                <div className="bg-blue-500/20 border border-blue-500/50 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
                  ⚡ Fast Delivery Morocco
                </div>
                <div className="bg-purple-500/20 border border-purple-500/50 text-purple-300 px-3 py-1 rounded-full text-xs font-bold">
                  ⭐ 4.9/5 Rating
                </div>
              </div>
              
              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-3xl md:text-5xl lg:text-7xl xl:text-8xl font-black leading-tight">
                  <span className="text-white drop-shadow-2xl animate-pulse">{t('hero.gamingLaptop')}</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse drop-shadow-2xl">
                    {t('hero.productName')}
                  </span>
                </h1>
                <p className="text-lg md:text-xl lg:text-3xl text-gray-200 max-w-2xl font-medium leading-relaxed">
                  {t('hero.description')}
                </p>
                
                {/* Enhanced Features */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-primary-400/30">
                    <span className="text-primary-400 mr-2">⚡</span>
                    <span className="text-sm font-medium">Wi-Fi 7</span>
                  </div>
                  <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-400/30">
                    <span className="text-blue-400 mr-2">🖥️</span>
                    <span className="text-sm font-medium">UHD+ Display</span>
                  </div>
                  <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30">
                    <span className="text-green-400 mr-2">🔋</span>
                    <span className="text-sm font-medium">99.9 Whr Battery</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Price with Savings */}
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-3xl p-8 border-2 border-green-500/30 shadow-2xl">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <span className="text-5xl font-black text-green-400 drop-shadow-lg">
                      24,999 MAD
                    </span>
                    <span className="text-3xl text-gray-400 line-through">
                      29,999 MAD
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg animate-pulse">
                      🔥 SAVE 5,000 MAD!
                    </span>
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                      ⚡ 17% OFF
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-gray-300">
                    <span className="bg-white/10 px-3 py-1 rounded-full">💳 0% Interest Financing Available</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-primary-400/30">
                  <span className="text-sm font-medium">Wi-Fi 7</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-400/30">
                  <span className="text-sm font-medium">UHD+ Display</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-green-400/30">
                  <span className="text-sm font-medium">99.9 Whr Battery</span>
                </div>
              </div>

              {/* Urgency Message */}
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-300 font-semibold text-sm">
                    ⚡ {t('promo.stockUrgency')}
                  </span>
                </div>
              </div>

              {/* Brand Logos */}
              <div className="flex items-center space-x-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <span className="text-sm font-semibold">NVIDIA Studio</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <span className="text-sm font-semibold">Intel Evo</span>
                </div>
              </div>

              {/* Enhanced CTA Buttons */}
              <div className="space-y-6">
                <Link href="/shop" className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white px-10 py-6 rounded-2xl font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl text-center block animate-pulse border-2 border-white/20">
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-2xl">🛒</span>
                    <span>BUY NOW - 2-YEAR WARRANTY!</span>
                    <span className="text-2xl animate-bounce">🔥</span>
                  </div>
                </Link>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/about" className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-xl font-bold text-center transition-all duration-300 backdrop-blur-sm hover:bg-white/10 transform hover:scale-105">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-xl">📱</span>
                      <span>Why Choose Us?</span>
                    </div>
                  </Link>
                  <Link href="/contacts" className="border-2 border-green-400/50 hover:border-green-400 text-green-400 px-8 py-4 rounded-xl font-bold text-center transition-all duration-300 backdrop-blur-sm hover:bg-green-400/10 transform hover:scale-105">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-xl">💬</span>
                      <span>Get Expert Advice</span>
                    </div>
                  </Link>
                </div>
                
                {/* Enhanced Social Proof */}
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex text-yellow-400 text-xl">
                        ⭐⭐⭐⭐⭐
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg">4.9/5</div>
                        <div className="text-gray-300 text-sm">(2,847 reviews)</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-lg">🔥 127</div>
                      <div className="text-gray-300 text-sm">sold today!</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-6 pt-4 border-t border-gray-600">
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>{t('promo.securePayment')}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <span>{t('promo.easyReturn')}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('promo.warranty')}</span>
                </div>
              </div>
            </div>
            
            {/* Right Side - Product Image */}
            <div className="relative">
              <div className="relative z-10">
                {/* Placeholder for product image - you can replace with actual laptop image */}
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-8 shadow-2xl">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">💻</div>
                      <p className="text-xl font-semibold">MSI Prestige 16</p>
                      <p className="text-sm opacity-80">AI Studio B1V</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Stats Section */}
      {/* Enhanced Animated Promotional Stats Section */}
      <section ref={statsRef} className={`relative py-12 bg-gradient-to-r from-primary-600 to-blue-600 text-white overflow-hidden z-10 transition-all duration-500 delay-100 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-10 w-3 h-3 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-6 right-20 w-2 h-2 bg-white rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-4 left-1/3 w-2.5 h-2.5 bg-white rounded-full animate-ping delay-2000"></div>
          <div className="absolute bottom-6 right-1/4 w-3 h-3 bg-white rounded-full animate-ping delay-3000"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-20 w-1 h-1 bg-white rounded-full animate-bounce delay-500"></div>
          <div className="absolute top-2/3 right-30 w-1 h-1 bg-white rounded-full animate-bounce delay-1500"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-bounce delay-2500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2 group hover:scale-110 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold animate-bounce group-hover:animate-pulse">10,000+</div>
              <div className="text-sm md:text-base opacity-90 animate-pulse">{t('promo.satisfiedCustomers')}</div>
            </div>
            <div className="space-y-2 group hover:scale-110 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold animate-bounce delay-100 group-hover:animate-pulse">4.9/5</div>
              <div className="text-sm md:text-base opacity-90 animate-pulse">{t('promo.averageRating')}</div>
            </div>
            <div className="space-y-2 group hover:scale-110 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold animate-bounce delay-200 group-hover:animate-pulse">24h</div>
              <div className="text-sm md:text-base opacity-90 animate-pulse">{t('promo.expressDelivery')}</div>
            </div>
            <div className="space-y-2 group hover:scale-110 transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold animate-bounce delay-300 group-hover:animate-pulse">1 an</div>
              <div className="text-sm md:text-base opacity-90 animate-pulse">{t('promo.warranty')}</div>
            </div>
          </div>
        </div>
        
        {/* Animated Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
      </section>

      {/* Enhanced Animated Special Offer Banner */}
      <section className="relative py-8 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-2 left-10 w-4 h-4 bg-white rounded-full animate-ping"></div>
          <div className="absolute top-4 right-20 w-3 h-3 bg-white rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-2 left-1/3 w-3 h-3 bg-white rounded-full animate-ping delay-2000"></div>
          <div className="absolute bottom-4 right-1/4 w-4 h-4 bg-white rounded-full animate-ping delay-3000"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-20 w-1 h-1 bg-white rounded-full animate-bounce delay-500"></div>
          <div className="absolute top-2/3 right-30 w-1 h-1 bg-white rounded-full animate-bounce delay-1500"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-bounce delay-2500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3 group">
              <span className="text-3xl animate-bounce group-hover:animate-spin transition-all duration-300">🎉</span>
              <h2 className="text-2xl md:text-3xl font-bold animate-pulse">
                {t('promo.specialOffer')}
              </h2>
            </div>
            <div className="hidden md:block w-px h-8 bg-white opacity-50 animate-pulse"></div>
            <div className="flex items-center gap-3 group">
              <span className="text-2xl animate-pulse group-hover:animate-bounce transition-all duration-300">💰</span>
              <p className="text-lg md:text-xl font-semibold animate-pulse">
                {t('promo.firstOrderDiscount')}
              </p>
            </div>
            <div className="hidden md:block w-px h-8 bg-white opacity-50 animate-pulse"></div>
            <Link href="/shop" className="bg-white text-orange-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg animate-pulse">
              {t('promo.takeAdvantage')}
            </Link>
          </div>
        </div>
        
        {/* Animated Border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
      </section>

      {/* Enhanced Promotional Carousel Section */}
      <section ref={carouselRef} className={`py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20 relative overflow-hidden z-10 transition-all duration-500 delay-200 ${carouselVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
        
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Enhanced Animated Header */}
          <div className="text-center mb-16 animate-in slide-in-from-top duration-1000">
            <div className="inline-flex items-center bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 animate-bounce shadow-lg group hover:animate-pulse">
              <span className="animate-spin group-hover:animate-bounce">🔥</span>
              <span className="mx-2">{t('promo.flashSale')}</span>
              <span className="animate-spin group-hover:animate-bounce">🔥</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-pulse">
                {t('home.featured.title').toUpperCase()}
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 animate-pulse">
              {t('home.featured.subtitle')}
            </p>
            
            {/* Enhanced Animated Countdown Timer */}
            <div 
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-3 max-w-lg mx-auto shadow-2xl animate-pulse cursor-pointer hover:from-red-600 hover:to-orange-600 transition-all duration-300"
              onClick={() => window.location.href = '/products'}
            >
            <div className="text-center">
                <div className="text-xs md:text-sm font-bold mb-1 animate-bounce">⏰ FLASH SALE ENDS IN:</div>
                <div className="flex justify-center space-x-1 md:space-x-2 text-sm md:text-lg font-bold">
                  <div className="bg-white/20 rounded px-1 md:px-2 py-0.5 md:py-1 animate-bounce shadow-lg">
                    <div className="animate-pulse">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs">H</div>
                  </div>
                  <div className="bg-white/20 rounded px-1 md:px-2 py-0.5 md:py-1 animate-bounce delay-100 shadow-lg">
                    <div className="animate-pulse">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs">M</div>
                  </div>
                  <div className="bg-white/20 rounded px-1 md:px-2 py-0.5 md:py-1 animate-bounce delay-200 shadow-lg">
                    <div className="animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs">S</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Carousel Container */}
          <div className="relative">
            <div 
              className={`overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-xl ${isRTL ? 'rtl' : 'ltr'}`}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ 
                  transform: isRTL 
                    ? `translateX(${currentSlide * 100}%)` 
                    : `translateX(-${currentSlide * 100}%)` 
                }}
              >
                {featuredProducts.map((product, index) => (
                  <div key={product.id} className="w-full flex-shrink-0">
                    <div className="bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-3xl p-8 mx-4 shadow-2xl border-2 border-red-200 dark:border-red-800 relative overflow-hidden group hover:shadow-3xl hover:scale-105 transition-all duration-500 hover:border-primary-500 dark:hover:border-primary-400">
                      {/* Enhanced Promotional Banner */}
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white text-center py-3 text-sm font-bold animate-pulse">
                        ⚡ {t('promo.limitedTime')} ⚡
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-4">
                        {/* Product Image */}
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden">
                            <div className="text-8xl z-10">💻</div>
                            {/* Animated background elements */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-blue-400/20 animate-pulse"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
                            <div className="absolute bottom-2 left-2 w-3 h-3 bg-green-400 rounded-full animate-bounce delay-1000"></div>
                          </div>
                          
                          {/* Multiple Sale Badges */}
                          {product.originalPrice && (
                            <>
                              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                              </div>
                              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                {t('promo.limitedTime')}
                              </div>
                            </>
                          )}
                          
                          {/* Stock Counter */}
                          <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {t('promo.stockUrgency')}
                          </div>
                        </div>
                        
                        {/* Product Info */}
                        <div className="space-y-6">
                          <div>
                            <div className={`flex items-center mb-4 ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                              <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                ⭐ {t('product.bestseller')}
                              </span>
                              <span className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                🚀 {t('product.new')}
                              </span>
                              <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                🔥 {t('product.hotDeal')}
                              </span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                              {product.name}
                            </h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                              {product.description}
                            </p>
                          </div>
                          
                          {/* Urgency Message */}
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-red-700 dark:text-red-300 font-semibold text-sm">
                                ⏰ {t('promo.limitedTime')}
                              </span>
                            </div>
                          </div>
                          
                          {/* Features */}
                          <div className="grid grid-cols-2 gap-3">
                            {product.features?.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{feature}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Price with Savings */}
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                                {product.price} MAD
                              </span>
                              {product.originalPrice && (
                                <span className="text-2xl text-gray-500 line-through">
                                  {product.originalPrice} MAD
                                </span>
                              )}
                            </div>
                            {product.originalPrice && (
                              <div className="flex items-center space-x-2">
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                  Économisez {product.originalPrice - product.price} MAD!
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  Soit {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% de réduction
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Rating with Trust Signals */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-5 h-5 ${
                                      i < Math.floor(product.rating || 0)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">
                                {product.rating} ({product.reviews} avis clients)
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-semibold">GARANTIE 2 ANS</span>
                            </div>
                          </div>
                          
                          {/* Enhanced CTA Buttons */}
                          <div className="space-y-4">
                            <button className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl animate-pulse">
                              🛒 {t('promo.buyNow')}
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                              <button className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                                📱 {t('promo.learnMore')}
                              </button>
                              <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                                💬 {t('promo.whatsapp')}
                              </button>
                            </div>
                          </div>
                          
                          {/* Trust Badges */}
                          <div className={`flex items-center justify-center pt-4 border-t border-gray-200 dark:border-gray-600 ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                            <div className={`flex items-center text-xs text-gray-500 ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              <span>{t('promo.securePayment')}</span>
                            </div>
                            <div className={`flex items-center text-xs text-gray-500 ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                              </svg>
                              <span>{t('promo.easyReturn')}</span>
                            </div>
                            <div className={`flex items-center text-xs text-gray-500 ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{t('promo.warranty')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Enhanced Navigation Arrows */}
            <button
              onClick={prevSlide}
              className={`absolute top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-10 group ${isRTL ? 'right-6' : 'left-6'} hover:shadow-red-500/50 hover:animate-pulse`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              className={`absolute top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-10 group ${isRTL ? 'left-6' : 'right-6'} hover:shadow-red-500/50 hover:animate-pulse`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>
            
            {/* Enhanced Dot Indicators */}
            <div className={`flex justify-center mt-12 ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 scale-150 shadow-lg'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 hover:scale-125'
                  }`}
                />
              ))}
            </div>
            
            {/* Auto-play Indicator */}
            <div className="text-center mt-6">
              <div className={`inline-flex items-center text-sm text-gray-500 ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span>{isAutoPlaying ? t('carousel.autoPlayActive') : t('carousel.autoPlayPaused')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-green-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-1500"></div>
          <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg animate-pulse">
              ⭐ 4.9/5 CUSTOMER RATING ⭐
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                WHAT OUR CUSTOMERS SAY
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join 10,000+ satisfied customers who trust PIXEL PAD for their tech needs
            </p>
          </div>

          {/* Enhanced Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 border-2 border-green-200 dark:border-green-800 relative overflow-hidden group">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="ml-2 text-sm text-gray-500">5.0/5</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Amazing service! Got my MacBook Pro delivered in 2 days. The quality is perfect and the 2-year warranty gives me peace of mind. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Ahmed Benali</h4>
                  <p className="text-sm text-gray-500">Casablanca</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="ml-2 text-sm text-gray-500">5.0/5</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Best tech store in Morocco! The customer support is incredible. They helped me choose the perfect gaming setup and even gave me a discount. Will definitely buy again!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Mariam Alami</h4>
                  <p className="text-sm text-gray-500">Rabat</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  ⭐⭐⭐⭐⭐
                </div>
                <span className="ml-2 text-sm text-gray-500">5.0/5</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "Professional service from start to finish. The team helped me set up my entire office with the latest equipment. Fast delivery and excellent after-sales support!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  Y
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Youssef Tazi</h4>
                  <p className="text-sm text-gray-500">Marrakech</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">10,000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Happy Customers</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">4.9/5</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Average Rating</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">99%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Satisfaction Rate</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Enhanced Promotional Section */}
      <section ref={benefitsRef} className={`py-20 bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden z-10 transition-all duration-500 delay-300 ${benefitsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-20 w-40 h-40 bg-primary-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary-400 rounded-full animate-bounce delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-primary-400 rounded-full animate-bounce delay-1500"></div>
          <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-2000"></div>
        </div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-primary-500/20 to-transparent animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Promotional Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg animate-pulse">
              🏆 #1 CHOIX DES CLIENTS AU MAROC! 🏆
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                POURQUOI CHOISIR
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">PIXEL PAD?</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              {t('promo.joinCustomers')}
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">+10,000 Clients</span>
              </div>
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">4.9/5 Étoiles</span>
              </div>
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Livraison Rapide</span>
              </div>
            </div>
          </div>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Quality */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 relative overflow-hidden animate-in slide-in-from-bottom duration-1000">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-bl-3xl opacity-10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-bounce transition-all duration-300">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold mr-2">GARANTIE</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">LIMITÉ</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Qualité Supérieure</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Des produits rigoureusement sélectionnés pour leur performance et leur fiabilité. <span className="font-semibold text-green-600">Testés et approuvés par nos experts.</span>
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                      ✅ 2 ans de garantie étendue incluse
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fast Delivery */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 relative overflow-hidden animate-in slide-in-from-bottom duration-1000 delay-200">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-bl-3xl opacity-10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-bounce transition-all duration-300">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold mr-2">EXPRESS</span>
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">GRATUIT</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('promo.fastDelivery')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {t('promo.fastDeliveryDesc')}
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                      🚚 {t('promo.delivery24h')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 relative overflow-hidden animate-in slide-in-from-bottom duration-1000 delay-400">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-bl-3xl opacity-10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-bounce transition-all duration-300">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold mr-2">24/7</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">DÉDIÉ</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('promo.dedicatedSupport')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {t('promo.supportDesc')}
                  </p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
                      💬 {t('promo.supportChannels')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitive Prices */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 relative overflow-hidden animate-in slide-in-from-bottom duration-1000 delay-600">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-bl-3xl opacity-10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-bounce transition-all duration-300">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold mr-2">MEILLEUR</span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">PRIX</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('promo.competitivePrices')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {t('promo.pricesDesc')}
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 font-semibold">
                      💰 {t('promo.flashDiscounts')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wide Selection */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 relative overflow-hidden animate-in slide-in-from-bottom duration-1000 delay-800">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-bl-3xl opacity-10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-bounce transition-all duration-300">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold mr-2">+5000</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">PRODUITS</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('promo.wideSelection')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {t('promo.selectionDesc')}
                  </p>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">
                      🎯 {t('promo.productCategories')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Extended Warranty */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 relative overflow-hidden animate-in slide-in-from-bottom duration-1000 delay-1000">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-bl-3xl opacity-10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:animate-bounce transition-all duration-300">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
            </div>
            <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold mr-2">2 ANS</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">GARANTIE</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('promo.extendedWarrantyTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {t('promo.warrantyDesc')}
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                      🛡️ {t('promo.warrantyService')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t('promo.readyToJoin')}
              </h3>
              <p className="text-lg mb-6 opacity-90">
                {t('promo.joinThousands')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/shop" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                  🛒 {t('promo.discoverProducts')}
                </Link>
                <Link href="/contacts" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300">
                  💬 {t('promo.contactUs')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Animated Final Promotional CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-20 w-40 h-40 bg-primary-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white rounded-full animate-bounce delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-red-400 rounded-full animate-bounce delay-1500"></div>
          <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-bounce delay-2000"></div>
        </div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white to-transparent animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="space-y-8 animate-in slide-in-from-bottom duration-1000">
            <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg animate-bounce group hover:animate-pulse">
              <span className="animate-spin group-hover:animate-bounce">🚨</span>
              <span className="mx-2">DERNIÈRE CHANCE - OFFRE SE TERMINE BIENTÔT!</span>
              <span className="animate-spin group-hover:animate-bounce">🚨</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                NE MANQUEZ PAS
              </span>
              <br />
              <span className="text-white animate-pulse">CETTE OPPORTUNITÉ!</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              {t('promo.joinThousands')}
            </p>
            
            {/* Urgency Timer */}
            <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-red-300 font-semibold mb-4">⏰ TEMPS RESTANT:</p>
              <div className="flex justify-center gap-4">
                <div className="bg-red-600 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                  <div className="text-xs">HEURES</div>
                </div>
                <div className="bg-red-600 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-xs">MINUTES</div>
                </div>
                <div className="bg-red-600 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-xs">SECONDES</div>
                </div>
              </div>
            </div>
            
            {/* Benefits List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold">{t('promo.fastDelivery')}</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold">{t('promo.warrantyBenefit')}</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold">{t('promo.support24h')}</span>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                🛒 {t('promo.orderNow')}
              </Link>
              <Link href="/contacts" className="border-2 border-white/30 hover:border-white text-white px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 backdrop-blur-sm">
                💬 {t('promo.contactUsFinal')}
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>{t('promo.securePaymentFinal')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span>{t('promo.easyReturn30')}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('promo.manufacturerWarranty')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('home.featured.title')}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">{t('home.featured.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
                <Link href="/shop" className="btn-primary text-lg px-8 py-3">
                  {t('home.featured.viewAll')}
                </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-4">{t('home.newsletter.title')}</h2>
              <p className="text-xl mb-8">{t('home.newsletter.subtitle')}</p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder={t('home.newsletter.email')}
              className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-primary-600 px-6 py-3 rounded-r-lg font-medium hover:bg-gray-100 transition-colors">
{t('home.newsletter.subscribe')}
            </button>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 animate-bounce group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

      {/* Enhanced Newsletter Signup Section */}
      <section className="py-24 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 text-white relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-bounce delay-500"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-bounce delay-1500"></div>
          <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-bounce delay-2000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          {/* Marketing Badge */}
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg animate-bounce">
            <span className="animate-spin">🎁</span>
            <span className="mx-2">GET 20% OFF YOUR FIRST ORDER + EXCLUSIVE DEALS!</span>
            <span className="animate-spin">🎁</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              JOIN 10,000+ SMART SHOPPERS
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Get exclusive deals, early access to sales, and tech tips delivered to your inbox
          </p>
          
          {/* Enhanced Newsletter Form */}
          <div className="max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-5 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 text-lg font-medium shadow-xl border-2 border-white/20"
              />
              <button className="bg-white text-orange-600 hover:bg-gray-100 px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-white/20">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🎁</span>
                  <span>GET 20% OFF</span>
                </div>
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">🔒</span>
                <span>100% secure</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📧</span>
                <span>Weekly deals</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Social Proof */}
          <div className="mt-12 bg-white/15 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/30 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-black text-white mb-2">10,000+</div>
                <div className="text-white/90 font-medium">Happy Subscribers</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-black text-white mb-2">4.9/5</div>
                <div className="text-white/90 font-medium">Average Rating</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-black text-white mb-2">50%</div>
                <div className="text-white/90 font-medium">Average Savings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}


