import mongoose, { Schema, Document } from 'mongoose'

export type UserRole = 'admin' | 'team'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  avatar?: string
  permissions?: string[]
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['admin', 'team'], 
      default: 'team',
      required: true 
    },
    avatar: { type: String },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

// Index is already created by unique: true on email field, so no need for duplicate

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)


