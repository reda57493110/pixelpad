import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Check if we only need max order
    const { searchParams } = new URL(request.url)
    const maxOrderOnly = searchParams.get('maxOrder') === 'true'
    
    if (maxOrderOnly) {
      // Efficiently get max order without loading all products
      const maxOrderProduct = await Product.findOne().sort({ order: -1 }).select('order').lean()
      const maxOrder = (maxOrderProduct as any)?.order ? (maxOrderProduct as any).order + 1 : 1
      return NextResponse.json({ maxOrder })
    }
    
    // Sort by order first (ascending), then by createdAt (descending) for products without order
    // Use .lean() for faster queries (returns plain objects instead of Mongoose documents)
    // Only select fields we need for better performance
    const products = await Product.find({})
      .select('name nameFr description descriptionFr price originalPrice deliveryPrice costPrice category image inStock stockQuantity soldQuantity rating reviews features specifications badge badgeKey discount showOnHomeCarousel showInHero showInNewArrivals showInBestSellers showInSpecialOffers showInTrending showOnProductPage order createdAt')
      .sort({ order: 1, createdAt: -1 })
      .lean()
    
    // Initialize order for products that don't have one
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
        .select('name nameFr description descriptionFr price originalPrice deliveryPrice costPrice category image inStock stockQuantity soldQuantity rating reviews features specifications badge badgeKey discount showOnHomeCarousel showInHero showInNewArrivals showInBestSellers showInSpecialOffers showInTrending showOnProductPage order createdAt')
        .sort({ order: 1, createdAt: -1 })
        .lean()
      return NextResponse.json(updatedProducts, {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600, max-age=1800'
        }
      })
    }
    
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600, max-age=1800'
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
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


