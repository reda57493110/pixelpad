/**
 * Force migration script - migrates users with default 'team' role to customers
 * This is useful when users were incorrectly assigned the team role
 * 
 * Run with: npx ts-node scripts/migrate-customers-force.ts
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

async function migrateCustomersForce() {
  try {
    console.log('🔄 Starting FORCE customer migration...\n')
    console.log('⚠️  This will migrate users with "team" role to customers collection\n')
    console.log('Connecting to database...')
    
    if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/pixelpad') {
      console.error('\n❌ Error: MONGODB_URI not set')
      process.exit(1)
    }
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to database\n')

    // Find all users except admins
    const users = await User.find({ role: { $ne: 'admin' } })
    console.log(`📊 Found ${users.length} non-admin users to migrate\n`)

    let migrated = 0
    let skipped = 0
    let errors = 0

    for (const user of users) {
      try {
        const userObj = user.toObject ? user.toObject() : user
        
        // Skip admin users
        if ((userObj as any).role === 'admin') {
          console.log(`⏭️  Skipping ${userObj.email} - admin user`)
          skipped++
          continue
        }

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ email: userObj.email })
        if (existingCustomer) {
          console.log(`⏭️  Skipping ${userObj.email} - already exists in customers collection`)
          skipped++
          continue
        }

        // Create customer from user data
        await Customer.create({
          name: userObj.name,
          email: userObj.email,
          password: userObj.password,
          avatar: userObj.avatar,
          orders: userObj.orders || 0,
          createdAt: userObj.createdAt,
          updatedAt: userObj.updatedAt,
        })

        console.log(`✅ Migrated ${userObj.email} (${(userObj as any).role || 'no role'}) to customers collection`)
        migrated++

        // Optionally delete the user after migration
        // Uncomment the next line if you want to delete users after migration
        // await User.deleteOne({ _id: user._id })
      } catch (error: any) {
        console.error(`❌ Error migrating ${(user as any).email}:`, error.message)
        errors++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📋 Migration Summary:')
    console.log(`   ✅ Migrated: ${migrated} customers`)
    console.log(`   ⏭️  Skipped: ${skipped} users`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log('='.repeat(50))
    
    if (migrated > 0) {
      console.log('\n✅ Migration completed successfully!')
      console.log(`\n💡 Note: Original users are kept in the Users collection.`)
      console.log(`   If you want to delete them, uncomment the delete line in the script.`)
    } else {
      console.log('\nℹ️  No customers to migrate')
    }

    await mongoose.disconnect()
    console.log('\n✅ Disconnected from database')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
    }
    process.exit(1)
  }
}

migrateCustomersForce()

