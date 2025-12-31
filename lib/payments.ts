export interface PaymentSession {
  sessionId: string
  orderId?: string
  userId: string
  email: string
  amount: number
  currency: string
  paymentMethod: 'cash' | 'card' | 'mobile'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  customerName?: string
  customerPhone?: string
  city?: string
  address?: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface CreatePaymentSessionParams {
  userId: string
  email: string
  amount: number
  currency?: string
  paymentMethod: 'cash' | 'card' | 'mobile'
  customerName?: string
  customerPhone?: string
  city?: string
  address?: string
  metadata?: Record<string, any>
}

const API_BASE = '/api/payments/sessions'

export async function createPaymentSession(
  params: CreatePaymentSessionParams
): Promise<PaymentSession | null> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        currency: params.currency || 'MAD',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create payment session' }))
      throw new Error(errorData.error || `Failed to create payment session: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Error creating payment session:', error)
    throw error // Re-throw so caller can handle it
  }
}

export async function getPaymentSession(sessionId: string): Promise<PaymentSession | null> {
  try {
    const response = await fetch(`${API_BASE}?sessionId=${encodeURIComponent(sessionId)}`)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return Array.isArray(data) && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error fetching payment session:', error)
    return null
  }
}

export async function updatePaymentSession(
  sessionId: string,
  updates: {
    status?: 'pending' | 'completed' | 'failed' | 'cancelled'
    orderId?: string
    metadata?: Record<string, any>
  }
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    return response.ok
  } catch (error) {
    console.error('Error updating payment session:', error)
    return false
  }
}

