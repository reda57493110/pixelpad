import mongoose, { Schema, Document } from 'mongoose'

export interface IServiceRequest extends Document {
  userId: string
  email: string
  date: Date
  fullName: string
  companyName?: string
  city: string
  emailOrPhone: string
  phone?: string
  numberOfComputers: string
  needCameras: string
  preferredDate?: string
  additionalDetails?: string
  status?: 'new' | 'in-progress' | 'completed' | 'cancelled'
  createdAt?: Date
  updatedAt?: Date
}

const ServiceRequestSchema = new Schema<IServiceRequest>(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: Date, default: Date.now },
    fullName: { type: String, required: true },
    companyName: { type: String },
    city: { type: String, required: true },
    emailOrPhone: { type: String, required: true },
    phone: { type: String },
    numberOfComputers: { type: String, required: true },
    needCameras: { type: String, required: true },
    preferredDate: { type: String },
    additionalDetails: { type: String },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'completed', 'cancelled'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
)

ServiceRequestSchema.index({ email: 1 })
ServiceRequestSchema.index({ userId: 1 })

// Clear cached model to ensure schema updates are applied
if (mongoose.models.ServiceRequest) {
  delete mongoose.models.ServiceRequest
}

export default mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema)





