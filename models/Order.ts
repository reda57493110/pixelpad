import mongoose, { Schema, Document } from 'mongoose'

export interface IOrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface IOrder extends Document {
  userId: string
  email: string
  date: Date
  items: IOrderItem[]
  total: number
  status: 'processing' | 'shipped' | 'completed' | 'cancelled' | 'returned' | 'refunded'
  customerName?: string
  customerPhone?: string
  city?: string
  returnNotes?: string
  paymentSessionId?: string
  paymentMethod?: 'cash' | 'card' | 'mobile'
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'cancelled'
  createdAt?: Date
  updatedAt?: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
}, { _id: false })

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, unique: true, sparse: true }, // Custom order ID like "PP-XXXXXX"
    userId: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: Date, default: Date.now },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['processing', 'shipped', 'completed', 'cancelled', 'returned', 'refunded'],
      default: 'processing',
    },
    customerName: { type: String },
    customerPhone: { type: String },
    city: { type: String },
    returnNotes: { type: String },
    paymentSessionId: { type: String },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'mobile'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for common query patterns (most selective field first)
OrderSchema.index({ userId: 1, date: -1 }) // Most common: get user's orders sorted by date
OrderSchema.index({ email: 1, date: -1 }) // Common: get orders by email sorted by date (covers email queries too)
OrderSchema.index({ status: 1, date: -1 }) // Admin: filter by status and sort by date
OrderSchema.index({ paymentSessionId: 1 }) // For payment lookup
// Single field indexes
// Note: { email: 1 } index removed - compound index { email: 1, date: -1 } covers email queries
OrderSchema.index({ userId: 1 })
OrderSchema.index({ customerPhone: 1 })
OrderSchema.index({ date: -1 }) // For general date sorting
OrderSchema.index({ status: 1 }) // For status filtering
// Note: id field already has unique: true which creates an index automatically

// Delete cached model if it exists to force refresh with new enum values
if (mongoose.models.Order) {
  delete mongoose.models.Order
}

export default mongoose.model<IOrder>('Order', OrderSchema)





