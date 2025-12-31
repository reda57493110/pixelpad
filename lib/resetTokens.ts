// Shared utility for managing password reset tokens
// In production, use a database or Redis instead of in-memory storage

interface ResetToken {
  email: string
  token: string
  expiresAt: number
}

// In-memory storage (use a database in production)
const resetTokens = new Map<string, ResetToken>()

// Clean up expired tokens periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    Array.from(resetTokens.entries()).forEach(([token, data]) => {
      if (data.expiresAt < now) {
        resetTokens.delete(token)
      }
    })
  }, 60 * 60 * 1000) // Clean every hour
}

export function createResetToken(email: string): { token: string; expiresAt: number } {
  // Generate reset token
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15) + 
                Date.now().toString(36)
  
  // Token expires in 1 hour
  const expiresAt = Date.now() + 60 * 60 * 1000

  // Store token
  resetTokens.set(token, { email, token, expiresAt })

  return { token, expiresAt }
}

export function getResetTokenData(token: string): ResetToken | null {
  const data = resetTokens.get(token)
  if (!data) return null
  
  // Check if expired
  if (data.expiresAt < Date.now()) {
    resetTokens.delete(token)
    return null
  }
  
  return data
}

export function deleteResetToken(token: string): void {
  resetTokens.delete(token)
}


























