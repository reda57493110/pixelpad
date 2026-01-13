import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  originalPrice?: number
  deliveryPrice?: number
  costPrice?: number
  category: mongoose.Types.ObjectId | string
  image: string
  images?: string[] // Multiple images for product gallery
  inStock: boolean
  stockQuantity?: number
  soldQuantity?: number
  rating?: number
  reviews?: number
  features?: string[]
  specifications?: Record<string, string>
  badge?: string
  badgeKey?: string
  discount?: number
  showOnHomeCarousel?: boolean
  showInHero?: boolean
  showInNewArrivals?: boolean
  showInBestSellers?: boolean
  showInSpecialOffers?: boolean
  showInTrending?: boolean
  showOnProductPage?: boolean
  order?: number
  variants?: Array<{
    ram: string
    storage: string
    storageType: string
    price: number
    originalPrice?: number
  }>
  createdAt?: Date
  updatedAt?: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    deliveryPrice: { type: Number },
    costPrice: { type: Number },
    category: { 
      type: Schema.Types.ObjectId, 
      ref: 'Category',
      required: true 
    },
    image: { type: String, required: true },
    images: { type: [String], default: [] }, // Multiple images for product gallery
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    soldQuantity: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    features: { type: [String], default: [] },
    specifications: { type: Schema.Types.Mixed, default: {} },
    badge: { type: String },
    badgeKey: { type: String },
    discount: { type: Number, default: 0 },
    showOnHomeCarousel: { type: Boolean, default: false },
    showInHero: { type: Boolean, default: false },
    showInNewArrivals: { type: Boolean, default: false },
    showInBestSellers: { type: Boolean, default: false },
    showInSpecialOffers: { type: Boolean, default: false },
    showInTrending: { type: Boolean, default: false },
    showOnProductPage: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    variants: [{
      ram: { type: String, required: true },
      storage: { type: String, required: true },
      storageType: { type: String, required: true },
      price: { type: Number, required: true },
      originalPrice: { type: Number }
    }],
  },
  {
    timestamps: true,
  }
)

// Add indexes for faster queries
// Compound indexes for common query patterns (order matters - equality first, then sort)
ProductSchema.index({ showOnProductPage: 1, order: 1, createdAt: -1 }) // Most common query pattern
ProductSchema.index({ showOnHomeCarousel: 1, order: 1, createdAt: -1 }) // Featured products query
ProductSchema.index({ category: 1, inStock: 1, order: 1 }) // Category filtering with stock
ProductSchema.index({ showInHero: 1, order: 1 })
ProductSchema.index({ showInNewArrivals: 1, order: 1, createdAt: -1 })
ProductSchema.index({ showInBestSellers: 1, order: 1, rating: -1 })
ProductSchema.index({ showInSpecialOffers: 1, order: 1, discount: -1 })
ProductSchema.index({ showInTrending: 1, order: 1, soldQuantity: -1 })
// Single field indexes for individual lookups
ProductSchema.index({ category: 1 })
ProductSchema.index({ inStock: 1 })
ProductSchema.index({ order: 1 }) // For max order queries

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)




