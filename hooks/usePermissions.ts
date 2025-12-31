'use client'

import { useAuth } from '@/contexts/AuthContext'
import { hasPermission, hasAnyPermission, hasAllPermissions, Permission } from '@/lib/permissions'

/**
 * React hook for checking user permissions on the client side
 */
export function usePermissions() {
  const { user } = useAuth()

  const userPermissions = user?.permissions || []
  const userRole = user?.role

  /**
   * Check if current user has a specific permission
   */
  const can = (permission: Permission): boolean => {
    // Admin has all permissions
    if (userRole === 'admin') return true
    
    return hasPermission(userPermissions, permission)
  }

  /**
   * Check if current user has any of the specified permissions
   */
  const canAny = (permissions: Permission[]): boolean => {
    // Admin has all permissions
    if (userRole === 'admin') return true
    
    return hasAnyPermission(userPermissions, permissions)
  }

  /**
   * Check if current user has all of the specified permissions
   */
  const canAll = (permissions: Permission[]): boolean => {
    // Admin has all permissions
    if (userRole === 'admin') return true
    
    return hasAllPermissions(userPermissions, permissions)
  }

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return userRole === 'admin'
  }

  /**
   * Check if user is team member
   */
  const isTeam = (): boolean => {
    return userRole === 'team'
  }

  return {
    can,
    canAny,
    canAll,
    isAdmin,
    isTeam,
    permissions: userPermissions,
    role: userRole,
  }
}


