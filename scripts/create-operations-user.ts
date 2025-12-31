/**
 * Script to create the Operations Manager user
 * 
 * Usage:
 *   npx ts-node scripts/create-operations-user.ts
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local')
}

async function createUser() {
  try {
    await connectDB()
    console.log('✅ Connected to MongoDB\n')

    const userData = {
      name: 'Operations Manager',
      email: 'operations@pixelpad.com',
      password: 'operations123',
      role: 'team' as const,
      permissions: [
        // Dashboard
        'dashboard.view',
        // Products
        'products.view',
        'products.create',
        'products.edit',
        // Stock
        'stock.view',
        'stock.update',
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
        // Sales
        'sales.view',
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

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error creating user:', error.message)
    if (error.code === 11000) {
      console.error('   User with this email already exists!')
    }
    process.exit(1)
  }
}

createUser()


