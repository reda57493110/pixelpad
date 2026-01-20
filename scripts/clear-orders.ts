import mongoose from 'mongoose'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelpad'

// Define Order schema inline to avoid import issues
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

const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  inquiryType: String,
  subject: String,
  message: String,
  userId: String,
  status: String,
}, { timestamps: true })

const ServiceRequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  serviceType: String,
  description: String,
  address: String,
  city: String,
  preferredDate: Date,
  userId: String,
  status: String,
}, { timestamps: true })

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema)
const ServiceRequest = mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', ServiceRequestSchema)

async function clearOrders() {
  try {
    console.log('Connecting to database...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to database')

    // Delete all orders
    console.log('Deleting all orders...')
    const ordersResult = await Order.deleteMany({})
    console.log(`✓ Deleted ${ordersResult.deletedCount} orders`)

    // Delete all messages
    console.log('Deleting all messages...')
    const messagesResult = await Message.deleteMany({})
    console.log(`✓ Deleted ${messagesResult.deletedCount} messages`)

    // Delete all service requests
    console.log('Deleting all service requests...')
    const serviceRequestsResult = await ServiceRequest.deleteMany({})
    console.log(`✓ Deleted ${serviceRequestsResult.deletedCount} service requests`)

    console.log('\n✅ Successfully cleared all orders, messages, and service requests!')
    console.log(`\nSummary:`)
    console.log(`  - Orders deleted: ${ordersResult.deletedCount}`)
    console.log(`  - Messages deleted: ${messagesResult.deletedCount}`)
    console.log(`  - Service requests deleted: ${serviceRequestsResult.deletedCount}`)

    await mongoose.disconnect()
    console.log('\nDatabase connection closed.')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error clearing orders:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

clearOrders()
