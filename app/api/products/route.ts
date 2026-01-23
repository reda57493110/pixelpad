import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

// Cache in memory for faster responses
let cachedAllProducts: any[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes - faster updates while maintaining performance

// Export cache for clearing from other routes
if (typeof global !== 'undefined') {
  global.__productsCache = { cachedAllProducts, cacheTimestamp }
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check if we only need max order and cache-busting parameter
    const { searchParams } = new URL(request.url)
    const maxOrderOnly = searchParams.get('maxOrder') === 'true'
    const bypassCache = searchParams.get('bypassCache') === 'true' || searchParams.get('_t')
    
    if (maxOrderOnly) {
      await connectDB()
      // Efficiently get max order without loading all products
      const maxOrderProduct = await Product.findOne().sort({ order: -1 }).select('order').lean()
      const maxOrder = (maxOrderProduct as any)?.order ? (maxOrderProduct as any).order + 1 : 1
      return NextResponse.json({ maxOrder })
    }
    
    // Return cached data if available and fresh (unless bypassing)
    const now = Date.now()
    if (!bypassCache && cachedAllProducts && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedAllProducts, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60, max-age=30'
        }
      })
    }
    
    await connectDB()
    
    // Sort by order first (ascending), then by createdAt (descending) for products without order
    // Use .lean() for faster queries (returns plain objects instead of Mongoose documents)
    // Only select fields we need for better performance
    const products = await Product.find({})
      .select('name nameFr description descriptionFr price originalPrice deliveryPrice costPrice category image images inStock stockQuantity soldQuantity rating reviews features specifications badge badgeKey discount showOnHomeCarousel showInHero showInNewArrivals showInBestSellers showInSpecialOffers showInTrending showOnProductPage order variants createdAt')
      .sort({ order: 1, createdAt: -1 })
      .lean()
      .limit(500) // Reduced limit for faster queries
      .maxTimeMS(3000) // 3 second timeout for query - faster fail
    
    // Initialize order for products that don't have one (only if needed)
    let needsUpdate = false
    const productsToUpdate: any[] = []
    
    products.forEach((product, index) => {
      if (product.order === undefined || product.order === null) {
        product.order = index
        needsUpdate = true
        productsToUpdate.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { order: index } }
          }
        })
      }
    })
    
    // Bulk update products without order (only if needed - this is rare)
    if (needsUpdate && productsToUpdate.length > 0) {
      await Product.bulkWrite(productsToUpdate)
      // Re-fetch to get updated order values - only select needed fields for performance
      const updatedProducts = await Product.find({})
        .select('name nameFr description descriptionFr price originalPrice deliveryPrice costPrice category image images inStock stockQuantity soldQuantity rating reviews features specifications badge badgeKey discount showOnHomeCarousel showInHero showInNewArrivals showInBestSellers showInSpecialOffers showInTrending showOnProductPage order variants createdAt')
        .sort({ order: 1, createdAt: -1 })
        .lean()
        .limit(1000)
      
      // Cache the result
      cachedAllProducts = updatedProducts
      cacheTimestamp = now
      
      return NextResponse.json(updatedProducts, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600, max-age=300'
        }
      })
    }
    
    // Cache the result
    cachedAllProducts = products
    cacheTimestamp = now
    
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120, max-age=60'
      }
    })
  } catch (error: any) {
    // Log error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching products:', error?.message || error)
    }
    
    // Return cached data even if stale on error - this allows the app to work offline
    if (cachedAllProducts && cachedAllProducts.length > 0) {
      return NextResponse.json(cachedAllProducts, {
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

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.description || !body.price || !body.image || !body.category) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: {
          name: !body.name,
          description: !body.description,
          price: !body.price,
          image: !body.image,
          category: !body.category
        }
      }, { status: 400 })
    }
    
    // Ensure all visibility flags are explicitly set (including false values)
    const productData = {
      ...body,
      showInHero: body.showInHero === true,
      showOnHomeCarousel: body.showOnHomeCarousel === true,
      showInNewArrivals: body.showInNewArrivals === true,
      showInBestSellers: body.showInBestSellers === true,
      showInSpecialOffers: body.showInSpecialOffers === true,
      showInTrending: body.showInTrending === true,
      // showOnProductPage defaults to true if not explicitly set to false
      showOnProductPage: body.showOnProductPage !== false,
      // Remove legacy fields if present
      showOnLanding: undefined,
      isFeatured: undefined,
    }
    
    // Remove undefined fields
    Object.keys(productData).forEach(key => {
      if (productData[key] === undefined) {
        delete productData[key]
      }
    })
    
    const product = await Product.create(productData)
    
    // Clear cache when new product is created
    cachedAllProducts = null
    cacheTimestamp = 0
    
    // Clear global cache
    if (global.__productsCache) {
      global.__productsCache.cachedAllProducts = null
      global.__productsCache.cacheTimestamp = 0
    }
    
    // Also clear the products page cache
    if (global.__productsPageCache) {
      global.__productsPageCache.cachedProducts = null
      global.__productsPageCache.cacheTimestamp = 0
    }
    
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product:', error)
    
    // Return validation errors in a more readable format
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }))
      return NextResponse.json({ 
        error: 'Validation failed',
        details: validationErrors,
        message: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to create product', message: error.message }, { status: 500 })
  }
}


