import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      )
    }

    const result = await Order.deleteMany({ email: email })
    if (process.env.NODE_ENV === 'development') {
      console.log(`Deleted ${result.deletedCount} orders for customer`)
    }
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} orders for customer`,
      count: result.deletedCount
    })
  } catch (error) {
    console.error('Error deleting customer orders:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer orders' },
      { status: 500 }
    )
  }
}


