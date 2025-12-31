import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PaymentSession from '@/models/PaymentSession'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await connectDB()
    const session = await PaymentSession.findOne({ sessionId: params.sessionId })
    
    if (!session) {
      return NextResponse.json(
        { error: 'Payment session not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error fetching payment session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment session' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    
    const session = await PaymentSession.findOne({ sessionId: params.sessionId })
    
    if (!session) {
      return NextResponse.json(
        { error: 'Payment session not found' },
        { status: 404 }
      )
    }
    
    // Update allowed fields
    if (body.status) {
      if (!['pending', 'completed', 'failed', 'cancelled'].includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        )
      }
      session.status = body.status
    }
    
    if (body.orderId) {
      session.orderId = body.orderId
    }
    
    if (body.metadata) {
      session.metadata = { ...session.metadata, ...body.metadata }
    }
    
    await session.save()
    
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error updating payment session:', error)
    return NextResponse.json(
      { error: 'Failed to update payment session' },
      { status: 500 }
    )
  }
}






