import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-middleware'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Customer from '@/models/Customer'
import GuestCustomer from '@/models/GuestCustomer'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await requireAdmin(request)
    
    if (error) {
      return error
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    // Delete all orders
    const ordersResult = await Order.deleteMany({})
    
    // Delete all registered customers
    const customersResult = await Customer.deleteMany({})
    
    // Delete all guest customers
    const guestCustomersResult = await GuestCustomer.deleteMany({})

    return NextResponse.json({
      success: true,
      message: 'All orders and customers cleared successfully',
      deleted: {
        orders: ordersResult.deletedCount,
        customers: customersResult.deletedCount,
        guestCustomers: guestCustomersResult.deletedCount,
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error clearing data:', error)
    return NextResponse.json(
      { error: 'Failed to clear data', details: error.message },
      { status: 500 }
    )
  }
}

