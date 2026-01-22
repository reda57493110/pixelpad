import { NextRequest, NextResponse } from 'next/server'
import { Document } from 'mongoose'
import connectDB from '@/lib/mongodb'
import Order, { IOrder, IOrderItem } from '@/models/Order'
import Product from '@/models/Product'

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

// Type for lean order (plain object without Document methods)
type LeanOrder = Omit<IOrder, keyof Document> & { _id: string; id?: string }

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await connectDB()
    
    // Validate ObjectId format if it looks like one
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id)
    let order
    if (isValidObjectId) {
      // Try both _id and custom id
      order = await Order.findOne({
        $or: [
          { _id: id },
          { id: id }
        ]
      })
        .select('id _id date items total status customerName customerPhone city email paymentSessionId paymentMethod paymentStatus returnNotes createdAt updatedAt')
        .lean()
    } else {
      // Custom ID search
      order = await Order.findOne({ id: id })
        .select('id _id date items total status customerName customerPhone city email paymentSessionId paymentMethod paymentStatus returnNotes createdAt updatedAt')
        .lean()
    }
    
    if (!order && isValidObjectId) {
      // Fallback to findById for backward compatibility
      order = await Order.findById(id)
        .select('id _id date items total status customerName customerPhone city email paymentSessionId paymentMethod paymentStatus returnNotes createdAt updatedAt')
        .lean()
    }
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Clean up response - remove unnecessary MongoDB fields
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
    // Remove undefined/null fields
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined || cleaned[key] === null) {
        delete cleaned[key]
      }
    })
    
    return NextResponse.json(cleaned, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching order:', error)
    } else {
      console.error('Error fetching order:', error instanceof Error ? error.message : 'An error occurred')
    }
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    await connectDB()
    
    // Parse request body with error handling for aborted requests
    let body: any
    try {
      body = await request.json()
    } catch (parseError: any) {
      if (parseError.name === 'AbortError' || parseError.code === 'ECONNRESET') {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Request aborted while parsing body')
        }
        return NextResponse.json({ error: 'Request aborted' }, { status: 499 })
      }
      throw parseError
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('PUT /api/orders/[id] - Request:', {
        id: id,
        body,
        status: body.status
      })
    }
    
    // Validate status if provided
    if (body.status && !['processing', 'shipped', 'completed', 'cancelled', 'returned', 'refunded'].includes(body.status)) {
      return NextResponse.json({ 
        error: 'Invalid status value',
        received: body.status,
        valid: ['processing', 'shipped', 'completed', 'cancelled', 'returned', 'refunded']
      }, { status: 400 })
    }
    
    // Extract only the fields we want to update (especially status)
    const updateData: any = {}
    if (body.status) updateData.status = body.status
    if (body.customerName) updateData.customerName = body.customerName
    if (body.customerPhone) updateData.customerPhone = body.customerPhone
    if (body.city) updateData.city = body.city
    if (body.returnNotes !== undefined) updateData.returnNotes = body.returnNotes
    if (body.items) updateData.items = body.items
    if (body.total !== undefined) updateData.total = body.total
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Update data:', updateData)
    }
    
    // Try to find the order by MongoDB _id (ObjectId) or custom id
    // Only check _id if id looks like a valid ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id)
    const query: any = isValidObjectId 
      ? { $or: [{ _id: id }, { id: id }] }
      : { id: id }
    
    let order = await Order.findOne(query)
      .select('id _id date items total status customerName customerPhone city email paymentSessionId paymentMethod paymentStatus returnNotes createdAt updatedAt')
      .lean() as LeanOrder | null
    
    if (!order) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Order not found with ID:', id)
      }
      return NextResponse.json({ 
        error: 'Order not found',
        id: id
      }, { status: 404 })
    }
    
    // Get the old order status to check for stock changes
    const oldStatus = order.status
    const newStatus = body.status
    const wasCompleted = oldStatus === 'completed'
    const wasReturned = oldStatus === 'returned'
    const wasRefunded = oldStatus === 'refunded'
    const isNowCompleted = newStatus === 'completed'
    const isNowReturned = newStatus === 'returned'
    const isNowRefunded = newStatus === 'refunded'
    const isNowCancelled = newStatus === 'cancelled'
    
    // Ensure order has custom ID if missing
    if (!order.id || !order.id.startsWith('PP-')) {
      const customId = `PP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      updateData.id = customId
      if (process.env.NODE_ENV === 'development') {
        console.log(`Adding custom ID to order ${order._id}: ${customId}`)
      }
    }
    
    // Update the order using findByIdAndUpdate for better reliability
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    
    if (!updatedOrder) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update order after finding it')
      }
      return NextResponse.json({ 
        error: 'Failed to update order' 
      }, { status: 500 })
    }
    
    // Verify the status was updated
    if (updateData.status && updatedOrder.status !== updateData.status) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Status update mismatch:', {
          requested: updateData.status,
          actual: updatedOrder.status,
          orderId: id
        })
      }
    }
    
    // Clean up response - return only needed fields
    const updatedOrderObj = updatedOrder.toObject ? updatedOrder.toObject() : updatedOrder
    const cleaned: any = {
      id: updatedOrderObj.id || updatedOrderObj._id?.toString(),
      date: updatedOrderObj.date || updatedOrderObj.createdAt,
      items: updatedOrderObj.items || [],
      total: updatedOrderObj.total,
      status: updatedOrderObj.status || 'processing',
      customerName: updatedOrderObj.customerName,
      customerPhone: updatedOrderObj.customerPhone,
      city: updatedOrderObj.city,
      email: updatedOrderObj.email,
      paymentSessionId: updatedOrderObj.paymentSessionId,
      paymentMethod: updatedOrderObj.paymentMethod,
      paymentStatus: updatedOrderObj.paymentStatus,
      returnNotes: updatedOrderObj.returnNotes,
    }
    // Remove undefined/null fields to reduce payload size
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined || cleaned[key] === null) {
        delete cleaned[key]
      }
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Order updated:', {
        id: cleaned.id,
        oldStatus: oldStatus,
        newStatus: cleaned.status,
      })
    }
    
    // Return response immediately to avoid connection timeouts
    // Stock updates will be done after response is sent (best effort)
    const response = NextResponse.json(cleaned, {
      headers: {
        'Cache-Control': 'no-store'
      }
    })
    
    // Perform stock updates asynchronously (don't await - fire and forget)
    // This prevents blocking the response
    Promise.resolve().then(async () => {
      try {
        // If order status changed to completed, update stock quantities (decrease stock, increase sold)
        if (!wasCompleted && isNowCompleted && updatedOrder.items) {
          try {
            await Promise.all(
              updatedOrder.items.map(async (item: IOrderItem) => {
                const product = await Product.findById(item.id)
                if (product) {
                  const newStockQuantity = Math.max(0, (product.stockQuantity || 0) - item.quantity)
                  const newSoldQuantity = (product.soldQuantity || 0) + item.quantity
                  const newInStock = newStockQuantity > 0
                  
                  await Product.findByIdAndUpdate(product._id, {
                    $set: {
                      stockQuantity: newStockQuantity,
                      soldQuantity: newSoldQuantity,
                      inStock: newInStock
                    }
                  })
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Updated stock for product ${product.name}: Stock=${newStockQuantity}, Sold=${newSoldQuantity}`)
                  }
                }
              })
            )
          } catch (stockError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error updating stock quantities:', stockError)
            } else {
              console.error('Error updating stock quantities:', stockError instanceof Error ? stockError.message : 'An error occurred')
            }
          }
        }
        
        // If order was completed but is now cancelled, returned, or changed to non-completed, reverse the stock change
        if (wasCompleted && !isNowCompleted && order.items) {
          try {
            await Promise.all(
              order.items.map(async (item: IOrderItem) => {
                const product = await Product.findById(item.id)
                if (product) {
                  const newStockQuantity = (product.stockQuantity || 0) + item.quantity
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
                    console.log(`Reversed stock for product ${product.name}: Stock=${newStockQuantity}, Sold=${newSoldQuantity}`)
                  }
                }
              })
            )
          } catch (stockError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error reversing stock quantities:', stockError)
            } else {
              console.error('Error reversing stock quantities:', stockError instanceof Error ? stockError.message : 'An error occurred')
            }
          }
        }
        
        // If order is being marked as returned (from any status), restore stock and decrease sold quantity
        if (!wasReturned && isNowReturned && updatedOrder.items) {
          try {
            await Promise.all(
              updatedOrder.items.map(async (item: IOrderItem) => {
                const product = await Product.findById(item.id)
                if (product) {
                  const newStockQuantity = (product.stockQuantity || 0) + item.quantity
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
                    console.log(`Returned order - Restored stock for product ${product.name}: Stock=${newStockQuantity}, Sold=${newSoldQuantity}`)
                  }
                }
              })
            )
          } catch (stockError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error handling returned order stock:', stockError)
            } else {
              console.error('Error handling returned order stock:', stockError instanceof Error ? stockError.message : 'An error occurred')
            }
          }
        }
        
        // If order was returned but is now changed to a different status, reverse the return stock change
        if (wasReturned && !isNowReturned && order.items) {
          try {
            await Promise.all(
              order.items.map(async (item: IOrderItem) => {
                const product = await Product.findById(item.id)
                if (product && isNowCompleted) {
                  const newStockQuantity = Math.max(0, (product.stockQuantity || 0) - item.quantity)
                  const newSoldQuantity = (product.soldQuantity || 0) + item.quantity
                  const newInStock = newStockQuantity > 0
                  
                  await Product.findByIdAndUpdate(product._id, {
                    $set: {
                      stockQuantity: newStockQuantity,
                      soldQuantity: newSoldQuantity,
                      inStock: newInStock
                    }
                  })
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Order no longer returned - Updated stock for product ${product.name}: Stock=${newStockQuantity}, Sold=${newSoldQuantity}`)
                  }
                }
              })
            )
          } catch (stockError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error reversing returned order stock:', stockError)
            } else {
              console.error('Error reversing returned order stock:', stockError instanceof Error ? stockError.message : 'An error occurred')
            }
          }
        }
        
        // If order is being marked as refunded (from any status), restore stock and decrease sold quantity
        if (!wasRefunded && isNowRefunded && updatedOrder.items) {
          try {
            await Promise.all(
              updatedOrder.items.map(async (item: IOrderItem) => {
                const product = await Product.findById(item.id)
                if (product) {
                  const newStockQuantity = (product.stockQuantity || 0) + item.quantity
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
                    console.log(`Refunded order - Restored stock for product ${product.name}: Stock=${newStockQuantity}, Sold=${newSoldQuantity}`)
                  }
                }
              })
            )
          } catch (stockError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error handling refunded order stock:', stockError)
            } else {
              console.error('Error handling refunded order stock:', stockError instanceof Error ? stockError.message : 'An error occurred')
            }
          }
        }
        
        // If order was refunded but is now changed to a different status, reverse the refund stock change
        if (wasRefunded && !isNowRefunded && order.items) {
          try {
            await Promise.all(
              order.items.map(async (item: IOrderItem) => {
                const product = await Product.findById(item.id)
                if (product && isNowCompleted) {
                  const newStockQuantity = Math.max(0, (product.stockQuantity || 0) - item.quantity)
                  const newSoldQuantity = (product.soldQuantity || 0) + item.quantity
                  const newInStock = newStockQuantity > 0
                  
                  await Product.findByIdAndUpdate(product._id, {
                    $set: {
                      stockQuantity: newStockQuantity,
                      soldQuantity: newSoldQuantity,
                      inStock: newInStock
                    }
                  })
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log(`Order no longer refunded - Updated stock for product ${product.name}: Stock=${newStockQuantity}, Sold=${newSoldQuantity}`)
                  }
                }
              })
            )
          } catch (stockError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error reversing refunded order stock:', stockError)
            } else {
              console.error('Error reversing refunded order stock:', stockError instanceof Error ? stockError.message : 'An error occurred')
            }
          }
        }
      } catch (asyncError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in async stock updates:', asyncError)
        } else {
          console.error('Error in async stock updates:', asyncError instanceof Error ? asyncError.message : 'An error occurred')
        }
      }
    }).catch((err: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Unhandled error in stock update promise:', err)
      } else {
        console.error('Unhandled error in stock update promise:', err instanceof Error ? err.message : 'An error occurred')
      }
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Order updated successfully:', updatedOrder._id, updatedOrder.status)
    }
    
    return response
  } catch (error: any) {
    // Handle connection abort errors gracefully
    if (error.name === 'AbortError' || error.code === 'ECONNRESET') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Request aborted during order update:', id)
      }
      return NextResponse.json({ error: 'Request aborted' }, { status: 499 })
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating order:', error)
    } else {
      console.error('Error updating order:', error instanceof Error ? error.message : 'An error occurred')
    }
    return NextResponse.json({ 
      error: 'Failed to update order',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while updating the order'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await connectDB()
    const order = await Order.findByIdAndDelete(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Order deleted successfully' })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting order:', error)
    } else {
      console.error('Error deleting order:', error instanceof Error ? error.message : 'An error occurred')
    }
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
