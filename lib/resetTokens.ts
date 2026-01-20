// Shared utility for managing password reset tokens
// Uses MongoDB for persistence across serverless function invocations

import connectDB from './mongodb'
import ResetToken from '@/models/ResetToken'

interface ResetTokenData {
  email: string
  token: string
  expiresAt: number
}

export async function createResetToken(email: string): Promise<{ token: string; expiresAt: number }> {
  await connectDB()
  
  // Generate reset token
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15) + 
                Date.now().toString(36)
  
  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  // Delete any existing tokens for this email
  await ResetToken.deleteMany({ email: email.toLowerCase().trim() })

  // Store token in database
  await ResetToken.create({
    email: email.toLowerCase().trim(),
    token,
    expiresAt,
  })

  return { token, expiresAt: expiresAt.getTime() }
}

export async function getResetTokenData(token: string): Promise<ResetTokenData | null> {
  await connectDB()
  
  const tokenDoc = await ResetToken.findOne({ token })
  
  if (!tokenDoc) {
    return null
  }
  
  // Check if expired (MongoDB TTL should handle this, but double-check)
  if (tokenDoc.expiresAt.getTime() < Date.now()) {
    await ResetToken.deleteOne({ token })
    return null
  }
  
  return {
    email: tokenDoc.email,
    token: tokenDoc.token,
    expiresAt: tokenDoc.expiresAt.getTime(),
  }
}

export async function deleteResetToken(token: string): Promise<void> {
  await connectDB()
  await ResetToken.deleteOne({ token })
}


























