import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'
import { requireAuth } from '@/lib/auth-middleware'
import bcrypt from 'bcryptjs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error) return error

    // Users can only change their own password unless admin
    if (user?.type === 'customer' && user.id !== params.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await connectDB()
    const { oldPassword, newPassword } = await request.json()

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Old password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const customer = await Customer.findById(params.id)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Verify old password (unless admin)
    if (user?.type === 'customer') {
      const isPasswordValid = await bcrypt.compare(oldPassword, customer.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid old password' },
          { status: 401 }
        )
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    customer.password = hashedPassword
    await customer.save()

    return NextResponse.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}

