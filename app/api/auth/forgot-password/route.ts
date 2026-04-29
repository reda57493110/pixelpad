import { NextRequest, NextResponse } from 'next/server'
import { createResetToken } from '@/lib/resetTokens'
import { strictRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { validateBody } from '@/lib/validation'
import { requireSameOriginMutation } from '@/lib/auth-middleware'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

const forgotPasswordSchema = z.object({
  email: z.string().email().max(254),
})

async function handleForgotPassword(request: NextRequest) {
  try {
    const { error: csrfError } = requireSameOriginMutation(request)
    if (csrfError) return csrfError

    const body = await request.json()
    const parsed = validateBody(forgotPasswordSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const { email } = parsed.data

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

    // Build reset link from trusted configured base URL.
    const trustedBaseUrl =
      process.env.APP_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000'
    const resetLink = `${trustedBaseUrl.replace(/\/$/, '')}/reset-password?token=${token}`
    
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

export async function POST(request: NextRequest) {
  return strictRateLimit(request, handleForgotPassword)
}

