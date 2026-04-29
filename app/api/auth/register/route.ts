import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'
import bcrypt from 'bcryptjs'
import { setAuthCookie, signToken } from '@/lib/jwt'
import { loginRateLimit } from '@/lib/rate-limit'
import { defaultCors } from '@/lib/cors'
import { z } from 'zod'
import { validateBody } from '@/lib/validation'
import { requireSameOriginMutation } from '@/lib/auth-middleware'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  password: z.string().min(8).max(256),
})

async function handleRegister(request: NextRequest) {
  try {
    const { error: csrfError } = requireSameOriginMutation(request)
    if (csrfError) return csrfError

    await connectDB()
    const body = await request.json()
    const parsed = validateBody(registerSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const { name, email, password } = parsed.data

    // Check if customer already exists (keep response generic to reduce enumeration)
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() })
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Unable to create account with provided details' },
        { status: 400 }
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

    const response = NextResponse.json(
      {
        user: customerWithoutPassword,
        type: 'customer',
      },
      { status: 201 }
    )
    setAuthCookie(response, token)
    return response
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


