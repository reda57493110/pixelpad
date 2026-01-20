import mongoose, { Schema, Document } from 'mongoose'

export interface IResetToken extends Document {
  email: string
  token: string
  expiresAt: Date
  createdAt?: Date
}

const ResetTokenSchema = new Schema<IResetToken>(
  {
    email: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
)

// TTL index to automatically delete expired tokens
ResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.ResetToken || mongoose.model<IResetToken>('ResetToken', ResetTokenSchema)
