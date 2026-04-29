import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'
import { requireAuth } from '@/lib/auth-middleware'

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
    await connectDB()
    const body = await request.json()
    const message = await Message.create(body)
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}





