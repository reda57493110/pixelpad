import { NextRequest, NextResponse } from 'next/server'
import { createResetToken } from '@/lib/resetTokens'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists in database
    // Note: We generate tokens for any email to prevent user enumeration
    // In production, you might want to verify the email exists first

    // Generate and store reset token in MongoDB
    const { token } = await createResetToken(email)

    // In production, send email here using services like:
    // - Resend (https://resend.com)
    // - SendGrid (https://sendgrid.com)
    // - Nodemailer (https://nodemailer.com)
    // - AWS SES
    // Example:
    // await sendEmail({
    //   to: email,
    //   subject: 'Reset Your Password',
    //   html: `Click here to reset your password: ${process.env.NEXT_PUBLIC_URL}/reset-password?token=${token}`
    // })

    // Get base URL from request headers
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 
                     (host.includes('localhost') ? 'http' : 'https')
    const resetLink = `${protocol}://${host}/reset-password?token=${token}`
    
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('\n========================================')
      console.log('📧 PASSWORD RESET LINK (Development):')
      console.log('========================================')
      console.log(`Email: ${email}`)
      console.log(`Reset Link: ${resetLink}`)
      console.log('========================================\n')
    }

    // Always return success (don't reveal if email exists - security best practice)
    return NextResponse.json({
      success: true,
      message: 'If this email exists, a reset link has been sent.',
      // Only include this in development
      ...(process.env.NODE_ENV === 'development' && {
        resetLink,
        warning: 'This link is only shown in development mode'
      })
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

