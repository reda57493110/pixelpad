import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Customer from '@/models/Customer'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/jwt'
import { loginRateLimit } from '@/lib/rate-limit'
import { defaultCors } from '@/lib/cors'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

async function handleLogin(request: NextRequest) {
  try {
    // Try to connect to database with better error handling
    try {
      await connectDB()
    } catch (dbError: any) {
      console.error('MongoDB connection error in login:', {
        message: dbError?.message,
        name: dbError?.name,
        code: dbError?.code,
        hasMongoDB: !!process.env.MONGODB_URI,
        mongoDBLength: process.env.MONGODB_URI?.length || 0
      })
      return NextResponse.json(
        { error: 'Database connection failed. Please check server configuration.' },
        { status: 500 }
      )
    }
    
    // Parse request body with error handling for aborted requests
    let body
    try {
      body = await request.json()
    } catch (parseError: any) {
      if (parseError.name === 'AbortError' || parseError.code === 'ECONNRESET') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Request aborted while parsing body')
        }
        return NextResponse.json({ error: 'Request aborted' }, { status: 499 })
      }
      throw parseError
    }
    
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Try to find user (admin/team) first
    const normalizedEmail = email.toLowerCase().trim()
    let user = await User.findOne({ email: normalizedEmail, isActive: true })
    let userType: 'user' | 'customer' = 'user'
    
    // If not found, try without isActive check (for debugging)
    if (!user) {
      user = await User.findOne({ email: normalizedEmail })
      if (user && !user.isActive && process.env.NODE_ENV === 'development') {
        console.log('User found but isActive is false')
      }
    }
    
    // If still not found, try customer
    if (!user) {
      user = await Customer.findOne({ email: normalizedEmail })
      userType = 'customer'
    }

    if (!user) {
      // Log for debugging (email is already normalized, safe to log)
      console.error('Login attempt: User not found', { email: normalizedEmail })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    // Check if user has a password hash
    if (!user.password) {
      console.error('Login attempt: User has no password hash', { email: normalizedEmail, userId: user._id })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      // Log for debugging in production (without sensitive data)
      console.error('Login attempt: Password mismatch', { 
        email: normalizedEmail, 
        userId: user._id,
        hasPassword: !!user.password,
        passwordLength: user.password?.length 
      })
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    let token
    try {
      token = signToken({
        id: user._id.toString(),
        email: user.email,
        role: userType === 'user' ? (user as any).role : 'customer',
        type: userType,
      })
    } catch (jwtError: any) {
      console.error('JWT token generation error:', {
        message: jwtError?.message,
        name: jwtError?.name,
        hasJWTSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0
      })
      return NextResponse.json(
        { error: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      )
    }

    // Return user data without password
    const userWithoutPassword = user.toObject()
    delete userWithoutPassword.password

    return NextResponse.json(
      {
        user: userWithoutPassword,
        token,
        type: userType,
      },
      { status: 200 }
    )
  } catch (error: any) {
    // Handle connection abort errors gracefully
    if (error.name === 'AbortError' || error.code === 'ECONNRESET') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Login request aborted by client')
      }
      return NextResponse.json({ error: 'Request aborted' }, { status: 499 })
    }
    
    // Log other errors only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error)
    } else {
      // In production, only log error message without stack trace
      console.error('Login error:', error.message || 'An error occurred during login')
    }
    
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return defaultCors(request, (req) => loginRateLimit(req, handleLogin))
}

