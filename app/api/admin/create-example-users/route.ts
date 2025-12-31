import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireAdmin } from '@/lib/auth-middleware'
import bcrypt from 'bcryptjs'
import { PERMISSION_GROUPS } from '@/lib/permissions'

/**
 * POST /api/admin/create-example-users
 * 
 * Creates example users with different permission sets.
 * Only admins can access this endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin access
    const { user, error } = await requireAdmin(request)
    if (error) return error

    await connectDB()

    const usersToCreate = [
      {
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
      },
    ]

    const results = {
      created: [] as any[],
      skipped: [] as any[],
      errors: [] as any[],
    }

    for (const userData of usersToCreate) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email })
        if (existingUser) {
          results.skipped.push({
            email: userData.email,
            reason: 'User already exists',
          })
          continue
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10)

        // Create user
        const newUser = await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          permissions: userData.permissions,
          isActive: true,
        })

        // Return user without password
        const userWithoutPassword = newUser.toObject()
        delete userWithoutPassword.password
        if (userWithoutPassword._id) {
          userWithoutPassword.id = userWithoutPassword._id.toString()
          delete userWithoutPassword._id
        }

        results.created.push({
          ...userWithoutPassword,
          password: userData.password, // Include plain password for display
        })
      } catch (error: any) {
        results.errors.push({
          email: userData.email,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${results.created.length} users, skipped ${results.skipped.length}, errors: ${results.errors.length}`,
      results,
    })
  } catch (error: any) {
    console.error('Error creating example users:', error)
    return NextResponse.json(
      { error: 'Failed to create users', details: error.message },
      { status: 500 }
    )
  }
}

