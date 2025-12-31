/**
 * Script to create example users with different permission sets
 * 
 * This script creates:
 * - Manager User
 * - Support User
 * - Inventory User
 * - Sales User
 * 
 * Usage:
 *   npx ts-node scripts/create-example-users.ts
 * 
 * Make sure MONGODB_URI is set in your .env.local file
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import { PERMISSION_GROUPS } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local')
}

interface UserToCreate {
  name: string
  email: string
  password: string
  role: 'admin' | 'team'
  permissions: string[]
  description: string
}

const usersToCreate: UserToCreate[] = [
  {
    name: 'Operations Manager',
    email: 'operations@pixelpad.com',
    password: 'operations123',
    role: 'team',
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
    description: 'Can manage orders, messages, service requests, sales, products, and stock'
  },
]

async function createUsers() {
  try {
    await connectDB()
    console.log('✅ Connected to MongoDB\n')

    let createdCount = 0
    let skippedCount = 0

    for (const userData of usersToCreate) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email })
        if (existingUser) {
          console.log(`⏭️  Skipping ${userData.name} (${userData.email}) - already exists`)
          skippedCount++
          continue
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10)

        // Create user
        const user = await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          permissions: userData.permissions,
          isActive: true,
        })

        console.log(`✅ Created: ${userData.name}`)
        console.log(`   Email: ${userData.email}`)
        console.log(`   Password: ${userData.password}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Permissions: ${user.permissions?.length || 0} permissions`)
        console.log(`   Description: ${userData.description}`)
        console.log('')
        createdCount++
      } catch (error: any) {
        console.error(`❌ Error creating ${userData.name}:`, error.message)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   Created: ${createdCount} users`)
    console.log(`   Skipped: ${skippedCount} users (already exist)`)
    console.log(`   Total: ${usersToCreate.length} users\n`)

    if (createdCount > 0) {
      console.log('🔐 Login Credentials:')
      usersToCreate.forEach(user => {
        console.log(`   ${user.email} / ${user.password}`)
      })
      console.log('\n⚠️  Remember to change these passwords after first login!\n')
    }

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createUsers()

