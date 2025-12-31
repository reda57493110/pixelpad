/**
 * Simple script to create Operations Manager user
 * 
 * Usage: node scripts/create-operations-user-simple.js
 * 
 * Make sure MONGODB_URI is set in .env.local
 */

require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

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

async function createUser() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const userData = {
      name: 'Operations Manager',
      email: 'operations@pixelpad.com',
      password: 'operations123',
      role: 'team',
      permissions: [
        'dashboard.view',
        'products.view',
        'products.create',
        'products.edit',
        'stock.view',
        'stock.update',
        'orders.view',
        'orders.view.details',
        'orders.update.status',
        'orders.edit',
        'messages.view',
        'messages.reply',
        'service-requests.view',
        'service-requests.update',
        'sales.view'
      ],
      isActive: true,
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      console.log(`⚠️  User with email ${userData.email} already exists!`)
      console.log('\n📋 Existing User Details:')
      console.log(`   Name: ${existingUser.name}`)
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Role: ${existingUser.role}`)
      console.log(`   Permissions: ${existingUser.permissions?.length || 0} permissions`)
      console.log(`   Active: ${existingUser.isActive}`)
      await mongoose.disconnect()
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // Create user
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    })

    console.log('✅ User created successfully!')
    console.log('\n📋 User Details:')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: ${userData.password}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Permissions: ${user.permissions?.length || 0} permissions`)
    console.log(`   Active: ${user.isActive}`)
    console.log('\n🔐 Login Credentials:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: ${userData.password}`)
    console.log('\n⚠️  Remember to change the password after first login!\n')

    await mongoose.disconnect()
    console.log('✅ Disconnected from database')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating user:', error.message)
    if (error.code === 11000) {
      console.error('   User with this email already exists!')
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
    }
    process.exit(1)
  }
}

createUser()


