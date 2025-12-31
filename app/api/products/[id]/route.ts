import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const productId = params.id?.trim()
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }
    
    // Try to find product by ID - use select to only get needed fields for faster queries
    let product = await Product.findById(productId)
      .select('name nameFr description descriptionFr price originalPrice deliveryPrice costPrice category image inStock stockQuantity soldQuantity rating reviews features specifications badge badgeKey discount showOnHomeCarousel showInHero showInNewArrivals showInBestSellers showInSpecialOffers showInTrending showOnProductPage order createdAt')
      .lean()
    
    // If not found, try to find by string ID (in case it's stored differently)
    if (!product) {
      product = await Product.findOne({ id: productId })
        .select('name nameFr description descriptionFr price originalPrice deliveryPrice costPrice category image inStock stockQuantity soldQuantity rating reviews features specifications badge badgeKey discount showOnHomeCarousel showInHero showInNewArrivals showInBestSellers showInSpecialOffers showInTrending showOnProductPage order createdAt')
        .lean()
    }
    
    if (!product) {
      console.error('Product not found with ID:', productId)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600, max-age=1800'
      }
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    if ('inStock' in body) updateData.inStock = body.inStock !== false
    
    // Use $set and $unset to update fields and remove legacy fields
    const updateOps: any = { $set: updateData }
    updateOps.$unset = { showOnLanding: '', isFeatured: '' }
    
    const product = await Product.findByIdAndUpdate(
      params.id, 
      updateOps, 
      { new: true, runValidators: true }
    )
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const product = await Product.findByIdAndDelete(params.id)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}





