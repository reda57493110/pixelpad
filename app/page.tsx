'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { getAllProducts, clearProductsCache } from '@/lib/products'
import {
  ShieldCheckIcon,
  TruckIcon,
  StarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid'
import { CheckCircleIcon as CheckCircleIconOutline } from '@heroicons/react/24/outline'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
      observer.disconnect()
    }
  }, [])

  return [ref, isVisible] as const
}

export default function HomePage() {
  const { t, isRTL } = useLanguage()
  const { addItem } = useCart()
  const searchParams = useSearchParams()
  const [showOrderSuccess, setShowOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [discountProducts, setDiscountProducts] = useState<Product[]>([])
  const [heroFlagged, setHeroFlagged] = useState<Product[]>([])
  const [flaggedNewArrivals, setFlaggedNewArrivals] = useState<Product[]>([])
  const [flaggedBestSellers, setFlaggedBestSellers] = useState<Product[]>([])
  const [flaggedSpecialOffers, setFlaggedSpecialOffers] = useState<Product[]>([])
  const [flaggedTrending, setFlaggedTrending] = useState<Product[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [newArrivalsScroll, setNewArrivalsScroll] = useState(0)
  const [isNewArrivalsPaused, setIsNewArrivalsPaused] = useState(false)
  const [bestSellersScroll, setBestSellersScroll] = useState(0)
  const [isBestSellersPaused, setIsBestSellersPaused] = useState(false)
  const [specialOffersScroll, setSpecialOffersScroll] = useState(0)
  const [isSpecialOffersPaused, setIsSpecialOffersPaused] = useState(false)
  const [trendingScroll, setTrendingScroll] = useState(0)
  const [isTrendingPaused, setIsTrendingPaused] = useState(false)
  // Removed backgroundImageKey - using static path for better caching

  // Add CSS animations for dynamic product layouts (only once)
  useEffect(() => {
    // Check if animation already exists
    if (document.getElementById('fadeInUp-animation')) return
    
    const style = document.createElement('style')
    style.id = 'fadeInUp-animation'
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      const existingStyle = document.getElementById('fadeInUp-animation')
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [])

  // Preload product images for faster display
  useEffect(() => {
    if (featuredProducts.length > 0) {
      featuredProducts.slice(0, 3).forEach((product) => {
        if (product.image) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = product.image
          link.setAttribute('fetchpriority', 'high')
          document.head.appendChild(link)
        }
      })
    }
  }, [featuredProducts])

  // Preload hero product image
  useEffect(() => {
    if (heroFlagged.length > 0 && heroFlagged[0]?.image) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = heroFlagged[0].image
      link.setAttribute('fetchpriority', 'high')
      document.head.appendChild(link)
    }
  }, [heroFlagged])

  // Load products from database - Optimized
  useEffect(() => {
    let isMounted = true
    let loadingTimeout: NodeJS.Timeout
    
    // Background image is preloaded in layout.tsx for fast loading
    
    const loadProducts = async () => {
      try {
        // Set loading state immediately
        setIsLoaded(false)
        
        // Use cache for faster loading - only bypass on product changes
        // Load products with cache for faster initial load
        // But if cache is empty or stale, bypass to get fresh data
        let products = await getAllProducts(false)
        
        // If cache returned empty or we got no products, try bypassing cache
        if (!products || products.length === 0) {
          console.log('Cache returned empty, fetching fresh products...')
          clearProductsCache()
          products = await getAllProducts(true)
        }
        
        // Auto-setup homepage flags if no products have flags set
        const hasAnyFlags = products.some(p => 
          p.showInHero || p.showOnHomeCarousel || p.showInNewArrivals || 
          p.showInBestSellers || p.showInSpecialOffers || p.showInTrending
        )
        
        if (products.length > 0 && !hasAnyFlags) {
          console.log('No products have homepage flags set. Auto-setting flags...')
          try {
            await fetch('/api/products/setup-homepage', { method: 'POST' })
            // Reload products after setting flags (bypass cache for fresh data)
            clearProductsCache()
            const updatedProducts = await getAllProducts(true)
            if (isMounted) {
              setAllProducts(updatedProducts)
              // Apply the same logic with updated products
              const carouselProducts = updatedProducts.filter(p => p.showOnHomeCarousel === true)
              setFeaturedProducts(carouselProducts.length > 0 ? carouselProducts : updatedProducts.slice(0, 5))
              const heroProducts = updatedProducts.filter(p => p.showInHero === true)
              setHeroFlagged(heroProducts.length > 0 ? heroProducts : updatedProducts.slice(0, 1))
              setFlaggedNewArrivals(updatedProducts.filter(p => p.showInNewArrivals === true))
              setFlaggedBestSellers(updatedProducts.filter(p => p.showInBestSellers === true))
              setFlaggedSpecialOffers(updatedProducts.filter(p => p.showInSpecialOffers === true))
              setFlaggedTrending(updatedProducts.filter(p => p.showInTrending === true))
              // Clear the fallback timeout since we loaded successfully
              if (loadingTimeout) clearTimeout(loadingTimeout)
              setIsLoaded(true)
              return
            }
          } catch (setupError) {
            console.error('Error auto-setting homepage flags:', setupError)
            // Continue with fallback logic
          }
        }
        
        if (!isMounted) return
        
        if (!products || products.length === 0) {
          console.warn('No products found in database')
          setIsLoaded(true)
          return
        }
        
        // Preload product images immediately for faster display
        if (products && products.length > 0 && typeof window !== 'undefined') {
          // Preload first 10 product images (hero + carousel) for instant display
          products.slice(0, 10).forEach((product) => {
            if (product.image) {
              const img = document.createElement('img')
              img.src = product.image
              img.loading = 'eager'
              // @ts-ignore - fetchPriority is supported in modern browsers
              img.fetchPriority = 'high'
              // Start loading the image
              document.body.appendChild(img)
              // Remove it immediately after it starts loading
              setTimeout(() => {
                if (img.parentNode) {
                  img.parentNode.removeChild(img)
                }
              }, 0)
            }
          })
          
          // Prefetch products API immediately in background for faster navigation
          fetch('/api/products/page', { method: 'HEAD' }).catch(() => {})
          fetch('/api/products', { method: 'HEAD' }).catch(() => {})
        }
        
        setAllProducts(products)
        
        // Use flagged products, but fallback to all products if no flags are set
        // Carousel: only products with showOnHomeCarousel === true, or fallback to first 5 products
        const carouselProducts = products.filter(p => p.showOnHomeCarousel === true)
        setFeaturedProducts(carouselProducts.length > 0 ? carouselProducts : products.slice(0, 5))
        
        // Flagged sections - Use flagged products or fallback to first product
        const heroProducts = products.filter(p => p.showInHero === true)
        setHeroFlagged(heroProducts.length > 0 ? heroProducts : products.slice(0, 1))
        setFlaggedNewArrivals(products.filter(p => p.showInNewArrivals === true))
        setFlaggedBestSellers(products.filter(p => p.showInBestSellers === true))
        setFlaggedSpecialOffers(products.filter(p => p.showInSpecialOffers === true))
        setFlaggedTrending(products.filter(p => p.showInTrending === true))
        
        // Clear old fallback arrays
            setNewArrivals([])
            setBestSellers([])
        setTrendingProducts([])
        setDiscountProducts([])
        
        // Mark as loaded after products are set
        // Clear the fallback timeout since we loaded successfully
        if (isMounted) {
          if (loadingTimeout) {
            clearTimeout(loadingTimeout)
          }
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Error loading products:', error)
        if (!isMounted) return
        setFeaturedProducts([])
        setAllProducts([])
        setNewArrivals([])
        setBestSellers([])
        setTrendingProducts([])
        setDiscountProducts([])
        setHeroFlagged([])
        setFlaggedNewArrivals([])
        setFlaggedBestSellers([])
        setFlaggedSpecialOffers([])
        setFlaggedTrending([])
        setIsLoaded(true) // Still mark as loaded to show the page even if there's an error
      }
    }
    
    loadProducts()
    
    const handleChange = () => {
      if (isMounted) {
        // Clear cache when products change to get fresh data
        clearProductsCache()
        loadProducts()
      }
    }
    window.addEventListener('pixelpad_products_changed', handleChange)
    
    // Fallback: mark as loaded after 500ms if products haven't loaded yet (ultra-fast display)
    loadingTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoaded(true)
      }
    }, 500)
    
    return () => {
      isMounted = false
      if (loadingTimeout) clearTimeout(loadingTimeout)
      window.removeEventListener('pixelpad_products_changed', handleChange)
    }
  }, [])

  // Scroll animation hooks
  const [heroRef, heroVisible] = useScrollAnimation()
  const [carouselRef, carouselVisible] = useScrollAnimation()
  const [benefitsRef, benefitsVisible] = useScrollAnimation()

  // Hero: ONLY use products explicitly flagged with showInHero
  const heroProduct = heroFlagged.length > 0 ? heroFlagged[0] : null
  
  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || featuredProducts.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, featuredProducts.length])


  // Handle scroll events to pause auto-play during scrolling
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    let isScrolling = false

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true
        setIsAutoPlaying(false)
      }

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        isScrolling = false
        setIsAutoPlaying(true)
      }, 1000) // Resume auto-play 1 second after scrolling stops
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('wheel', handleScroll, { passive: true })
    window.addEventListener('touchmove', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('wheel', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  const nextSlide = () => {
    if (featuredProducts.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length)
  }
  
  const prevSlide = () => {
    if (featuredProducts.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)
  }
  
  const goToSlide = (index: number) => {
    if (featuredProducts.length === 0) return
    setCurrentSlide(index)
  }

  // Facts/Benefits data
  const benefits = [
    {
      icon: ShieldCheckIcon,
      title: '2-Year Warranty',
      description: 'Full protection on all products',
      color: 'primary'
    },
    {
      icon: TruckIcon,
      title: 'Fast Delivery',
      description: '24h express shipping',
      color: 'blue'
    },
    {
      icon: StarIcon,
      title: '4.9/5 Rating',
      description: '10,000+ happy customers',
      color: 'primary'
    },
    {
      icon: CheckCircleIcon,
      title: '30-Day Returns',
      description: 'Easy returns & exchanges',
      color: 'blue'
    }
  ]

  // Use flagged products, but fallback to all products if no flags are set
  const specialOffersToShow = flaggedSpecialOffers.length > 0 ? flaggedSpecialOffers : allProducts.slice(0, 10)
  const newArrivalsToShow = flaggedNewArrivals.length > 0 ? flaggedNewArrivals : allProducts.slice(0, 10)
  const bestSellersToShow = flaggedBestSellers.length > 0 ? flaggedBestSellers : allProducts.slice(0, 10)
  const trendingToShow = flaggedTrending.length > 0 ? flaggedTrending : allProducts.slice(0, 10)

  // Auto-scroll New Arrivals carousel - starts automatically with smooth animation
  useEffect(() => {
    if (newArrivalsToShow.length === 0) return
    
    // Reset scroll position to start from beginning when products change
    setNewArrivalsScroll(0)
    
    let animationFrameId: number
    let lastTime = 0
    const scrollSpeed = 0.5 // pixels per frame for smooth scrolling
    
    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      if (!isNewArrivalsPaused && deltaTime > 0) {
        setNewArrivalsScroll((prev) => {
          // Mobile: 280px card + 14px gap = 294px, Small mobile: 300px + 14px = 314px, Desktop: 280px card + 14px gap = 294px
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
          const isSmallMobile = typeof window !== 'undefined' && window.innerWidth >= 375 && window.innerWidth < 640
          const cardWidth = isSmallMobile ? 314 : isMobile ? 294 : 294
          const totalWidth = newArrivalsToShow.length * cardWidth
          const nextScroll = prev + scrollSpeed
          
          if (nextScroll >= totalWidth) {
            return 0
          }
          return nextScroll
        })
      }
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animationFrameId = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isNewArrivalsPaused, newArrivalsToShow.length])

  // Auto-scroll Best Sellers carousel - smooth animation
  useEffect(() => {
    if (bestSellersToShow.length === 0) return
    
    let animationFrameId: number
    let lastTime = 0
    const scrollSpeed = 0.5
    
    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      if (!isBestSellersPaused && deltaTime > 0) {
        setBestSellersScroll((prev) => {
          // Mobile: 280px card + 14px gap = 294px, Small mobile: 300px + 14px = 314px, Desktop: 280px card + 14px gap = 294px
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
          const isSmallMobile = typeof window !== 'undefined' && window.innerWidth >= 375 && window.innerWidth < 640
          const cardWidth = isSmallMobile ? 314 : isMobile ? 294 : 294
          const totalWidth = bestSellersToShow.length * cardWidth
          const nextScroll = prev + scrollSpeed
          
          if (nextScroll >= totalWidth) {
            return 0
          }
          return nextScroll
        })
      }
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animationFrameId = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isBestSellersPaused, bestSellersToShow.length])

  // Auto-scroll Special Offers carousel - smooth animation
  useEffect(() => {
    if (specialOffersToShow.length === 0) return
    
    let animationFrameId: number
    let lastTime = 0
    const scrollSpeed = 0.5
    
    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      if (!isSpecialOffersPaused && deltaTime > 0) {
        setSpecialOffersScroll((prev) => {
          // Mobile: 280px card + 14px gap = 294px, Small mobile: 300px + 14px = 314px, Desktop: 280px card + 14px gap = 294px
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
          const isSmallMobile = typeof window !== 'undefined' && window.innerWidth >= 375 && window.innerWidth < 640
          const cardWidth = isSmallMobile ? 314 : isMobile ? 294 : 294
          const totalWidth = specialOffersToShow.length * cardWidth
          const nextScroll = prev + scrollSpeed
          
          if (nextScroll >= totalWidth) {
            return 0
          }
          return nextScroll
        })
      }
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animationFrameId = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isSpecialOffersPaused, specialOffersToShow.length])

  // Auto-scroll Trending carousel - smooth animation
  useEffect(() => {
    if (trendingToShow.length === 0) return
    
    let animationFrameId: number
    let lastTime = 0
    const scrollSpeed = 0.5
    
    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      if (!isTrendingPaused && deltaTime > 0) {
        setTrendingScroll((prev) => {
          // Mobile: 280px card + 14px gap = 294px, Small mobile: 300px + 14px = 314px, Desktop: 280px card + 14px gap = 294px
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
          const isSmallMobile = typeof window !== 'undefined' && window.innerWidth >= 375 && window.innerWidth < 640
          const cardWidth = isSmallMobile ? 314 : isMobile ? 294 : 294
          const totalWidth = trendingToShow.length * cardWidth
          const nextScroll = prev + scrollSpeed
          
          if (nextScroll >= totalWidth) {
            return 0
          }
          return nextScroll
        })
      }
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animationFrameId = requestAnimationFrame(animate)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isTrendingPaused, trendingToShow.length])

  // Check for order success message
  useEffect(() => {
    const orderSuccess = searchParams?.get('orderSuccess')
    const orderIdParam = searchParams?.get('orderId')
    if (orderSuccess === '1' && orderIdParam) {
      setShowOrderSuccess(true)
      setOrderId(orderIdParam)
      // Clean URL
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete('orderSuccess')
      newParams.delete('orderId')
      const newUrl = newParams.toString() ? `${window.location.pathname}?${newParams.toString()}` : window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams])

  return (
    <div className={`relative acid-surface overflow-x-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Order Success Message for Guests */}
      {showOrderSuccess && orderId && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[200] bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-300 dark:border-green-700 rounded-lg shadow-xl p-4 max-w-md w-full mx-4">
          <div className="flex items-start gap-3">
            <CheckCircleIconOutline className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-green-800 dark:text-green-200 mb-1">
                {t('checkout.orderPlaced') || 'Order Placed Successfully!'}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                {t('checkout.orderId') || 'Order ID'}: <span className="font-mono font-semibold">{orderId}</span>
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                {t('checkout.orderPlacedSuccess') || 'Your order has been sent, wait for confirmation with you.'}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/track-order?orderId=${encodeURIComponent(orderId)}`}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {t('checkout.trackOrder') || 'Track Order'}
                </Link>
                <button
                  onClick={() => setShowOrderSuccess(false)}
                  className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  {t('checkout.close') || 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Animation */}
      {!isLoaded && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black z-[9999] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white text-xl font-bold animate-pulse">PIXEL PAD</div>
          </div>
        </div>
      )}

      {/* Hero Section with Carousel - Single Background */}
      <div
        className="relative overflow-x-hidden scroll-snap-align-start bg-cover bg-center bg-no-repeat w-full hero-background"
        style={{
          backgroundImage: `url('/images/hero-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          willChange: 'transform',
          // Force immediate rendering
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-primary-500/8 to-primary-600/12 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-white/25 dark:to-gray-900/25 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_60%),radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.12),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/5 via-transparent to-transparent pointer-events-none" />
        
        {/* Hero Section - Featured Product */}
        {heroProduct && (
          <section
            ref={heroRef}
            className="relative pt-20 sm:pt-12 md:pt-16 lg:pt-20 pb-4 sm:pb-0 min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] lg:min-h-[75vh]"
          >
            <div className="relative max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
              <div className={`flex ${isRTL ? 'justify-center lg:justify-start' : 'justify-center sm:justify-center lg:justify-end'}`}>
                <div className="w-full max-w-[320px] sm:max-w-sm md:max-w-md lg:max-w-md bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-gray-200/80 dark:border-gray-700/80 shadow-2xl p-2 sm:p-2.5 md:p-2.5 lg:p-3 transform hover:scale-[1.02] transition-transform duration-300">
                  <ProductCard product={heroProduct} variant="hero" hideIds />
                </div>
              </div>
            </div>
          </section>
        )}

      {/* Featured Products Carousel - refined styling */}
        <section 
          ref={carouselRef} 
          className="pt-4 sm:pt-0 pb-6 sm:pb-8 md:pb-10 lg:pb-12 relative"
        >
        <div className="relative max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Carousel */}
          {featuredProducts.length === 0 ? (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl p-12 text-center border border-gray-100/70 dark:border-gray-700/60 shadow-xl">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {t('home.featured.noProducts') || 'No featured products available'}
              </p>
            </div>
          ) : (
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100/70 dark:border-gray-700/60 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-full w-full bg-white/40 dark:bg-black/20 backdrop-blur-[1px]" />
              </div>
              <div 
                className="overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                onTouchStart={() => setIsAutoPlaying(false)}
                onTouchEnd={() => {
                  setTimeout(() => setIsAutoPlaying(true), 2000)
                }}
              >
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ 
                    transform: isRTL 
                      ? `translateX(${currentSlide * 100}%)`
                      : `translateX(-${currentSlide * 100}%)`
                  }}
                >
                  {featuredProducts.map((product) => {
                    const looksLikeId = (value?: string) => typeof value === 'string' && /^[0-9a-f]{24}$/i.test(value.trim())
                    const displayName = looksLikeId(product.name) ? '' : product.name
                    const displayDescription = looksLikeId(product.description) ? '' : product.description
                    
                    return (
                      <div key={product.id} className="w-full flex-shrink-0 px-2 sm:px-2.5 md:px-3 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-2.5 md:p-3 lg:p-4 shadow-lg hover:shadow-2xl border border-gray-100/80 dark:border-gray-700 transition-all duration-300">
                          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 items-center ${isRTL ? 'rtl' : 'ltr'}`}>
                            {/* Product Image */}
                            <div className="relative">
                              <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-md sm:rounded-lg lg:rounded-xl p-2 sm:p-2.5 md:p-3 lg:p-3 flex items-center justify-center relative overflow-hidden">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={displayName}
                                    fill
                                    className="object-contain rounded-xl"
                                    priority
                                    loading="eager"
                                    fetchPriority="high"
                                  />
                                ) : (
                                  <div className="text-8xl">💻</div>
                                )}
                              </div>
                              
                              {product.originalPrice && (
                                <div className={`absolute top-1 sm:top-1.5 lg:top-3 ${isRTL ? 'right-1 sm:right-1.5 lg:right-3' : 'left-1 sm:left-1.5 lg:left-3'} bg-primary-500 text-white px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 rounded-full text-[8px] sm:text-[9px] lg:text-xs font-bold shadow`}>
                                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                </div>
                              )}
                            </div>
                            
                            {/* Product Info - Enhanced */}
                            <div className="space-y-1.5 sm:space-y-2 lg:space-y-4">
                              {/* Badge & Title Section */}
                              <div>
                                {product.originalPrice && (
                                  <div className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 lg:px-3 py-0.5 mb-1.5 sm:mb-2 lg:mb-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-[8px] sm:text-[9px] lg:text-xs font-bold shadow-md">
                                    <span className="text-[8px] sm:text-[9px]">🔥</span>
                                    <span>LIMITED OFFER</span>
                                  </div>
                                )}
                                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-2 sm:mb-2.5 md:mb-3 lg:mb-3 leading-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                                  {displayName}
                                </h3>
                                <p className="text-sm sm:text-sm md:text-base lg:text-base text-gray-600 dark:text-gray-300 mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 leading-relaxed line-clamp-2">
                                  {displayDescription}
                                </p>
                              </div>
                              
                              {/* Enhanced Price Section */}
                              <div className="space-y-2">
                                <div className="flex items-baseline gap-1.5 sm:gap-2 lg:gap-3 flex-wrap">
                                  <span className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-black text-primary-600 dark:text-primary-400">
                                    {product.price} <span className="text-xs sm:text-sm lg:text-lg">MAD</span>
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-xs sm:text-sm lg:text-lg text-gray-500 dark:text-gray-400 line-through">
                                      {product.originalPrice} MAD
                                    </span>
                                  )}
                                </div>
                                {product.originalPrice && (
                                  <>
                                    <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-bold">
                                      Save {product.originalPrice - product.price} MAD
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 font-medium">
                                      <span className="text-[10px] sm:text-xs">✨</span>
                                      <span>Best Price Guaranteed</span>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              {/* Enhanced CTA Button */}
                              <button
                                onClick={() => {
                                  if (product.inStock) {
                                    addItem({
                                      productId: String(product.id),
                                      variantId: undefined,
                                      name: displayName || product.name,
                                      price: product.price,
                                      image: product.image
                                    }, 1)
                                  }
                                }}
                                disabled={!product.inStock}
                                className="group block w-full bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 hover:from-primary-700 hover:via-primary-800 hover:to-primary-700 text-white px-4 sm:px-5 md:px-6 lg:px-6 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-lg sm:rounded-lg lg:rounded-xl font-bold text-sm sm:text-base md:text-base lg:text-base text-center transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-100 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2">
                                  <span>{t('product.addToCart') || 'Add to Cart'}</span>
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                              </button>
                              
                              {/* Trust Badges */}
                              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 pt-1 sm:pt-1.5 lg:pt-2">
              <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] lg:text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>Fast Shipping</span>
                                </div>
              <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] lg:text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span>30-Day Returns</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Navigation - Only show if more than 1 product */}
              {featuredProducts.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className={`absolute ${isRTL ? 'right-2 sm:right-3 md:right-4 lg:right-4' : 'left-2 sm:left-3 md:left-4 lg:left-4'} top-1/2 transform -translate-y-1/2 bg-white/95 dark:bg-gray-800/95 text-primary-600 p-2 sm:p-2.5 md:p-3 lg:p-2.5 rounded-full shadow-xl hover:bg-primary-100 dark:hover:bg-gray-700 transition-all duration-300 z-10 pointer-events-auto touch-manipulation`}
                    aria-label="Previous slide"
                  >
                    <div dir="ltr">
                      <svg className="w-5 h-5 sm:w-5 md:w-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                      </svg>
                    </div>
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    className={`absolute ${isRTL ? 'left-2 sm:left-3 md:left-4 lg:left-4' : 'right-2 sm:right-3 md:right-4 lg:right-4'} top-1/2 transform -translate-y-1/2 bg-white/95 dark:bg-gray-800/95 text-primary-600 p-2 sm:p-2.5 md:p-3 lg:p-2.5 rounded-full shadow-xl hover:bg-primary-100 dark:hover:bg-gray-700 transition-all duration-300 z-10 pointer-events-auto touch-manipulation`}
                    aria-label="Next slide"
                  >
                    <div dir="ltr">
                      <svg className="w-5 h-5 sm:w-5 md:w-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                      </svg>
                    </div>
                  </button>
                  
                  {/* Dot Indicators */}
                  <div className="flex justify-center mt-3 sm:mt-4 lg:mt-6 space-x-1 sm:space-x-1.5">
                    {featuredProducts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-[2px] h-[2px] sm:w-[6px] sm:h-[6px] rounded-full transition-all duration-200 border ${
                          index === currentSlide
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-400 dark:border-gray-500 bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
      </div>

      {/* New Arrivals Section - Enhanced Colors */}
      <section className="py-8 sm:py-10 md:py-12 bg-white dark:bg-gray-900 scroll-snap-align-start overflow-x-hidden relative sm:relative">
        {/* Decorative top and bottom borders - mobile only */}
        <div className="sm:hidden absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        <div className="sm:hidden absolute top-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
        <div className="sm:hidden absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        <div className="sm:hidden absolute bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
        {/* Corner accent dots - mobile only */}
        <div className="sm:hidden absolute top-2 left-4 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="sm:hidden absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="sm:hidden absolute bottom-2 left-4 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="sm:hidden absolute bottom-2 right-4 w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full relative z-10">
          <div className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 mb-6 sm:mb-7 text-center transition-transform duration-300 hover:-translate-y-0.5">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5">
              <h2 className="text-xl sm:text-2xl md:text-[28px] lg:text-[30px] font-black text-primary-700 dark:text-primary-300">
                {t('home.newArrivals') || 'New Arrivals'}
              </h2>
              <span className="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200 border border-primary-200/70 dark:border-primary-700/60">
                Pro Picks
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium px-2">
              {t('home.newArrivalsDesc') || 'Discover our latest products'}
            </p>
            <Link 
              href="/products" 
              className="group bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 hover:from-primary-700 hover:via-primary-800 hover:to-primary-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 relative overflow-hidden mt-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('home.featured.viewAll')}
                <span className={isRTL ? 'transform rotate-180' : ''}>→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
          </div>
          
          {newArrivalsToShow.length > 0 ? (
            <div 
              className="overflow-x-hidden relative w-full max-w-full -mx-2 px-2 sm:-mx-4 sm:px-4 md:mx-0 md:px-0"
              onMouseEnter={() => setIsNewArrivalsPaused(true)}
              onMouseLeave={() => setIsNewArrivalsPaused(false)}
              onTouchStart={() => setIsNewArrivalsPaused(true)}
              onTouchEnd={() => {
                setTimeout(() => setIsNewArrivalsPaused(false), 1000)
              }}
            >
              <div 
                className="flex gap-3.5 md:gap-3.5"
                style={{
                  transform: isRTL 
                    ? `translateX(${newArrivalsScroll}px)`
                    : `translateX(-${newArrivalsScroll}px)`,
                  width: 'max-content',
                  willChange: 'transform',
                  transition: isNewArrivalsPaused ? 'transform 0.3s ease-out' : 'none',
                  pointerEvents: 'auto'
                }}
              >
                {/* Duplicate products for seamless infinite loop */}
                {[...newArrivalsToShow, ...newArrivalsToShow].map((product, index) => (
                  <div
                    key={`${product.id}-${index}`}
                    className="w-[280px] xs:w-[300px] sm:w-[300px] md:w-[280px] flex-shrink-0 relative z-0"
                    style={{ minWidth: '280px' }}
                  >
                    <div className="w-full h-full relative isolate">
                      <ProductCard product={product} hideIds />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {t('home.featured.noProducts') || 'No new arrivals available'}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section - Simplified */}
      <section className="py-8 sm:py-10 md:py-12 bg-white dark:bg-gray-900 scroll-snap-align-start overflow-x-hidden relative sm:relative">
        {/* Decorative side borders with shadow - mobile only */}
        <div className="sm:hidden absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600 shadow-sm"></div>
        <div className="sm:hidden absolute left-1 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
        <div className="sm:hidden absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600 shadow-sm"></div>
        <div className="sm:hidden absolute right-1 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
        {/* Top and bottom accent lines - mobile only */}
        <div className="sm:hidden absolute top-3 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        <div className="sm:hidden absolute bottom-3 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full relative z-10">
          <div className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 mb-6 sm:mb-7 text-center transition-transform duration-300 hover:-translate-y-0.5">
            <h2 className="text-xl sm:text-2xl md:text-[28px] lg:text-[30px] font-black text-primary-700 dark:text-primary-300">
              {t('home.featured.title') || 'Our Best Sellers'}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium px-2">
              {t('home.featured.subtitle') || 'Technology solutions handpicked for exceptional quality and performance'}
            </p>
            <Link 
              href="/products" 
              className="group bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 hover:from-primary-700 hover:via-primary-800 hover:to-primary-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 relative overflow-hidden mt-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('home.featured.viewAll')}
                <span className={isRTL ? 'transform rotate-180' : ''}>→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
          </div>
          
          {bestSellersToShow.length > 0 ? (
            <div 
              className="overflow-x-hidden relative w-full max-w-full -mx-2 px-2 sm:-mx-4 sm:px-4 md:mx-0 md:px-0"
              onMouseEnter={() => setIsBestSellersPaused(true)}
              onMouseLeave={() => setIsBestSellersPaused(false)}
              onTouchStart={() => setIsBestSellersPaused(true)}
              onTouchEnd={() => {
                setTimeout(() => setIsBestSellersPaused(false), 1000)
              }}
            >
              <div 
                className="flex gap-3.5 md:gap-3.5"
                style={{
                  transform: isRTL 
                    ? `translateX(${bestSellersScroll}px)`
                    : `translateX(-${bestSellersScroll}px)`,
                  width: 'max-content',
                  willChange: 'transform',
                  transition: isBestSellersPaused ? 'transform 0.3s ease-out' : 'none',
                  pointerEvents: 'auto'
                }}
              >
                {[...bestSellersToShow, ...bestSellersToShow].map((product, index) => (
                  <div
                    key={`${product.id}-${index}`}
                    className="w-[280px] xs:w-[300px] sm:w-[300px] md:w-[280px] flex-shrink-0 relative z-0"
                    style={{ minWidth: '280px' }}
                  >
                    <div className="w-full h-full relative isolate">
                      <ProductCard product={product} hideIds />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {t('home.featured.noProducts') || 'No best sellers available'}
            </div>
          )}
        </div>
      </section>

      {/* Special Offers Section - Simplified */}
      <section className="py-8 sm:py-10 md:py-12 bg-white dark:bg-gray-900 scroll-snap-align-start overflow-x-hidden relative sm:relative">
        {/* Decorative top and bottom borders - mobile only */}
        <div className="sm:hidden absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        <div className="sm:hidden absolute top-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
        <div className="sm:hidden absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        <div className="sm:hidden absolute bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
        {/* Diagonal corner accents - mobile only */}
        <div className="sm:hidden absolute top-3 left-3 w-6 h-6 border-t border-l border-gray-300 dark:border-gray-600 rounded-br-md z-20 pointer-events-none"></div>
        <div className="sm:hidden absolute top-3 right-3 w-6 h-6 border-t border-r border-gray-300 dark:border-gray-600 rounded-bl-md z-20 pointer-events-none"></div>
        <div className="sm:hidden absolute bottom-2 left-3 w-6 h-6 border-b border-l border-gray-300 dark:border-gray-600 rounded-tr-md z-20 pointer-events-none"></div>
        <div className="sm:hidden absolute bottom-2 right-3 w-6 h-6 border-b border-r border-gray-300 dark:border-gray-600 rounded-tl-md z-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full relative z-10">
          <div className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 mb-6 sm:mb-7 text-center transition-transform duration-300 hover:-translate-y-0.5">
            <h2 className="text-xl sm:text-2xl md:text-[28px] lg:text-[30px] font-black text-primary-700 dark:text-primary-300">
              {t('home.specialOffers') || 'Special Offers'}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium px-2">
              {t('home.specialOffersDesc') || 'Exclusive deals and promotions'}
            </p>
            <Link 
              href="/products" 
              className="group bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 hover:from-primary-700 hover:via-primary-800 hover:to-primary-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 relative overflow-hidden mt-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('home.featured.viewAll')}
                <span className={isRTL ? 'transform rotate-180' : ''}>→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
          </div>
          
          {specialOffersToShow.length > 0 ? (
            <div 
              className="overflow-x-hidden relative w-full max-w-full -mx-2 px-2 sm:-mx-4 sm:px-4 md:mx-0 md:px-0"
              onMouseEnter={() => setIsSpecialOffersPaused(true)}
              onMouseLeave={() => setIsSpecialOffersPaused(false)}
              onTouchStart={() => setIsSpecialOffersPaused(true)}
              onTouchEnd={() => {
                setTimeout(() => setIsSpecialOffersPaused(false), 1000)
              }}
            >
              <div 
                className="flex gap-3.5 md:gap-3.5"
                style={{
                  transform: isRTL 
                    ? `translateX(${specialOffersScroll}px)`
                    : `translateX(-${specialOffersScroll}px)`,
                  width: 'max-content',
                  willChange: 'transform',
                  transition: isSpecialOffersPaused ? 'transform 0.3s ease-out' : 'none',
                  pointerEvents: 'auto'
                }}
              >
                {[...specialOffersToShow, ...specialOffersToShow].map((product, index) => (
                  <div
                    key={`${product.id}-${index}`}
                    className="w-[280px] xs:w-[300px] sm:w-[300px] md:w-[280px] flex-shrink-0 relative z-0"
                    style={{ minWidth: '280px' }}
                  >
                    <div className="w-full h-full relative isolate">
                      <ProductCard product={product} hideIds />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {t('home.featured.noProducts') || 'No special offers available'}
            </div>
          )}
        </div>
      </section>

      {/* Trending Products Section - Simplified */}
      <section className="py-8 sm:py-10 md:py-12 bg-white dark:bg-gray-900 scroll-snap-align-start overflow-x-hidden relative sm:relative">
        {/* Decorative top and bottom borders - mobile only */}
        <div className="sm:hidden absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        <div className="sm:hidden absolute top-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
        <div className="sm:hidden absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        <div className="sm:hidden absolute bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
        {/* Center decorative line - mobile only */}
        <div className="sm:hidden absolute top-1/2 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600 transform -translate-y-1/2"></div>
        {/* Side accent lines - mobile only */}
        <div className="sm:hidden absolute top-6 left-2 bottom-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        <div className="sm:hidden absolute top-6 right-2 bottom-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full relative z-10">
          <div className="flex flex-col items-center gap-2 sm:gap-2.5 md:gap-3 mb-6 sm:mb-7 text-center transition-transform duration-300 hover:-translate-y-0.5">
            <h2 className="text-xl sm:text-2xl md:text-[28px] lg:text-[30px] font-black text-primary-700 dark:text-primary-300">
              {t('home.trending') || 'Trending Now'}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium px-2">
              {t('home.trendingDesc') || 'Highly rated products loved by customers'}
            </p>
            <Link 
              href="/products" 
              className="group bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 hover:from-primary-700 hover:via-primary-800 hover:to-primary-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 relative overflow-hidden mt-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('home.featured.viewAll')}
                <span className={isRTL ? 'transform rotate-180' : ''}>→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </Link>
          </div>
          
          {trendingToShow.length > 0 ? (
            <div 
              className="overflow-x-hidden relative w-full max-w-full -mx-2 px-2 sm:-mx-4 sm:px-4 md:mx-0 md:px-0"
              onMouseEnter={() => setIsTrendingPaused(true)}
              onMouseLeave={() => setIsTrendingPaused(false)}
              onTouchStart={() => setIsTrendingPaused(true)}
              onTouchEnd={() => {
                setTimeout(() => setIsTrendingPaused(false), 1000)
              }}
            >
              <div 
                className="flex gap-3.5 md:gap-3.5"
                style={{
                  transform: isRTL 
                    ? `translateX(${trendingScroll}px)`
                    : `translateX(-${trendingScroll}px)`,
                  width: 'max-content',
                  willChange: 'transform',
                  transition: isTrendingPaused ? 'transform 0.3s ease-out' : 'none',
                  pointerEvents: 'auto'
                }}
              >
                {[...trendingToShow, ...trendingToShow].map((product, index) => (
                  <div
                    key={`${product.id}-${index}`}
                    className="w-[280px] xs:w-[300px] sm:w-[300px] md:w-[280px] flex-shrink-0 relative z-0"
                    style={{ minWidth: '280px' }}
                  >
                    <div className="w-full h-full relative isolate">
                      <ProductCard product={product} hideIds />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {t('home.featured.noProducts') || 'No trending products available'}
            </div>
          )}
        </div>
      </section>

      {/* Discount Products Section removed */}

      {/* Why Choose Us */}
      <section ref={benefitsRef} className="py-8 sm:py-10 md:py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] lg:text-4xl font-black text-primary-700 dark:text-primary-300 mb-2">
              {t('promo.whyChooseUs') || 'Why Choose PIXEL PAD?'}
            </h2>
          </div>
          
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-5 lg:gap-5 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Quality Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.01] border border-gray-100 dark:border-gray-700 group text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                <ShieldCheckIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-black text-primary-700 dark:text-primary-300">
                {t('home.trust.quality') || 'Pro-Grade Quality'}
              </h3>
            </div>

            {/* Support Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.01] border border-gray-100 dark:border-gray-700 group text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                <StarIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-black text-primary-700 dark:text-primary-300">
                {t('home.trust.support') || 'Experts on Call'}
              </h3>
            </div>

            {/* Returns Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.01] border border-gray-100 dark:border-gray-700 group text-center">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                <CheckCircleIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-black text-primary-700 dark:text-primary-300">
                {t('home.trust.returns') || 'Hassle-Free Returns'}
              </h3>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
