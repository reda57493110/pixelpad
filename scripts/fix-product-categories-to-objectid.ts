import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import Product from '@/models/Product'
import Category from '@/models/Category'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local')
  process.exit(1)
}

async function fixProductCategoriesToObjectId() {
  try {
    await mongoose.connect(MONGODB_URI!)
    console.log('Connected to MongoDB')

    // Get all categories
    const categories = await Category.find({})
    const categoryMap = new Map<string, mongoose.Types.ObjectId>()
    categories.forEach(cat => {
      categoryMap.set(cat._id.toString(), cat._id)
      categoryMap.set(cat.slug, cat._id)
    })

    // Use native MongoDB collection to get raw documents
    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Database connection not available')
    }
    
    const productsCollection = db.collection('products')
    const products = await productsCollection.find({}).toArray()
    console.log(`Found ${products.length} products to check`)

    let fixed = 0
    let skipped = 0
    let errors = 0

    for (const product of products) {
      try {
        const storedCategory = product.category
        
        // Check if it's stored as a string
        if (typeof storedCategory === 'string') {
          // Try to find category by ID string
          const categoryId = categoryMap.get(storedCategory)
          
          if (categoryId) {
            // Use direct MongoDB update to ensure ObjectId is stored
            await productsCollection.updateOne(
              { _id: product._id },
              { $set: { category: categoryId } }
            )
            fixed++
            console.log(`Fixed product "${product.name}" - converted category "${storedCategory}" to ObjectId`)
          } else {
            console.warn(`Category not found for product "${product.name}" with category "${storedCategory}"`)
            errors++
          }
        } else {
          // Already an ObjectId
          skipped++
        }
      } catch (error) {
        console.error(`Error fixing product "${product.name}":`, error)
        errors++
      }
    }

    console.log('\nFix Summary:')
    console.log(`- Fixed: ${fixed}`)
    console.log(`- Skipped (already ObjectId): ${skipped}`)
    console.log(`- Errors: ${errors}`)
    console.log('Fix completed!')
    process.exit(0)
  } catch (error) {
    console.error('Error during fix:', error)
    process.exit(1)
  }
}

fixProductCategoriesToObjectId()

