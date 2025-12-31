import mongoose, { Schema, Document } from 'mongoose'

export interface IPaymentSession extends Document {
  sessionId: string
  orderId?: string // Will be set when order is created
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
  createdAt?: Date
  updatedAt?: Date
}

const PaymentSessionSchema = new Schema<IPaymentSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    orderId: { type: String },
    userId: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'MAD' },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'mobile'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    customerName: { type: String },
    customerPhone: { type: String },
    city: { type: String },
    address: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
)

// sessionId index is automatically created by unique: true
PaymentSessionSchema.index({ userId: 1 })
PaymentSessionSchema.index({ email: 1 })
PaymentSessionSchema.index({ orderId: 1 })

export default mongoose.models.PaymentSession || mongoose.model<IPaymentSession>('PaymentSession', PaymentSessionSchema)

