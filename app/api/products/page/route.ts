import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET() {
  try {
    await connectDB()
    // Return all products where showOnProductPage is not explicitly false
    // Use .lean() for faster queries and only select needed fields
    const products = await Product.find({
      $or: [
        { showOnProductPage: { $ne: false } },
        { showOnProductPage: { $exists: false } }
      ]
    })
    .select('name nameFr description descriptionFr price originalPrice deliveryPrice costPrice category image inStock stockQuantity soldQuantity rating reviews features specifications badge badgeKey discount showOnHomeCarousel showInHero showInNewArrivals showInBestSellers showInSpecialOffers showInTrending showOnProductPage order createdAt')
    .sort({ order: 1, createdAt: -1 })
    .lean()
    
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600, max-age=1800'
      }
    })
  } catch (error) {
    console.error('Error fetching product page products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}





