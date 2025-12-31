/**
 * Permission System for Admin Users
 * 
 * This file defines all available permissions and helper functions
 * to check user permissions throughout the admin panel.
 */

// Define all available permissions
export const PERMISSIONS = {
  // Dashboard
  'dashboard.view': 'View dashboard and statistics',
  
  // Products
  'products.view': 'View products list',
  'products.create': 'Create new products',
  'products.edit': 'Edit existing products',
  'products.delete': 'Delete products',
  
  // Stock
  'stock.view': 'View stock levels',
  'stock.update': 'Update stock levels',
  
  // Orders
  'orders.view': 'View orders list',
  'orders.view.details': 'View order details',
  'orders.update.status': 'Update order status',
  'orders.edit': 'Edit order information',
  'orders.delete': 'Delete orders',
  
  // Customers
  'customers.view': 'View customers list',
  'customers.view.details': 'View customer details',
  'customers.edit': 'Edit customer information',
  'customers.delete': 'Delete customers',
  
  // Users (Admin/Team)
  'users.view': 'View users list',
  'users.create': 'Create new users',
  'users.edit': 'Edit user information',
  'users.delete': 'Delete users',
  'users.manage.permissions': 'Manage user permissions',
  
  // Messages
  'messages.view': 'View messages',
  'messages.reply': 'Reply to messages',
  'messages.delete': 'Delete messages',
  
  // Service Requests
  'service-requests.view': 'View service requests',
  'service-requests.update': 'Update service request status',
  'service-requests.delete': 'Delete service requests',
  
  // Coupons
  'coupons.view': 'View coupons',
  'coupons.create': 'Create coupons',
  'coupons.edit': 'Edit coupons',
  'coupons.delete': 'Delete coupons',
  
  // Warranty
  'warranty.view': 'View warranty information',
  'warranty.manage': 'Manage warranty claims',
  
  // Sales
  'sales.view': 'View sales analytics',
  'sales.export': 'Export sales data',
  
  // Settings (Admin only)
  'settings.view': 'View settings',
  'settings.edit': 'Edit settings',
} as const

export type Permission = keyof typeof PERMISSIONS

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  // Manager - Can manage products, orders, and customers
  MANAGER: [
    'dashboard.view',
    'products.view',
    'products.create',
    'products.edit',
    'stock.view',
    'stock.update',
    'orders.view',
    'orders.view.details',
    'orders.update.status',
    'orders.edit',
    'customers.view',
    'customers.view.details',
    'customers.edit',
    'messages.view',
    'messages.reply',
    'service-requests.view',
    'service-requests.update',
    'coupons.view',
    'coupons.create',
    'coupons.edit',
    'warranty.view',
    'warranty.manage',
    'sales.view',
  ] as Permission[],
  
  // Support - Can view and respond to customer inquiries
  SUPPORT: [
    'dashboard.view',
    'orders.view',
    'orders.view.details',
    'orders.update.status',
    'customers.view',
    'customers.view.details',
    'messages.view',
    'messages.reply',
    'service-requests.view',
    'service-requests.update',
    'warranty.view',
  ] as Permission[],
  
  // Inventory - Can manage products and stock
  INVENTORY: [
    'dashboard.view',
    'products.view',
    'products.create',
    'products.edit',
    'stock.view',
    'stock.update',
  ] as Permission[],
  
  // Sales - Can view sales and manage orders
  SALES: [
    'dashboard.view',
    'orders.view',
    'orders.view.details',
    'orders.update.status',
    'orders.edit',
    'customers.view',
    'customers.view.details',
    'coupons.view',
    'coupons.create',
    'coupons.edit',
    'sales.view',
  ] as Permission[],
  
  // Full Admin - All permissions
  ADMIN: Object.keys(PERMISSIONS) as Permission[],
} as const

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  permission: Permission
): boolean {
  if (!userPermissions) return false
  
  // Admin role has all permissions
  // This will be checked separately in the middleware
  
  return userPermissions.includes(permission) || userPermissions.includes('*')
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: string[] | undefined,
  permissions: Permission[]
): boolean {
  if (!userPermissions) return false
  
  if (userPermissions.includes('*')) return true
  
  return permissions.some(permission => userPermissions.includes(permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: string[] | undefined,
  permissions: Permission[]
): boolean {
  if (!userPermissions) return false
  
  if (userPermissions.includes('*')) return true
  
  return permissions.every(permission => userPermissions.includes(permission))
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: string): Permission[] {
  switch (role) {
    case 'admin':
      return PERMISSION_GROUPS.ADMIN
    case 'manager':
      return PERMISSION_GROUPS.MANAGER
    case 'support':
      return PERMISSION_GROUPS.SUPPORT
    case 'inventory':
      return PERMISSION_GROUPS.INVENTORY
    case 'sales':
      return PERMISSION_GROUPS.SALES
    default:
      return []
  }
}

/**
 * Server-side permission check helper
 */
export function checkPermission(
  user: { role?: string; permissions?: string[] } | null,
  permission: Permission
): boolean {
  if (!user) return false
  
  // Admin role has all permissions
  if (user.role === 'admin') return true
  
  return hasPermission(user.permissions, permission)
}


