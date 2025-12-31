/**
 * Cleanup script to delete migrated customers from Users collection
 * This removes users that have been migrated to the Customers collection
 * 
 * Run with: npx ts-node scripts/cleanup-migrated-users.ts
 */

import mongoose from 'mongoose'
import { Schema, model } from 'mongoose'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelpad'

// Define schemas inline
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'team'], default: 'team' },
  avatar: { type: String },
  permissions: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  orders: { type: Number, default: 0 },
}, { timestamps: true })

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  orders: { type: Number, default: 0 },
}, { timestamps: true })

const User = mongoose.models.User || model('User', UserSchema)
const Customer = mongoose.models.Customer || model('Customer', CustomerSchema)

async function cleanupMigratedUsers() {
  try {
    console.log('🧹 Starting cleanup of migrated users...\n')
    console.log('⚠️  This will DELETE users from Users collection that exist in Customers collection\n')
    console.log('Connecting to database...')
    
    if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/pixelpad') {
      console.error('\n❌ Error: MONGODB_URI not set')
      process.exit(1)
    }
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to database\n')

    // Get all customers
    const customers = await Customer.find({})
    const customerEmails = customers.map(c => c.email.toLowerCase())
    console.log(`📊 Found ${customerEmails.length} customers in Customers collection\n`)

    // Find users that exist in customers collection (excluding admins)
    const users = await User.find({ 
      email: { $in: customerEmails },
      role: { $ne: 'admin' }
    })
    
    console.log(`📋 Found ${users.length} users to delete (migrated to customers)\n`)

    if (users.length === 0) {
      console.log('ℹ️  No users to delete - all migrated users have already been cleaned up')
      await mongoose.disconnect()
      process.exit(0)
    }

    let deleted = 0
    let errors = 0

    for (const user of users) {
      try {
        const userObj = user.toObject ? user.toObject() : user
        const email = userObj.email
        
        // Double check it exists in customers before deleting
        const existsInCustomers = await Customer.findOne({ email: email.toLowerCase() })
        if (!existsInCustomers) {
          console.log(`⏭️  Skipping ${email} - not found in customers collection`)
          continue
        }

        // Don't delete admin users
        if ((userObj as any).role === 'admin') {
          console.log(`⏭️  Skipping ${email} - admin user (should not be deleted)`)
          continue
        }

        // Delete the user
        await User.deleteOne({ _id: user._id })
        console.log(`✅ Deleted ${email} from Users collection`)
        deleted++

      } catch (error: any) {
        console.error(`❌ Error deleting ${(user as any).email}:`, error.message)
        errors++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📋 Cleanup Summary:')
    console.log(`   ✅ Deleted: ${deleted} users`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log('='.repeat(50))
    
    if (deleted > 0) {
      console.log('\n✅ Cleanup completed successfully!')
      console.log(`\n💡 Users collection now only contains admin and team members`)
    }

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from database')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Cleanup failed:', error.message)
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
    }
    process.exit(1)
  }
}

cleanupMigratedUsers()

