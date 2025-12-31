'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { migrateGuestOrders } from '@/lib/orders'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  orders?: number
  role?: 'admin' | 'team' | 'customer'
  type?: 'user' | 'customer'
  permissions?: string[]
  createdAt?: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load user and token from localStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedToken = localStorage.getItem('pixelpad_token')
        const savedUser = localStorage.getItem('pixelpad_user')
        
        if (savedToken && savedUser) {
          // Verify token is still valid by checking with server
          try {
            const response = await fetch('/api/auth/verify', {
              headers: {
                'Authorization': `Bearer ${savedToken}`
              }
            })
            
            if (response.ok) {
              // Get fresh user data from server (includes permissions)
              const serverUserData = await response.json()
              const savedUserData = JSON.parse(savedUser)
              
              // Merge server data with saved data, prioritizing server data
              const userData: User = {
                id: serverUserData._id?.toString() || serverUserData.id || savedUserData.id || Date.now().toString(),
                name: serverUserData.name || savedUserData.name || '',
                email: serverUserData.email || savedUserData.email || '',
                avatar: serverUserData.avatar || savedUserData.avatar,
                orders: serverUserData.orders || savedUserData.orders || 0,
                role: serverUserData.role || savedUserData.role || 'customer',
                type: serverUserData.type || savedUserData.type || 'customer',
                permissions: serverUserData.permissions || savedUserData.permissions || [],
                createdAt: serverUserData.createdAt || savedUserData.createdAt || new Date().toISOString()
              }
              
              setToken(savedToken)
              setUser(userData)
              setIsLoggedIn(true)
              try { migrateGuestOrders(userData.email) } catch {}
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('pixelpad_token')
              localStorage.removeItem('pixelpad_user')
            }
          } catch (error) {
            console.error('Token verification error:', error)
            localStorage.removeItem('pixelpad_token')
            localStorage.removeItem('pixelpad_user')
          }
        }
      } catch (error) {
        console.error('Error loading auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAuth()
  }, [])

  // Save user and token to localStorage whenever they change
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('pixelpad_token', token)
      localStorage.setItem('pixelpad_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('pixelpad_token')
      localStorage.removeItem('pixelpad_user')
    }
  }, [user, token])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Login failed' }))
        console.error('Login error:', error)
        return false
      }

      const data = await response.json()
      const { user: userData, token: authToken, type } = data
      
      // Convert to User format
      const newUser: User = {
        id: userData._id?.toString() || userData.id || Date.now().toString(),
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        orders: userData.orders || 0,
        role: type === 'user' ? (userData.role || 'team') : 'customer',
        type: type,
        permissions: userData.permissions || [],
        createdAt: userData.createdAt || new Date().toISOString()
      }
      
      setUser(newUser)
      setToken(authToken)
      setIsLoggedIn(true)
      
      try { migrateGuestOrders(newUser.email) } catch {}
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Registration failed' }))
        console.error('Registration error:', error)
        return false
      }

      const data = await response.json()
      const { user: userData, token: authToken, type } = data
      
      // Convert to User format
      const newUser: User = {
        id: userData._id?.toString() || userData.id || Date.now().toString(),
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        orders: userData.orders || 0,
        role: 'customer',
        type: 'customer',
        createdAt: userData.createdAt || new Date().toISOString()
      }
      
      setUser(newUser)
      setToken(authToken)
      setIsLoggedIn(true)
      
      try { migrateGuestOrders(newUser.email) } catch {}
      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setIsLoggedIn(false)
    localStorage.removeItem('pixelpad_token')
    localStorage.removeItem('pixelpad_user')
  }

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user || !token) return false
    
    setIsLoading(true)
    try {
      const endpoint = user.type === 'customer' ? '/api/customers' : '/api/users'
      const response = await fetch(`${endpoint}/${user.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        return false
      }

      const updatedUserData = await response.json()
      const updatedUser = { ...user, ...updatedUserData }
      setUser(updatedUser)
      return true
    } catch (error) {
      console.error('Profile update error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user || !token) return false
    setIsLoading(true)
    try {
      const endpoint = user.type === 'customer' ? '/api/customers' : '/api/users'
      const response = await fetch(`${endpoint}/${user.id}/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      
      return response.ok
    } catch (e) {
      console.error('Change password error:', e)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAuth = async (): Promise<void> => {
    if (!token) return
    
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        // Ensure permissions are included
        const updatedUser: User = {
          id: userData._id?.toString() || userData.id || user?.id || Date.now().toString(),
          name: userData.name || user?.name || '',
          email: userData.email || user?.email || '',
          avatar: userData.avatar || user?.avatar,
          orders: userData.orders || user?.orders || 0,
          role: userData.role || user?.role || 'customer',
          type: userData.type || user?.type || 'customer',
          permissions: userData.permissions || user?.permissions || [],
          createdAt: userData.createdAt || user?.createdAt || new Date().toISOString()
        }
        setUser(updatedUser)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Auth refresh error:', error)
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    isLoggedIn,
    isLoading,
    token,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
