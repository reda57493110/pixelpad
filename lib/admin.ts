// Admin helper functions to get all data across the system

import { getAllProducts } from './products'
import type { Order } from '@/types'
import { ContactMessage, getAllMessages } from './messages'
import { getAllServiceRequests } from './serviceRequests'
import type { ServiceRequest } from '@/types'
import { authenticatedFetch } from './api-client'

const API_BASE = '/api/users'
const CUSTOMERS_API_BASE = '/api/customers'

export interface AdminStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalCustomers: number
  totalRevenue: number
  totalMessages: number
  totalServiceRequests: number
  pendingOrders: number
  newMessages: number
  newServiceRequests: number
  totalStockQuantity: number
  totalSoldQuantity: number
  lowStockProducts: number
  totalProfit: number
  totalProductsSold: number
}

export async function getAllUsers() {
  try {
    const response = await authenticatedFetch(API_BASE)
    if (!response.ok) {
      console.error('Failed to fetch users:', response.status, response.statusText)
      return []
    }
    const data = await response.json()
    // Remove passwords before returning and ensure id field exists
    const users = data.map((u: any) => {
      const { password, ...userData } = u
      // Ensure id field exists (from _id or id)
      if (!userData.id && userData._id) {
        userData.id = userData._id.toString()
      }
      return userData
    })
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function getAllCustomers() {
  try {
    const response = await authenticatedFetch(CUSTOMERS_API_BASE)
    if (!response.ok) {
      console.error('Failed to fetch customers:', response.status, response.statusText)
      return []
    }
    const data = await response.json()
    // Remove passwords before returning and ensure id field exists
    const customers = data.map((c: any) => {
      const { password, ...customerData } = c
      // Ensure id field exists (from _id or id)
      if (!customerData.id && customerData._id) {
        customerData.id = customerData._id.toString()
      }
      return customerData
    })
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    return []
  }
}

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
  if (doc.email || doc.userId) order.email = doc.email || doc.userId
  
  return order
}

// Helper function to get all orders (flattened from API)
async function getAllOrdersFlattened(): Promise<Order[]> {
  try {
    const response = await authenticatedFetch('/api/orders')
    if (!response.ok) return []
    const data = await response.json()
    // Convert MongoDB documents to Order format
    const orders = data.map(toOrder)
    return orders.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error fetching all orders:', error)
    return []
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Use the optimized API endpoint that calculates stats in the database
    const response = await authenticatedFetch('/api/admin/stats')
    
    if (!response.ok) {
      console.error('Failed to fetch admin stats:', response.status, response.statusText)
      // Return default values on error
      return {
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        totalMessages: 0,
        totalServiceRequests: 0,
        pendingOrders: 0,
        newMessages: 0,
        newServiceRequests: 0,
        totalStockQuantity: 0,
        totalSoldQuantity: 0,
        lowStockProducts: 0,
        totalProfit: 0,
        totalProductsSold: 0
      }
    }

    const stats = await response.json()
    return stats as AdminStats
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      totalMessages: 0,
      totalServiceRequests: 0,
      pendingOrders: 0,
      newMessages: 0,
      newServiceRequests: 0,
      totalStockQuantity: 0,
      totalSoldQuantity: 0,
      lowStockProducts: 0,
      totalProfit: 0,
      totalProductsSold: 0
    }
  }
}

export async function updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<boolean> {
  try {
    console.log('Updating order status:', { orderId, newStatus })
    
    // The orderId should be the MongoDB _id as a string (from toOrder conversion)
    // MongoDB findById can handle string ObjectIds, so we can use it directly
    const updateResponse = await authenticatedFetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        status: newStatus
      }),
    })
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}))
      console.error('Failed to update order status:', {
        orderId,
        newStatus,
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        error: errorData
      })
      alert(`Failed to update order status: ${errorData.error || updateResponse.statusText}`)
      return false
    }
    
    const updatedOrder = await updateResponse.json()
    console.log('Order updated successfully:', updatedOrder)
    
    // Verify the status was actually updated
    if (updatedOrder.status !== newStatus) {
      console.error('Status mismatch after update:', {
        expected: newStatus,
        actual: updatedOrder.status
      })
      return false
    }
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pixelpad_orders_changed'))
    }
    
    return true
  } catch (error) {
    console.error('Error updating order status:', error)
    alert(`Error updating order status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return false
  }
}

export async function deleteUser(email: string): Promise<boolean> {
  try {
    // First get all users to find the user ID
    const users = await getAllUsers()
    const user = users.find((u: any) => u.email === email)
    if (!user || !user.id) return false
    
    const response = await authenticatedFetch(`/api/users/${user.id}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

export async function updateUser(email: string, updates: any): Promise<boolean> {
  try {
    // First get all users to find the user ID
    const users = await getAllUsers()
    const user = users.find((u: any) => u.email === email)
    if (!user || !user.id) return false
    
    const response = await authenticatedFetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    return response.ok
  } catch (error) {
    console.error('Error updating user:', error)
    return false
  }
}

// Export getAllOrders for backward compatibility
export { getAllOrdersFlattened as getAllOrders }
