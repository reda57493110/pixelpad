'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { getProductById } from '@/lib/products'
import { Product } from '@/types'
import {
  ArrowLeftIcon,
  StarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

// Lazy load components that are not needed for initial render
const QuickOrderModal = lazy(() => import('@/components/QuickOrderModal'))
const ProductSchema = lazy(() => import('@/components/ProductSchema'))
const BreadcrumbSchema = lazy(() => import('@/components/BreadcrumbSchema'))

// Product Review Section Component
function ProductReviewSection({ productId, user, token, t, isRTL }: { productId: string, user: any, token: string | null, t: any, isRTL: boolean }) {
  const [userReview, setUserReview] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch user's review for this product
  useEffect(() => {
    const fetchReview = async () => {
      const authToken = token || localStorage.getItem('pixelpad_token')
      
      if (!authToken) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/reviews?productId=${productId}`, {
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
  }, [token, user, productId])

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
        body: JSON.stringify({ rating, comment: comment.trim(), productId })
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
      const response = await fetch(`/api/reviews?productId=${productId}`, {
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
    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-6 mt-3 sm:mt-6">
      <div className="text-center mb-2 sm:mb-4">
        <h3 className="text-xs sm:text-lg font-bold text-gray-900 dark:text-white">
          {t('testimonials.shareExperience') || 'Share your experience'}
        </h3>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded sm:rounded-xl p-2 sm:p-5 shadow-md border border-gray-100/50 dark:border-gray-700/50">
          <div className="animate-pulse space-y-1.5 sm:space-y-3">
            <div className="h-2.5 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-12 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      ) : userReview && !isEditing ? (
        <div className="group relative bg-white dark:bg-gray-800 rounded sm:rounded-xl p-2 sm:p-5 shadow-md border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1.5 sm:mb-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-2.5 h-2.5 sm:w-4 sm:h-4 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[9px] sm:text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  {t('common.edit') || 'Edit'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-[9px] sm:text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                >
                  {t('common.delete') || 'Delete'}
                </button>
              </div>
            </div>
            
            <p className="text-[10px] sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2 sm:mb-4 font-medium">
              &quot;{userReview.comment}&quot;
            </p>
            
            <div className="flex items-center gap-1.5 sm:gap-3 pt-1.5 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] sm:text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                  {user.name || 'You'}
                </h4>
                <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400">
                  Your Review
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded sm:rounded-xl p-2 sm:p-5 shadow-lg border-2 border-primary-200 dark:border-primary-800">
          <div className="space-y-2 sm:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-sm font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1.5">
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
                      className={`w-4 h-4 sm:w-6 sm:h-6 transition-colors ${
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
              <label className="block text-[10px] sm:text-sm font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1.5">
                {t('testimonials.shareExperience') || 'Your Review'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('testimonials.shareExperience') || 'Share your experience...'}
                className="w-full px-2 sm:px-4 py-1.5 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={2}
              />
            </div>
            
            <div className="flex flex-row items-center gap-1.5 sm:gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving || !rating || !comment.trim()}
                className="flex-1 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-600 hover:from-primary-700 hover:via-primary-800 hover:to-primary-700 text-white px-3 sm:px-6 py-1.5 sm:py-3 rounded font-bold text-xs sm:text-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
                  className="px-3 sm:px-6 py-1.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 text-xs sm:text-base font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('testimonials.deleteConfirm') || 'Delete Review?'}
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
              {t('testimonials.deleteConfirm') || 'Are you sure you want to delete your review? This action cannot be undone.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold text-base transition-colors"
              >
                {t('common.delete') || 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg font-semibold text-base hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t, formatCurrency, language, isRTL } = useLanguage()
  const { addItem } = useCart()
  const { user, isLoggedIn, token } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showQuickOrder, setShowQuickOrder] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<{ ram: string; storage: string; storageType: string; price: number; originalPrice?: number } | null>(null)

  useEffect(() => {
    const productId = params.id as string
    if (productId) {
      // Ensure ID is a string and trim any whitespace
      const cleanId = String(productId).trim()
      console.log('Product ID from params:', cleanId)
      // Start loading immediately
      loadProduct(cleanId)
    }
  }, [params.id])
  
  const handleBack = () => {
    router.back()
  }

  const loadProduct = async (id: string) => {
    try {
      setIsLoading(true)
      console.log('Loading product with ID:', id)
      
      // Non-blocking: Load product data without blocking UI
      // Use fetch directly for better control
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/products/${id}`, {
            cache: 'force-cache',
            next: { revalidate: 60 }
          })
          
          if (!response.ok) {
            setProduct(null)
            setIsLoading(false)
            return
          }
          
          const data = await response.json()
          const productData = {
            id: data._id?.toString() || data.id,
            name: data.name,
            nameFr: data.nameFr,
            description: data.description,
            descriptionFr: data.descriptionFr,
            price: data.price,
            originalPrice: data.originalPrice,
            deliveryPrice: data.deliveryPrice,
            costPrice: data.costPrice,
            category: typeof data.category === 'object' ? data.category._id?.toString() || data.category.toString() : String(data.category || ''),
            image: data.image,
            images: data.images || (data.image ? [data.image] : []),
            inStock: data.inStock ?? true,
            stockQuantity: data.stockQuantity ?? 0,
            soldQuantity: data.soldQuantity ?? 0,
            rating: data.rating ?? 0,
            reviews: data.reviews ?? 0,
            features: data.features || [],
            specifications: data.specifications || {},
            badge: data.badge,
            badgeKey: data.badgeKey,
            discount: data.discount ?? 0,
            showOnHomeCarousel: data.showOnHomeCarousel ?? false,
            showInHero: data.showInHero ?? false,
            showInNewArrivals: data.showInNewArrivals ?? false,
            showInBestSellers: data.showInBestSellers ?? false,
            showInSpecialOffers: data.showInSpecialOffers ?? false,
            showInTrending: data.showInTrending ?? false,
            showOnProductPage: data.showOnProductPage !== false,
            order: data.order ?? 0,
            variants: data.variants || undefined,
          } as Product
          
          console.log('Product loaded:', productData ? 'Found' : 'Not found')
          setProduct(productData || null)
          
          // Set first variant as selected if variants exist
          if (productData?.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0])
          }
        } catch (error) {
          console.error('Error loading product:', error)
          setProduct(null)
        } finally {
          setIsLoading(false)
        }
      }
      
      // Start loading immediately, non-blocking
      fetchProduct()
    } catch (error) {
      console.error('Error in loadProduct:', error)
      setProduct(null)
      setIsLoading(false)
    }
  }

  const productName = product && (language === 'ar' 
    ? (product.nameFr || product.name)
    : language === 'fr'
      ? (product.nameFr || product.name)
      : product.name)

  const productDescription = product && (language === 'ar'
    ? (product.descriptionFr || product.description)
    : language === 'fr'
      ? (product.descriptionFr || product.description)
      : product.description)

  const handleAddToCart = () => {
    if (product) {
      const price = selectedVariant ? selectedVariant.price : product.price
      const variantInfo = selectedVariant 
        ? `${selectedVariant.ram} - ${selectedVariant.storage} ${selectedVariant.storageType}`
        : ''
      addItem({
        productId: product.id,
        variantId: selectedVariant ? `${selectedVariant.ram}-${selectedVariant.storage}-${selectedVariant.storageType}` : undefined,
        name: productName || product.name,
        price: price,
        image: product.images && product.images.length > 0 ? product.images[0] : product.image,
        variantInfo: variantInfo
      }, 1)
    }
  }

  // Get all product images (use images array if available, otherwise fallback to single image)
  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : (product?.image ? [product.image] : [])
  
  // Get current display price (from selected variant or product price)
  const displayPrice = selectedVariant ? selectedVariant.price : (product?.price || 0)
  const displayOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product?.originalPrice

  // Navigate images
  const nextImage = () => {
    if (productImages.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % productImages.length)
    }
  }

  const prevImage = () => {
    if (productImages.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
    }
  }

  // Show skeleton only if we have no product data yet
  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
              {/* Image skeleton */}
              <div className="relative">
                <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
              {/* Content skeleton */}
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{t('product.notFound') || 'Product not found'}</p>
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {t('product.backToProducts') || 'Back to Products'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Back Button - Goes to previous page */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 sm:mb-6 px-4 sm:px-0 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t('common.back') || 'Back'}</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 sm:gap-8 p-0 sm:p-6 lg:p-8">
            {/* Left: Image Gallery */}
            <div className="relative space-y-3 sm:space-y-4">
              {/* Main Image */}
              <div className="relative w-full aspect-[4/3] lg:aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-none sm:rounded-xl overflow-hidden">
                {productImages.length > 0 && productImages[selectedImageIndex] ? (
                  <>
                    <Image
                      src={productImages[selectedImageIndex]}
                      alt={`${productName || product.name} - Image ${selectedImageIndex + 1}`}
                      fill
                      className="object-contain"
                      priority
                    />
                    {/* Navigation arrows (only show if more than 1 image) */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10`}
                          aria-label="Previous image"
                        >
                          <ChevronLeftIcon className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                          onClick={nextImage}
                          className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10`}
                          aria-label="Next image"
                        >
                          <ChevronRightIcon className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                          {selectedImageIndex + 1} / {productImages.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image src="/icons/laptop.svg" alt="Product" width={120} height={120} className="opacity-50" />
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery (only show if more than 1 image) */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-600 dark:ring-blue-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Badges - Organized positioning to avoid overlap */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Top Left: Badge Key (if exists) */}
                {product.badgeKey && (
                  <div className={`absolute top-2 sm:top-3 md:top-4 ${isRTL ? 'right-2 sm:right-3 md:right-4' : 'left-2 sm:left-3 md:left-4'}`}>
                    <span className="bg-gradient-to-r from-primary-600 via-blue-500 to-primary-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
                      {t(product.badgeKey)}
                    </span>
                  </div>
                )}
                
                {/* Top Right: Discount Badge (if exists) - Stack below badgeKey if both exist */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className={`absolute ${product.badgeKey ? 'top-10 sm:top-12 md:top-14' : 'top-2 sm:top-3 md:top-4'} ${isRTL ? 'left-2 sm:left-3 md:left-4' : 'right-2 sm:right-3 md:right-4'}`}>
                    <span className="bg-gradient-to-r from-primary-600 to-blue-600 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </div>
                )}
                
                {/* Bottom Left: Out of Stock (if exists) */}
                {!product.inStock && (
                  <div className={`absolute bottom-2 sm:bottom-3 md:bottom-4 ${isRTL ? 'right-2 sm:right-3 md:right-4' : 'left-2 sm:left-3 md:left-4'}`}>
                    <span className="bg-primary-600 dark:bg-primary-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg dark:shadow-primary-900/50">
                      {t('product.outOfStock') || 'Out of Stock'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
              {/* Title */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-3">
                  {productName || product.name}
                </h1>
                {productDescription && (
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {productDescription}
                  </p>
                )}
              </div>

              {/* Rating */}
              {typeof product.rating === 'number' && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    {product.rating}
                  </span>
                  {typeof product.reviews === 'number' && (
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      ({product.reviews} {t('product.reviews') || 'reviews'})
                    </span>
                  )}
                </div>
              )}

              {/* Variants Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                    {t('product.selectConfiguration') || 'Select Configuration'}
                  </h3>
                  <div className="space-y-3">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(variant)}
                        className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all text-left ${
                          selectedVariant && 
                          selectedVariant.ram === variant.ram && 
                          selectedVariant.storage === variant.storage && 
                          selectedVariant.storageType === variant.storageType
                            ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-600 dark:ring-blue-400'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                              {variant.ram} - {variant.storage} {variant.storageType}
                            </div>
                            {variant.originalPrice && variant.originalPrice > variant.price && (
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                                {formatCurrency(variant.originalPrice)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-base sm:text-lg lg:text-xl font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(variant.price)}
                            </div>
                            {variant.originalPrice && variant.originalPrice > variant.price && (
                              <div className="text-xs sm:text-xs lg:text-sm text-green-600 dark:text-green-400">
                                Save {formatCurrency(variant.originalPrice - variant.price)}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(displayPrice)}
                  </span>
                  {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                    <span className="text-base sm:text-lg lg:text-xl text-gray-500 dark:text-gray-400 line-through">
                      {formatCurrency(displayOriginalPrice)}
                    </span>
                  )}
                </div>
                {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                  <div className="text-sm sm:text-base lg:text-lg text-green-600 dark:text-green-400 font-bold">
                    {t('product.save') || 'Save'} {formatCurrency(displayOriginalPrice - displayPrice)}!
                  </div>
                )}
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('product.features') || 'Features'}
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('product.specifications') || 'Specifications'}
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{key}:</span>
                        <span className="text-xs sm:text-sm text-gray-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-2.5 sm:py-3 lg:py-4 px-6 rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>
                      {t('product.addToCart') || 'Add to Cart'}
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowQuickOrder(true)}
                  className="w-full py-2.5 sm:py-3 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {t('product.quickOrder') || 'Quick Order'}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span>{t('product.fastShipping') || 'Fast Shipping'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span>{t('product.securePayment') || 'Secure Payment'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span>{t('product.returnPolicy') || '30-Day Returns'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span>{t('product.warranty') || 'Warranty Included'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Review Section - Only visible to logged in users */}
        {isLoggedIn && user && product && (
          <div className="mt-8 px-4 sm:px-0">
            <ProductReviewSection 
              productId={product.id} 
              user={user} 
              token={token || ''} 
              t={t} 
              isRTL={isRTL} 
            />
          </div>
        )}
      </div>

      {showQuickOrder && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000]">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
              <div className="animate-pulse text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
          </div>
        }>
          <QuickOrderModal
            product={{ 
              id: product.id, 
              name: productName || product.name, 
              price: displayPrice 
            }}
            onClose={() => setShowQuickOrder(false)}
          />
        </Suspense>
      )}

      {/* SEO Structured Data */}
      {product && (
        <Suspense fallback={null}>
          <ProductSchema product={product} />
          <BreadcrumbSchema
            items={[
              { name: 'Home', url: '/' },
              { name: 'Products', url: '/products' },
              { name: product.name, url: `/products/${product.id}` },
            ]}
          />
        </Suspense>
      )}
    </div>
  )
}

