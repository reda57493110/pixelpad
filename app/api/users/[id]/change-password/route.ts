import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireAdminOrTeam } from '@/lib/auth-middleware'
import bcrypt from 'bcryptjs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await requireAdminOrTeam(request)
    if (error) return error

    // Users can only change their own password unless admin
    if (user?.role !== 'admin' && user?.id !== params.id) {
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

    const userData = await User.findById(params.id)
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify old password (unless admin changing someone else's password)
    if (user?.role !== 'admin' || user.id === params.id) {
      const isPasswordValid = await bcrypt.compare(oldPassword, userData.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid old password' },
          { status: 401 }
        )
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    userData.password = hashedPassword
    await userData.save()

    return NextResponse.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}

