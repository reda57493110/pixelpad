import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

// Cache in memory for faster responses
const productCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes - faster updates

// Global cache references (will be set by other routes)
declare global {
  var __productsCache: { cachedAllProducts: any[] | null; cacheTimestamp: number } | undefined
  var __productsPageCache: { cachedProducts: any[] | null; cacheTimestamp: number } | undefined
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const productId = id?.trim()
  try {
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    // Check cache first
    const now = Date.now()
    const cached = productCache.get(productId)
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120, max-age=60'
        }
      })
    }
    
    await connectDB()
    
    // Try to find product by ID - use select to only get needed fields for faster queries
    let product = await Product.findById(productId)
      .select('name nameFr description descriptionFr price originalPrice deliveryPrice costPrice category image images inStock stockQuantity soldQuantity rating reviews features specifications badge badgeKey discount showOnHomeCarousel showInHero showInNewArrivals showInBestSellers showInSpecialOffers showInTrending showOnProductPage order variants createdAt')
      .lean()
    
    // If not found, try to find by string ID (in case it's stored differently)
    if (!product) {
      product = await Product.findOne({ id: productId })
        .select('name nameFr description descriptionFr price originalPrice deliveryPrice costPrice category image images inStock stockQuantity soldQuantity rating reviews features specifications badge badgeKey discount showOnHomeCarousel showInHero showInNewArrivals showInBestSellers showInSpecialOffers showInTrending showOnProductPage order variants createdAt')
        .lean()
    }
    
    if (!product) {
      console.error('Product not found with ID:', productId)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Cache the result
    productCache.set(productId, { data: product, timestamp: now })
    
    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120, max-age=60'
      }
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    // Return cached data even if stale on error
    const productId = params.id?.trim()
    if (productId) {
      const cached = productCache.get(productId)
      if (cached) {
        return NextResponse.json(cached.data, {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60, max-age=30'
          }
        })
      }
    }
    return NextResponse.json({ 
      error: 'Failed to fetch product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await connectDB()
    const body = await request.json()
    
    // Explicitly ensure all visibility flags are set (including false values)
    // This ensures boolean false values are properly saved to the database
    const updateData: any = { ...body }
    
    // Remove legacy fields (showOnLanding, isFeatured)
    delete updateData.showOnLanding
    delete updateData.isFeatured
    
    // Always explicitly set all boolean flags to ensure false values are saved
    // Use the value from body if present, otherwise default to false
    updateData.showInHero = body.showInHero === true
    updateData.showOnHomeCarousel = body.showOnHomeCarousel === true
    updateData.showInNewArrivals = body.showInNewArrivals === true
    updateData.showInBestSellers = body.showInBestSellers === true
    updateData.showInSpecialOffers = body.showInSpecialOffers === true
    updateData.showInTrending = body.showInTrending === true
    // showOnProductPage defaults to true if not explicitly set to false
    if ('showOnProductPage' in body) {
      updateData.showOnProductPage = body.showOnProductPage !== false
    } else {
      updateData.showOnProductPage = true
    }
    if ('inStock' in body) updateData.inStock = body.inStock !== false
    
    // Use $set and $unset to update fields and remove legacy fields
    const updateOps: any = { $set: updateData }
    updateOps.$unset = { showOnLanding: '', isFeatured: '' }
    
    const product = await Product.findByIdAndUpdate(
      id, 
      updateOps, 
      { new: true, runValidators: true }
    )
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Clear cache when product is updated
    productCache.delete(id)
    
    // Clear global caches if they exist
    if (global.__productsCache) {
      global.__productsCache.cachedAllProducts = null
      global.__productsCache.cacheTimestamp = 0
    }
    if (global.__productsPageCache) {
      global.__productsPageCache.cachedProducts = null
      global.__productsPageCache.cacheTimestamp = 0
    }
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await connectDB()
    
    const productId = id?.trim()
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    // Try to find and delete the product
    const product = await Product.findByIdAndDelete(productId)
    if (!product) {
      // Try with string ID in case it's stored differently
      const productByString = await Product.findOneAndDelete({ _id: productId })
      if (!productByString) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
    }
    
    // Clear cache when product is deleted
    productCache.delete(productId)
    
    // Clear global caches if they exist
    if (global.__productsCache) {
      global.__productsCache.cachedAllProducts = null
      global.__productsCache.cacheTimestamp = 0
    }
    if (global.__productsPageCache) {
      global.__productsPageCache.cachedProducts = null
      global.__productsPageCache.cacheTimestamp = 0
    }
    
    return NextResponse.json({ 
      message: 'Product deleted successfully',
      deletedId: productId 
    })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}





