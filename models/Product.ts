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
  },
  {
    timestamps: true,
  }
)

// Add indexes for faster queries
ProductSchema.index({ order: 1, createdAt: -1 })
ProductSchema.index({ showOnHomeCarousel: 1 })
ProductSchema.index({ showInHero: 1 })
ProductSchema.index({ showInNewArrivals: 1 })
ProductSchema.index({ showInBestSellers: 1 })
ProductSchema.index({ showInSpecialOffers: 1 })
ProductSchema.index({ showInTrending: 1 })
ProductSchema.index({ showOnProductPage: 1 })
ProductSchema.index({ category: 1 })
ProductSchema.index({ inStock: 1 })

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)




