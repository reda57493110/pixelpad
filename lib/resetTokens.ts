// Shared utility for managing password reset tokens
// Uses MongoDB for persistence across serverless function invocations

import connectDB from './mongodb'
import ResetToken from '@/models/ResetToken'
import crypto from 'crypto'

interface ResetTokenData {
  email: string
  tokenHash: string
  expiresAt: number
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createResetToken(email: string): Promise<{ token: string; expiresAt: number }> {
  await connectDB()
  
  // Generate a cryptographically secure reset token.
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  
  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  // Delete any existing tokens for this email
  await ResetToken.deleteMany({ email: email.toLowerCase().trim() })

  // Store token in database
  await ResetToken.create({
    email: email.toLowerCase().trim(),
    tokenHash,
    expiresAt,
  })

  return { token, expiresAt: expiresAt.getTime() }
}

export async function getResetTokenData(token: string): Promise<ResetTokenData | null> {
  await connectDB()
  const tokenHash = hashToken(token)
  
  const tokenDoc = await ResetToken.findOne({ tokenHash })
  
  if (!tokenDoc) {
    return null
  }
  
  // Check if expired (MongoDB TTL should handle this, but double-check)
  if (tokenDoc.expiresAt.getTime() < Date.now()) {
    await ResetToken.deleteOne({ tokenHash })
    return null
  }
  
  return {
    email: tokenDoc.email,
    tokenHash: tokenDoc.tokenHash,
    expiresAt: tokenDoc.expiresAt.getTime(),
  }
}

export async function deleteResetToken(token: string): Promise<void> {
  await connectDB()
  await ResetToken.deleteOne({ tokenHash: hashToken(token) })
}


























