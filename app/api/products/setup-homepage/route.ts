import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Auto-setup endpoint - no authentication required for initial setup

    // Get all products
    const products = await Product.find({})
    
    if (products.length === 0) {
      return NextResponse.json({ 
        message: 'No products found',
        updated: 0 
      })
    }

    // Update all products to show on homepage sections
    // Distribute products across different sections
    const totalProducts = products.length
    const productsPerSection = Math.max(1, Math.floor(totalProducts / 5)) // Distribute across 5 sections
    
    const updates = products.map((product, index) => {
      const updateData: any = {}
      
      // First product: Hero + Carousel
      if (index === 0) {
        updateData.showInHero = true
        updateData.showOnHomeCarousel = true
        updateData.showInNewArrivals = true
        updateData.showInBestSellers = true
      }
      // Next products: Carousel + New Arrivals
      else if (index < productsPerSection) {
        updateData.showOnHomeCarousel = true
        updateData.showInNewArrivals = true
      }
      // Next products: Best Sellers
      else if (index < productsPerSection * 2) {
        updateData.showInBestSellers = true
      }
      // Next products: Special Offers
      else if (index < productsPerSection * 3) {
        updateData.showInSpecialOffers = true
      }
      // Next products: Trending
      else if (index < productsPerSection * 4) {
        updateData.showInTrending = true
      }
      // Remaining products: Mix of flags
      else {
        // Alternate between different sections
        if (index % 2 === 0) {
          updateData.showInNewArrivals = true
        } else {
          updateData.showInBestSellers = true
        }
      }
      
      return Product.findByIdAndUpdate(
        product._id,
        { $set: updateData },
        { new: true }
      )
    })

    await Promise.all(updates)

    return NextResponse.json({ 
      message: `Successfully updated ${products.length} products for homepage display`,
      updated: products.length,
      distribution: {
        hero: 1,
        carousel: Math.min(productsPerSection, totalProducts),
        newArrivals: Math.min(productsPerSection * 2, totalProducts),
        bestSellers: Math.min(productsPerSection * 2, totalProducts),
        specialOffers: Math.min(productsPerSection, totalProducts),
        trending: Math.min(productsPerSection, totalProducts)
      }
    })
  } catch (error) {
    console.error('Error setting up homepage products:', error)
    return NextResponse.json(
      { error: 'Failed to setup homepage products' },
      { status: 500 }
    )
  }
}

