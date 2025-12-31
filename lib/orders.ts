import { Order, OrderItem } from '@/types'

const API_BASE = '/api/orders'

// Helper function to convert MongoDB document to Order (only include fields with values)
function toOrder(doc: any): Order {
  const order: any = {
    id: doc.id || doc._id?.toString(),
    date: doc.date || doc.createdAt,
    items: doc.items || [],
    total: doc.total,
    status: doc.status || 'processing',
  }
  
  // Only include optional fields if they have values
  if (doc.customerName) order.customerName = doc.customerName
  if (doc.customerPhone) order.customerPhone = doc.customerPhone
  if (doc.city) order.city = doc.city
  if (doc.returnNotes) order.returnNotes = doc.returnNotes
  if (doc.email) order.email = doc.email
  if (doc.refundStatus) order.refundStatus = doc.refundStatus
  if (doc.paymentSessionId) order.paymentSessionId = doc.paymentSessionId
  if (doc.paymentMethod) order.paymentMethod = doc.paymentMethod
  if (doc.paymentStatus) order.paymentStatus = doc.paymentStatus
  
  return order as Order
}

export async function getUserOrders(email: string | undefined | null): Promise<Order[]> {
  if (!email) return []
  try {
    const response = await fetch(`${API_BASE}?email=${encodeURIComponent(email)}`)
    if (!response.ok) return []
    const data = await response.json()
    return data.map(toOrder)
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return []
  }
}

export async function addOrder(email: string, order: Order): Promise<Order | null> {
  try {
    const orderData = {
      ...order,
      userId: email, // Use email as userId for now
      email: email,
      date: order.date || new Date().toISOString(),
    }
    
    // Check if stock bypass is enabled
    const bypassStock = typeof window !== 'undefined' && localStorage.getItem('pixelpad_bypass_stock') === 'true'
    
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (bypassStock) {
      headers['x-bypass-stock-check'] = 'true'
    }
    
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    })
    if (!response.ok) throw new Error('Failed to create order')
    const data = await response.json()
    return toOrder(data)
  } catch (error) {
    console.error('Error creating order:', error)
    return null
  }
}

export async function migrateGuestOrders(email: string): Promise<void> {
  try {
    // Get guest orders
    const guestOrders = await getUserOrders('guest')
    if (guestOrders.length === 0) return
    
    // Update all guest orders to the new email
    for (const order of guestOrders) {
      await updateOrder('guest', order.id, { ...order, email: email } as Partial<Order>)
    }
  } catch (error) {
    console.error('Error migrating guest orders:', error)
  }
}

export async function updateOrder(email: string, orderId: string, updated: Partial<Order>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    return response.ok
  } catch (error) {
    console.error('Error updating order:', error)
    return false
  }
}

export async function deleteOrder(email: string, orderId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${orderId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting order:', error)
    return false
  }
}

export async function cancelOrder(email: string, orderId: string): Promise<boolean> {
  return updateOrder(email, orderId, { status: 'cancelled' } as Order)
}

// Re-export types for convenience
export type { Order, OrderItem } from '@/types'
