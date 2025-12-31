import mongoose, { Schema, Document } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  discountPercent: number
  discountAmount?: number
  type: 'percent' | 'fixed'
  minPurchase?: number
  maxDiscount?: number
  validFrom: Date
  validUntil: Date
  usageLimit?: number
  usedCount: number
  isActive: boolean
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercent: { type: Number, required: true },
    discountAmount: { type: Number },
    type: {
      type: String,
      enum: ['percent', 'fixed'],
      required: true,
    },
    minPurchase: { type: Number },
    maxDiscount: { type: Number },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
)

// Index is already created by unique: true on code field, so no need for duplicate

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)


