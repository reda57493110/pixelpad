'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { getAllProducts, clearProductsCache } from '@/lib/products'
import OrganizationSchema from '@/components/OrganizationSchema'
import LocalBusinessSchema from '@/components/LocalBusinessSchema'
import {
  ShieldCheckIcon,
  TruckIcon,
  StarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid'
import { CheckCircleIcon as CheckCircleIconOutline } from '@heroicons/react/24/outline'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import HeroLoadingSpinner from '@/components/HeroLoadingSpinner'

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

// User Review Section Component
function UserReviewSection({ user, token, t, isRTL }: { user: any, token: string | null, t: any, isRTL: boolean }) {
  const [userReview, setUserReview] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch user's review
  useEffect(() => {
    const fetchReview = async () => {
      // Get token from localStorage if not provided
      const authToken = token || localStorage.getItem('pixelpad_token')
      
      if (!authToken) {
        setIsLoading(false)
        return
      }

      try {
        const authToken = token || localStorage.getItem('pixelpad_token')
        const response = await fetch('/api/reviews', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.review) {
            setUserReview(data.review)
            setRating(data.review.rating)
            setComment(data.review.comment)
          }
        }
      } catch (error) {
        console.error('Error fetching review:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReview()
  }, [token, user])

  const handleSave = async () => {
    const authToken = token || localStorage.getItem('pixelpad_token')
    if (!authToken || !rating || !comment.trim()) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ rating, comment: comment.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setUserReview(data.review)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving review:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const authToken = token || localStorage.getItem('pixelpad_token')
    if (!authToken) return

    try {
      const response = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        setUserReview(null)
        setComment('')
        setRating(5)
        setShowDeleteConfirm(false)
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  return (
    <div className="border-t border-primary-200 dark:border-primary-800 pt-2 sm:pt-4 md:pt-6 w-full relative z-20 bg-transparent block overflow-visible">
      <div className="text-center mb-2 sm:mb-4 md:mb-5 px-2">
        <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-900 dark:text-white">
          {t('testimonials.shareExperience') || 'Share your experience'}
        </h3>
      </div>

      {isLoading ? (
        // Loading state
        <div className="bg-white dark:bg-gray-800 rounded-md sm:rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 lg:p-5 shadow-md border border-gray-100/50 dark:border-gray-700/50 w-full sm:max-w-xl sm:mx-auto">
          <div className="animate-pulse space-y-2 sm:space-y-3">
            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-16 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      ) : userReview && !isEditing ? (
        // Display existing review
        <div className="group relative bg-white dark:bg-gray-800 rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2.5 md:p-4 lg:p-5 shadow-md border border-gray-100/50 dark:border-gray-700/50 overflow-hidden w-full sm:max-w-xl sm:mx-auto">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1 sm:mb-1.5 md:mb-2 lg:mb-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[9px] sm:text-[10px] md:text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  {t('common.edit') || 'Edit'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-[9px] sm:text-[10px] md:text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  {t('common.delete') || 'Delete'}
                </button>
              </div>
            </div>
            
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-1 sm:mb-2 md:mb-3 lg:mb-4 font-medium">
              &quot;{userReview.comment}&quot;
            </p>
            
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 pt-1 sm:pt-1.5 md:pt-2 lg:pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                  {user.name || 'You'}
                </h4>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                  Your Review
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Review form - Always show when no review exists or when editing
        <div className="bg-white dark:bg-gray-800 rounded-md sm:rounded-lg md:rounded-xl p-1.5 sm:p-2.5 md:p-4 lg:p-5 shadow-lg border border-primary-200 dark:border-primary-800 w-full sm:max-w-xl sm:mx-auto relative z-10">
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3 lg:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 md:mb-1.5">
                {t('testimonials.ratingRequired') || 'Rating'} <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="focus:outline-none touch-manipulation"
                    aria-label={`Rate ${i + 1} stars`}
                  >
                    <StarIcon
                      className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors ${
                        i < rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 md:mb-1.5">
                {t('testimonials.shareExperience') || 'Your Review'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('testimonials.shareExperience') || 'Share your experience...'}
                className="w-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2.5 border border-gray-300 dark:border-gray-600 rounded-md sm:rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-[11px] sm:text-xs md:text-sm lg:text-base focus:ring-1 sm:focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={2}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving || !rating || !comment.trim()}
                className="flex-1 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 hover:from-primary-700 hover:via-primary-800 hover:to-primary-700 text-white px-2.5 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-2.5 rounded-md sm:rounded-lg font-bold text-[11px] sm:text-xs md:text-sm lg:text-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {isSaving ? (t('common.saving') || 'Saving...') : (t('common.save') || 'Save Review')}
              </button>
              {userReview && (
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setComment(userReview.comment)
                    setRating(userReview.rating)
                  }}
                  className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-2.5 border border-gray-300 dark:border-gray-600 rounded-md sm:rounded-lg text-gray-700 dark:text-gray-300 text-[11px] sm:text-xs md:text-sm lg:text-base font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('testimonials.deleteConfirm') || 'Delete Review?'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              {t('testimonials.deleteConfirm') || 'Are you sure you want to delete your review? This action cannot be undone.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-colors"
              >
                {t('common.delete') || 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HomeClient() {
  const { t, isRTL } = useLanguage()
  const { addItem } = useCart()
  const { user, isLoggedIn, token } = useAuth()
  const router = useRouter()
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
  const [heroImageLoaded, setHeroImageLoaded] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)
  const [newArrivalsScroll, setNewArrivalsScroll] = useState(0)
  const [isNewArrivalsPaused, setIsNewArrivalsPaused] = useState(false)
  const [bestSellersScroll, setBestSellersScroll] = useState(0)
  const [isBestSellersPaused, setIsBestSellersPaused] = useState(false)
  const [specialOffersScroll, setSpecialOffersScroll] = useState(0)
  const [isSpecialOffersPaused, setIsSpecialOffersPaused] = useState(false)
  const [trendingScroll, setTrendingScroll] = useState(0)
  const [isTrendingPaused, setIsTrendingPaused] = useState(false)
  // Removed backgroundImageKey - using static path for better caching
  // fadeInUp animation is already defined in globals.css, no need for dynamic injection

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

  // Preload hero product image and track when it's loaded
  useEffect(() => {
    if (heroFlagged.length > 0 && heroFlagged[0]?.image) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = heroFlagged[0].image
      link.setAttribute('fetchpriority', 'high')
      document.head.appendChild(link)
      
      // Track when the hero product image is loaded
      const img = new window.Image()
      img.src = heroFlagged[0].image
      if (img.complete) {
        setHeroImageLoaded(true)
      } else {
        img.onload = () => setHeroImageLoaded(true)
        img.onerror = () => setHeroImageLoaded(true) // Continue even if image fails
      }
    } else {
      setHeroImageLoaded(true) // No hero product, consider it "loaded"
    }
  }, [heroFlagged])

  // Preload hero background images for smooth appearance - optimized
  useEffect(() => {
    // Start with loaded state if images are already cached
    const checkCache = () => {
      const lightImg = new window.Image()
      const darkImg = new window.Image()
      
      // Check if images are already cached
      lightImg.src = '/images/hero-background-light.jpg'
      darkImg.src = '/images/hero-background-dark.jpg'
      
      if (lightImg.complete && darkImg.complete) {
        setIsLoaded(true)
        return
      }
      
      // Otherwise, wait for both to load
      let lightLoaded = lightImg.complete
      let darkLoaded = darkImg.complete
      
      const checkComplete = () => {
        if (lightLoaded && darkLoaded) {
          setIsLoaded(true)
        }
      }
      
      if (!lightLoaded) {
        lightImg.onload = () => {
          lightLoaded = true
          checkComplete()
        }
        lightImg.onerror = () => {
          lightLoaded = true // Continue even if one fails
          checkComplete()
        }
      }
      
      if (!darkLoaded) {
        darkImg.onload = () => {
          darkLoaded = true
          checkComplete()
        }
        darkImg.onerror = () => {
          darkLoaded = true // Continue even if one fails
          checkComplete()
        }
      }
      
      checkComplete()
    }
    
    // Use requestIdleCallback for non-blocking preload
    if ('requestIdleCallback' in window) {
      requestIdleCallback(checkCache, { timeout: 100 })
    } else {
      setTimeout(checkCache, 50)
    }
  }, [])

  // Load products from database - Optimized with caching
  useEffect(() => {
    let isMounted = true
    
    // Show page immediately - don't block rendering
    setIsLoaded(true)
    
    const loadProducts = async () => {
      try {
        // Use cached data first for instant display, then refresh in background
        const cachedProducts = await getAllProducts(false) // Use cache first
        
        if (cachedProducts && cachedProducts.length > 0 && isMounted) {
          // Process cached data immediately for fast initial render
          processProducts(cachedProducts)
        }
        
        // Refresh data in background (non-blocking)
        const freshProducts = await getAllProducts(true).catch(() => cachedProducts || [])
        
        if (!isMounted) return
        
        if (!freshProducts || freshProducts.length === 0) {
          if (!cachedProducts || cachedProducts.length === 0) {
            console.warn('No products found')
          }
          return
        }
        
        // Auto-setup homepage flags in background (non-blocking)
        const hasAnyFlags = freshProducts.some(p => 
          p.showInHero || p.showOnHomeCarousel || p.showInNewArrivals || 
          p.showInBestSellers || p.showInSpecialOffers || p.showInTrending
        )
        
        if (freshProducts.length > 0 && !hasAnyFlags) {
          fetch('/api/products/setup-homepage', { method: 'POST' }).catch(() => {})
        }
        
        // Update with fresh data
        processProducts(freshProducts)
        
      } catch (error) {
        console.error('Error loading products:', error)
        if (!isMounted) return
        // Keep existing state on error, don't clear everything
      }
    }
    
    // Helper function to process products (reduces code duplication)
    const processProducts = (products: Product[]) => {
      if (!isMounted) return
      
      setAllProducts(products)
      setProductsLoading(false)
      
      // Use flagged products, but fallback to all products if no flags are set
      const carouselProducts = products.filter(p => p.showOnHomeCarousel === true)
      setFeaturedProducts(carouselProducts.length > 0 ? carouselProducts : products.slice(0, 5))
      
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
    }
    
    loadProducts()
    
    const handleChange = () => {
      if (isMounted) {
        clearProductsCache()
        loadProducts()
      }
    }
    window.addEventListener('pixelpad_products_changed', handleChange)
    
    return () => {
      isMounted = false
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

  // Reset scroll position only when products actually change (not on pause state changes)
  useEffect(() => {
    if (newArrivalsToShow.length > 0) {
      setNewArrivalsScroll(0)
    }
  }, [newArrivalsToShow.length])

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
    <div className={`relative acid-surface overflow-x-hidden overflow-y-visible ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'} style={{ touchAction: 'pan-y', minHeight: '100vh' }}>
      {/* Full-page loading spinner - shows until products and hero images are loaded */}
      <HeroLoadingSpinner isLoading={productsLoading || !isLoaded || !heroImageLoaded} />
      
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

      {/* Loading Animation - Removed to show page immediately */}

      {/* Hero Section with Background Image Extending Full Width */}
      <div className="relative overflow-x-hidden w-full" style={{ touchAction: 'pan-y' }}>
        {/* Hero Section - Featured Product with Background Image */}
        {heroProduct && (
          <section
            ref={heroRef}
            className="relative min-h-[60vh] sm:min-h-[calc(100vh-200px)]"
            style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch', position: 'relative', zIndex: 1 }}
          >
            {/* Background Image - Full Width Behind Everything */}
            <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ touchAction: 'none' }}>
              {/* Background image for light mode */}
              <div 
                className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-300 ease-out ${
                  isLoaded ? 'opacity-100 dark:opacity-0' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url('/images/hero-background-light.jpg')`,
                  imageRendering: 'auto',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                }}
              />
              {/* Background image for dark mode */}
              <div 
                className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-300 ease-out ${
                  isLoaded ? 'opacity-0 dark:opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url('/images/hero-background-dark.jpg')`,
                  imageRendering: 'auto',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                }}
              />
              {/* Subtle overlay for better visual balance */}
              <div className={`absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-white/10 dark:from-black/20 dark:via-transparent dark:to-gray-900/20 transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`} />
            </div>
            
            {/* Content Container */}
            <div className="relative z-10 min-h-[60vh] lg:min-h-[75vh] pt-28 sm:pt-20 md:pt-24 lg:pt-28">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch ${isRTL ? 'rtl' : 'ltr'}`}>
                {/* Left Side - Empty/Spacer (or can add content here) */}
                <div className={`hidden lg:block ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}></div>
                
                {/* Product Card Section - Right Side */}
                <div className={`flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-12 ${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-sm lg:max-w-md">
                    <ProductCard product={heroProduct} variant="hero" hideIds />
                  </div>
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
                        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 items-center ${isRTL ? 'rtl' : 'ltr'}`}>
                            {/* Product Image */}
                            <div className="relative">
                              <div className="aspect-square rounded-md sm:rounded-lg lg:rounded-xl overflow-hidden shadow-lg">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={displayName}
                                    fill
                                    className="object-cover"
                                    priority
                                    loading="eager"
                                    fetchPriority="high"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <div className="text-8xl">💻</div>
                                  </div>
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
                              
                              {/* Enhanced CTA Buttons */}
                              <div className="flex gap-2 sm:gap-2.5">
                                <button
                                  onClick={() => {
                                    router.push(`/products/${product.id}`)
                                  }}
                                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 sm:px-5 md:px-4 lg:px-5 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-lg sm:rounded-lg lg:rounded-xl font-bold text-sm sm:text-base md:text-base lg:text-base text-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-100"
                                >
                                  {t('product.viewDetails') || 'View Details'}
                                </button>
                                <button
                                  onClick={() => {
                                    addItem({
                                      productId: String(product.id),
                                      variantId: undefined,
                                      name: displayName || product.name,
                                      price: product.price,
                                      image: product.image
                                    }, 1)
                                  }}
                                  className="flex-1 group bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 hover:from-primary-700 hover:via-primary-800 hover:to-primary-700 text-white px-4 sm:px-5 md:px-6 lg:px-6 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-lg sm:rounded-lg lg:rounded-xl font-bold text-sm sm:text-base md:text-base lg:text-base text-center transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-100 relative overflow-hidden"
                                >
                                  <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2">
                                    <span>{t('product.addToCart') || 'Add to Cart'}</span>
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                  </span>
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                </button>
                              </div>
                              
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

      {/* Reviews Section */}
      <section className="py-6 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 scroll-snap-align-start overflow-x-hidden overflow-y-visible relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/10 dark:bg-primary-800/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-300/10 dark:bg-primary-700/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full relative z-10">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-6 sm:mb-10 md:mb-12 lg:mb-16 text-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-1 sm:mb-2">
              <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-[10px] sm:text-xs md:text-sm font-bold text-primary-700 dark:text-primary-300">
                {t('testimonials.verifiedBuyer') || 'Verified Reviews'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              {t('testimonials.title') || 'What our clients say'}
            </h2>
          </div>
          
          {/* Reviews Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-7 lg:gap-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Review 1 */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-7 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
              {/* Decorative quote icon */}
              <div className="absolute top-1.5 sm:top-4 right-1.5 sm:right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <svg className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500"></div>
              
              <div className="relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-400 fill-current drop-shadow-sm"
                    />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-xs sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-6 font-medium">
                  &quot;{t('testimonials.comment1.text') || 'Fast delivery and great support. Highly recommend!'}&quot;
                </p>
                
                {/* Customer Info */}
                <div className="flex items-center gap-2 sm:gap-4 pt-2 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-base md:text-lg font-bold text-gray-900 dark:text-white mb-0 sm:mb-1">
                      {t('testimonials.comment1.name') || 'Youssef'}
                    </h3>
                    <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                      Customer
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-7 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
              {/* Decorative quote icon */}
              <div className="absolute top-1.5 sm:top-4 right-1.5 sm:right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <svg className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500"></div>
              
              <div className="relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-400 fill-current drop-shadow-sm"
                    />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-xs sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-6 font-medium">
                  &quot;{t('testimonials.comment2.text') || 'They installed our office network flawlessly.'}&quot;
                </p>
                
                {/* Customer Info */}
                <div className="flex items-center gap-2 sm:gap-4 pt-2 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-base md:text-lg font-bold text-gray-900 dark:text-white mb-0 sm:mb-1">
                      {t('testimonials.comment2.name') || 'Sara'}
                    </h3>
                    <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                      Customer
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-7 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/50 dark:border-gray-700/50 overflow-hidden md:col-span-1 lg:col-span-1">
              {/* Decorative quote icon */}
              <div className="absolute top-1.5 sm:top-4 right-1.5 sm:right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <svg className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500"></div>
              
              <div className="relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-400 fill-current drop-shadow-sm"
                    />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-xs sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-6 font-medium">
                  &quot;{t('testimonials.comment3.text') || 'Good prices and professional service.'}&quot;
                </p>
                
                {/* Customer Info */}
                <div className="flex items-center gap-2 sm:gap-4 pt-2 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-base md:text-lg font-bold text-gray-900 dark:text-white mb-0 sm:mb-1">
                      {t('testimonials.comment3.name') || 'Anas'}
                    </h3>
                    <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                      Customer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* User's Own Review Section - Only visible to logged in users */}
          {isLoggedIn && user && (
            <div className="mt-4 sm:mt-6 md:mt-8 w-full relative z-20 overflow-visible">
              <UserReviewSection user={user} token={token || ''} t={t} isRTL={isRTL} />
            </div>
          )}
        </div>
      </section>

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
              onTouchStart={(e) => {
                // Only pause if touching the container, not individual product cards
                if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.overflow-x-hidden')) {
                  setIsNewArrivalsPaused(true)
                }
              }}
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
      <section ref={benefitsRef} className="py-4 sm:py-8 md:py-10 lg:py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-primary-700 dark:text-primary-300 mb-1 sm:mb-2">
              {t('promo.whyChooseUs') || 'Why Choose PIXEL PAD?'}
            </h2>
          </div>
          
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 lg:gap-5 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Quality Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 lg:p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.01] border border-gray-100 dark:border-gray-700 group text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-1.5 md:mb-2 shadow-md transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-primary-700 dark:text-primary-300">
                {t('home.trust.quality') || 'Pro-Grade Quality'}
              </h3>
            </div>

            {/* Support Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 lg:p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.01] border border-gray-100 dark:border-gray-700 group text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-1.5 md:mb-2 shadow-md transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-primary-700 dark:text-primary-300">
                {t('home.trust.support') || 'Experts on Call'}
              </h3>
            </div>

            {/* Returns Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 lg:p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.01] border border-gray-100 dark:border-gray-700 group text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-1.5 md:mb-2 shadow-md transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-primary-700 dark:text-primary-300">
                {t('home.trust.returns') || 'Hassle-Free Returns'}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Customer Reviews Section */}
      <section className="py-6 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 scroll-snap-align-start overflow-x-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-72 h-72 bg-primary-300/5 dark:bg-primary-700/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-primary-200/5 dark:bg-primary-800/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 w-full relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 mb-6 sm:mb-10 md:mb-12 lg:mb-16 text-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 rounded-full border border-primary-200/50 dark:border-primary-700/30 shadow-sm">
              <StarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-[10px] sm:text-xs md:text-sm font-bold text-primary-700 dark:text-primary-300">
                {t('landing.reviews.badge') || 'Trusted by 500+ Customers'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              {t('landing.reviews.title') || 'What Our Customers Say'}
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
              Real experiences from satisfied customers across Morocco
            </p>
          </div>
          
          {/* Reviews Grid - Enhanced Layout */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Review 1 */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/80 dark:border-gray-700/50 overflow-hidden">
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-l-lg sm:rounded-l-2xl md:rounded-l-3xl"></div>
              
              {/* Quote icon */}
              <div className="absolute top-1.5 sm:top-6 right-1.5 sm:right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <svg className="w-12 h-12 sm:w-18 sm:h-18 md:w-20 md:h-20 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-4 md:mb-5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-400 fill-current drop-shadow-sm"
                    />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-xs sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-5 md:mb-6 font-medium">
                  {t('landing.reviews.review1.text') || 'Pixel Pad transformed our office setup. Professional service, fast delivery, and excellent support. Highly recommended!'}
                </p>
                
                {/* Customer Info */}
                <div className="flex items-center gap-2 sm:gap-4 pt-2 sm:pt-4 md:pt-5 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-base md:text-lg font-bold text-gray-900 dark:text-white mb-0 sm:mb-1">
                      {t('landing.reviews.review1.name') || 'Ahmed Benali'}
                    </h4>
                    <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                      {t('landing.reviews.review1.role') || 'Business Owner, Casablanca'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/80 dark:border-gray-700/50 overflow-hidden">
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-l-lg sm:rounded-l-2xl md:rounded-l-3xl"></div>
              
              {/* Quote icon */}
              <div className="absolute top-1.5 sm:top-6 right-1.5 sm:right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <svg className="w-12 h-12 sm:w-18 sm:h-18 md:w-20 md:h-20 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-4 md:mb-5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-400 fill-current drop-shadow-sm"
                    />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-xs sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-5 md:mb-6 font-medium">
                  {t('landing.reviews.review2.text') || 'Got my MacBook Pro here. Outstanding service, great warranty, and the team helped with everything. Best tech store!'}
                </p>
                
                {/* Customer Info */}
                <div className="flex items-center gap-2 sm:gap-4 pt-2 sm:pt-4 md:pt-5 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-base md:text-lg font-bold text-gray-900 dark:text-white mb-0 sm:mb-1">
                      {t('landing.reviews.review2.name') || 'Fatima Alami'}
                    </h4>
                    <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                      {t('landing.reviews.review2.role') || 'Designer, Rabat'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100/80 dark:border-gray-700/50 overflow-hidden">
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-l-lg sm:rounded-l-2xl md:rounded-l-3xl"></div>
              
              {/* Quote icon */}
              <div className="absolute top-1.5 sm:top-6 right-1.5 sm:right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <svg className="w-12 h-12 sm:w-18 sm:h-18 md:w-20 md:h-20 text-gray-400 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-4 md:mb-5">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-400 fill-current drop-shadow-sm"
                    />
                  ))}
                </div>
                
                {/* Review Text */}
                <p className="text-xs sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-5 md:mb-6 font-medium">
                  {t('landing.reviews.review3.text') || 'Perfect gaming PC setup! Great prices, expert help, and they even installed everything. 10/10 experience!'}
                </p>
                
                {/* Customer Info */}
                <div className="flex items-center gap-2 sm:gap-4 pt-2 sm:pt-4 md:pt-5 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-base md:text-lg font-bold text-gray-900 dark:text-white mb-0 sm:mb-1">
                      {t('landing.reviews.review3.name') || 'Youssef Idrissi'}
                    </h4>
                    <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">
                      {t('landing.reviews.review3.role') || 'Gamer, Marrakech'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Structured Data */}
      <OrganizationSchema />
      <LocalBusinessSchema />
    </div>
  )
}
