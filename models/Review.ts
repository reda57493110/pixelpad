import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  userId: string
  email: string
  name: string
  rating: number
  comment: string
  isPrivate: boolean // Only visible to the user who created it
  productId?: string // Optional: for product-specific reviews
  createdAt?: Date
  updatedAt?: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isPrivate: { type: Boolean, default: true }, // Private by default - only user can see
    productId: { type: String }, // Optional: for product-specific reviews
  },
  {
    timestamps: true,
  }
)

// Compound indexes for common query patterns
ReviewSchema.index({ userId: 1, createdAt: -1 }) // User's reviews sorted by date
ReviewSchema.index({ email: 1, createdAt: -1 }) // Reviews by email sorted by date
ReviewSchema.index({ productId: 1, userId: 1 }) // Product reviews by user
ReviewSchema.index({ productId: 1, createdAt: -1 }) // Product reviews sorted by date
// Single field indexes
ReviewSchema.index({ userId: 1 })
ReviewSchema.index({ email: 1 })
ReviewSchema.index({ productId: 1 })

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)



