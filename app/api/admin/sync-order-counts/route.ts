import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import GuestCustomer from '@/models/GuestCustomer'
import Customer from '@/models/Customer'
import { authenticateRequest } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

// Admin endpoint to sync order counts for all customers
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Check authentication
    const { user } = await authenticateRequest(request)
    const isAdmin = (user?.role === 'admin' && user?.type === 'user') ||
                    user?.email === 'admin@pixelpad.com' ||
                    (user?.email && user.email.toLowerCase().includes('admin'))
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const email = body.email // Optional: sync specific customer
    
    let syncedCount = 0
    let errors: string[] = []
    
    if (email) {
      // Sync specific customer
      const emailLower = email.toLowerCase()
      
      // Count actual orders for this email
      const orderCount = await Order.countDocuments({
        $or: [
          { email: emailLower },
          { userId: emailLower }
        ],
        status: { $ne: 'cancelled' } // Exclude cancelled orders
      })
      
      // Update guest customer if exists
      const guest = await GuestCustomer.findOne({ email: emailLower })
      if (guest) {
        await GuestCustomer.findByIdAndUpdate(guest._id, {
          $set: { orders: orderCount }
        })
        syncedCount++
      }
      
      // Update regular customer if exists
      const customer = await Customer.findOne({ email: emailLower })
      if (customer) {
        await Customer.findByIdAndUpdate(customer._id, {
          $set: { orders: orderCount }
        })
        syncedCount++
      }
      
      if (!guest && !customer) {
        errors.push(`Customer not found: ${email}`)
      }
    } else {
      // Sync all customers
      // Get all unique emails from orders
      const orders = await Order.find({ status: { $ne: 'cancelled' } })
        .select('email userId')
        .lean()
      
      const emailMap = new Map<string, number>()
      
      // Count orders per email
      orders.forEach((order: any) => {
        const email = (order.email || order.userId)?.toLowerCase()
        if (email) {
          emailMap.set(email, (emailMap.get(email) || 0) + 1)
        }
      })
      
      // Update all guest customers
      const guests = await GuestCustomer.find({})
      for (const guest of guests) {
        const orderCount = emailMap.get(guest.email.toLowerCase()) || 0
        await GuestCustomer.findByIdAndUpdate(guest._id, {
          $set: { orders: orderCount }
        })
        syncedCount++
      }
      
      // Update all regular customers
      const customers = await Customer.find({})
      for (const customer of customers) {
        const orderCount = emailMap.get(customer.email.toLowerCase()) || 0
        await Customer.findByIdAndUpdate(customer._id, {
          $set: { orders: orderCount }
        })
        syncedCount++
      }
    }
    
    return NextResponse.json({
      success: true,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error syncing order counts:', error)
    return NextResponse.json(
      { error: 'Failed to sync order counts' },
      { status: 500 }
    )
  }
}


