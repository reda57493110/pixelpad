import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Customer from '@/models/Customer'
import GuestCustomer from '@/models/GuestCustomer'
import { requireAuth } from '@/lib/auth-middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAuth(request)
    if (error) return error

    // Only admins can list all customers
    if (!user || user.type !== 'user' || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    await connectDB()
    const [customers, guestCustomers] = await Promise.all([
      Customer.find({}).select('-password').sort({ createdAt: -1 }),
      GuestCustomer.find({}).sort({ createdAt: -1 })
    ])
    
    const normalize = (doc: any, isGuest: boolean) => {
      const customerObj = doc.toObject ? doc.toObject() : doc
      if (!customerObj.id && customerObj._id) {
        customerObj.id = customerObj._id.toString()
      }
      if (!customerObj.orders) customerObj.orders = 0
      const guestFlag = isGuest || customerObj.isGuest === true
      customerObj.isGuest = guestFlag
      customerObj.customerType = guestFlag ? 'guest' : 'registered'
      if (!guestFlag) {
        delete customerObj.password
      }
      return customerObj
    }
    
    const allCustomers = [
      ...customers.map((c: any) => normalize(c, false)),
      ...guestCustomers.map((c: any) => normalize(c, true)),
    ]
    
    return NextResponse.json(allCustomers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

