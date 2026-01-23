/**
 * Script to create an admin user in the database
 * 
 * Usage:
 *   npx ts-node scripts/create-admin.ts
 * 
 * Environment variables are loaded from .env.local
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { Schema, model } from 'mongoose'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelpad'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pixelpad.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User'

// Define User schema inline to avoid import issues
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'team'], default: 'team', required: true },
  avatar: { type: String },
  permissions: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const User = mongoose.models.User || model('User', UserSchema)

async function createAdmin() {
  try {
    console.log('Connecting to database...')
    console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')) // Hide password in logs
    
    if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/pixelpad') {
      console.error('\n❌ Error: MONGODB_URI not set or using default value')
      console.error('Please set MONGODB_URI in your .env.local file')
      console.error('Example: MONGODB_URI=mongodb://localhost:27017/pixelpad')
      process.exit(1)
    }
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to database\n')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })
    if (existingAdmin) {
      console.log(`⚠️  Admin user with email ${ADMIN_EMAIL} already exists`)
      
      // Ask if user wants to update password
      console.log('\n💡 To update the password, run this script with ADMIN_PASSWORD set in .env.local')
      console.log('   Or use the API endpoint: POST /api/admin/setup-admin')
      
      // Update password if provided
      if (ADMIN_PASSWORD && ADMIN_PASSWORD !== 'admin123') {
        console.log('\n🔄 Updating admin password...')
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
        ;(existingAdmin as any).password = hashedPassword
        console.log('✅ Password updated')
      }
      
      // Update to ensure it's an admin
      if ((existingAdmin as any).role !== 'admin') {
        ;(existingAdmin as any).role = 'admin'
        ;(existingAdmin as any).isActive = true
        console.log('✅ Updated existing user to admin role')
      } else {
        console.log('✅ User is already an admin')
      }
      
      await existingAdmin.save()
      
      console.log(`\n📋 Admin Details:`)
      console.log(`   Email: ${(existingAdmin as any).email}`)
      console.log(`   Name: ${(existingAdmin as any).name}`)
      console.log(`   Role: ${(existingAdmin as any).role}`)
      console.log(`   ID: ${(existingAdmin as any)._id}`)
      
      await mongoose.disconnect()
      process.exit(0)
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

    // Create admin user
    console.log('Creating admin user...')
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    })

    console.log(`\n✅ Admin user created successfully!`)
    console.log(`\n📋 Admin Details:`)
    console.log(`   Email: ${(admin as any).email}`)
    console.log(`   Name: ${(admin as any).name}`)
    console.log(`   Role: ${(admin as any).role}`)
    console.log(`   ID: ${(admin as any)._id}`)
    console.log(`\n⚠️  Please change the default password after first login!`)
    console.log(`\n🔐 Login Credentials:`)
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from database')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Error creating admin:', error.message)
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Make sure MongoDB is running and MONGODB_URI is correct in .env.local')
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
    }
    process.exit(1)
  }
}

createAdmin()
