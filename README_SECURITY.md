# Security Implementation Guide

This document outlines the security improvements implemented for the Pixel Pad admin panel.

## Overview

The application now uses:
- **JWT-based authentication** instead of localStorage-only sessions
- **Database-backed user management** with separate collections for admins/team and customers
- **Server-side authentication middleware** for API route protection
- **Role-based access control** (admin, team, customer)

## Database Structure

### Users Collection (Admin/Team)
- **Purpose**: Admin and team member accounts
- **Model**: `models/User.ts`
- **Fields**:
  - `name`: User's full name
  - `email`: Unique email address
  - `password`: Hashed password (bcrypt)
  - `role`: 'admin' | 'team'
  - `avatar`: Optional avatar URL
  - `permissions`: Array of permission strings
  - `isActive`: Boolean flag for account status

### Customers Collection
- **Purpose**: Customer accounts
- **Model**: `models/Customer.ts`
- **Fields**:
  - `name`: Customer's full name
  - `email`: Unique email address
  - `password`: Hashed password (bcrypt)
  - `avatar`: Optional avatar URL
  - `orders`: Number of orders placed

## Authentication Flow

### Login Process
1. User submits email/password to `/api/auth/login`
2. Server checks Users collection first, then Customers collection
3. Password is verified using bcrypt
4. JWT token is generated with user info (id, email, role, type)
5. Token and user data returned to client
6. Client stores token in localStorage and includes in Authorization header

### Token Structure
```typescript
{
  id: string,        // User/Customer ID
  email: string,     // User email
  role: 'admin' | 'team' | 'customer',
  type: 'user' | 'customer'
}
```

### Token Storage
- **Client**: Stored in `localStorage` as `pixelpad_token`
- **Expiration**: 7 days (configurable via `JWT_EXPIRES_IN` env var)
- **Secret**: Set via `JWT_SECRET` env var (change in production!)

## API Route Protection

### Middleware Functions

#### `requireAuth(request)`
- Verifies JWT token
- Returns user data if authenticated
- Returns 401 if not authenticated

#### `requireAdmin(request)`
- Requires authentication
- Requires `role === 'admin'` and `type === 'user'`
- Returns 403 if not admin

#### `requireAdminOrTeam(request)`
- Requires authentication
- Requires `role === 'admin' || role === 'team'` and `type === 'user'`
- Returns 403 if not admin or team

### Usage Example
```typescript
import { requireAdmin } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request)
  if (error) return error
  
  // User is authenticated and is admin
  // Proceed with admin-only logic
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install jsonwebtoken @types/jsonwebtoken
```

### 2. Set Environment Variables
Add to `.env.local`:
```env
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
MONGODB_URI=your-mongodb-connection-string
```

### 3. Create Admin User
```bash
# Set environment variables
export ADMIN_EMAIL=admin@pixelpad.com
export ADMIN_PASSWORD=your-secure-password
export ADMIN_NAME="Admin User"

# Run the script
npx ts-node scripts/create-admin.ts
```

Or use environment variables from `.env.local`:
```bash
npx ts-node scripts/create-admin.ts
```

### 4. Migrate Existing Customers (Optional)
If you have existing customer accounts in the Users collection:
```bash
npx ts-node scripts/migrate-customers.ts
```

**Note**: This script will:
- Find all users that are not admins/team members
- Copy them to the Customers collection
- Keep original users (doesn't delete by default)

## Client-Side Changes

### AuthContext Updates
- Now uses JWT tokens for authentication
- Automatically includes token in API requests
- Verifies token validity on app load
- Refreshes user data from server

### Making Authenticated Requests
The `AuthContext` automatically includes the token in requests. For manual requests:

```typescript
const token = localStorage.getItem('pixelpad_token')
fetch('/api/some-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## Security Best Practices

1. **Change JWT_SECRET**: Use a strong, random secret in production
2. **Use HTTPS**: Always use HTTPS in production to protect tokens
3. **Token Expiration**: Tokens expire after 7 days (configurable)
4. **Password Hashing**: All passwords are hashed with bcrypt (10 rounds)
5. **Server-Side Validation**: All admin routes verify authentication server-side
6. **Role-Based Access**: Different roles have different permissions

## Migration Notes

### Breaking Changes
- Old localStorage-based auth no longer works
- Admin check changed from email-based to role-based
- Customer accounts moved to separate collection

### Backward Compatibility
- Migration script handles existing customer data
- Old admin user can be updated to new role system
- AuthContext maintains similar API for components

## Troubleshooting

### "Authentication required" errors
- Check if token exists in localStorage
- Verify token hasn't expired
- Ensure JWT_SECRET matches between client/server

### "Admin access required" errors
- Verify user has `role: 'admin'` in database
- Check user `type` is 'user' not 'customer'
- Ensure `isActive: true` for the user

### Token not working
- Clear localStorage and login again
- Check JWT_SECRET is set correctly
- Verify token format: `Bearer <token>`

## Next Steps

1. Add refresh token mechanism for better security
2. Implement rate limiting on auth endpoints
3. Add 2FA for admin accounts
4. Implement session management (logout all devices)
5. Add audit logging for admin actions

