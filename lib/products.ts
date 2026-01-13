import { Product } from '@/types'

// Use MongoDB API instead of localStorage
const API_BASE = '/api/products'

// Helper function to convert MongoDB document to Product
function toProduct(doc: any): Product {
  // Convert category ObjectId to string
  let categoryId: string
  if (doc.category) {
    if (typeof doc.category === 'object') {
      // If it's an ObjectId or populated category object
      categoryId = doc.category._id?.toString() || doc.category.toString()
    } else {
      // If it's already a string
      categoryId = String(doc.category)
    }
  } else {
    categoryId = ''
  }
  
  return {
    id: doc._id?.toString() || doc.id,
    name: doc.name,
    nameFr: doc.nameFr,
    description: doc.description,
    descriptionFr: doc.descriptionFr,
    price: doc.price,
    originalPrice: doc.originalPrice,
    deliveryPrice: doc.deliveryPrice,
    costPrice: doc.costPrice,
    category: categoryId,
    image: doc.image,
    images: doc.images || (doc.image ? [doc.image] : []), // Support multiple images, fallback to single image
    inStock: doc.inStock ?? true,
    stockQuantity: doc.stockQuantity ?? 0,
    soldQuantity: doc.soldQuantity ?? 0,
    rating: doc.rating ?? 0,
    reviews: doc.reviews ?? 0,
    features: doc.features || [],
    specifications: doc.specifications || {},
    badge: doc.badge,
    badgeKey: doc.badgeKey,
    discount: doc.discount ?? 0,
    showOnHomeCarousel: doc.showOnHomeCarousel ?? false,
    showInHero: doc.showInHero ?? false,
    showInNewArrivals: doc.showInNewArrivals ?? false,
    showInBestSellers: doc.showInBestSellers ?? false,
    showInSpecialOffers: doc.showInSpecialOffers ?? false,
    showInTrending: doc.showInTrending ?? false,
    showOnProductPage: doc.showOnProductPage !== false,
    order: doc.order ?? 0,
    variants: doc.variants || undefined,
  }
}

// Cache for products list
const productsCache = new Map<string, { data: Product[]; timestamp: number }>()
const PRODUCTS_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes - faster updates while maintaining performance

// Function to clear products cache
export function clearProductsCache() {
  productsCache.clear()
  productCache.clear()
}

export async function getAllProducts(bypassCache: boolean = false): Promise<Product[]> {
  try {
    // Check cache first (unless bypassing)
    if (!bypassCache) {
      const cached = productsCache.get('all')
      if (cached && Date.now() - cached.timestamp < PRODUCTS_CACHE_DURATION) {
        return cached.data
      }
    }
    
    // Add cache-busting parameter when bypassing cache
    const url = bypassCache ? `${API_BASE}?bypassCache=true&_t=${Date.now()}` : API_BASE
    const response = await fetch(url, {
      cache: bypassCache ? 'no-store' : 'force-cache',
      next: bypassCache ? { revalidate: 0 } : { revalidate: 30 } // 30 seconds for faster updates
    })
    if (!response.ok) {
      console.error('Failed to fetch products:', response.status, response.statusText)
      // Try to get error message from response
      try {
        const errorData = await response.json()
        console.error('Error details:', errorData)
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(`Failed to fetch products: ${response.status}`)
    }
    const data = await response.json()
    if (!Array.isArray(data)) {
      console.error('Invalid products data format - expected array, got:', typeof data, data)
      // If it's an error object, log it
      if (data && typeof data === 'object' && data.error) {
        console.error('API returned error:', data.error)
      }
      return []
    }
    const products = data.map(toProduct)
    
    // Cache the result
    productsCache.set('all', { data: products, timestamp: Date.now() })
    
    return products
  } catch (error: any) {
    // Log error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching products:', error?.message || error)
    }
    // Return cached data if available, even if stale
    const cached = productsCache.get('all')
    if (cached) {
      return cached.data
    }
    return []
  }
}

// Cache for client-side requests
const productCache = new Map<string, { data: Product; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes - faster updates while maintaining performance

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    // Check cache first
    const cached = productCache.get(id)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    
    const response = await fetch(`${API_BASE}/${id}`, {
      cache: 'force-cache',
      next: { revalidate: 60 } // 1 minute revalidation for faster reloads
    })
    if (!response.ok) return undefined
    const data = await response.json()
    const product = toProduct(data)
    
    // Cache the result
    if (product) {
      productCache.set(id, { data: product, timestamp: Date.now() })
    }
    
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return undefined
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getAllProducts()
  if (category === 'all' || !category) return products
  return products.filter(p => p.category === category)
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getAllProducts()
  const lowerQuery = query.toLowerCase()
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  )
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  // Calculate discount if originalPrice is provided but discount is not
  let discount = product.discount
  if (!discount && product.originalPrice && product.originalPrice > product.price) {
    discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  }
  
  // Set default badgeKey if not provided
  let badgeKey = product.badgeKey
  if (!badgeKey && product.badge) {
    const badgeMap: Record<string, string> = {
      'HOT DEAL': 'products.badge.hotDeal',
      'BESTSELLER': 'product.badge.bestseller',
      'POPULAR': 'product.badge.popular',
      'GAMING': 'product.badge.gaming',
      'LIMITED': 'products.badge.limited',
      'PRO': 'products.badge.pro',
      'PREMIUM': 'products.badge.premium',
      'WIRELESS': 'products.badge.wireless',
      'EXCLUSIVE': 'products.badge.exclusive',
      'PORTABLE': 'products.badge.portable'
    }
    badgeKey = badgeMap[product.badge.toUpperCase()] || 'products.badge.hotDeal'
  } else if (!badgeKey) {
    badgeKey = 'products.badge.hotDeal'
  }
  
  const productData = {
    ...product,
    rating: product.rating ?? 4.5,
    reviews: product.reviews ?? 0,
    features: product.features ?? [],
    specifications: product.specifications ?? {},
    discount: discount ?? 0,
    badgeKey: badgeKey,
    showOnHomeCarousel: product.showOnHomeCarousel ?? false,
    showInHero: product.showInHero ?? false,
    showInNewArrivals: product.showInNewArrivals ?? false,
    showInBestSellers: product.showInBestSellers ?? false,
    showInSpecialOffers: product.showInSpecialOffers ?? false,
    showInTrending: product.showInTrending ?? false,
    showOnProductPage: product.showOnProductPage ?? true,
    inStock: product.inStock ?? true
  }

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || errorData.error || 'Failed to create product')
      ;(error as any).response = response
      ;(error as any).errorData = errorData
      throw error
    }
    const data = await response.json()
    return toProduct(data)
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return response.ok
  } catch (error) {
    console.error('Error updating product:', error)
    return false
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      cache: 'no-store', // Don't cache delete requests
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || errorData.error || `Failed to delete product: ${response.status}`)
      ;(error as any).response = response
      ;(error as any).errorData = errorData
      throw error
    }
    // Clear ALL caches after successful deletion
    productsCache.clear()
    productCache.clear() // Clear all individual product caches
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error // Re-throw so the caller can handle it
  }
}

export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/featured?limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch featured products')
    const data = await response.json()
    return data.map(toProduct)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export async function getProductPageProducts(bypassCache: boolean = false): Promise<Product[]> {
  try {
    // Check cache first (unless bypassing)
    if (!bypassCache) {
      const cached = productsCache.get('page')
      if (cached && Date.now() - cached.timestamp < PRODUCTS_CACHE_DURATION) {
        return cached.data
      }
    }
    
    // Add cache-busting parameter when bypassing cache
    const url = bypassCache ? `${API_BASE}/page?bypassCache=true&_t=${Date.now()}` : `${API_BASE}/page`
    const response = await fetch(url, {
      cache: bypassCache ? 'no-store' : 'force-cache',
      next: bypassCache ? { revalidate: 0 } : { revalidate: 30 } // 30 seconds for faster updates
    })
    if (!response.ok) {
      console.error('Failed to fetch product page products:', response.status, response.statusText)
      // Try to get error message from response
      try {
        const errorData = await response.json()
        console.error('Error details:', errorData)
      } catch (e) {
        // Ignore JSON parse errors
      }
      throw new Error(`Failed to fetch products: ${response.status}`)
    }
    const data = await response.json()
    if (!Array.isArray(data)) {
      console.error('Invalid product page data format - expected array, got:', typeof data, data)
      // If it's an error object, log it
      if (data && typeof data === 'object' && data.error) {
        console.error('API returned error:', data.error)
      }
      return []
    }
    const products = data.map(toProduct)
    
    // Cache the result
    productsCache.set('page', { data: products, timestamp: Date.now() })
    
    return products
  } catch (error) {
    console.error('Error fetching product page products:', error)
    // Return cached data if available, even if stale
    const cached = productsCache.get('page')
    if (cached) {
      return cached.data
    }
    return []
  }
}

export async function getNewArrivals(limit: number = 12): Promise<Product[]> {
  try {
    const products = await getAllProducts()
    if (!products || products.length === 0) {
      return []
    }
    // Sort by createdAt (newest first) or by order (lower order = newer)
    // For new arrivals, we want the newest products
    return products
      .sort((a, b) => {
        // First sort by order (ascending - lower order = newer)
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0)
        }
        // If order is same, sort by id (descending - newer IDs)
        return b.id.localeCompare(a.id)
      })
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching new arrivals:', error)
    return []
  }
}

export async function getTopSelling(limit: number = 12): Promise<Product[]> {
  try {
    const products = await getAllProducts()
    if (!products || products.length === 0) {
      return []
    }
    // Sort by soldQuantity (descending - most sold first)
    // If soldQuantity is same, sort by rating (descending)
    return products
      .sort((a, b) => {
        const aSold = a.soldQuantity || 0
        const bSold = b.soldQuantity || 0
        if (aSold !== bSold) {
          return bSold - aSold
        }
        // If sold quantity is same, sort by rating
        const aRating = a.rating || 0
        const bRating = b.rating || 0
        return bRating - aRating
      })
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching top selling products:', error)
    return []
  }
}
