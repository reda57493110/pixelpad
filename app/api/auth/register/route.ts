import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/jwt'
import { loginRateLimit } from '@/lib/rate-limit'
import { defaultCors } from '@/lib/cors'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

async function handleRegister(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() })
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create customer (regular customer, not guest)
    const customer = await Customer.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      orders: 0,
      isGuest: false, // Explicitly set to false for registered customers
    })

    // Generate JWT token
    const token = signToken({
      id: customer._id.toString(),
      email: customer.email,
      role: 'customer',
      type: 'customer',
    })

    // Return customer without password
    const customerWithoutPassword = customer.toObject()
    delete customerWithoutPassword.password

    return NextResponse.json(
      {
        user: customerWithoutPassword,
        token,
        type: 'customer',
      },
      { status: 201 }
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Registration error:', error)
    } else {
      console.error('Registration error:', error instanceof Error ? error.message : 'An error occurred')
    }
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return defaultCors(request, (req) => loginRateLimit(req, handleRegister))
}


