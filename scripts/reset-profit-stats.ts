import mongoose from 'mongoose'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelpad'

// Define Product schema inline
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  costPrice: Number,
  deliveryPrice: Number,
  soldQuantity: Number,
  stockQuantity: Number,
  inStock: Boolean,
}, { timestamps: true })

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

async function resetProfitStats() {
  try {
    console.log('Connecting to database...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to database')

    // Reset all soldQuantity to 0
    console.log('Resetting sold quantities to 0...')
    const result = await Product.updateMany(
      {},
      { $set: { soldQuantity: 0 } }
    )
    console.log(`✓ Reset soldQuantity for ${result.modifiedCount} products`)

    console.log('\n✅ Successfully reset profit statistics!')
    console.log(`\nSummary:`)
    console.log(`  - Products updated: ${result.modifiedCount}`)
    console.log(`  - Total Profit will now show: 0.00 DH`)
    console.log(`  - Products Sold will now show: 0`)

    await mongoose.disconnect()
    console.log('\nDatabase connection closed.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting profit stats:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

resetProfitStats()
