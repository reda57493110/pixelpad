import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import Customer from '@/models/Customer'
import GuestCustomer from '@/models/GuestCustomer'
import { authenticateRequest, requireAuth, requireSameOriginMutation } from '@/lib/auth-middleware'
import { z } from 'zod'
import { validateBody } from '@/lib/validation'

const orderItemSchema = z.object({
  id: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(240),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive().max(100),
})

const createOrderSchema = z.object({
  id: z.string().trim().max(80).optional(),
  userId: z.string().trim().min(1).max(120),
  email: z.string().email().max(254),
  date: z.string().datetime().optional(),
  items: z.array(orderItemSchema).min(1),
  total: z.number().nonnegative(),
  status: z.enum(['processing', 'shipped', 'completed', 'cancelled', 'returned', 'refunded']).optional(),
  customerName: z.string().trim().max(120).optional(),
  customerPhone: z.string().trim().max(30).optional(),
  city: z.string().trim().max(120).optional(),
  address: z.string().trim().max(500).optional(),
  returnNotes: z.string().trim().max(1000).optional(),
  paymentSessionId: z.string().trim().max(120).optional(),
  paymentMethod: z.enum(['cash', 'card', 'mobile']).optional(),
  paymentStatus: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
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
      // Customers can only access their own orders regardless of query params.
      const normalizedEmail = user.email.toLowerCase()
      query = {
        $or: [
          { email: normalizedEmail },
          { userId: normalizedEmail },
          { userId: user.id },
        ],
      }
    }
    
    // Use lean() for faster queries and select only needed fields
    // Use compound index based on query: userId + date or email + date
    let ordersQuery = Order.find(query)
      .select('id _id date items total status customerName customerPhone city email paymentSessionId paymentMethod paymentStatus returnNotes createdAt updatedAt')
      .sort({ date: -1 })
      .lean()
    
    // Hint the appropriate compound index based on query
    if (query.userId) {
      ordersQuery = ordersQuery.hint({ userId: 1, date: -1 })
    } else if (query.email) {
      ordersQuery = ordersQuery.hint({ email: 1, date: -1 })
    }
    
    const orders = await ordersQuery
    
    // Batch update missing IDs (more efficient than individual updates)
    const ordersNeedingIds = orders.filter((order: any) => !order.id || !order.id.startsWith('PP-'))
    if (ordersNeedingIds.length > 0) {
      // Update in background (don't wait for it)
      Promise.all(
        ordersNeedingIds.map(async (order: any) => {
          const customId = `PP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
          try {
            await Order.findByIdAndUpdate(order._id, { $set: { id: customId } })
            order.id = customId
          } catch (updateError) {
            console.error(`Failed to add custom ID to order ${order._id}:`, updateError)
            if (!order.id) {
              order.id = order._id?.toString()
            }
          }
        })
      ).catch(err => console.error('Error updating order IDs:', err))
    }
    
    // Clean up response - remove unnecessary MongoDB fields
    const cleanedOrders = orders.map((order: any) => {
      const cleaned: any = {
        id: order.id || order._id?.toString(),
        date: order.date || order.createdAt,
        items: order.items || [],
        total: order.total,
        status: order.status || 'processing',
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        city: order.city,
        email: order.email,
        paymentSessionId: order.paymentSessionId,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        returnNotes: order.returnNotes,
      }
      // Only include fields that have values
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === undefined || cleaned[key] === null) {
          delete cleaned[key]
        }
      })
      return cleaned
    })
    
    return NextResponse.json(cleanedOrders, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: csrfError } = requireSameOriginMutation(request)
    if (csrfError) return csrfError

    await connectDB()
    const body = await request.json()
    const parsed = validateBody(createOrderSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }
    const orderInput = parsed.data
    
    // Check if user is admin (bypass stock validation for admins)
    const { user } = await authenticateRequest(request)
    // Only check role and type - remove email-based checks for security
    const isAdmin = user?.role === 'admin' && user?.type === 'user'
    
    // Remove client-controlled bypass header - only admins can bypass
    const bypassStock = isAdmin
    
    // Stock validation removed - allow orders even when products are out of stock
    // Products can still be ordered and will be fulfilled when stock becomes available
    
    // Reserve stock: Deduct stock quantity on order creation (for all users, including admins)
    const normalizedItems = orderInput.items

    if (normalizedItems && orderInput.status !== 'returned') {
      try {
        for (const item of normalizedItems) {
          const product = await Product.findById(item.id)
          if (product) {
            const newStockQuantity = Math.max(0, (product.stockQuantity || 0) - item.quantity)
            const newInStock = newStockQuantity > 0
            
            await Product.findByIdAndUpdate(product._id, {
              $set: {
                stockQuantity: newStockQuantity,
                inStock: newInStock
              }
            })
            
            if (process.env.NODE_ENV === 'development') {
              console.log(`Order creation - Reserved stock for product ${product.name}: Stock=${newStockQuantity}, Reserved=${item.quantity}${isAdmin ? ' (Admin bypass)' : ''}`)
            }
          }
        }
      } catch (stockError) {
        console.error('Error reserving stock:', stockError)
        return NextResponse.json(
          { error: 'Failed to reserve stock. Please try again.' },
          { status: 500 }
        )
      }
    }
    
    // Create or find customer record for guest customers
    let customerEmail = orderInput.email || orderInput.userId
    const isGuest = !user || user.type !== 'customer' || customerEmail === 'guest' || customerEmail?.startsWith('guest-')
    
    if (isGuest && orderInput.customerName && customerEmail) {
      try {
        // Normalize email for guest customers
        if (customerEmail === 'guest' || customerEmail?.startsWith('guest-')) {
          // Use the email from the order body if available, otherwise generate one
          customerEmail = orderInput.email || `guest-${Date.now()}@pixelpad.local`
        }

        const emailLower = customerEmail.toLowerCase()
        
        // Find or create guest customer record (stored in separate collection)
        let guest = await GuestCustomer.findOne({ email: emailLower })
        
        if (!guest) {
          // Create new guest customer with order count of 1 (since we're creating an order now)
          guest = await GuestCustomer.create({
            name: orderInput.customerName,
            email: emailLower,
            phone: orderInput.customerPhone,
            city: orderInput.city,
            address: orderInput.address,
            orders: 1, // Start with 1 since we're creating an order
            isGuest: true,
          })
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Created guest customer record: ${guest.email} with 1 order`)
          }
        } else {
          // Update customer info and increment order count
          await GuestCustomer.findByIdAndUpdate(guest._id, {
            $set: {
              name: orderInput.customerName,
              phone: orderInput.customerPhone,
              city: orderInput.city,
              address: orderInput.address,
            },
            $inc: { orders: 1 } // Increment order count
          })
          
            if (process.env.NODE_ENV === 'development') {
              console.log(`Incremented order count for guest customer`)
            }
        }
        
        // Update order body to use the customer email
        orderInput.email = guest.email
        orderInput.userId = guest.email
      } catch (customerError: any) {
        // If customer creation fails (e.g., duplicate email), try to find existing customer
        console.error('Error creating/finding customer:', customerError)
        if (customerError.code !== 11000) { // Not a duplicate key error
          // Continue with order creation even if customer creation fails
          console.warn('Continuing with order creation despite customer creation error')
        } else {
          // Duplicate email - find existing customer and increment order count
          const existingGuest = await GuestCustomer.findOne({ email: customerEmail.toLowerCase() })
          if (existingGuest) {
            await GuestCustomer.findByIdAndUpdate(existingGuest._id, {
              $inc: { orders: 1 } // Increment order count
            })
            orderInput.email = existingGuest.email
            orderInput.userId = existingGuest.email
          }
        }
      }
    }
    
    // Also update order count for regular customers (non-guest)
    if (!isGuest && customerEmail) {
      try {
        const customer = await Customer.findOne({ email: customerEmail.toLowerCase() })
        if (customer) {
          await Customer.findByIdAndUpdate(customer._id, {
            $inc: { orders: 1 } // Increment order count
          })
            if (process.env.NODE_ENV === 'development') {
              console.log(`Incremented order count for customer`)
            }
        }
      } catch (customerError) {
        console.error('Error updating customer order count:', customerError)
        // Don't fail order creation if customer update fails
      }
    }
    
    // Ensure order has custom ID if not provided
    if (!orderInput.id || !orderInput.id.startsWith('PP-')) {
      orderInput.id = orderInput.id || `PP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    }
    
    const orderPayload = {
      id: orderInput.id,
      userId: String(orderInput.userId || '').trim(),
      email: String(orderInput.email || '').toLowerCase().trim(),
      date: orderInput.date ? new Date(orderInput.date) : undefined,
      items: normalizedItems,
      total: Number(orderInput.total || 0),
      status: orderInput.status || 'processing',
      customerName: orderInput.customerName ? String(orderInput.customerName).trim() : undefined,
      customerPhone: orderInput.customerPhone ? String(orderInput.customerPhone).trim() : undefined,
      city: orderInput.city ? String(orderInput.city).trim() : undefined,
      returnNotes: orderInput.returnNotes ? String(orderInput.returnNotes).trim() : undefined,
      paymentSessionId: orderInput.paymentSessionId ? String(orderInput.paymentSessionId).trim() : undefined,
      paymentMethod: orderInput.paymentMethod,
      paymentStatus: orderInput.paymentStatus,
    }
    if (!orderPayload.userId || !orderPayload.email || !Number.isFinite(orderPayload.total) || orderPayload.total < 0) {
      return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })
    }

    const order = await Order.create(orderPayload)
    
    // If order is created with "returned" status, restore stock
    if (order.status === 'returned' && order.items) {
      try {
        for (const item of order.items) {
          const product = await Product.findById(item.id)
          if (product) {
            // Restore stock (add back the quantity)
            const newStockQuantity = (product.stockQuantity || 0) + item.quantity
            // Decrease sold quantity (only if it was previously counted as sold)
            const newSoldQuantity = Math.max(0, (product.soldQuantity || 0) - item.quantity)
            const newInStock = newStockQuantity > 0
            
            await Product.findByIdAndUpdate(product._id, {
              $set: {
                stockQuantity: newStockQuantity,
                soldQuantity: newSoldQuantity,
                inStock: newInStock
              }
            })
            
            if (process.env.NODE_ENV === 'development') {
              console.log(`Manual return - Restored stock for product ${product.name}: Stock=${newStockQuantity}, Sold=${newSoldQuantity}`)
            }
          }
        }
      } catch (stockError) {
        console.error('Error handling returned order stock:', stockError)
        // Don't fail the order creation if stock update fails
      }
    }
    
    // Clean up response - return only needed fields
    const orderResponse: any = {
      id: order.id || order._id?.toString(),
      date: order.date || order.createdAt,
      items: order.items || [],
      total: order.total,
      status: order.status || 'processing',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      city: order.city,
      email: order.email,
      paymentSessionId: order.paymentSessionId,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    }
    // Remove undefined/null fields to reduce payload size
    Object.keys(orderResponse).forEach(key => {
      if (orderResponse[key] === undefined || orderResponse[key] === null) {
        delete orderResponse[key]
      }
    })
    
    return NextResponse.json(orderResponse, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

