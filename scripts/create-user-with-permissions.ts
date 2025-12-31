/**
 * Script to create a user with specific permissions
 * 
 * Usage:
 *   npx ts-node scripts/create-user-with-permissions.ts
 * 
 * Or modify the user data below and run:
 *   ts-node scripts/create-user-with-permissions.ts
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import { PERMISSION_GROUPS, PERMISSIONS } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

async function createUser() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    // ============================================
    // CONFIGURE YOUR USER HERE
    // ============================================
    
    const userData = {
      name: 'Manager User', // Change this
      email: 'manager@pixelpad.com', // Change this
      password: 'manager123', // Change this - will be hashed
      role: 'team' as const, // 'admin' or 'team'
      
      // Option 1: Use a predefined permission group
      permissions: PERMISSION_GROUPS.MANAGER,
      
      // Option 2: Use custom permissions (uncomment and modify)
      // permissions: [
      //   'dashboard.view',
      //   'products.view',
      //   'products.create',
      //   'orders.view',
      //   'orders.update.status',
      // ],
      
      // Option 3: Give all permissions (like admin)
      // permissions: Object.keys(PERMISSIONS) as string[],
      
      isActive: true,
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      console.log(`❌ User with email ${userData.email} already exists!`)
      console.log('To update permissions, use the admin panel or update the user directly.')
      process.exit(1)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // Create user
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    })

    console.log('✅ User created successfully!')
    console.log('\nUser Details:')
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Role: ${user.role}`)
    console.log(`  Permissions: ${user.permissions?.length || 0} permissions`)
    console.log(`  Active: ${user.isActive}`)
    console.log('\nPermissions:')
    user.permissions?.forEach((permission: string) => {
      const description = PERMISSIONS[permission as keyof typeof PERMISSIONS]
      console.log(`  - ${permission}: ${description || 'N/A'}`)
    })

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error creating user:', error.message)
    process.exit(1)
  }
}

createUser()

