import { NextRequest, NextResponse } from 'next/server'
import { getResetTokenData, deleteResetToken } from '@/lib/resetTokens'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Customer from '@/models/Customer'
import bcrypt from 'bcryptjs'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Get token data from MongoDB
    const tokenData = await getResetTokenData(token)
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Delete the token (one-time use) before updating password
    const email = tokenData.email.toLowerCase().trim()
    await deleteResetToken(token)

    // Connect to database
    await connectDB()

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Try to find user (admin/team) first
    let user = await User.findOne({ email })
    
    // If not found, try customer
    if (!user) {
      user = await Customer.findOne({ email })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update password in database
    user.password = hashedPassword
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
      email
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

