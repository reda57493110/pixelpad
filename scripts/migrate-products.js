const mongoose = require('mongoose')

// MongoDB connection string - update this with your connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelpad'

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  deliveryPrice: Number,
  costPrice: Number,
  category: mongoose.Schema.Types.ObjectId,
  image: String,
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 0 },
  soldQuantity: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  features: [String],
  specifications: mongoose.Schema.Types.Mixed,
  badge: String,
  badgeKey: String,
  discount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  showOnHomeCarousel: { type: Boolean, default: false },
  showInHero: { type: Boolean, default: false },
  showInNewArrivals: { type: Boolean, default: false },
  showInBestSellers: { type: Boolean, default: false },
  showInSpecialOffers: { type: Boolean, default: false },
  showInTrending: { type: Boolean, default: false },
  showOnProductPage: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

async function migrate() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const products = await Product.find({})
    console.log(`Found ${products.length} products to migrate`)

    let updated = 0
    let errors = []

    for (const product of products) {
      try {
        const updateOps = {}
        let needsUpdate = false

        // Check if showOnLanding exists
        const productObj = product.toObject()
        if ('showOnLanding' in productObj) {
          updateOps.$unset = { showOnLanding: '' }
          needsUpdate = true
        }

        // Check for missing new fields
        const newFields = {}
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
          console.log(`Updated product: ${product.name || product._id}`)
        }
      } catch (error) {
        errors.push(`Product ${product._id}: ${error.message}`)
        console.error(`Error updating product ${product._id}:`, error.message)
      }
    }

    console.log('\n=== Migration Complete ===')
    console.log(`Updated: ${updated} products`)
    console.log(`Total: ${products.length} products`)
    if (errors.length > 0) {
      console.log(`Errors: ${errors.length}`)
      errors.forEach(err => console.error(err))
    }

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    process.exit(0)
  } catch (error) {
    console.error('Migration error:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

migrate()

