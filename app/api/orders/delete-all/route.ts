import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-middleware'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function DELETE(request: NextRequest) {
  try {
    // Require admin authentication
    const { user, error } = await requireAdmin(request)
    if (error) return error

    if (!user) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    const result = await Order.deleteMany({})
    if (process.env.NODE_ENV === 'development') {
      console.log(`Deleted ${result.deletedCount} orders`)
    }
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} orders`,
      count: result.deletedCount
    })
  } catch (error) {
    console.error('Error deleting all orders:', error)
    return NextResponse.json(
      { error: 'Failed to delete orders' },
      { status: 500 }
    )
  }
}


