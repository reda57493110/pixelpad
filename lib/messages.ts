import { ContactMessage } from '@/types'

const API_BASE = '/api/messages'

// Helper function to convert MongoDB document to ContactMessage
function toMessage(doc: any): ContactMessage {
  return {
    id: doc._id?.toString() || doc.id,
    date: doc.date || doc.createdAt,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    inquiryType: doc.inquiryType,
    subject: doc.subject,
    message: doc.message,
    status: doc.status || 'new',
  }
}

export async function getUserMessages(email: string | undefined | null): Promise<ContactMessage[]> {
  if (!email) return []
  try {
    const response = await fetch(`${API_BASE}?email=${encodeURIComponent(email)}`)
    if (!response.ok) return []
    const data = await response.json()
    return data.map(toMessage)
  } catch (error) {
    console.error('Error fetching user messages:', error)
    return []
  }
}

export async function addMessage(email: string | null, message: ContactMessage): Promise<ContactMessage | null> {
  try {
    const messageData = {
      ...message,
      userId: email || 'guest',
      email: email || 'guest',
      date: message.date || new Date().toISOString(),
    }
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    })
    if (!response.ok) throw new Error('Failed to create message')
    const data = await response.json()
    return toMessage(data)
  } catch (error) {
    console.error('Error creating message:', error)
    return null
  }
}

export async function migrateGuestMessages(email: string): Promise<void> {
  try {
    const guestMessages = await getUserMessages('guest')
    if (guestMessages.length === 0) return
    
    for (const message of guestMessages) {
      await updateMessage('guest', message.id, { ...message, email: email } as Partial<ContactMessage>)
    }
  } catch (error) {
    console.error('Error migrating guest messages:', error)
  }
}

export async function getAllMessages(): Promise<ContactMessage[]> {
  try {
    const response = await fetch(API_BASE)
    if (!response.ok) return []
    const data = await response.json()
    return data.map(toMessage).sort((a: ContactMessage, b: ContactMessage) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error fetching all messages:', error)
    return []
  }
}

export async function findMessageOwner(messageId: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/${messageId}`)
    if (!response.ok) return null
    const data = await response.json()
    return data.email || null
  } catch (error) {
    console.error('Error finding message owner:', error)
    return null
  }
}

export async function updateMessageStatus(email: string, messageId: string, status: 'new' | 'read' | 'replied'): Promise<boolean> {
  return updateMessage(email, messageId, { status } as ContactMessage)
}

export async function updateMessage(email: string, messageId: string, updated: Partial<ContactMessage>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    return response.ok
  } catch (error) {
    console.error('Error updating message:', error)
    return false
  }
}

export async function deleteMessage(email: string, messageId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${messageId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting message:', error)
    return false
  }
}

// Re-export type for convenience
export type { ContactMessage } from '@/types'
