'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { getProductById } from '@/lib/products'
import { Product } from '@/types'
import {
  ArrowLeftIcon,
  StarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import QuickOrderModal from '@/components/QuickOrderModal'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t, formatCurrency, language, isRTL } = useLanguage()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showQuickOrder, setShowQuickOrder] = useState(false)

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
      
      // Use Promise.race to add timeout (reduced to 2s for faster feedback)
      const data = await Promise.race([
        getProductById(id),
        new Promise<Product | undefined>((resolve) => 
          setTimeout(() => resolve(undefined), 2000)
        )
      ])
      
      console.log('Product loaded:', data ? 'Found' : 'Not found')
      setProduct(data || null)
    } catch (error) {
      console.error('Error loading product:', error)
      setProduct(null)
    } finally {
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
    if (product && product.inStock) {
      addItem({
        productId: product.id,
        variantId: undefined,
        name: productName || product.name,
        price: product.price,
        image: product.image
      }, 1)
    }
  }

  // Show skeleton immediately while loading
  if (isLoading) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button - Goes to previous page */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>{t('common.back') || 'Back'}</span>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Left: Image */}
            <div className="relative">
              <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={productName || product.name}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image src="/icons/laptop.svg" alt="Product" width={120} height={120} className="opacity-50" />
                  </div>
                )}
              </div>
              
              {/* Badges */}
              {product.badgeKey && (
                <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                  <span className="bg-gradient-to-r from-primary-600 via-blue-500 to-primary-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    {t(product.badgeKey)}
                  </span>
                </div>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
                  <span className="bg-gradient-to-r from-primary-600 to-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </div>
              )}
              {!product.inStock && (
                <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {t('product.outOfStock') || 'Out of Stock'}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3">
                  {productName || product.name}
                </h1>
                {productDescription && (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {product.rating}
                  </span>
                  {typeof product.reviews === 'number' && (
                    <span className="text-gray-600 dark:text-gray-400">
                      ({product.reviews} {t('product.reviews') || 'reviews'})
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-lg text-green-600 dark:text-green-400 font-bold">
                    {t('product.save') || 'Save'} {formatCurrency(product.originalPrice - product.price)}!
                  </div>
                )}
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('product.features') || 'Features'}
                  </h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t('product.specifications') || 'Specifications'}
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{key}:</span>
                        <span className="text-gray-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                    product.inStock
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCartIcon className="w-6 h-6" />
                    <span>
                      {product.inStock 
                        ? (t('product.addToCart') || 'Add to Cart')
                        : (t('product.outOfStock') || 'Out of Stock')
                      }
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowQuickOrder(true)}
                  disabled={!product.inStock}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-200 border-2 ${
                    product.inStock
                      ? 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      : 'border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('product.quickOrder') || 'Quick Order'}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <TruckIcon className="w-5 h-5 text-green-500" />
                  <span>{t('product.fastShipping') || 'Fast Shipping'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                  <span>{t('product.securePayment') || 'Secure Payment'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span>{t('product.returnPolicy') || '30-Day Returns'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span>{t('product.warranty') || 'Warranty Included'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQuickOrder && (
        <QuickOrderModal
          product={{ id: product.id, name: productName || product.name, price: product.price }}
          onClose={() => setShowQuickOrder(false)}
        />
      )}
    </div>
  )
}

