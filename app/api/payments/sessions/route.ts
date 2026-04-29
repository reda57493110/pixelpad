import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PaymentSession from '@/models/PaymentSession'
import { requireAuth, requireSameOriginMutation } from '@/lib/auth-middleware'
import { sensitiveWriteRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { validateBody } from '@/lib/validation'

const createPaymentSessionSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().trim().min(3).max(6).optional(),
  paymentMethod: z.string().trim().min(2).max(30),
  customerName: z.string().trim().min(2).max(120).optional(),
  customerPhone: z.string().trim().min(6).max(30).optional(),
  city: z.string().trim().min(2).max(80).optional(),
  address: z.string().trim().min(5).max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

async function handleCreatePaymentSession(request: NextRequest) {
  try {
    const { error: csrfError } = requireSameOriginMutation(request)
    if (csrfError) return csrfError

    const { user, error } = await requireAuth(request)
    if (error || !user) return error!

    await connectDB()
    const body = await request.json()
    const parsed = validateBody(createPaymentSessionSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const { amount, paymentMethod, customerName, customerPhone, city, address, metadata } = parsed.data
    const currency = parsed.data.currency || 'MAD'

    const finalUserId = user.id
    const finalEmail = user.email.toLowerCase()

    // Generate unique session ID
    const sessionId = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Create payment session
    const paymentSession = await PaymentSession.create({
      sessionId,
      userId: finalUserId,
      email: finalEmail,
      amount,
      currency,
      paymentMethod,
      status: 'pending',
      customerName,
      customerPhone,
      city,
      address,
      metadata,
    })

    return NextResponse.json(paymentSession, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment session:', error)
    
    // Handle duplicate sessionId error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Session ID already exists, please try again' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return sensitiveWriteRateLimit(request, handleCreatePaymentSession)
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) return error!

    await connectDB()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    
    let query: any = {}
    const isStaff = user.type === 'user' && (user.role === 'admin' || user.role === 'team')

    if (isStaff) {
      if (sessionId) query.sessionId = sessionId
      if (userId) query.userId = userId
      if (email) query.email = email.toLowerCase()
    } else {
      query = {
        userId: user.id,
        email: user.email.toLowerCase(),
      }
      if (sessionId) query.sessionId = sessionId
    }
    
    const sessions = await PaymentSession.find(query).sort({ createdAt: -1 })
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching payment sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment sessions' },
      { status: 500 }
    )
  }
}

