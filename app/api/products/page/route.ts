import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export const dynamic = 'force-dynamic'

// Cache in memory for faster responses
let cachedProducts: any[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes - faster updates while maintaining performance

// Export cache for clearing from other routes
if (typeof global !== 'undefined') {
  global.__productsPageCache = { cachedProducts, cacheTimestamp }
}

export async function GET(request: NextRequest) {
  try {
    // Check for cache-busting parameter
    const { searchParams } = new URL(request.url)
    const bypassCache = searchParams.get('bypassCache') === 'true' || searchParams.get('_t')
    
    // Return cached data if available and fresh (unless bypassing)
    const now = Date.now()
    if (!bypassCache && cachedProducts && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedProducts, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60, max-age=30'
        }
      })
    }

    await connectDB()
    // Return all products where showOnProductPage is not explicitly false
    // This includes products where showOnProductPage is true or undefined/null
    // Use .lean() for faster queries and only select needed fields
    // Limit fields to only what's needed for product listing
    // Use index hint for faster queries
    // Optimized query using compound index: showOnProductPage + order + createdAt
    const products = await Product.find({
      showOnProductPage: { $ne: false }
    })
    .select('name nameFr description descriptionFr price originalPrice category image inStock rating reviews badge badgeKey discount order')
    .sort({ order: 1, createdAt: -1 })
    .lean()
    .limit(500) // Reduced limit for faster queries
    .maxTimeMS(3000) // 3 second timeout for query - faster fail
    .hint({ showOnProductPage: 1, order: 1, createdAt: -1 }) // Force use of compound index
    
    // Cache the result
    cachedProducts = products
    cacheTimestamp = now
    
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120, max-age=60'
      }
    })
  } catch (error: any) {
    // Log error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching product page products:', error?.message || error)
    }
    
    // Return cached data even if stale on error - this allows the app to work offline
    if (cachedProducts && cachedProducts.length > 0) {
      return NextResponse.json(cachedProducts, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60, max-age=30'
        }
      })
    }
    
    // If no cache and MongoDB connection failed, return empty array instead of error
    // This prevents the app from crashing and allows it to show empty state
    if (error?.name === 'MongooseServerSelectionError' || error?.message?.includes('whitelist')) {
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60, max-age=30'
        }
      })
    }
    
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}





