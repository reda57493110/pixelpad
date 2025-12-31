# Admin Panel Refactoring Guide

## ✅ Completed

### 1. Admin Layout (`app/admin/layout.tsx`)
- Created shared layout with navigation
- All admin pages now use this layout automatically
- Navigation highlights active route

### 2. Dashboard (`app/admin/page.tsx`)
- Extracted dashboard to main admin page
- Shows statistics and key metrics
- Clean, focused component

### 3. Products Module ✅
Created complete module structure:
- **Listing**: `app/admin/products/page.tsx`
  - Table view with search, filters, sorting
  - Actions: View, Edit, Delete
  - Shows all product information
  
- **Create**: `app/admin/products/create/page.tsx`
  - Full form with all product fields
  - Image upload support
  - Features and specifications management
  
- **View**: `app/admin/products/[id]/page.tsx`
  - Detailed product view
  - All product information displayed
  - Quick actions (Edit, Delete)
  
- **Edit**: `app/admin/products/[id]/edit/page.tsx`
  - Pre-populated form
  - Same structure as create page
  - Updates existing product

## 📋 Remaining Modules

Follow the same pattern for each module:

### 4. Orders Module
**Structure:**
```
app/admin/orders/
  ├── page.tsx          # Listing (all orders with filters)
  └── [id]/
      ├── page.tsx      # View order details
      └── edit/
          └── page.tsx  # Edit order status
```

**Key Features:**
- List all orders with status, customer, total
- Filter by status, date, customer
- View order details (items, shipping, payment)
- Update order status
- View order history

### 5. Users Module
**Structure:**
```
app/admin/users/
  ├── page.tsx          # Listing (all users)
  └── [id]/
      ├── page.tsx      # View user profile
      └── edit/
          └── page.tsx  # Edit user info
```

**Key Features:**
- List all users
- Search by name/email
- View user details (orders, profile)
- Edit user information
- Delete users

### 6. Messages Module
**Structure:**
```
app/admin/messages/
  ├── page.tsx          # Listing (all messages)
  └── [id]/
      └── page.tsx      # View message & reply
```

**Key Features:**
- List all contact messages
- Filter by status (new, read, replied)
- View message details
- Mark as read/replied
- Reply to messages

### 7. Service Requests Module
**Structure:**
```
app/admin/service-requests/
  ├── page.tsx          # Listing (all requests)
  └── [id]/
      ├── page.tsx      # View request details
      └── edit/
          └── page.tsx  # Update request status
```

**Key Features:**
- List all service requests
- Filter by status
- View request details
- Update status
- Assign to technician

### 8. Coupons Module
**Structure:**
```
app/admin/coupons/
  ├── page.tsx          # Listing (all coupons)
  ├── create/
  │   └── page.tsx      # Create new coupon
  └── [id]/
      ├── page.tsx      # View coupon details
      └── edit/
          └── page.tsx  # Edit coupon
```

**Key Features:**
- List all coupons
- Create new coupons
- Edit coupon details
- View usage statistics
- Enable/disable coupons

### 9. Stock Module
**Structure:**
```
app/admin/stock/
  └── page.tsx          # Stock management dashboard
```

**Key Features:**
- Overview of all stock levels
- Low stock alerts
- Bulk stock updates
- Stock history

### 10. Warranty Module
**Structure:**
```
app/admin/warranty/
  ├── page.tsx          # Listing (all warranty claims)
  └── [id]/
      └── page.tsx      # View warranty details
```

**Key Features:**
- List warranty claims
- Filter by status
- View warranty details
- Process claims

### 11. Sales Module
**Structure:**
```
app/admin/sales/
  └── page.tsx          # Sales analytics dashboard
```

**Key Features:**
- Sales charts and graphs
- Revenue by period
- Top products
- Sales trends

## 🔧 Implementation Pattern

For each module, follow this pattern:

### 1. Listing Page (`page.tsx`)
```typescript
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
// Import your data fetching functions
// Import your types

export default function ModuleListPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  // ... filters

  useEffect(() => {
    loadItems()
    // Listen for changes
    window.addEventListener('pixelpad_module_changed', loadItems)
    return () => window.removeEventListener('pixelpad_module_changed', loadItems)
  }, [])

  const loadItems = async () => {
    // Fetch data
  }

  return (
    <div className="space-y-6">
      {/* Header with Create button */}
      {/* Filters */}
      {/* Table/List */}
      {/* Actions */}
    </div>
  )
}
```

### 2. View Page (`[id]/page.tsx`)
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
// ... imports

export default function ViewItemPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState(null)
  // ... state

  useEffect(() => {
    if (params.id) {
      loadItem(params.id as string)
    }
  }, [params.id])

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      {/* Item details */}
    </div>
  )
}
```

### 3. Create/Edit Pages
- Similar structure to products create/edit
- Form with all relevant fields
- Validation
- Submit handler

## 📝 Notes

1. **Navigation**: All routes are automatically added to the admin layout navigation
2. **Protection**: All pages are protected by `AdminProtected` via layout
3. **Consistency**: Follow the same UI patterns and styling
4. **Data Loading**: Use the existing lib functions (e.g., `lib/admin.ts`, `lib/orders.ts`)
5. **Events**: Dispatch events after mutations: `window.dispatchEvent(new Event('pixelpad_module_changed'))`

## 🚀 Next Steps

1. Start with Orders module (most important after Products)
2. Then Users, Messages, Service Requests
3. Finally Coupons, Stock, Warranty, Sales

Each module should be self-contained and follow the same patterns for consistency.

