import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import Customer from '@/models/Customer'
import GuestCustomer from '@/models/GuestCustomer'
import { authenticateRequest } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const userId = searchParams.get('userId')
    
    let query: any = {}
    if (email) query.email = email
    if (userId) query.userId = userId
    
    // Use lean() for faster queries and select only needed fields
    const orders = await Order.find(query)
      .select('id _id date items total status customerName customerPhone city email paymentSessionId paymentMethod paymentStatus returnNotes createdAt updatedAt')
      .sort({ date: -1 })
      .lean()
    
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
    await connectDB()
    const body = await request.json()
    
    // Check if user is admin (bypass stock validation for admins)
    const { user } = await authenticateRequest(request)
    // Only check role and type - remove email-based checks for security
    const isAdmin = user?.role === 'admin' && user?.type === 'user'
    
    // Remove client-controlled bypass header - only admins can bypass
    const bypassStock = isAdmin
    
    // Validate stock availability before creating order (skip for admins or if bypass is enabled)
    if (body.items && body.status !== 'returned' && !bypassStock) {
      const stockErrors: string[] = []
      
      for (const item of body.items) {
        const product = await Product.findById(item.id)
        if (!product) {
          stockErrors.push(`Product not found`)
          continue
        }
        
        const availableStock = product.stockQuantity || 0
        if (!product.inStock || availableStock < item.quantity) {
          // Don't expose product names or IDs in errors
          stockErrors.push(
            availableStock === 0 ? 'One or more products are out of stock' : `Insufficient stock available`
          )
        }
      }
      
      if (stockErrors.length > 0) {
        return NextResponse.json(
          { error: 'Stock validation failed', details: stockErrors },
          { status: 400 }
        )
      }
    }
    
    // Reserve stock: Deduct stock quantity on order creation (for all users, including admins)
    if (body.items && body.status !== 'returned') {
      try {
        for (const item of body.items) {
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
    let customerEmail = body.email || body.userId
    const isGuest = !user || user.type !== 'customer' || customerEmail === 'guest' || customerEmail?.startsWith('guest-')
    
    if (isGuest && body.customerName && customerEmail) {
      try {
        // Normalize email for guest customers
        if (customerEmail === 'guest' || customerEmail?.startsWith('guest-')) {
          // Use the email from the order body if available, otherwise generate one
          customerEmail = body.email || `guest-${Date.now()}@pixelpad.local`
        }

        const emailLower = customerEmail.toLowerCase()
        
        // Find or create guest customer record (stored in separate collection)
        let guest = await GuestCustomer.findOne({ email: emailLower })
        
        if (!guest) {
          // Create new guest customer with order count of 1 (since we're creating an order now)
          guest = await GuestCustomer.create({
            name: body.customerName,
            email: emailLower,
            phone: body.customerPhone,
            city: body.city,
            address: body.address,
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
              name: body.customerName,
              phone: body.customerPhone,
              city: body.city,
              address: body.address,
            },
            $inc: { orders: 1 } // Increment order count
          })
          
            if (process.env.NODE_ENV === 'development') {
              console.log(`Incremented order count for guest customer`)
            }
        }
        
        // Update order body to use the customer email
        body.email = guest.email
        body.userId = guest.email
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
            body.email = existingGuest.email
            body.userId = existingGuest.email
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
    if (!body.id || !body.id.startsWith('PP-')) {
      body.id = body.id || `PP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    }
    
    const order = await Order.create(body)
    
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

