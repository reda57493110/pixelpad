import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PaymentSession from '@/models/PaymentSession'
import { requireAuth, requireAdminOrTeam, requireSameOriginMutation } from '@/lib/auth-middleware'
import { sensitiveWriteRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { validateBody } from '@/lib/validation'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

const updatePaymentSessionSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
  orderId: z.string().trim().min(1).max(80).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) return error!

    const { sessionId } = await context.params
    await connectDB()
    const session = await PaymentSession.findOne({ sessionId: sessionId })
    
    if (!session) {
      return NextResponse.json(
        { error: 'Payment session not found' },
        { status: 404 }
      )
    }

    const isStaff = user.type === 'user' && (user.role === 'admin' || user.role === 'team')
    if (!isStaff) {
      const isOwner = session.userId === user.id && session.email?.toLowerCase?.() === user.email.toLowerCase()
      if (!isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
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
  context: { params: Promise<{ sessionId: string }> }
) {
  const { error: csrfError } = requireSameOriginMutation(request)
  if (csrfError) return csrfError

  const { error } = await requireAdminOrTeam(request)
  if (error) return error

  return sensitiveWriteRateLimit(request, async () => {
  try {
    const { sessionId } = await context.params
    await connectDB()
    const rawBody = await request.json()
    const parsed = validateBody(updatePaymentSessionSchema, rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const body = parsed.data
    
    const session = await PaymentSession.findOne({ sessionId: sessionId })
    
    if (!session) {
      return NextResponse.json(
        { error: 'Payment session not found' },
        { status: 404 }
      )
    }
    
    // Update allowed fields
    if (body.status) {
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
  })
}






