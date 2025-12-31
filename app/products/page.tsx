'use client'

import Link from 'next/link'
import Image from 'next/image'
import QuickOrderModal from '@/components/QuickOrderModal'
import ProductCard from '@/components/ProductCard'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { getProductPageProducts, getAllProducts, getProductsByCategory, searchProducts } from '@/lib/products'
import { getAllCategories, matchProductToCategory, Category } from '@/lib/categories'
import { Product } from '@/types'
import { 
  StarIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
  Squares2X2Icon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  FireIcon,
  BoltIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

// Legacy product data - removed to reduce bundle size and improve load time
// This data is no longer needed as we use MongoDB for products
/*
const legacyProducts = [
  {
    id: 1,
    name: 'MacBook Pro 16" M3 Max',
    nameFr: 'MacBook Pro 16" M3 Max',
    description: 'Professional laptop with M3 Max chip, perfect for creators and developers. Features stunning Liquid Retina XDR display.',
    descriptionFr: 'Ordinateur portable professionnel avec puce M3 Max, parfait pour les créateurs et développeurs. Doté d\'un écran Liquid Retina XDR époustouflant.',
    price: 2499,
    originalPrice: 2799,
    category: 'laptops',
    inStock: true,
    rating: 4.8,
    reviews: 124,
    badgeKey: 'products.badge.hotDeal',
    discount: 11,
    image: 'https://via.placeholder.com/400x300/1E40AF/FFFFFF?text=MacBook+Pro+M3',
    features: ['M3 Max Chip', '32GB RAM', '1TB SSD', '16-inch Retina Display'],
    specifications: {
      'Processor': 'Apple M3 Max',
      'Memory': '32GB Unified Memory',
      'Storage': '1TB SSD',
      'Display': '16.2-inch Liquid Retina XDR',
      'Graphics': '40-core GPU',
      'Battery': 'Up to 22 hours'
    }
  },
  {
    id: 2,
    name: 'Dell XPS 13',
    nameFr: 'Dell XPS 13',
    description: 'Ultra-portable laptop with stunning 13.4-inch display and all-day battery life. Perfect for professionals on the go.',
    descriptionFr: 'Ordinateur portable ultra-portable avec un écran 13,4 pouces époustouflant et une autonomie d\'une journée. Parfait pour les professionnels en déplacement.',
    price: 1299,
    originalPrice: 1499,
    category: 'laptops',
    inStock: true,
    rating: 4.6,
    reviews: 89,
    badgeKey: 'product.badge.bestseller',
    discount: 13,
    image: 'https://via.placeholder.com/400x300/059669/FFFFFF?text=Dell+XPS+13',
    features: ['Intel i7', '16GB RAM', '512GB SSD', '13.4-inch 4K Display'],
    specifications: {
      'Processor': 'Intel Core i7-1360P',
      'Memory': '16GB LPDDR5',
      'Storage': '512GB PCIe SSD',
      'Display': '13.4-inch 4K+ Touch',
      'Graphics': 'Intel Iris Xe',
      'Battery': 'Up to 12 hours'
    }
  },
  {
    id: 3,
    name: 'ASUS ROG Gaming Laptop',
    nameFr: 'ASUS ROG Ordinateur Portable Gaming',
    description: 'High-performance gaming laptop with RTX 4070 and 144Hz display. Built for serious gamers and content creators.',
    descriptionFr: 'Ordinateur portable gaming haute performance avec RTX 4070 et écran 144Hz. Conçu pour les joueurs sérieux et les créateurs de contenu.',
    price: 1899,
    originalPrice: 2199,
    category: 'laptops',
    inStock: true,
    rating: 4.7,
    reviews: 156,
    badgeKey: 'product.badge.gaming',
    discount: 14,
    image: 'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=ASUS+ROG+Gaming',
    features: ['RTX 4070', 'Intel i7', '16GB RAM', '144Hz Display'],
    specifications: {
      'Processor': 'Intel Core i7-13700H',
      'Memory': '16GB DDR5',
      'Storage': '1TB PCIe SSD',
      'Display': '15.6-inch 144Hz FHD',
      'Graphics': 'NVIDIA RTX 4070',
      'Battery': 'Up to 6 hours'
    }
  },
  {
    id: 4,
    name: 'Gaming PC RTX 4080',
    nameFr: 'PC Gaming RTX 4080',
    description: 'High-performance gaming desktop with Intel Core i9 and NVIDIA RTX 4080. Ultimate gaming and content creation machine.',
    descriptionFr: 'Ordinateur de bureau gaming haute performance avec Intel Core i9 et NVIDIA RTX 4080. Machine ultime pour le gaming et la création de contenu.',
    price: 2899,
    originalPrice: 3299,
    category: 'desktops',
    inStock: true,
    rating: 4.8,
    reviews: 67,
    badgeKey: 'products.badge.limited',
    discount: 12,
    image: 'https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Gaming+PC+RTX+4080',
    features: ['RTX 4080', 'Intel i9', '32GB RAM', '2TB SSD'],
    specifications: {
      'Processor': 'Intel Core i9-13900K',
      'Memory': '32GB DDR5',
      'Storage': '2TB PCIe SSD',
      'Graphics': 'NVIDIA RTX 4080',
      'Power Supply': '850W 80+ Gold',
      'Cooling': 'Liquid Cooling'
    }
  },
  {
    id: 5,
    name: 'iMac 24" M3',
    nameFr: 'iMac 24" M3',
    description: 'All-in-one desktop with 24-inch 4.5K Retina display and M3 chip. Beautiful design meets powerful performance.',
    descriptionFr: 'Ordinateur tout-en-un avec écran Retina 4,5K de 24 pouces et puce M3. Design magnifique allié à des performances puissantes.',
    price: 1299,
    originalPrice: 1499,
    category: 'desktops',
    inStock: true,
    rating: 4.7,
    reviews: 98,
    badgeKey: 'product.badge.popular',
    discount: 13,
    image: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=iMac+24+M3',
    features: ['M3 Chip', '8GB RAM', '256GB SSD', '24-inch 4.5K Display'],
    specifications: {
      'Processor': 'Apple M3',
      'Memory': '8GB Unified Memory',
      'Storage': '256GB SSD',
      'Display': '24-inch 4.5K Retina',
      'Graphics': '8-core GPU',
      'Camera': '1080p FaceTime HD'
    }
  },
  {
    id: 6,
    name: 'ASUS ProArt 27"',
    nameFr: 'ASUS ProArt 27"',
    description: 'Professional 4K monitor with 99% Adobe RGB coverage. Perfect for designers, photographers, and content creators.',
    descriptionFr: 'Moniteur professionnel 4K avec couverture Adobe RGB à 99%. Parfait pour les designers, photographes et créateurs de contenu.',
    price: 899,
    originalPrice: 1099,
    category: 'monitors',
    inStock: true,
    rating: 4.7,
    reviews: 234,
    badgeKey: 'products.badge.pro',
    discount: 18,
    image: 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=ASUS+ProArt+27',
    features: ['4K UHD', '99% Adobe RGB', 'HDR10', 'USB-C'],
    specifications: {
      'Size': '27-inch',
      'Resolution': '3840 x 2160',
      'Panel': 'IPS',
      'Color Gamut': '99% Adobe RGB',
      'Brightness': '400 cd/m²',
      'Response Time': '5ms'
    }
  },
  {
    id: 7,
    name: 'Dell UltraSharp 32"',
    nameFr: 'Dell UltraSharp 32"',
    description: 'Ultra-wide 4K monitor with USB-C connectivity. Ideal for productivity and professional work.',
    descriptionFr: 'Moniteur 4K ultra-large avec connectivité USB-C. Idéal pour la productivité et le travail professionnel.',
    price: 1199,
    originalPrice: 1399,
    category: 'monitors',
    inStock: true,
    rating: 4.6,
    reviews: 145,
    badgeKey: 'products.badge.premium',
    discount: 14,
    image: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Dell+UltraSharp+32',
    features: ['32-inch 4K', 'USB-C', '99% sRGB', 'HDR400'],
    specifications: {
      'Size': '32-inch',
      'Resolution': '3840 x 2160',
      'Panel': 'IPS',
      'Color Gamut': '99% sRGB',
      'Brightness': '400 cd/m²',
      'Connectivity': 'USB-C, HDMI, DisplayPort'
    }
  },
  {
    id: 8,
    name: 'Logitech MX Master 3S',
    nameFr: 'Logitech MX Master 3S',
    description: 'Premium wireless mouse with ultra-fast scrolling and ergonomic design. Perfect for productivity and creative work.',
    descriptionFr: 'Souris sans fil premium avec défilement ultra-rapide et design ergonomique. Parfaite pour la productivité et le travail créatif.',
    price: 99,
    originalPrice: 129,
    category: 'accessories',
    inStock: true,
    rating: 4.8,
    reviews: 567,
    badgeKey: 'product.badge.bestseller',
    discount: 23,
    image: 'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Logitech+MX+Master+3S',
    features: ['Wireless', 'Ultra-fast Scroll', 'Ergonomic', 'Multi-device'],
    specifications: {
      'Connectivity': 'Bluetooth, USB Receiver',
      'Battery': 'Up to 70 days',
      'DPI': '8000 DPI',
      'Buttons': '7 programmable',
      'Scroll': 'MagSpeed electromagnetic',
      'Compatibility': 'Windows, macOS, Linux'
    }
  },
  {
    id: 9,
    name: 'Corsair K100 RGB',
    nameFr: 'Corsair K100 RGB',
    description: 'Mechanical gaming keyboard with Cherry MX Speed switches and RGB lighting. Built for gamers and enthusiasts.',
    descriptionFr: 'Clavier mécanique gaming avec interrupteurs Cherry MX Speed et éclairage RGB. Conçu pour les joueurs et les passionnés.',
    price: 199,
    originalPrice: 249,
    category: 'accessories',
    inStock: true,
    rating: 4.5,
    reviews: 234,
    badgeKey: 'product.badge.gaming',
    discount: 20,
    image: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Corsair+K100+RGB',
    features: ['Cherry MX Speed', 'RGB Lighting', 'Aluminum Frame', 'Macro Keys'],
    specifications: {
      'Switches': 'Cherry MX Speed',
      'Backlighting': 'RGB per-key',
      'Frame': 'Aluminum',
      'Macro Keys': '6 dedicated',
      'Media Keys': 'Volume wheel',
      'Cable': 'Detachable USB-C'
    }
  },
  {
    id: 10,
    name: 'SteelSeries Arctis 7P',
    nameFr: 'SteelSeries Arctis 7P',
    description: 'Wireless gaming headset with 2.4GHz lossless audio and 30-hour battery life. Perfect for gaming and entertainment.',
    descriptionFr: 'Casque gaming sans fil avec audio sans perte 2,4 GHz et autonomie de 30 heures. Parfait pour le gaming et le divertissement.',
    price: 149,
    originalPrice: 179,
    category: 'accessories',
    inStock: true,
    rating: 4.7,
    reviews: 345,
    badgeKey: 'products.badge.wireless',
    discount: 17,
    image: 'https://via.placeholder.com/400x300/EC4899/FFFFFF?text=SteelSeries+Arctis+7P',
    features: ['Wireless 2.4GHz', '30h Battery', 'Lossless Audio', 'Comfortable'],
    specifications: {
      'Connectivity': '2.4GHz Wireless',
      'Battery': 'Up to 30 hours',
      'Drivers': '40mm neodymium',
      'Frequency': '20-20000 Hz',
      'Microphone': 'Retractable noise-cancelling',
      'Compatibility': 'PC, PlayStation, Switch'
    }
  },
  {
    id: 11,
    name: 'PlayStation 5',
    nameFr: 'PlayStation 5',
    description: 'Next-gen gaming console with 4K gaming and ray tracing. Experience the future of gaming.',
    descriptionFr: 'Console de jeu nouvelle génération avec gaming 4K et lancer de rayons. Vivez l\'avenir du gaming.',
    price: 499,
    originalPrice: 599,
    category: 'gaming',
    inStock: true,
    rating: 4.7,
    reviews: 1234,
    badgeKey: 'products.badge.exclusive',
    discount: 17,
    image: 'https://via.placeholder.com/400x300/1F2937/FFFFFF?text=PlayStation+5',
    features: ['4K Gaming', 'Ray Tracing', 'SSD Storage', '3D Audio'],
    specifications: {
      'CPU': 'AMD Zen 2 8-core',
      'GPU': 'AMD RDNA 2',
      'Memory': '16GB GDDR6',
      'Storage': '825GB SSD',
      'Optical Drive': '4K UHD Blu-ray',
      'Audio': 'Tempest 3D AudioTech'
    }
  },
  {
    id: 12,
    name: 'Nintendo Switch OLED',
    nameFr: 'Nintendo Switch OLED',
    description: 'Handheld gaming console with 7-inch OLED screen and enhanced audio. Perfect for gaming anywhere.',
    descriptionFr: 'Console de jeu portable avec écran OLED de 7 pouces et audio amélioré. Parfaite pour jouer n\'importe où.',
    price: 349,
    originalPrice: 399,
    category: 'gaming',
    inStock: true,
    rating: 4.8,
    reviews: 789,
    badgeKey: 'products.badge.portable',
    discount: 13,
    image: 'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Nintendo+Switch+OLED',
    features: ['7-inch OLED', 'Enhanced Audio', '64GB Storage', 'Portable'],
    specifications: {
      'Display': '7-inch OLED',
      'Storage': '64GB internal',
      'Battery': 'Up to 9 hours',
      'Audio': 'Enhanced speakers',
      'Connectivity': 'Wi-Fi, Bluetooth',
      'Joy-Con': 'Included'
    }
  }
]
*/

export default function ProductsPage() {
  const router = useRouter()
  const { t, language, formatCurrency } = useLanguage()
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 45
  })
  const [endTime, setEndTime] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null)
  const [showProductNotification, setShowProductNotification] = useState(false)
  const [showQuickOrder, setShowQuickOrder] = useState(false)
  const [quickProduct, setQuickProduct] = useState<{ id: string; name: string; price: number } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Load products and categories - Optimized for faster loading
  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      try {
        // Load in parallel for faster loading
        // Use Promise.allSettled to handle partial failures gracefully
        const [productsResult, categoriesResult] = await Promise.allSettled([
          getProductPageProducts(), // Only show products that should be visible
          getAllCategories(true) // Only active categories
        ])
        
        if (!isMounted) return
        
        // Handle products
        if (productsResult.status === 'fulfilled') {
          setProducts(productsResult.value)
          
          // Preload first 15 product images for faster display (increased for better UX)
          if (productsResult.value && productsResult.value.length > 0 && typeof window !== 'undefined') {
            productsResult.value.slice(0, 15).forEach((product) => {
              if (product.image) {
                const img = document.createElement('img')
                img.src = product.image
                img.loading = 'eager'
                // @ts-ignore - fetchPriority is supported in modern browsers
                img.fetchPriority = 'high'
                // Start loading in background
                document.body.appendChild(img)
                setTimeout(() => {
                  if (img.parentNode) {
                    img.parentNode.removeChild(img)
                  }
                }, 0)
              }
            })
            
            // Prefetch product detail pages for first 5 products on hover
            productsResult.value.slice(0, 5).forEach((product) => {
              if (product.id) {
                fetch(`/api/products/${product.id}`, { method: 'HEAD' }).catch(() => {})
              }
            })
          }
        } else {
          console.error('Error loading products:', productsResult.reason)
          setProducts([])
        }
        
        // Handle categories
        if (categoriesResult.status === 'fulfilled') {
          setCategories(categoriesResult.value.sort((a, b) => a.order - b.order))
        } else {
          console.error('Error loading categories:', categoriesResult.reason)
          setCategories([])
        }
      } catch (error) {
        console.error('Error loading data:', error)
        if (isMounted) {
          setProducts([])
          setCategories([])
        }
      }
    }
    
    // Start loading immediately
    loadData()
    
    // Listen for product changes (still works for client-side updates)
    const handleChange = () => {
      if (isMounted) {
        loadData()
      }
    }
    window.addEventListener('pixelpad_products_changed', handleChange)
    
    return () => {
      isMounted = false
      window.removeEventListener('pixelpad_products_changed', handleChange)
    }
  }, [])

  // Categories with dynamic counts from database - Optimized with useMemo
  const categoryData = useMemo(() => {
    // Create maps for faster category lookups
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]))
    const categorySlugMap = new Map(categories.map(cat => [cat.slug, cat]))
    
    return [
      { nameKey: 'products.categories.all', value: 'all', count: products.length }
    ].concat(
      categories.map(cat => {
        // Optimized count calculation using maps
        const count = products.filter(p => {
          if (!p.category) return false
          const categoryId = typeof p.category === 'string' 
            ? p.category 
            : (typeof p.category === 'object' && p.category !== null && 'toString' in p.category)
              ? String(p.category)
              : String(p.category)
          const matched = categoryMap.get(categoryId) || categorySlugMap.get(categoryId) || matchProductToCategory(p.category, categories)
          return matched?.id === cat.id || matched?.slug === cat.slug
        }).length
        
        return {
          nameKey: `home.categories.${cat.slug}`,
          name: language === 'fr' && cat.nameFr ? cat.nameFr : 
                language === 'ar' && cat.nameAr ? cat.nameAr : 
                cat.name,
          value: cat.slug,
          count
        }
      })
    )
  }, [products, categories, language])

  // Handle URL parameters for direct product links and category filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const productId = urlParams.get('product')
    const categoryParam = urlParams.get('category')
    
    // Handle category parameter
    if (categoryParam) {
      setSelectedCategories([categoryParam])
    }
    
    if (productId && products.length > 0) {
      setHighlightedProduct(productId)
      setShowProductNotification(true)
      
      // Find the product and set appropriate category
      const product = products.find(p => p.id.toString() === productId)
      if (product) {
        setSelectedCategories([product.category])
        
        // Function to scroll to product with retry mechanism
        const scrollToProduct = (retries = 5) => {
          const productElement = document.getElementById(`product-${productId}`)
          if (productElement) {
            // Wait a bit more for layout to settle
            setTimeout(() => {
              productElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
              })
              
              // Add highlight effect
              productElement.classList.add('ring-4', 'ring-primary-500', 'ring-opacity-50')
              
              // Remove highlight after 3 seconds
              setTimeout(() => {
                productElement.classList.remove('ring-4', 'ring-primary-500', 'ring-opacity-50')
                setHighlightedProduct(null)
              }, 3000)
            }, 300)
          } else if (retries > 0) {
            // Retry after a delay if element not found
            setTimeout(() => scrollToProduct(retries - 1), 500)
          }
        }
        
        // Start scrolling after products are loaded and filtered
        setTimeout(() => {
          scrollToProduct()
        }, 800)
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setShowProductNotification(false)
        }, 5000)
      }
    }
  }, [products])

  // Initialize countdown timer
  useEffect(() => {
    const savedEndTime = localStorage.getItem('pixelPadCountdownEndTime')
    const now = Date.now()
    
    if (savedEndTime) {
      const endTime = parseInt(savedEndTime)
      const timeRemaining = endTime - now
      
      if (timeRemaining > 0) {
        setEndTime(endTime)
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)
        setTimeLeft({ hours, minutes, seconds })
      } else {
        const newEndTime = now + (24 * 60 * 60 * 1000)
        localStorage.setItem('pixelPadCountdownEndTime', newEndTime.toString())
        setEndTime(newEndTime)
        setTimeLeft({ hours: 23, minutes: 59, seconds: 59 })
      }
    } else {
      const newEndTime = now + (24 * 60 * 60 * 1000)
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
        const newEndTime = now + (24 * 60 * 60 * 1000)
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
      const matchesCategory = selectedCategories.includes('all') || 
        selectedCategories.some(selectedCat => {
          const matched = matchProductToCategory(product.category, categories)
          return matched?.slug === selectedCat || matched?.id === selectedCat
        })
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
          return (b.rating || 0) - (a.rating || 0)
        case 'discount':
          return (b.discount || 0) - (a.discount || 0)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategories, searchQuery, sortOption])

  // Performance optimization: Preload images
  useEffect(() => {
    const preloadImages = () => {
      products.forEach(product => {
        const img = document.createElement('img')
        img.src = product.image
      })
    }
    
    preloadImages()
  }, [products])


  const getCategoryColor = (category: string) => {
    return 'from-primary-500 to-primary-600'
  }

  const getCategoryIcon = (category: string) => {
    const getIconSrc = (cat: string) => {
      switch (cat) {
        case 'laptops': return '/icons/laptop.svg'
        case 'desktops': return '/icons/computer.svg'
        case 'monitors': return '/icons/monitor.svg'
        case 'accessories': return '/icons/computer-keyboard.svg'
        case 'gaming': return '/icons/game-controller.svg'
        default: return '/icons/handbag_10802004.svg'
      }
    }
    
    const getIconAlt = (cat: string) => {
      switch (cat) {
        case 'laptops': return 'Laptop'
        case 'desktops': return 'Desktop'
        case 'monitors': return 'Monitor'
        case 'accessories': return 'Accessories'
        case 'gaming': return 'Gaming'
        default: return 'Products'
      }
    }
    
    return (
      <div className="relative w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
        <Image 
          src={getIconSrc(category)} 
          alt={getIconAlt(category)} 
          width={40} 
          height={40} 
          className="w-10 h-10 filter brightness-0 invert"
        />
      </div>
    )
  }

  // Render rating - only full stars, rounded to nearest integer
  const renderRatingStars = (rating: number, sizeClasses: string = 'h-4 w-4') => {
    // Round to nearest integer (4.8 -> 5, 4.3 -> 4)
    const roundedStars = Math.round(rating)
    const stars = []
    
    // Show only full stars
    for (let i = 0; i < roundedStars; i++) {
      stars.push(
        <StarIcon key={i} className={`${sizeClasses} text-yellow-400 fill-current`} />
      )
    }
    
    return (
      <div className={`flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : ''}`} style={{ width: 'fit-content' }}>
        {stars}
      </div>
    )
  }

  // Flash sale progress (time remaining over 24h window)
  const saleProgressPercent = (() => {
    try {
      if (!endTime) return 0
      const total = 24 * 60 * 60 * 1000
      const remaining = Math.max(0, endTime - Date.now())
      const elapsed = Math.max(0, total - remaining)
      return Math.min(100, Math.round((elapsed / total) * 100))
    } catch {
      return 0
    }
  })();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative pt-20 sm:pt-24">
      
      {/* Enhanced Header */}
      <div className="relative bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-10 pt-24">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-500 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-6 relative z-10">
          <div className="text-center animate-in slide-in-from-top duration-1000">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-4 animate-in fade-in duration-1000 delay-300">
              {t('products.title')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-5 lg:mb-6 animate-in slide-in-from-bottom duration-1000 delay-500 px-2">
              {t('products.subtitle')}
            </p>
            
            {/* Enhanced Trust Indicators - Compact for Desktop */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-3.5 md:gap-4 lg:gap-5 animate-in slide-in-from-bottom duration-1000 delay-700">
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 sm:px-3 md:px-3 lg:px-4 py-2 sm:py-2.5 md:py-2.5 lg:py-2.5 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300 group w-[130px] xs:w-[140px] sm:w-[150px] md:w-[160px] lg:w-[140px] xl:w-[160px]">
                <Image src="/icons/trophy_1576749.svg" alt="Trophy icon" width={24} height={24} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left flex-1 min-w-0">
                  <div className="text-[11px] sm:text-xs md:text-sm lg:text-xs xl:text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 truncate">500+</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-[10px] xl:text-xs text-gray-600 dark:text-gray-300 truncate">{t('products.trust.happyClients')}</div>
                </div>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 sm:px-3 md:px-3 lg:px-4 py-2 sm:py-2.5 md:py-2.5 lg:py-2.5 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300 group w-[130px] xs:w-[140px] sm:w-[150px] md:w-[160px] lg:w-[140px] xl:w-[160px]">
                <Image src="/icons/star-gold-orange.svg" alt="Star icon" width={24} height={24} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left flex-1 min-w-0">
                  <div className="text-[11px] sm:text-xs md:text-sm lg:text-xs xl:text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 truncate">4.7/5</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-[10px] xl:text-xs text-gray-600 dark:text-gray-300 truncate">{t('products.trust.customerRating')}</div>
                </div>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 sm:px-3 md:px-3 lg:px-4 py-2 sm:py-2.5 md:py-2.5 lg:py-2.5 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300 group w-[130px] xs:w-[140px] sm:w-[150px] md:w-[160px] lg:w-[140px] xl:w-[160px]">
                <Image src="/icons/security_102649.svg" alt="Security icon" width={24} height={24} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform duration-300 dark:invert" />
                <div className="text-left flex-1 min-w-0">
                  <div className="text-[11px] sm:text-xs md:text-sm lg:text-xs xl:text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 truncate">1 Year</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-[10px] xl:text-xs text-gray-600 dark:text-gray-300 truncate">{t('products.trust.warranty')}</div>
                </div>
              </div>
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-2.5 sm:px-3 md:px-3 lg:px-4 py-2 sm:py-2.5 md:py-2.5 lg:py-2.5 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300 group w-[130px] xs:w-[140px] sm:w-[150px] md:w-[160px] lg:w-[140px] xl:w-[160px]">
                <Image src="/icons/delivery-truck.svg" alt="Delivery truck icon" width={24} height={24} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left flex-1 min-w-0">
                  <div className="text-[11px] sm:text-xs md:text-sm lg:text-xs xl:text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 truncate">24h</div>
                  <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-[10px] xl:text-xs text-gray-600 dark:text-gray-300 truncate">{t('products.trust.fastDelivery')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          
          {/* Enhanced Sidebar Filters - Compact for Desktop */}
          <div className="lg:w-1/5 xl:w-1/6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 lg:p-5 xl:p-6 sticky top-4 xl:top-6 animate-in slide-in-from-left duration-1000">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-md">
                    <FunnelIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  {t('products.filters.title')}
                  {(selectedCategories.length > 1 || selectedCategories[0] !== 'all' || searchQuery) && (
                    <span className="px-1.5 py-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full">
                      {(selectedCategories.length > 1 || selectedCategories[0] !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)}
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1.5">
                  {(selectedCategories.length > 1 || selectedCategories[0] !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedCategories(['all'])
                        setSearchQuery('')
                      }}
                      className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition"
                      aria-label={t('products.filters.clearAll')}
                    >
                      {t('products.filters.clear')}
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    aria-label={t('products.filters.toggle')}
                  >
                    <FunnelIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            
              <div className={`space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Enhanced Search */}
                <div className="animate-in slide-in-from-left duration-1000 delay-200">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('products.filters.search')}
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('products.filters.searchPlaceholder')}
                      className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 group-hover:border-primary-400"
                      aria-label={t('products.filters.search')}
                    />
                    <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-300" />
            </div>
          </div>
          
                {/* Enhanced Categories - Checkbox Filter */}
                <div className="animate-in slide-in-from-left duration-1000 delay-400">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('products.filters.categories')}
                  </label>
                  <div className="space-y-2">
                    {categoryData.map((category, index) => {
                      const isChecked = selectedCategories.includes(category.value)
                      const isAll = category.value === 'all'
                      
                      return (
                        <label
                          key={category.value}
                          className={`flex items-center px-3 py-2 text-sm rounded-md transition-all duration-300 cursor-pointer ${
                            isChecked
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-md border border-primary-300 dark:border-primary-700'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (isAll) {
                                // If "All" is clicked, toggle all categories
                                setSelectedCategories(e.target.checked ? ['all'] : [])
                              } else {
                                // If a specific category is clicked
                                if (e.target.checked) {
                                  // Remove 'all' if it exists and add the category
                                  const newCategories = selectedCategories.filter(c => c !== 'all')
                                  setSelectedCategories([...newCategories, category.value])
                                } else {
                                  // Remove the category
                                  const newCategories = selectedCategories.filter(c => c !== category.value)
                                  // If no categories selected, select 'all'
                                  setSelectedCategories(newCategories.length > 0 ? newCategories : ['all'])
                                }
                              }
                            }}
                            className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                            aria-label={`${t('products.filters.categories')}: ${t(category.nameKey)}`}
                          />
                          <span className="font-medium flex-1">{t(category.nameKey)}</span>
                          {category.count !== undefined && (
                            <span className="text-xs text-gray-500 dark:text-gray-300 ml-2">
                              ({category.count})
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
                
                {/* Enhanced Sort Options */}
                <div className="animate-in slide-in-from-left duration-1000 delay-600">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('products.filters.sortBy')}
                  </label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 hover:border-primary-400"
                  >
                    <option value="name">{t('products.sort.name')}</option>
                    <option value="price-low">{t('products.sort.priceLow')}</option>
                    <option value="price-high">{t('products.sort.priceHigh')}</option>
                    <option value="rating">{t('products.sort.rating')}</option>
                    <option value="discount">{t('products.sort.discount')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Main Content - Compact for Desktop */}
          <div className="lg:w-4/5 xl:w-5/6">
            {/* Product Notification Banner - Compact for Desktop */}
            {showProductNotification && highlightedProduct && (
              <div className="bg-primary-600 text-white p-3 lg:p-4 rounded-lg shadow-lg mb-4 lg:mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Image src="/icons/target_17139056.svg" alt="Target icon" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5" />
                    <div>
                      <h3 className="text-sm sm:text-base lg:text-sm xl:text-base font-bold">{t('products.notification.found')}</h3>
                      <p className="text-xs sm:text-sm lg:text-xs xl:text-sm opacity-90">{t('products.notification.highlighted')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowProductNotification(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Products Grid - Using ProductCard component like home page */}
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-3.5 md:gap-3.5 items-stretch' 
                : 'space-y-3.5 md:space-y-3.5'
            }`}>
              {paginatedProducts.length > 0 ? paginatedProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  id={`product-${product.id}`}
                  className={`${highlightedProduct === product.id.toString() ? 'ring-2 ring-primary-500 ring-opacity-50 rounded-2xl' : ''} animate-in slide-in-from-bottom duration-1000 h-full flex`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={viewMode === 'list' ? 'w-full' : 'w-full h-full'}>
                    <ProductCard product={product} hideIds />
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12">
                  <div className="mb-4 flex justify-center">
                    <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t('products.noResults.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('products.noResults.description')}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredProducts.length > itemsPerPage && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {t('products.pagination.showing', { 
                    start: startIndex + 1, 
                    end: Math.min(endIndex, filteredProducts.length), 
                    total: filteredProducts.length 
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                    aria-label={t('products.pagination.previous')}
                  >
                    <ChevronLeftIcon className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-500 dark:text-gray-300">
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                    aria-label={t('products.pagination.next')}
                  >
                    <ChevronRightIcon className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {showQuickOrder && quickProduct && (
              <QuickOrderModal product={quickProduct} onClose={() => setShowQuickOrder(false)} />
            )}

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4 flex justify-center">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search criteria or filters
            </p>
          </div>
        )}

        {/* Enhanced Professional Support Section */}
        <div className="mt-8 relative z-10">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl -z-10"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-24 h-24 bg-primary-400 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary-400 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative bg-white dark:bg-gray-800 dark:bg-opacity-95 rounded-xl p-4 lg:p-5 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-4">
              <div className="inline-flex items-center bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 py-1.5 rounded-full text-[10px] font-bold mb-3 shadow-md">
                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                {t('products.support.title')}
              </div>
              <h2 className="text-lg lg:text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                <span className="bg-gradient-to-r from-gray-900 via-primary-600 to-primary-700 dark:from-white dark:via-primary-400 dark:to-primary-400 bg-clip-text text-transparent">
                  {t('products.support.heading')}
                </span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-3">
                {t('products.support.description')}
              </p>
              
              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:bg-opacity-90 rounded-full border border-transparent dark:border-gray-600">
                  <CheckCircleIcon className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{t('products.support.freeConsultation')}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:bg-opacity-90 rounded-full border border-transparent dark:border-gray-600">
                  <CheckCircleIcon className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{t('products.support.expertAdvice')}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:bg-opacity-90 rounded-full border border-transparent dark:border-gray-600">
                  <CheckCircleIcon className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                  <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{t('products.support.fastResponse')}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
              <div className="group relative bg-gradient-to-br from-primary-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 dark:bg-opacity-90 rounded-lg p-3 border border-primary-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
                  <PhoneIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-md">
                    <PhoneIcon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold mb-1 text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors duration-300">{t('products.support.phone.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2 text-[10px] leading-relaxed">{t('products.support.phone.description')}</p>
                  <div className="text-[9px] text-gray-500 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <PhoneIcon className="h-2 w-2" />
                    <span>{t('products.support.phone.available')}</span>
                  </div>
                  <a href="tel:+212779318061" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                    {t('products.support.phone.callNow')}
                    <ArrowRightIcon className={`ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </a>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-primary-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 dark:bg-opacity-90 rounded-lg p-3 border border-primary-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
                  <EnvelopeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-md">
                    <EnvelopeIcon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold mb-1 text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors duration-300">{t('products.support.email.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2 text-[10px] leading-relaxed">{t('products.support.email.description')}</p>
                  <div className="text-[9px] text-gray-500 dark:text-gray-300 mb-2">📧 {t('products.support.email.response')}</div>
                  <a href="mailto:pixelpad77@gmail.com?subject=Product%20Inquiry&body=Hello,%20I%20need%20help%20choosing%20the%20right%20product." className="inline-flex items-center justify-center w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                    {t('products.support.email.send')}
                    <ArrowRightIcon className={`ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </a>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-primary-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 dark:bg-opacity-90 rounded-lg p-3 border border-primary-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-md">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold mb-1 text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors duration-300">{t('products.support.whatsapp.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2 text-[10px] leading-relaxed">{t('products.support.whatsapp.description')}</p>
                  <div className="text-[9px] text-gray-500 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <ChatBubbleLeftRightIcon className="h-2 w-2" />
                    <span>{t('products.support.whatsapp.instant')}</span>
                  </div>
                  <a href="https://wa.me/212779318061?text=Hello!%20I%20need%20help%20choosing%20the%20right%20product." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                    {t('products.support.whatsapp.start')}
                    <ArrowRightIcon className={`ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}




