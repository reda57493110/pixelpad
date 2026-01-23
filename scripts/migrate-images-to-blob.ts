/**
 * Script to migrate existing product images from local storage to Vercel Blob
 * 
 * Usage:
 *   npx ts-node scripts/migrate-images-to-blob.ts
 * 
 * Environment variables required:
 *   - BLOB_READ_WRITE_TOKEN: Your Vercel Blob read/write token
 *   - MONGODB_URI: MongoDB connection string
 * 
 * This script will:
 *   1. Find all products with local image URLs (/uploads/products/)
 *   2. Upload those images to Vercel Blob
 *   3. Update the product records with the new Blob URLs
 */

import { put } from '@vercel/blob'
import mongoose, { Schema, model } from 'mongoose'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Define Product schema inline to avoid import issues
const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  deliveryPrice: { type: Number },
  costPrice: { type: Number },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 0 },
  soldQuantity: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  features: { type: [String], default: [] },
  specifications: { type: Schema.Types.Mixed, default: {} },
  badge: { type: String },
  badgeKey: { type: String },
  discount: { type: Number, default: 0 },
  showOnHomeCarousel: { type: Boolean, default: false },
  showInHero: { type: Boolean, default: false },
  showInNewArrivals: { type: Boolean, default: false },
  showInBestSellers: { type: Boolean, default: false },
  showInSpecialOffers: { type: Boolean, default: false },
  showInTrending: { type: Boolean, default: false },
  showOnProductPage: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  variants: [{
    ram: { type: String, required: true },
    storage: { type: String, required: true },
    storageType: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number }
  }],
}, { timestamps: true })

const Product = mongoose.models.Product || model('Product', ProductSchema)

async function migrateImagesToBlob() {
  try {
    console.log('Starting image migration to Vercel Blob...')
    
    // Check for required environment variable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required')
    }

    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required')
    }
    
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find all products with local image URLs
    const products = await Product.find({
      $or: [
        { image: { $regex: '^/uploads/products/' } },
        { images: { $regex: '/uploads/products/' } }
      ]
    })

    console.log(`Found ${products.length} products with local images to migrate`)

    let migratedCount = 0
    let errorCount = 0

    for (const product of products) {
      try {
        const updates: { image?: string; images?: string[] } = {}
        let needsUpdate = false

        // Migrate main image
        if (product.image && product.image.startsWith('/uploads/products/')) {
          const localPath = join(process.cwd(), 'public', product.image)
          
          if (existsSync(localPath)) {
            const fileBuffer = await readFile(localPath)
            const filename = product.image.split('/').pop() || `product-${Date.now()}.jpg`
            const blobPath = `products/${filename}`

            const blob = await put(blobPath, fileBuffer, {
              access: 'public',
              token: process.env.BLOB_READ_WRITE_TOKEN!,
              contentType: 'image/jpeg', // Default, will be detected automatically
            })

            updates.image = blob.url
            needsUpdate = true
            console.log(`  ✓ Migrated main image for product: ${product.name} -> ${blob.url}`)
          } else {
            console.log(`  ⚠ Local file not found: ${localPath}`)
          }
        }

        // Migrate additional images
        if (product.images && product.images.length > 0) {
          const migratedImages: string[] = []
          
          for (const imageUrl of product.images) {
            if (imageUrl.startsWith('/uploads/products/')) {
              const localPath = join(process.cwd(), 'public', imageUrl)
              
              if (existsSync(localPath)) {
                const fileBuffer = await readFile(localPath)
                const filename = imageUrl.split('/').pop() || `product-${Date.now()}.jpg`
                const blobPath = `products/${filename}`

                const blob = await put(blobPath, fileBuffer, {
                  access: 'public',
                  token: process.env.BLOB_READ_WRITE_TOKEN!,
                  contentType: 'image/jpeg',
                })

                migratedImages.push(blob.url)
                console.log(`  ✓ Migrated additional image: ${imageUrl} -> ${blob.url}`)
              } else {
                // Keep non-local URLs as-is
                migratedImages.push(imageUrl)
                console.log(`  ⚠ Local file not found, keeping URL: ${imageUrl}`)
              }
            } else {
              // Keep non-local URLs as-is (already external URLs)
              migratedImages.push(imageUrl)
            }
          }

          if (migratedImages.length > 0) {
            updates.images = migratedImages
            needsUpdate = true
          }
        }

        // Update product if needed
        if (needsUpdate) {
          await Product.updateOne(
            { _id: product._id },
            { $set: updates }
          )
          migratedCount++
          console.log(`✓ Updated product: ${product.name}`)
        }
      } catch (error: any) {
        errorCount++
        console.error(`✗ Error migrating product ${product.name}:`, error.message)
      }
    }

    console.log('\n=== Migration Summary ===')
    console.log(`Total products processed: ${products.length}`)
    console.log(`Successfully migrated: ${migratedCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log('\nMigration completed!')

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    process.exit(0)
  } catch (error: any) {
    console.error('Migration failed:', error.message)
    process.exit(1)
  }
}

// Run migration
migrateImagesToBlob()
