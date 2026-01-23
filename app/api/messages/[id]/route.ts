import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Use dynamic import to prevent MongoDB modules from loading during build analysis
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Message } = await import('@/models/Message')
    
    const { id } = await context.params
    await connectDB()
    const message = await Message.findById(id)
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error fetching message:', error)
    return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Use dynamic import to prevent MongoDB modules from loading during build analysis
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Message } = await import('@/models/Message')
    
    const { id } = await context.params
    await connectDB()
    const body = await request.json()
    const message = await Message.findByIdAndUpdate(id, body, { new: true })
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    return NextResponse.json(message)
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Use dynamic import to prevent MongoDB modules from loading during build analysis
    const { default: connectDB } = await import('@/lib/mongodb')
    const { default: Message } = await import('@/models/Message')
    
    const { id } = await context.params
    await connectDB()
    const message = await Message.findByIdAndDelete(id)
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}





