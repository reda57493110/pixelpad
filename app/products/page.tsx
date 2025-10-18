'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

// Simple product data
const products = [
  {
    id: 1,
    name: 'MacBook Pro 16" M3 Max',
    description: 'Powerful laptop with M3 Max chip, perfect for professionals and creators.',
    price: 2499,
    originalPrice: 2799,
    category: 'laptops',
    inStock: true,
    rating: 4.8,
    reviews: 124,
    badge: 'HOT DEAL'
  },
  {
    id: 2,
    name: 'Dell XPS 13',
    description: 'Ultra-portable laptop with stunning 13.4-inch display and all-day battery life.',
    price: 1299,
    originalPrice: 1499,
    category: 'laptops',
    inStock: true,
    rating: 4.6,
    reviews: 89,
    badge: 'BESTSELLER'
  },
  {
    id: 3,
    name: 'ASUS ROG Gaming Laptop',
    description: 'High-performance gaming laptop with RTX 4070 and 144Hz display.',
    price: 1899,
    originalPrice: 2199,
    category: 'laptops',
    inStock: true,
    rating: 4.7,
    reviews: 156,
    badge: 'GAMING'
  },
  {
    id: 4,
    name: 'Gaming PC RTX 4080',
    description: 'High-performance gaming desktop with Intel Core i9 and NVIDIA RTX 4080.',
    price: 2899,
    originalPrice: 3299,
    category: 'desktops',
    inStock: true,
    rating: 4.8,
    reviews: 67,
    badge: 'LIMITED'
  },
  {
    id: 5,
    name: 'iMac 24" M3',
    description: 'All-in-one desktop with 24-inch 4.5K Retina display and M3 chip.',
    price: 1299,
    originalPrice: 1499,
    category: 'desktops',
    inStock: true,
    rating: 4.7,
    reviews: 98,
    badge: 'POPULAR'
  },
  {
    id: 6,
    name: 'ASUS ProArt 27"',
    description: 'Professional 4K monitor with 99% Adobe RGB coverage.',
    price: 899,
    originalPrice: 1099,
    category: 'monitors',
    inStock: true,
    rating: 4.9,
    reviews: 234,
    badge: 'PRO'
  },
  {
    id: 7,
    name: 'Dell UltraSharp 32"',
    description: 'Ultra-wide 4K monitor with USB-C connectivity.',
    price: 1199,
    originalPrice: 1399,
    category: 'monitors',
    inStock: true,
    rating: 4.6,
    reviews: 145,
    badge: 'PREMIUM'
  },
  {
    id: 8,
    name: 'Logitech MX Master 3S',
    description: 'Premium wireless mouse with ultra-fast scrolling.',
    price: 99,
    originalPrice: 129,
    category: 'accessories',
    inStock: true,
    rating: 4.8,
    reviews: 567,
    badge: 'BESTSELLER'
  },
  {
    id: 9,
    name: 'Corsair K100 RGB',
    description: 'Mechanical gaming keyboard with Cherry MX Speed switches.',
    price: 199,
    originalPrice: 249,
    category: 'accessories',
    inStock: true,
    rating: 4.5,
    reviews: 234,
    badge: 'GAMING'
  },
  {
    id: 10,
    name: 'SteelSeries Arctis 7P',
    description: 'Wireless gaming headset with 2.4GHz lossless audio.',
    price: 149,
    originalPrice: 179,
    category: 'accessories',
    inStock: true,
    rating: 4.7,
    reviews: 345,
    badge: 'WIRELESS'
  },
  {
    id: 11,
    name: 'PlayStation 5',
    description: 'Next-gen gaming console with 4K gaming and ray tracing.',
    price: 499,
    originalPrice: 599,
    category: 'gaming',
    inStock: true,
    rating: 4.9,
    reviews: 1234,
    badge: 'EXCLUSIVE'
  },
  {
    id: 12,
    name: 'Nintendo Switch OLED',
    description: 'Handheld gaming console with 7-inch OLED screen.',
    price: 349,
    originalPrice: 399,
    category: 'gaming',
    inStock: true,
    rating: 4.8,
    reviews: 789,
    badge: 'PORTABLE'
  }
]

const categories = ['all', 'laptops', 'desktops', 'monitors', 'accessories', 'gaming']

export default function ProductsPage() {
  const { t, language } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('name')
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 45
  })
  const [endTime, setEndTime] = useState<number | null>(null)

  // Debug log to confirm page is loading
  useEffect(() => {
    console.log('Products page loaded successfully!')
    console.log('Current URL:', window.location.href)
    console.log('Products data:', products.length, 'products')
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

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'laptops': return 'from-blue-500 to-purple-600'
      case 'desktops': return 'from-green-500 to-emerald-600'
      case 'monitors': return 'from-red-500 to-pink-600'
      case 'accessories': return 'from-purple-500 to-indigo-600'
      case 'gaming': return 'from-orange-500 to-red-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'laptops': return '💻'
      case 'desktops': return '🖥️'
      case 'monitors': return '🖥️'
      case 'accessories': return '⌨️'
      case 'gaming': return '🎮'
      default: return '🛍️'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'fr' ? 'Tous les Produits' : language === 'ar' ? 'جميع المنتجات' : 'All Products'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {language === 'fr' ? 'Découvrez notre collection complète de produits technologiques' : 
               language === 'ar' ? 'اكتشف مجموعتنا الكاملة من المنتجات التكنولوجية' : 
               'Discover our complete collection of technology products'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'fr' ? 'Rechercher' : language === 'ar' ? 'بحث' : 'Search'}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher des produits...' : language === 'ar' ? 'البحث عن المنتجات...' : 'Search products...'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'fr' ? 'Catégorie' : language === 'ar' ? 'الفئة' : 'Category'}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">{language === 'fr' ? 'Toutes les catégories' : language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                <option value="laptops">{language === 'fr' ? 'Ordinateurs portables' : language === 'ar' ? 'أجهزة كمبيوتر محمولة' : 'Laptops'}</option>
                <option value="desktops">{language === 'fr' ? 'Ordinateurs de bureau' : language === 'ar' ? 'أجهزة كمبيوتر سطح المكتب' : 'Desktops'}</option>
                <option value="monitors">{language === 'fr' ? 'Écrans' : language === 'ar' ? 'شاشات' : 'Monitors'}</option>
                <option value="accessories">{language === 'fr' ? 'Accessoires' : language === 'ar' ? 'إكسسوارات' : 'Accessories'}</option>
                <option value="gaming">{language === 'fr' ? 'Gaming' : language === 'ar' ? 'ألعاب' : 'Gaming'}</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'fr' ? 'Trier par' : language === 'ar' ? 'ترتيب حسب' : 'Sort by'}
              </label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="name">{language === 'fr' ? 'Nom' : language === 'ar' ? 'الاسم' : 'Name'}</option>
                <option value="price-low">{language === 'fr' ? 'Prix (bas à élevé)' : language === 'ar' ? 'السعر (منخفض إلى عالي)' : 'Price (Low to High)'}</option>
                <option value="price-high">{language === 'fr' ? 'Prix (élevé à bas)' : language === 'ar' ? 'السعر (عالي إلى منخفض)' : 'Price (High to Low)'}</option>
                <option value="rating">{language === 'fr' ? 'Note' : language === 'ar' ? 'التقييم' : 'Rating'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Flash Sale Banner with Countdown */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-lg mb-6 text-center relative overflow-hidden">
          {/* Background Animation */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 w-4 h-4 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full animate-ping delay-1000"></div>
            <div className="absolute bottom-2 left-1/4 w-2 h-2 bg-white rounded-full animate-ping delay-2000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <span className="text-3xl animate-bounce">🔥</span>
              <div>
                <h3 className="text-2xl font-bold">FLASH SALE ENDS SOON!</h3>
                <p className="text-sm opacity-90">Up to 70% OFF on all products - Limited time only!</p>
              </div>
              <span className="text-3xl animate-bounce">⚡</span>
            </div>
            
            {/* Countdown Timer */}
            <div className="flex justify-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="text-xs">HOURS</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="text-xs">MINUTES</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="text-xs">SECONDS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {/* Product Image */}
              <div className="relative h-80">
                <div 
                  className={`w-full h-full bg-gradient-to-br ${getCategoryColor(product.category)} flex items-center justify-center text-white`}
                >
                  <div className="text-center">
                    <div className="text-8xl mb-2">{getCategoryIcon(product.category)}</div>
                    <div className="text-sm font-medium opacity-90">{product.name}</div>
                  </div>
                </div>
                
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    🔥 {product.badge}
                  </span>
                </div>
                
                {/* Limited Time Badge */}
                <div className="absolute top-3 right-16">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⚡ FLASH SALE
                  </span>
                </div>

                {/* Stock Status */}
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full shadow-lg ${
                    product.inStock 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                  }`}>
                    {product.inStock ? '✅ IN STOCK' : '❌ SOLD OUT'}
                  </span>
                </div>
                
                {/* Bottom Marketing Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="bg-black bg-opacity-80 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ⚡ FAST DELIVERY
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                    {product.category}
                  </span>
                  <div className="flex items-center bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded-full">
                    <span className="text-yellow-500 text-sm">⭐⭐⭐⭐⭐</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 ml-1">{product.rating}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">({product.reviews} reviews)</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 font-medium">
                  {product.description}
                </p>
                
                <div className="mb-3">
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-bold">
                    <span className="mr-1">✅</span>
                    Fast Delivery • 30-Day Returns • 2-Year Warranty
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
                    {product.inStock ? '🛒 ADD TO CART' : '❌ SOLD OUT'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'fr' ? 'Aucun produit trouvé' : language === 'ar' ? 'لم يتم العثور على منتجات' : 'No products found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'fr' ? 'Essayez de modifier vos critères de recherche' : language === 'ar' ? 'حاول تعديل معايير البحث الخاصة بك' : 'Try adjusting your search criteria'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}