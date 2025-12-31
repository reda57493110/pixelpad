import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  return POST(request)
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get all products
    const products = await Product.find({})
    
    let updated = 0
    let errors: string[] = []
    
    for (const product of products) {
      try {
        // Remove showOnLanding and isFeatured if they exist
        const productObj = product.toObject()
        const fieldsToRemove: any = {}
        if ('showOnLanding' in productObj) {
          fieldsToRemove.showOnLanding = ''
        }
        if ('isFeatured' in productObj) {
          fieldsToRemove.isFeatured = ''
        }
        
        // Always ensure all new fields exist in database
        // Get current values or use false as default
        const newFields: any = {
          showInHero: product.showInHero !== undefined && product.showInHero !== null ? Boolean(product.showInHero) : false,
          showInNewArrivals: product.showInNewArrivals !== undefined && product.showInNewArrivals !== null ? Boolean(product.showInNewArrivals) : false,
          showInBestSellers: product.showInBestSellers !== undefined && product.showInBestSellers !== null ? Boolean(product.showInBestSellers) : false,
          showInSpecialOffers: product.showInSpecialOffers !== undefined && product.showInSpecialOffers !== null ? Boolean(product.showInSpecialOffers) : false,
          showInTrending: product.showInTrending !== undefined && product.showInTrending !== null ? Boolean(product.showInTrending) : false,
        }
        
        // Always update to ensure fields exist in database
        const updateOps: any = {
          $set: newFields
        }
        
        // Remove legacy fields (showOnLanding, isFeatured)
        if (Object.keys(fieldsToRemove).length > 0) {
          updateOps.$unset = fieldsToRemove
        }
        
        await Product.findByIdAndUpdate(product._id, updateOps)
        updated++
      } catch (error: any) {
        errors.push(`Product ${product._id}: ${error.message}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration completed. Updated ${updated} products.`,
      updated,
      total: products.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    )
  }
}

