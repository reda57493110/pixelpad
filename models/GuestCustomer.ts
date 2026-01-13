import mongoose, { Schema, Document } from 'mongoose'

export interface IGuestCustomer extends Document {
  name: string
  email: string
  phone?: string
  city?: string
  address?: string
  orders?: number
  isGuest: true
  createdAt?: Date
  updatedAt?: Date
}

const GuestCustomerSchema = new Schema<IGuestCustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    city: { type: String },
    address: { type: String },
    orders: { type: Number, default: 0 },
    isGuest: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
GuestCustomerSchema.index({ orders: -1 }) // For sorting by order count
// Note: email field already has unique: true which creates an index automatically, so no need for explicit email index

export default mongoose.models.GuestCustomer || mongoose.model<IGuestCustomer>('GuestCustomer', GuestCustomerSchema)


