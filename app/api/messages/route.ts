import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import { requireAuth, requireSameOriginMutation } from '@/lib/auth-middleware'
import { z } from 'zod'
import { validateBody } from '@/lib/validation'

const createMessageSchema = z.object({
  userId: z.string().trim().min(1).max(120).optional(),
  email: z.string().email().max(254).optional(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30).optional(),
  inquiryType: z.string().trim().min(2).max(80),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(2).max(2000),
})

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error || !user) return error!

    await connectDB()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('userId')
    
    let query: any = {}
    const isStaff = user.type === 'user' && (user.role === 'admin' || user.role === 'team')
    if (isStaff) {
      if (email) query.email = email.toLowerCase()
      if (userId) query.userId = userId
    } else {
      const normalizedEmail = user.email.toLowerCase()
      query = {
        $or: [
          { email: normalizedEmail },
          { userId: normalizedEmail },
          { userId: user.id },
        ],
      }
    }
    
    const messages = await Message.find(query).sort({ date: -1 })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: csrfError } = requireSameOriginMutation(request)
    if (csrfError) return csrfError

    const { user } = await requireAuth(request)
    await connectDB()
    const body = await request.json()
    const parsed = validateBody(createMessageSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const cleanBody = parsed.data

    const payload = {
      userId: user?.id || String(cleanBody.userId || '').trim(),
      email: (user?.email || cleanBody.email || '').toLowerCase().trim(),
      name: cleanBody.name,
      phone: cleanBody.phone,
      inquiryType: cleanBody.inquiryType,
      subject: cleanBody.subject,
      message: cleanBody.message,
    }

    if (!payload.userId || !payload.email || !payload.name || !payload.inquiryType || !payload.subject || !payload.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const message = await Message.create(payload)
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}





