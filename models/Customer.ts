import mongoose, { Schema, Document } from 'mongoose'

export interface ICustomer extends Document {
  name: string
  email: string
  password?: string
  avatar?: string
  orders?: number
  isGuest?: boolean
  phone?: string
  city?: string
  address?: string
  createdAt?: Date
  updatedAt?: Date
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for guest customers
    avatar: { type: String },
    orders: { type: Number, default: 0 },
    isGuest: { type: Boolean, default: false },
    phone: { type: String },
    city: { type: String },
    address: { type: String },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema)

