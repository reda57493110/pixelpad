import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

/**
 * API endpoint to create or reset admin password
 * 
 * POST /api/admin/setup-admin
 * Body: { password: string, secret?: string }
 * 
 * For security, you can set ADMIN_SETUP_SECRET in environment variables
 * If set, the request must include the secret in the body
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { password, secret } = body

    // Check secret if ADMIN_SETUP_SECRET is set
    const requiredSecret = process.env.ADMIN_SETUP_SECRET
    if (requiredSecret && secret !== requiredSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const ADMIN_EMAIL = 'admin@pixelpad.com'
    const ADMIN_NAME = 'Admin User'

    // Check if admin already exists
    let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    if (admin) {
      // Update existing admin
      admin.password = hashedPassword
      admin.role = 'admin'
      admin.isActive = true
      admin.name = ADMIN_NAME
      await admin.save()

      // Verify the password was set correctly by testing it
      const testCompare = await bcrypt.compare(password, admin.password)
      if (!testCompare) {
        console.error('Warning: Password hash verification failed after update')
      }

      return NextResponse.json({
        success: true,
        message: 'Admin password updated successfully',
        email: ADMIN_EMAIL,
        userId: admin._id.toString(),
        verified: testCompare,
      })
    } else {
      // Create new admin
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      })

      // Verify the password was set correctly by testing it
      const testCompare = await bcrypt.compare(password, admin.password)
      if (!testCompare) {
        console.error('Warning: Password hash verification failed after creation')
      }

      return NextResponse.json({
        success: true,
        message: 'Admin user created successfully',
        email: ADMIN_EMAIL,
        userId: admin._id.toString(),
        verified: testCompare,
      })
    }
  } catch (error: any) {
    console.error('Error setting up admin:', error)
    return NextResponse.json(
      { error: 'Failed to setup admin user', details: error.message },
      { status: 500 }
    )
  }
}
