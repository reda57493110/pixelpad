import { ServiceRequest } from '@/types'

const API_BASE = '/api/service-requests'

// Helper function to convert MongoDB document to ServiceRequest
function toServiceRequest(doc: any): ServiceRequest {
  // emailOrPhone should only contain phone numbers, not emails
  // If emailOrPhone looks like an email, use it as phone only if phone field is missing
  const emailOrPhoneValue = doc.emailOrPhone || ''
  const isEmail = emailOrPhoneValue.includes('@')
  const phoneValue = doc.phone || (isEmail ? '' : emailOrPhoneValue) || ''
  
  return {
    id: doc._id?.toString() || doc.id,
    date: doc.date || doc.createdAt,
    email: doc.email, // Add email field
    fullName: doc.fullName,
    companyName: doc.companyName,
    city: doc.city,
    emailOrPhone: phoneValue, // Only phone numbers, not emails
    phone: phoneValue,
    numberOfComputers: doc.numberOfComputers,
    needCameras: doc.needCameras,
    preferredDate: doc.preferredDate,
    additionalDetails: doc.additionalDetails,
    status: doc.status || 'new',
  }
}

export async function getUserServiceRequests(email: string | undefined | null): Promise<ServiceRequest[]> {
  if (!email) return []
  try {
    const response = await fetch(`${API_BASE}?email=${encodeURIComponent(email)}`)
    if (!response.ok) return []
    const data = await response.json()
    return data.map(toServiceRequest)
  } catch (error) {
    console.error('Error fetching user service requests:', error)
    return []
  }
}

export async function addServiceRequest(email: string | null, request: ServiceRequest): Promise<ServiceRequest | null> {
  try {
    const requestData = {
      ...request,
      userId: email || 'guest',
      email: email || 'guest',
      date: request.date || new Date().toISOString(),
    }
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })
    if (!response.ok) throw new Error('Failed to create service request')
    const data = await response.json()
    return toServiceRequest(data)
  } catch (error) {
    console.error('Error creating service request:', error)
    return null
  }
}

export async function migrateGuestServiceRequests(email: string): Promise<void> {
  try {
    const guestRequests = await getUserServiceRequests('guest')
    if (guestRequests.length === 0) return
    
    for (const request of guestRequests) {
      await updateServiceRequest('guest', request.id, { ...request, email: email } as Partial<ServiceRequest>)
    }
  } catch (error) {
    console.error('Error migrating guest service requests:', error)
  }
}

export async function getAllServiceRequests(): Promise<ServiceRequest[]> {
  try {
    const response = await fetch(API_BASE)
    if (!response.ok) return []
    const data = await response.json()
    return data.map(toServiceRequest).sort((a: ServiceRequest, b: ServiceRequest) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error fetching all service requests:', error)
    return []
  }
}

export async function findServiceRequestOwner(requestId: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/${requestId}`)
    if (!response.ok) return null
    const data = await response.json()
    return data.email || null
  } catch (error) {
    console.error('Error finding service request owner:', error)
    return null
  }
}

export async function updateServiceRequestStatus(email: string, requestId: string, status: 'new' | 'in-progress' | 'completed' | 'cancelled'): Promise<boolean> {
  return updateServiceRequest(email, requestId, { status } as ServiceRequest)
}

export async function updateServiceRequest(email: string, requestId: string, updated: Partial<ServiceRequest>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    return response.ok
  } catch (error) {
    console.error('Error updating service request:', error)
    return false
  }
}

export async function deleteServiceRequest(email: string, requestId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${requestId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting service request:', error)
    return false
  }
}

// ServiceRequest type is now imported from @/types
