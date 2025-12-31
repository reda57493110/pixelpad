/**
 * Test script to verify operations user login
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

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    const email = 'operations@pixelpad.com'
    const password = 'operations123'

    // Find user
    console.log('🔍 Looking for user...')
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      console.error('❌ User not found!')
      await mongoose.disconnect()
      process.exit(1)
    }

    console.log('✅ User found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   isActive: ${user.isActive}`)
    console.log(`   Permissions: ${user.permissions?.length || 0} permissions\n`)

    // Check if user is active
    if (!user.isActive) {
      console.log('⚠️  User is not active. Activating...')
      user.isActive = true
      await user.save()
      console.log('✅ User activated\n')
    }

    // Test password
    console.log('🔐 Testing password...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      console.log('❌ Password does not match!')
      console.log('🔄 Resetting password...')
      const hashedPassword = await bcrypt.hash(password, 10)
      user.password = hashedPassword
      await user.save()
      console.log('✅ Password reset successfully!\n')
    } else {
      console.log('✅ Password is correct!\n')
    }

    // Final check - simulate login query
    console.log('🔍 Simulating login query...')
    const loginUser = await User.findOne({ 
      email: email.toLowerCase(), 
      isActive: true 
    })
    
    if (loginUser) {
      console.log('✅ Login query successful!')
      console.log(`   Email: ${loginUser.email}`)
      console.log(`   isActive: ${loginUser.isActive}`)
      console.log('\n✅ Everything looks good! Try logging in again.')
    } else {
      console.log('❌ Login query failed!')
      console.log('   This means the query in the login API is not finding the user.')
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

testLogin()


