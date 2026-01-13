'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'
import { memo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import QuickOrderModal from './QuickOrderModal'
import { StarIcon } from '@heroicons/react/24/outline'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'hero'
  hideIds?: boolean
}

function ProductCard({ product, variant = 'default', hideIds = false }: ProductCardProps) {
  const router = useRouter()
  const { t, formatCurrency, isRTL } = useLanguage()
  const { addItem } = useCart()
  const [showQuickOrder, setShowQuickOrder] = useState(false)
  
  const looksLikeId = (value?: string) => typeof value === 'string' && /^[0-9a-f]{24}$/i.test(value.trim())
  const displayName = hideIds && product.name && looksLikeId(product.name)
    ? ''
    : product.name
  const displayDescription = hideIds && product.description && looksLikeId(product.description)
    ? ''
    : product.description
  const displayCategory = hideIds && product.category && looksLikeId(product.category)
    ? ''
    : product.category

  const isHero = variant === 'hero'
  
  return (
    <div 
      className={`${isHero ? 'bg-white dark:bg-gray-800 shadow-xl' : 'bg-white dark:bg-gray-800 shadow-xl'} rounded-2xl shadow-md dark:shadow-xl dark:shadow-gray-900/50 overflow-hidden group flex flex-col ${isHero ? 'h-full' : 'h-full'} relative isolate border border-gray-200 dark:border-gray-700`}
      onMouseEnter={() => {
        // Prefetch product data on hover for instant loading
        if (typeof window !== 'undefined' && product.id) {
          fetch(`/api/products/${product.id}`, { method: 'HEAD' }).catch(() => {})
        }
      }}
    >
      <div className="relative">
        <Link href={`/products/${product.id}`} prefetch={true}>
          <div 
            className={`relative w-full ${isHero ? 'h-56 sm:h-96 md:h-80 lg:h-96' : 'h-80'} ${isHero ? 'bg-white dark:bg-gray-900/60' : 'bg-gray-50 dark:bg-gray-900/50'} overflow-hidden`}
          >
            {product.image ? (
              <Image 
                src={product.image} 
                alt={product.name}
                fill
                className={isHero ? "object-contain sm:object-cover" : "object-cover"}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={isHero}
                loading={isHero ? "eager" : "lazy"}
                fetchPriority={isHero ? "high" : "auto"}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${
                    product.category === 'laptops' ? '#4F46E5, #7C3AED' :
                    product.category === 'desktops' ? '#059669, #10B981' :
                    product.category === 'monitors' ? '#DC2626, #EF4444' :
                    product.category === 'accessories' ? '#8B5CF6, #A855F7' :
                    product.category === 'gaming' ? '#1E40AF, #3B82F6' :
                    '#6B7280, #9CA3AF'
                  })`
                }}
              >
                <div className="text-center text-white">
                  <Image src="/icons/desktop.svg" alt="Desktop icon" width={80} height={80} className="w-20 h-20 mb-2 opacity-50" />
                  <div className="text-sm opacity-90">{displayName}</div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-primary-500/5 to-primary-500/15 dark:from-white/0 dark:via-primary-400/10 dark:to-primary-400/20 opacity-0 group-hover:opacity-70 dark:group-hover:opacity-80 transition-opacity duration-400 ease-out mix-blend-soft-light" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 via-black/8 to-transparent dark:from-black/40 dark:via-black/15 to-transparent opacity-0 group-hover:opacity-90 dark:group-hover:opacity-100 transition-opacity duration-400 ease-out" />
          </div>
        </Link>
        {/* Badge Container - Organized positioning for mobile */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Left: Discount Badge */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div 
              className={`absolute top-1.5 sm:top-2 md:top-2.5 lg:top-2 ${isRTL ? 'right-1.5 sm:right-2 md:right-2.5 lg:right-2' : 'left-1.5 sm:left-2 md:left-2.5 lg:left-2'} ${isHero ? 'bg-gradient-to-r from-primary-600 via-blue-500 to-primary-500 text-white px-1.5 sm:px-2.5 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 lg:py-2 rounded-full text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-black shadow-2xl z-20' : 'bg-gradient-to-r from-primary-600 to-blue-600 text-white px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 md:py-1 rounded-full text-[9px] sm:text-[10px] md:text-xs font-bold shadow-lg'} cursor-pointer hover:scale-110 transition-all duration-300 pointer-events-auto`}
              onClick={() => router.push(`/products/${product.id}`)}
            >
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </div>
          )}
          
          {isHero && (
            <>
              {/* Trending Badge - Top Right for Hero */}
              <div 
                className={`absolute top-1.5 sm:top-2 md:top-2.5 lg:top-2 ${isRTL ? 'left-1.5 sm:left-2 md:left-2.5 lg:left-2' : 'right-1.5 sm:right-2 md:right-2.5 lg:right-2'} bg-gradient-to-r from-primary-600 via-blue-500 to-primary-500 text-white px-1.5 sm:px-2.5 md:px-3 lg:px-3 py-0.5 sm:py-1 md:py-1.5 lg:py-1.5 rounded-full text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs font-black shadow-xl cursor-pointer hover:scale-110 transition-all duration-300 z-20 pointer-events-auto`}
                onClick={() => router.push(`/products/${product.id}`)}
              >
                TRENDING
              </div>
              
              {/* Limited Time - Bottom Left */}
              <div 
                className={`absolute bottom-1.5 sm:bottom-2 md:bottom-2.5 lg:bottom-2 ${isRTL ? 'right-1.5 sm:right-2 md:right-2.5 lg:right-2' : 'left-1.5 sm:left-2 md:left-2.5 lg:left-2'} bg-gradient-to-r from-primary-600 via-blue-500 to-primary-500 text-white px-1.5 sm:px-2.5 md:px-3 lg:px-3 py-0.5 sm:py-1 md:py-1.5 lg:py-1.5 rounded-full text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs font-black shadow-xl cursor-pointer hover:scale-110 transition-all duration-300 z-20 pointer-events-auto`}
                onClick={() => router.push(`/products/${product.id}`)}
              >
                LIMITED TIME
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className={`${isHero ? 'p-3 sm:p-3.5 md:p-3.5 lg:p-4' : 'p-3 sm:p-4'}`}>
        <div className="flex items-center justify-between mb-2 sm:mb-2.5 gap-2">
          <span className={`${isHero ? 'text-[9px] sm:text-[10px] lg:text-[10px]' : 'text-[10px] sm:text-[11px]'} font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide truncate flex-shrink`}>
            {displayCategory || ''}
          </span>
          {typeof product.rating === 'number' && (
            <div className={`flex items-center gap-0.5 sm:gap-1 bg-primary-50 dark:bg-gray-800 border border-primary-200 dark:border-gray-700 ${isHero ? 'px-1.5 sm:px-2 lg:px-2.5 py-0.5' : 'px-1.5 sm:px-2 py-0.5'} rounded-full max-w-full overflow-hidden shadow-sm dark:shadow-gray-900/50 flex-shrink-0`}>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-0.5`}>
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`${isHero ? 'w-2.5 h-2.5 sm:w-3 sm:h-3' : 'w-2.5 h-2.5 sm:w-3 h-3'} ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-primary-600 dark:text-primary-400 fill-primary-600 dark:fill-primary-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className={`${isHero ? 'text-[9px] sm:text-[10px] lg:text-[11px]' : 'text-[10px] sm:text-[11px]'} leading-none font-bold text-primary-700 dark:text-primary-300 ${isRTL ? 'mr-0.5 sm:mr-1' : 'ml-0.5 sm:ml-1'} whitespace-nowrap`}>{product.rating}</span>
              {typeof product.reviews === 'number' && (
                <span className={`${isHero ? 'text-[8px] sm:text-[9px] lg:text-[10px]' : 'text-[9px] sm:text-[10px]'} leading-none text-primary-600 dark:text-primary-400 ${isRTL ? 'mr-0.5 sm:mr-1' : 'ml-0.5 sm:ml-1'} whitespace-nowrap hidden sm:inline`}>
                  ({product.reviews} {t('product.reviews') || 'reviews'})
                </span>
              )}
            </div>
          )}
        </div>
        
        <Link href={`/products/${product.id}`} prefetch={true}>
          <h3 className={`${isHero ? 'text-sm sm:text-lg md:text-base lg:text-base' : 'text-sm sm:text-base'} text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-300 font-bold transition-colors mb-2 sm:mb-2.5 md:mb-2.5 lg:mb-3 line-clamp-2 leading-tight`}>
            {displayName || ''}
          </h3>
        </Link>
        
          <p className={`${isHero ? 'text-[10px] sm:text-sm md:text-[10px] lg:text-[10px]' : 'text-[10px] sm:text-[11px]'} text-gray-700 dark:text-gray-200 mb-2 sm:mb-2.5 md:mb-2.5 lg:mb-4 line-clamp-2 leading-relaxed`}>
          {displayDescription || ''}
        </p>
        
        <div className={`${isHero ? 'mb-2.5 sm:mb-3' : 'mb-3'}`}>
          {/* Stock Progress Bar */}
          <div className={`${isHero ? 'mt-2 sm:mt-2.5' : 'mt-2'}`}>
            <div className={`flex items-center justify-between ${isHero ? 'text-[10px] sm:text-[11px] lg:text-[11px]' : 'text-[11px]'} text-gray-700 dark:text-gray-300 mb-1`}>
              <span>Only 3 left in stock!</span>
              <span className="text-primary-700 dark:text-primary-200 font-bold">Hurry!</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700/70 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary-500 to-blue-500 dark:from-primary-400 dark:to-blue-400 h-2 rounded-full shadow-sm dark:shadow-primary-500/50" style={{width: '15%'}}></div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2">
          <div className="flex flex-col flex-1 min-w-0">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2 sm:space-x-2 md:space-x-2 lg:space-x-2' : 'space-x-2 sm:space-x-2 md:space-x-2 lg:space-x-2'} mb-1`}>
              <span className={`${isHero ? 'text-base sm:text-xl md:text-lg lg:text-lg' : 'text-base sm:text-lg'} text-primary-600 dark:text-primary-300 font-bold`}>
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className={`${isHero ? 'text-[10px] sm:text-sm md:text-[10px] lg:text-[10px]' : 'text-[10px] sm:text-[11px]'} text-gray-500 dark:text-gray-500 line-through`}>
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className={`${isHero ? 'text-[10px] sm:text-sm md:text-[10px] lg:text-[11px] px-2 sm:px-3 md:px-2.5 lg:px-3 py-0.5 sm:py-1 md:py-0.5 lg:py-1 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 text-white rounded-full inline-block w-fit shadow-sm dark:shadow-green-900/30' : 'text-[10px] sm:text-[11px] text-green-600 dark:text-green-300'} font-black`}>
                Save {formatCurrency(product.originalPrice - product.price)}!
              </span>
            )}
          </div>
          
          <div className="flex gap-2 sm:gap-2 flex-shrink-0">
            <button 
              className={`${isHero ? 'px-3 sm:px-4 md:px-3 lg:px-4 py-2 sm:py-2.5 md:py-2 lg:py-2.5 text-[10px] sm:text-xs md:text-[10px] lg:text-[11px]' : 'px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-[11px]'} rounded-xl font-bold transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-md dark:shadow-lg whitespace-nowrap touch-manipulation bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white`}
              onClick={() => {
                router.push(`/products/${product.id}`)
              }}
            >
              {t('product.viewDetails') || 'View Details'}
            </button>
            <button 
              className={`${isHero ? 'px-3.5 sm:px-5 md:px-4 lg:px-7 py-2 sm:py-3 md:py-2.5 lg:py-2.5 text-[10px] sm:text-sm md:text-[11px] lg:text-xs' : 'px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-[11px]'} rounded-xl font-bold transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-md dark:shadow-lg dark:shadow-primary-900/50 whitespace-nowrap flex-shrink-0 touch-manipulation ${
                isHero 
                  ? 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white'
              }`}
              onClick={() => {
                addItem({
                  productId: product.id,
                  variantId: undefined,
                  name: displayName || product.name,
                  price: product.price,
                  image: product.image
                }, 1)
              }}
            >
              {t('product.addToCart') || 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
      {showQuickOrder && (
        <QuickOrderModal 
          product={{ id: product.id, name: product.name, price: product.price }}
          onClose={() => setShowQuickOrder(false)}
        />
      )}
    </div>
  )
}

export default memo(ProductCard)
