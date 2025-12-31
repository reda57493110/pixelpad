import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Message from '@/models/Message'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const message = await Message.findById(params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    const message = await Message.findByIdAndUpdate(params.id, body, { new: true })
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
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const message = await Message.findByIdAndDelete(params.id)
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}





