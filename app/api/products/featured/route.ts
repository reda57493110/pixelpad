import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '4')
    
    // Get products with showOnHomeCarousel flag
    let products = await Product.find({ showOnHomeCarousel: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(limit)
    
    // Fallback to highest rated if no carousel products
    if (products.length === 0) {
      products = await Product.find({})
        .sort({ order: 1, rating: -1, createdAt: -1 })
        .limit(limit)
    }
    
    // Final fallback: return any products available, sorted by creation date
    if (products.length === 0) {
      products = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
    }
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 })
  }
}





