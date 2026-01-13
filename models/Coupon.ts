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

// Indexes for efficient coupon validation and queries
// Note: code field already has unique: true which creates an index automatically
// Compound index { code: 1, isActive: 1 } can use the unique index on code, so we use isActive first
CouponSchema.index({ isActive: 1, code: 1 }) // Compound index for validation (isActive first to avoid duplicate)
CouponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 }) // For finding active coupons by date range
CouponSchema.index({ isActive: 1 }) // For filtering active coupons
CouponSchema.index({ validUntil: 1 }) // For finding expired coupons

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)


