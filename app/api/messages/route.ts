import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Use dynamic import to prevent MongoDB modules from loading during build analysis
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Message } = await import('@/models/Message')
    
    try {
      await connectDB()
    } catch (dbError: any) {
      // During build, MongoDB connection errors are expected and should be ignored
      if (dbError?.isBuildTimeError) {
        return NextResponse.json({ error: 'Database not available during build' }, { status: 503 })
      }
      throw dbError
    }
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('userId')
    
    let query: any = {}
    if (email) query.email = email
    if (userId) query.userId = userId
    
    const messages = await Message.find(query).sort({ date: -1 })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use dynamic import to prevent MongoDB modules from loading during build analysis
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Message } = await import('@/models/Message')
    
    try {
      await connectDB()
    } catch (dbError: any) {
      // During build, MongoDB connection errors are expected and should be ignored
      if (dbError?.isBuildTimeError) {
        return NextResponse.json({ error: 'Database not available during build' }, { status: 503 })
      }
      throw dbError
    }
    const body = await request.json()
    const message = await Message.create(body)
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}





