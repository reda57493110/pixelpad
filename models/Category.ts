import mongoose, { Schema, Document } from 'mongoose'

export interface ICategory extends Document {
  name: string
  nameFr?: string
  nameAr?: string
  slug: string // URL-friendly identifier (e.g., 'laptops', 'gaming-pcs')
  description?: string
  descriptionFr?: string
  descriptionAr?: string
  icon?: string // Icon URL or path
  order: number // Display order (lower numbers appear first)
  isActive: boolean // Whether the category is active/visible
  createdAt?: Date
  updatedAt?: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    nameFr: { type: String },
    nameAr: { type: String },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    descriptionFr: { type: String },
    descriptionAr: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for common query patterns
CategorySchema.index({ isActive: 1, order: 1 }) // Most common: active categories sorted by order
// Single field indexes
CategorySchema.index({ isActive: 1 })
CategorySchema.index({ order: 1 })
// Note: slug already has an index from unique: true, so we don't need to add it again

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)

