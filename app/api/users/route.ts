import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireAdminOrTeam } from '@/lib/auth-middleware'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireAdminOrTeam(request)
    if (error) return error

    await connectDB()
    const users = await User.find({}).select('-password').sort({ createdAt: -1 })
    
    // Convert MongoDB documents to plain objects with id field
    const usersWithId = users.map((userData: any) => {
      const userObj = userData.toObject ? userData.toObject() : userData
      if (!userObj.id && userObj._id) {
        userObj.id = userObj._id.toString()
      }
      return userObj
    })
    
    return NextResponse.json(usersWithId)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireAdminOrTeam(request)
    if (error) return error

    await connectDB()
    const body = await request.json()
    const { password, ...userData } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Only admins can create admin users
    if (userData.role === 'admin' && user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create admin users' },
        { status: 403 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Team users must have at least one permission
    if (userData.role === 'team' && (!userData.permissions || userData.permissions.length === 0)) {
      return NextResponse.json(
        { error: 'Team users must have at least one permission' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'team',
      permissions: userData.role === 'admin' ? [] : (userData.permissions || []), // Admins don't need permissions
      isActive: userData.isActive !== undefined ? userData.isActive : true,
    })

    // Don't return password
    const userWithoutPassword = newUser.toObject()
    delete userWithoutPassword.password
    if (userWithoutPassword._id) {
      userWithoutPassword.id = userWithoutPassword._id.toString()
      delete userWithoutPassword._id
    }

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}




