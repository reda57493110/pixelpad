import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  userId: string
  email: string
  date: Date
  name: string
  phone?: string
  inquiryType: string
  subject: string
  message: string
  status?: 'new' | 'read' | 'replied'
  createdAt?: Date
  updatedAt?: Date
}

const MessageSchema = new Schema<IMessage>(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: Date, default: Date.now },
    name: { type: String, required: true },
    phone: { type: String },
    inquiryType: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for common query patterns
MessageSchema.index({ userId: 1, date: -1 }) // User's messages sorted by date
MessageSchema.index({ status: 1, date: -1 }) // Filter by status and sort by date (admin queries)
MessageSchema.index({ email: 1, date: -1 }) // Filter by email and sort by date
// Single field indexes
MessageSchema.index({ email: 1 })
MessageSchema.index({ userId: 1 })
MessageSchema.index({ status: 1 })

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)





