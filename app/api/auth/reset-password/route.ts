import { NextRequest, NextResponse } from 'next/server'
import { getResetTokenData, deleteResetToken } from '@/lib/resetTokens'

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

    // Get token data
    const tokenData = getResetTokenData(token)
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Delete the token (one-time use) before returning
    const email = tokenData.email
    deleteResetToken(token)

    // In production, update the password in your database:
    // await updateUserPassword(email, newPassword)

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
      email // Return email so client can update localStorage
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

