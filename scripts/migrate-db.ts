import mongoose from 'mongoose'
import Product from '@/models/Product'
import connectDB from '@/lib/mongodb'

async function migrateDatabase() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Connect to database using existing connection
    await connectDB()
    console.log('✅ Connected to MongoDB')

    // Get all products
    const products = await Product.find({})
    console.log(`📦 Found ${products.length} products to migrate`)

    let updated = 0
    let errors: string[] = []

    for (const product of products) {
      try {
        const updateOps: any = {}
        let needsUpdate = false

        // Check if showOnLanding exists and needs to be removed
        const productObj = product.toObject()
        if ('showOnLanding' in productObj) {
          updateOps.$unset = { showOnLanding: '' }
          needsUpdate = true
          console.log(`  🔍 Product "${product.name}" has showOnLanding field`)
        }

        // Check for missing new fields
        const newFields: any = {}
        if (product.showInHero === undefined) {
          newFields.showInHero = false
          needsUpdate = true
        }
        if (product.showInNewArrivals === undefined) {
          newFields.showInNewArrivals = false
          needsUpdate = true
        }
        if (product.showInBestSellers === undefined) {
          newFields.showInBestSellers = false
          needsUpdate = true
        }
        if (product.showInSpecialOffers === undefined) {
          newFields.showInSpecialOffers = false
          needsUpdate = true
        }
        if (product.showInTrending === undefined) {
          newFields.showInTrending = false
          needsUpdate = true
        }

        if (needsUpdate) {
          if (updateOps.$unset) {
            updateOps.$set = newFields
          } else {
            updateOps.$set = newFields
          }

          await Product.findByIdAndUpdate(product._id, updateOps)
          updated++
          console.log(`  ✅ Updated product: ${product.name || product._id}`)
        }
      } catch (error: any) {
        const errorMsg = `Product ${product._id}: ${error.message}`
        errors.push(errorMsg)
        console.error(`  ❌ Error updating product ${product._id}:`, error.message)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Migration Complete!')
    console.log('='.repeat(50))
    console.log(`✅ Updated: ${updated} products`)
    console.log(`📊 Total: ${products.length} products`)
    if (errors.length > 0) {
      console.log(`⚠️  Errors: ${errors.length}`)
      errors.forEach(err => console.error(`   - ${err}`))
    }
    console.log('='.repeat(50))

    await mongoose.disconnect()
    console.log('👋 Disconnected from MongoDB')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Migration error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

// Run migration
migrateDatabase()

