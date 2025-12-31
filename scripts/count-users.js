/**
 * Script to count all users in the database
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local')
  process.exit(1)
}

// User Schema (Admin/Team)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'team'], default: 'team', required: true },
  avatar: { type: String },
  permissions: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// Customer Schema
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  orders: { type: Number, default: 0 },
  isGuest: { type: Boolean, default: false },
}, { timestamps: true })

// GuestCustomer Schema
const GuestCustomerSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  orders: { type: Number, default: 0 },
  isGuest: { type: Boolean, default: true },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)
const GuestCustomer = mongoose.models.GuestCustomer || mongoose.model('GuestCustomer', GuestCustomerSchema)

async function countUsers() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Count Admin/Team Users
    const adminUsers = await User.countDocuments({ role: 'admin' })
    const teamUsers = await User.countDocuments({ role: 'team' })
    const totalAdminTeam = await User.countDocuments({})

    // Count Customers
    const regularCustomers = await Customer.countDocuments({})
    
    // Count Guest Customers
    const guestCustomers = await GuestCustomer.countDocuments({})

    // Total
    const totalUsers = totalAdminTeam + regularCustomers + guestCustomers

    console.log('📊 USER STATISTICS\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('👥 Admin/Team Users:')
    console.log(`   • Admin users: ${adminUsers}`)
    console.log(`   • Team users: ${teamUsers}`)
    console.log(`   • Total Admin/Team: ${totalAdminTeam}`)
    console.log('')
    console.log('🛒 Customers:')
    console.log(`   • Regular customers: ${regularCustomers}`)
    console.log(`   • Guest customers: ${guestCustomers}`)
    console.log(`   • Total customers: ${regularCustomers + guestCustomers}`)
    console.log('')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📈 TOTAL USERS: ${totalUsers}`)
    console.log('')

    // List admin/team users if any
    if (totalAdminTeam > 0) {
      console.log('\n👤 Admin/Team Users List:')
      const users = await User.find({}).select('name email role isActive').sort({ createdAt: -1 })
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive ? 'Yes' : 'No'}`)
      })
    }

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from database')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
    }
    process.exit(1)
  }
}

countUsers()


