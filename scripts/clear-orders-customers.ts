import mongoose from 'mongoose'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelpad'

// Define schemas inline
const OrderSchema = new mongoose.Schema({
  id: String,
  userId: String,
  email: String,
  date: Date,
  items: Array,
  total: Number,
  status: String,
  customerName: String,
  customerPhone: String,
  city: String,
  returnNotes: String,
  paymentSessionId: String,
  paymentMethod: String,
  paymentStatus: String,
}, { timestamps: true })

const CustomerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  avatar: String,
  orders: Number,
  isGuest: Boolean,
  phone: String,
  city: String,
  address: String,
}, { timestamps: true })

const GuestCustomerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  city: String,
  address: String,
  orders: Number,
  isGuest: Boolean,
}, { timestamps: true })

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  deliveryPrice: Number,
  costPrice: Number,
  category: mongoose.Schema.Types.ObjectId,
  image: String,
  inStock: Boolean,
  stockQuantity: Number,
  soldQuantity: Number,
  rating: Number,
  reviews: Number,
  features: Array,
  specifications: mongoose.Schema.Types.Mixed,
  badge: String,
  badgeKey: String,
  discount: Number,
  showOnHomeCarousel: Boolean,
  showInHero: Boolean,
  showInNewArrivals: Boolean,
  showInBestSellers: Boolean,
  showInSpecialOffers: Boolean,
  showInTrending: Boolean,
  showOnProductPage: Boolean,
  order: Number,
}, { timestamps: true })

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)
const GuestCustomer = mongoose.models.GuestCustomer || mongoose.model('GuestCustomer', GuestCustomerSchema)
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

async function clearData() {
  try {
    console.log('Connecting to database...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to database')

    // Delete all orders
    console.log('Deleting all orders...')
    const ordersResult = await Order.deleteMany({})
    console.log(`✓ Deleted ${ordersResult.deletedCount} orders`)

    // Delete all registered customers
    console.log('Deleting all registered customers...')
    const customersResult = await Customer.deleteMany({})
    console.log(`✓ Deleted ${customersResult.deletedCount} registered customers`)

    // Delete all guest customers
    console.log('Deleting all guest customers...')
    const guestCustomersResult = await GuestCustomer.deleteMany({})
    console.log(`✓ Deleted ${guestCustomersResult.deletedCount} guest customers`)

    // Reset all product sold quantities to 0
    console.log('Resetting product sold quantities...')
    const productsResult = await Product.updateMany(
      {},
      { $set: { soldQuantity: 0 } }
    )
    console.log(`✓ Reset sold quantities for ${productsResult.modifiedCount} products`)

    console.log('\n✅ Successfully cleared all orders, customers, and product statistics!')
    console.log(`\nSummary:`)
    console.log(`  - Orders: ${ordersResult.deletedCount}`)
    console.log(`  - Registered Customers: ${customersResult.deletedCount}`)
    console.log(`  - Guest Customers: ${guestCustomersResult.deletedCount}`)
    console.log(`  - Products reset: ${productsResult.modifiedCount}`)

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

clearData()

