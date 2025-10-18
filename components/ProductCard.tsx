'use client'

import Link from 'next/link'
import { Product } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useLanguage()
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <Link href={`/shop/${product.id}`}>
          <div 
            className="w-full h-80 flex items-center justify-center text-white font-bold hover:scale-105 transition-transform duration-300"
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
            <div className="text-center">
              <div className="text-7xl mb-2">🖥️</div>
              <div className="text-sm opacity-90">{product.name}</div>
            </div>
          </div>
        </Link>
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
{t('product.outOfStock')}
          </div>
        )}
        {product.originalPrice && product.originalPrice > product.price && (
          <div 
            className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse cursor-pointer hover:from-red-600 hover:to-pink-600 transition-all duration-300"
            onClick={() => window.location.href = `/shop/${product.id}`}
          >
            🔥 {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
        <div 
          className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold cursor-pointer hover:bg-opacity-90 transition-all duration-300"
          onClick={() => window.location.href = `/shop/${product.id}`}
        >
          ⚡ LIMITED TIME
        </div>
        
        {/* Trending Badge */}
        <div 
          className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          onClick={() => window.location.href = `/shop/${product.id}`}
        >
          🔥 TRENDING
        </div>
        
        {/* New Arrival Badge */}
        <div 
          className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full text-xs font-bold cursor-pointer hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
          onClick={() => window.location.href = `/shop/${product.id}`}
        >
          ✨ NEW
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide">{product.category}</span>
          {product.rating && (
            <div className="flex items-center bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded-full">
              <span className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200 ml-1">{product.rating}</span>
              {product.reviews && (
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">({product.reviews} reviews)</span>
              )}
            </div>
          )}
        </div>
        
        <Link href={`/shop/${product.id}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 font-medium">
          {product.description}
        </p>
        
        <div className="mb-3">
          <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-bold">
            <span className="mr-1">✅</span>
            Fast Delivery • 30-Day Returns • 2-Year Warranty
          </div>
          
          {/* Stock Progress Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Only 3 left in stock!</span>
              <span className="text-red-600 dark:text-red-400 font-bold">Hurry!</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full animate-pulse" style={{width: '15%'}}></div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                Save ${product.originalPrice - product.price}!
              </span>
            )}
          </div>
          
          <button 
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg ${
              product.inStock 
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!product.inStock}
          >
            {product.inStock ? '🛒 ADD TO CART' : 'OUT OF STOCK'}
          </button>
        </div>
      </div>
    </div>
  )
}


