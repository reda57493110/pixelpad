import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PaymentSession from '@/models/PaymentSession'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const {
      userId,
      email,
      amount,
      currency = 'MAD',
      paymentMethod,
      customerName,
      customerPhone,
      city,
      address,
      metadata,
    } = body

    // Validate required fields
    if (!userId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount, paymentMethod' },
        { status: 400 }
      )
    }
    
    // Use provided email or generate one for guests
    const finalEmail = email || `guest-${userId}@pixelpad.local`

    // Generate unique session ID
    const sessionId = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Create payment session
    const paymentSession = await PaymentSession.create({
      sessionId,
      userId,
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

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    
    let query: any = {}
    if (sessionId) query.sessionId = sessionId
    if (userId) query.userId = userId
    if (email) query.email = email
    
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

