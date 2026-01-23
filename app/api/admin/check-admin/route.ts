import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

/**
 * API endpoint to check if admin user exists
 * 
 * GET /api/admin/check-admin
 * 
 * Returns information about the admin user (if exists)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const ADMIN_EMAIL = 'admin@pixelpad.com'
    const admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() })

    if (!admin) {
      return NextResponse.json({
        exists: false,
        message: 'Admin user does not exist. Use /api/admin/setup-admin to create one.',
        email: ADMIN_EMAIL,
      })
    }

    return NextResponse.json({
      exists: true,
      email: admin.email,
      name: admin.name,
      role: (admin as any).role,
      isActive: (admin as any).isActive,
      hasPassword: !!admin.password,
      userId: admin._id.toString(),
      message: 'Admin user exists and is ready to use.',
    })
  } catch (error: any) {
    console.error('Error checking admin:', error)
    return NextResponse.json(
      { error: 'Failed to check admin user', details: error.message },
      { status: 500 }
    )
  }
}
