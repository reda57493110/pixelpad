import mongoose from 'mongoose'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelpad'

// Define Customer schema inline
const CustomerSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  city: String,
  address: String,
  orders: Number,
  isGuest: Boolean,
}, { timestamps: true })

// Define GuestCustomer schema inline
const GuestCustomerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  city: String,
  address: String,
  orders: Number,
}, { timestamps: true })

const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)
const GuestCustomer = mongoose.models.GuestCustomer || mongoose.model('GuestCustomer', GuestCustomerSchema)

async function clearCustomers() {
  try {
    console.log('Connecting to database...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to database')

    // Delete all regular customers
    console.log('Deleting all regular customers...')
    const customersResult = await Customer.deleteMany({})
    console.log(`✓ Deleted ${customersResult.deletedCount} regular customers`)

    // Delete all guest customers
    console.log('Deleting all guest customers...')
    const guestCustomersResult = await GuestCustomer.deleteMany({})
    console.log(`✓ Deleted ${guestCustomersResult.deletedCount} guest customers`)

    console.log('\n✅ Successfully cleared all customers!')
    console.log(`\nSummary:`)
    console.log(`  - Regular customers deleted: ${customersResult.deletedCount}`)
    console.log(`  - Guest customers deleted: ${guestCustomersResult.deletedCount}`)
    console.log(`  - Total customers deleted: ${customersResult.deletedCount + guestCustomersResult.deletedCount}`)

    await mongoose.disconnect()
    console.log('\nDatabase connection closed.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error clearing customers:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

clearCustomers()
