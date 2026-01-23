/**
 * Quick script to check what image URLs products have
 */

import mongoose, { Schema, model } from 'mongoose'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const ProductSchema = new Schema({}, { strict: false })
const Product = mongoose.models.Product || model('Product', ProductSchema)

async function checkImages() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required')
    }
    
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB\n')

    const products = await Product.find({}).select('name image images').limit(10)
    
    console.log(`Found ${products.length} products (showing first 10):\n`)
    
    products.forEach((product: any) => {
      console.log(`Product: ${product.name}`)
      console.log(`  Main image: ${product.image}`)
      if (product.images && product.images.length > 0) {
        console.log(`  Additional images: ${product.images.length}`)
        product.images.slice(0, 3).forEach((img: string) => {
          console.log(`    - ${img}`)
        })
      }
      console.log('')
    })

    // Count products with local images
    const localImageCount = await Product.countDocuments({
      $or: [
        { image: { $regex: '^/uploads/products/' } },
        { images: { $regex: '/uploads/products/' } }
      ]
    })
    
    console.log(`\nProducts with local images: ${localImageCount}`)

    await mongoose.disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

checkImages()
