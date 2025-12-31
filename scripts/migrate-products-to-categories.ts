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

// Mapping of old category slugs to new category slugs
const categoryMapping: Record<string, string> = {
  'laptop': 'laptops',
  'laptops': 'laptops',
  'desktop': 'desktops',
  'desktops': 'desktops',
  'monitor': 'monitors',
  'monitors': 'monitors',
  'keyboard': 'accessories',
  'mouse': 'accessories',
  'accessory': 'accessories',
  'accessories': 'accessories',
  'gaming': 'gaming',
  'pack': 'packs',
  'packs': 'packs',
}

async function migrateProductsToCategories() {
  try {
    await mongoose.connect(MONGODB_URI!)
    console.log('Connected to MongoDB')

    // Get all categories
    const categories = await Category.find({})
    const categoryMap = new Map<string, string>()
    categories.forEach(cat => {
      categoryMap.set(cat.slug, cat._id.toString())
    })

    // Get all products
    const products = await Product.find({})
    console.log(`Found ${products.length} products to migrate`)

    let migrated = 0
    let skipped = 0
    let errors = 0

    for (const product of products) {
      try {
        const oldCategory = product.category as string
        const normalizedCategory = categoryMapping[oldCategory.toLowerCase()] || oldCategory.toLowerCase()
        
        // Find category by slug
        const categoryId = categoryMap.get(normalizedCategory)
        
        if (categoryId) {
          // Update product to use category ID as ObjectId
          product.category = new mongoose.Types.ObjectId(categoryId)
          await product.save()
          migrated++
          console.log(`Migrated product "${product.name}" from "${oldCategory}" to category ObjectId "${categoryId}"`)
        } else {
          // Try to find by ID if it's already an ID
          const categoryById = categories.find(cat => cat._id.toString() === oldCategory)
          if (categoryById) {
            // Already using ID, skip
            skipped++
            console.log(`Product "${product.name}" already uses category ID, skipping`)
          } else {
            console.warn(`Category not found for product "${product.name}" with category "${oldCategory}"`)
            errors++
          }
        }
      } catch (error) {
        console.error(`Error migrating product "${product.name}":`, error)
        errors++
      }
    }

    console.log('\nMigration Summary:')
    console.log(`- Migrated: ${migrated}`)
    console.log(`- Skipped: ${skipped}`)
    console.log(`- Errors: ${errors}`)
    console.log('Migration completed!')
    process.exit(0)
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  }
}

migrateProductsToCategories()

