# Permissions System Guide

This guide explains how to use the permission system to create users with specific access rules.

## Overview

The permission system allows you to:
- Create users with custom roles (admin, team, manager, support, etc.)
- Assign specific permissions to users
- Control access to different admin features
- Use permission groups for common roles

## Available Permissions

### Dashboard
- `dashboard.view` - View dashboard and statistics

### Products
- `products.view` - View products list
- `products.create` - Create new products
- `products.edit` - Edit existing products
- `products.delete` - Delete products

### Stock
- `stock.view` - View stock levels
- `stock.update` - Update stock levels

### Orders
- `orders.view` - View orders list
- `orders.view.details` - View order details
- `orders.update.status` - Update order status
- `orders.edit` - Edit order information
- `orders.delete` - Delete orders

### Customers
- `customers.view` - View customers list
- `customers.view.details` - View customer details
- `customers.edit` - Edit customer information
- `customers.delete` - Delete customers

### Users (Admin/Team)
- `users.view` - View users list
- `users.create` - Create new users
- `users.edit` - Edit user information
- `users.delete` - Delete users
- `users.manage.permissions` - Manage user permissions

### Messages
- `messages.view` - View messages
- `messages.reply` - Reply to messages
- `messages.delete` - Delete messages

### Service Requests
- `service-requests.view` - View service requests
- `service-requests.update` - Update service request status
- `service-requests.delete` - Delete service requests

### Coupons
- `coupons.view` - View coupons
- `coupons.create` - Create coupons
- `coupons.edit` - Edit coupons
- `coupons.delete` - Delete coupons

### Warranty
- `warranty.view` - View warranty information
- `warranty.manage` - Manage warranty claims

### Sales
- `sales.view` - View sales analytics
- `sales.export` - Export sales data

### Settings
- `settings.view` - View settings
- `settings.edit` - Edit settings

## Predefined Permission Groups

### MANAGER
Full access to products, orders, customers, and most features (except user management and settings).

### SUPPORT
Can view and respond to customer inquiries, manage orders, messages, and service requests.

### INVENTORY
Can manage products and stock levels only.

### SALES
Can view sales, manage orders, customers, and coupons.

### ADMIN
Full access to everything (all permissions).

## How to Create a User with Specific Permissions

### Option 1: Using Permission Groups

```typescript
import { PERMISSION_GROUPS } from '@/lib/permissions'

// Create a manager user
const managerUser = {
  name: 'John Manager',
  email: 'manager@pixelpad.com',
  password: 'hashedPassword',
  role: 'team', // or create a new role
  permissions: PERMISSION_GROUPS.MANAGER,
  isActive: true
}
```

### Option 2: Custom Permissions

```typescript
// Create a user with custom permissions
const customUser = {
  name: 'Jane Support',
  email: 'support@pixelpad.com',
  password: 'hashedPassword',
  role: 'team',
  permissions: [
    'dashboard.view',
    'orders.view',
    'orders.view.details',
    'orders.update.status',
    'customers.view',
    'messages.view',
    'messages.reply',
  ],
  isActive: true
}
```

## Using Permissions in API Routes

### Example: Protect an API route with a permission

```typescript
// app/api/products/route.ts
import { requirePermission } from '@/lib/auth-middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Require 'products.create' permission
  const { user, error } = await requirePermission(request, 'products.create')
  
  if (error) {
    return error
  }
  
  // User has permission, proceed with creating product
  // ... your code here
}
```

### Example: Require any of multiple permissions

```typescript
import { requireAnyPermission } from '@/lib/auth-middleware'

export async function PUT(request: NextRequest) {
  // User needs either 'products.edit' OR 'products.create'
  const { user, error } = await requireAnyPermission(request, [
    'products.edit',
    'products.create'
  ])
  
  if (error) {
    return error
  }
  
  // ... your code here
}
```

## Using Permissions in React Components

### Example: Show/hide UI elements based on permissions

```typescript
'use client'

import { usePermissions } from '@/hooks/usePermissions'

export default function ProductsPage() {
  const { can, isAdmin } = usePermissions()
  
  return (
    <div>
      <h1>Products</h1>
      
      {/* Only show create button if user has permission */}
      {can('products.create') && (
        <button>Create Product</button>
      )}
      
      {/* Only show delete button if user has permission */}
      {can('products.delete') && (
        <button>Delete Product</button>
      )}
      
      {/* Admin-only section */}
      {isAdmin() && (
        <div>Admin Settings</div>
      )}
    </div>
  )
}
```

### Example: Check multiple permissions

```typescript
const { canAny, canAll } = usePermissions()

// User needs ANY of these permissions
if (canAny(['orders.view', 'orders.view.details'])) {
  // Show orders
}

// User needs ALL of these permissions
if (canAll(['products.edit', 'stock.update'])) {
  // Allow editing product and stock together
}
```

## Example: Creating Different User Types

### 1. Manager User
```typescript
{
  name: 'Store Manager',
  email: 'manager@pixelpad.com',
  role: 'team',
  permissions: PERMISSION_GROUPS.MANAGER
}
```

### 2. Support Staff
```typescript
{
  name: 'Support Agent',
  email: 'support@pixelpad.com',
  role: 'team',
  permissions: PERMISSION_GROUPS.SUPPORT
}
```

### 3. Inventory Manager
```typescript
{
  name: 'Inventory Staff',
  email: 'inventory@pixelpad.com',
  role: 'team',
  permissions: PERMISSION_GROUPS.INVENTORY
}
```

### 4. Sales Representative
```typescript
{
  name: 'Sales Rep',
  email: 'sales@pixelpad.com',
  role: 'team',
  permissions: PERMISSION_GROUPS.SALES
}
```

## Best Practices

1. **Always check permissions on the server side** - Client-side checks are for UI only
2. **Use permission groups** - Easier to manage than individual permissions
3. **Admin role bypasses all checks** - Admins automatically have all permissions
4. **Use descriptive permission names** - Makes it clear what each permission does
5. **Test permission boundaries** - Ensure users can't access what they shouldn't

## Adding New Permissions

To add a new permission:

1. Add it to `PERMISSIONS` object in `lib/permissions.ts`
2. Add it to relevant permission groups
3. Use it in your API routes and components

Example:
```typescript
// In lib/permissions.ts
export const PERMISSIONS = {
  // ... existing permissions
  'reports.view': 'View reports',
  'reports.export': 'Export reports',
} as const
```


