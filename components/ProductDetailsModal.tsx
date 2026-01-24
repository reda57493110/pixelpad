"use client"

import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import {
  XMarkIcon,
  StarIcon,
  ShoppingCartIcon,
  EyeIcon,
  CheckCircleIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface ProductDetailsModalProps {
  product: Product
  onClose: () => void
}

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  const router = useRouter()
  const { t, formatCurrency, language } = useLanguage()
  const { addItem } = useCart()

  const productName = language === 'ar' 
    ? (product.nameFr || product.name)
    : language === 'fr'
      ? (product.nameFr || product.name)
      : product.name

  const productDescription = language === 'ar'
    ? (product.descriptionFr || product.description)
    : language === 'fr'
      ? (product.descriptionFr || product.description)
      : product.description

  const handleAddToCart = () => {
    if (product.inStock) {
      addItem({
        productId: product.id,
        variantId: undefined, // Can be extended later for product variants
        name: productName,
        price: product.price, // Price snapshot
        image: product.image
      }, 1)
      onClose()
    }
  }

  const modal = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4" onClick={onClose}>
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('product.details') || 'Product Details'}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label={t('common.close') || 'Close'}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Image */}
            <div className="relative">
              <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={productName}
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
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {product.badge}
                  </span>
                )}
                {product.discount && product.discount > 0 && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    -{product.discount}% {t('product.discount.off') || 'OFF'}
                  </span>
                )}
                {!product.inStock && (
                  <span className="bg-primary-600 dark:bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg dark:shadow-primary-900/50">
                    {t('product.outOfStock') || 'Out of Stock'}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-4">
              {/* Name */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {productName}
              </h3>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {product.rating}
                  </span>
                  {product.reviews && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({product.reviews} {t('product.reviews') || 'reviews'})
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {productDescription}
              </p>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-sm text-green-600 dark:text-green-400 font-bold">
                    {t('product.save') || 'Save'} {formatCurrency(product.originalPrice - product.price)}!
                  </div>
                )}
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('product.features') || 'Features'}
                  </h4>
                  <ul className="space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
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
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('product.specifications') || 'Specifications'}
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{key}:</span>
                        <span className="text-gray-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <TruckIcon className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t('product.fastDelivery') || 'Fast Delivery'}
                  </div>
                </div>
                <div className="text-center">
                  <ShieldCheckIcon className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t('product.warranty') || 'Warranty'}
                  </div>
                </div>
                <div className="text-center">
                  <CheckCircleIcon className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {t('product.quality') || 'Quality'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => {
              router.push(`/products?product=${product.id}`)
              onClose()
            }}
            className="flex-1 px-4 py-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <EyeIcon className="h-5 w-5" />
            {t('product.viewFullDetails') || 'View Full Details'}
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {t('product.addToCart') || 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  
  return createPortal(modal, document.body)
}












