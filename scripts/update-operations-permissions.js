/**
 * Script to update Operations Manager user permissions
 * 
 * Usage: node scripts/update-operations-permissions.js
 * 
 * This will update operations@pixelpad.com to only have:
 * - Orders permissions
 * - Messages permissions  
 * - Service Requests permissions
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env.local')
  process.exit(1)
}

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'team'], default: 'team', required: true },
  avatar: { type: String },
  permissions: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function updatePermissions() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const email = 'operations@pixelpad.com'
    
    // Find the user
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.error(`❌ User with email ${email} not found!`)
      await mongoose.disconnect()
      process.exit(1)
    }

    console.log('📋 Current User Details:')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Current Permissions: ${user.permissions?.length || 0} permissions`)
    console.log(`   Permissions: ${JSON.stringify(user.permissions, null, 2)}\n`)

    // New permissions: Only Orders, Messages, and Service Requests
    const newPermissions = [
      // Orders
      'orders.view',
      'orders.view.details',
      'orders.update.status',
      'orders.edit',
      
      // Messages
      'messages.view',
      'messages.reply',
      
      // Service Requests
      'service-requests.view',
      'service-requests.update',
    ]

    // Update user permissions
    user.permissions = newPermissions
    await user.save()

    console.log('✅ User permissions updated successfully!')
    console.log('\n📋 Updated User Details:')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   New Permissions: ${user.permissions.length} permissions`)
    console.log(`   Permissions:`)
    user.permissions.forEach(perm => {
      console.log(`     - ${perm}`)
    })
    console.log('\n✅ The user now has access to:')
    console.log('   • Orders (view, view details, update status, edit)')
    console.log('   • Messages (view, reply)')
    console.log('   • Service Requests (view, update)')
    console.log('\n❌ The user NO LONGER has access to:')
    console.log('   • Dashboard')
    console.log('   • Products')
    console.log('   • Stock')
    console.log('   • Sales')
    console.log('   • Customers')
    console.log('   • Users')
    console.log('   • Coupons')
    console.log('   • Warranty')
    console.log('   • Settings')

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from database')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error updating permissions:', error.message)
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
    }
    process.exit(1)
  }
}

updatePermissions()


