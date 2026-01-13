# Pixel Pad Website - Complete Site Structure Analysis

## 📋 Overview
This document provides a comprehensive map of all pages, their locations, relationships, and navigation flows in the Pixel Pad website.

---

## 🏗️ Architecture: Three Main Sections

### 1. 🌐 **PUBLIC WEBSITE** (No Authentication Required)
**Purpose**: Marketing, product discovery, shopping, and information

### 2. 👤 **CUSTOMER ACCOUNT** (Authentication Required)
**Purpose**: User account management, orders, and personal features

### 3. 🔐 **ADMIN PANEL** (Admin Authentication Required)
**Purpose**: Administrative control and management

---

## 📍 Complete Page Directory Structure

```
app/
├── page.tsx                          # 🏠 Homepage (Landing Page)
│
├── products/
│   ├── page.tsx                      # 📦 Product Catalog
│   └── [id]/
│       └── page.tsx                  # 📦 Product Detail Page
│
├── cart/
│   └── page.tsx                      # 🛒 Shopping Cart
│
├── checkout/
│   └── page.tsx                      # 💳 Checkout Process
│
├── track-order/
│   └── page.tsx                      # 📍 Order Tracking
│
├── services/
│   └── page.tsx                      # 🛠️ Services Page
│
├── contacts/
│   └── page.tsx                      # 📧 Contact Form Page
│
├── contact/
│   └── page.tsx                      # 📧 Alternative Contact Page
│
├── more/
│   ├── about/
│   │   └── page.tsx                  # ℹ️ About Us Page
│   ├── faq/
│   │   └── page.tsx                  # ❓ FAQ Page
│   ├── warranty/
│   │   └── page.tsx                  # 🛡️ Warranty Information
│   └── return/
│       └── page.tsx                  # 🔄 Return Policy
│
├── privacy/
│   └── page.tsx                      # 🔒 Privacy Policy
│
├── terms/
│   └── page.tsx                      # 📜 Terms of Service
│
├── about/
│   └── page.tsx                      # ℹ️ Alternative About Page
│
├── forgot-password/
│   └── page.tsx                      # 🔑 Forgot Password
│
├── reset-password/
│   └── page.tsx                      # 🔑 Reset Password
│
├── account/                          # 👤 CUSTOMER ACCOUNT SECTION
│   ├── page.tsx                      # 📊 Account Dashboard
│   ├── profile/
│   │   └── page.tsx                  # 👤 Profile Management
│   ├── orders/
│   │   └── page.tsx                  # 📋 Order History
│   ├── returns/
│   │   └── page.tsx                  # 🔄 Return Requests
│   ├── messages/
│   │   └── page.tsx                  # 💬 Customer Messages
│   ├── service-requests/
│   │   └── page.tsx                  # 🛠️ Service Requests
│   └── addresses/
│       └── page.tsx                  # 📍 Address Management
│
├── admin/                            # 🔐 ADMIN PANEL SECTION
│   ├── login/
│   │   └── page.tsx                  # 🔑 Admin Login
│   ├── page.tsx                      # 📊 Admin Dashboard
│   ├── products/
│   │   ├── page.tsx                  # 📦 Product Management
│   │   ├── create/
│   │   │   └── page.tsx              # ➕ Create Product
│   │   └── [id]/
│   │       ├── page.tsx              # 👁️ View Product
│   │       └── edit/
│   │           └── page.tsx          # ✏️ Edit Product
│   ├── orders/
│   │   ├── page.tsx                  # 📋 Order Management
│   │   └── [id]/
│   │       ├── page.tsx              # 👁️ View Order
│   │       └── edit/
│   │           └── page.tsx          # ✏️ Edit Order
│   ├── users/
│   │   ├── page.tsx                  # 👥 User Management
│   │   ├── create/
│   │   │   └── page.tsx              # ➕ Create User
│   │   └── [id]/
│   │       ├── page.tsx              # 👁️ View User
│   │       └── edit/
│   │           └── page.tsx          # ✏️ Edit User
│   ├── customers/
│   │   └── page.tsx                  # 👥 Customer Management
│   ├── messages/
│   │   ├── page.tsx                  # 💬 Message Management
│   │   └── [id]/
│   │       └── page.tsx              # 👁️ View Message
│   ├── service-requests/
│   │   ├── page.tsx                  # 🛠️ Service Request Management
│   │   └── [id]/
│   │       ├── page.tsx              # 👁️ View Service Request
│   │       └── edit/
│   │           └── page.tsx          # ✏️ Edit Service Request
│   ├── coupons/
│   │   ├── page.tsx                  # 🎫 Coupon Management
│   │   ├── create/
│   │   │   └── page.tsx              # ➕ Create Coupon
│   │   └── [id]/
│   │       ├── page.tsx              # 👁️ View Coupon
│   │       └── edit/
│   │           └── page.tsx          # ✏️ Edit Coupon
│   ├── warranty/
│   │   ├── page.tsx                  # 🛡️ Warranty Management
│   │   └── [id]/
│   │       └── page.tsx              # 👁️ View Warranty
│   ├── stock/
│   │   └── page.tsx                  # 📊 Stock Management
│   ├── sales/
│   │   └── page.tsx                  # 💰 Sales Dashboard
│   ├── settings/
│   │   └── categories/
│   │       ├── page.tsx              # 🏷️ Category Management
│   │       ├── create/
│   │       │   └── page.tsx          # ➕ Create Category
│   │       └── [id]/
│   │           ├── page.tsx          # 👁️ View Category
│   │           └── edit/
│   │               └── page.tsx      # ✏️ Edit Category
│   ├── profile/
│   │   └── page.tsx                  # 👤 Admin Profile
│   ├── migrate/
│   │   └── page.tsx                  # 🔄 Data Migration
│   └── migrate-users/
│       └── page.tsx                  # 🔄 User Migration
│
└── [Legacy/Alternative Routes]
    ├── orders/
    │   └── page.tsx                  # 📋 Alternative Orders Page
    ├── messages/
    │   └── page.tsx                  # 💬 Alternative Messages Page
    ├── service-requests/
    │   └── page.tsx                  # 🛠️ Alternative Service Requests
    ├── addresses/
    │   └── page.tsx                  # 📍 Alternative Addresses
    ├── profile/
    │   └── page.tsx                  # 👤 Alternative Profile
    ├── settings/
    │   └── page.tsx                  # ⚙️ Settings Page
    └── payment-methods/
        └── page.tsx                  # 💳 Payment Methods
```

---

## 🔗 Navigation & Page Relationships

### **Main Navigation (NavBar)**
**Location**: `components/NavBar.tsx`

**Desktop Links**:
- `/` → Home
- `/products` → Shop/Products
- `/more/about` → About Us
- `/contacts` → Contact
- `/services` → Services (with accent styling)

**User Menu** (When Logged In):
- `/account` → Account Dashboard
- `/account/profile` → My Profile
- `/account/orders` → My Orders
- `/account/addresses` → Address
- Logout

**Mobile Menu**:
- Same as desktop + additional account links

### **Footer Navigation**
**Location**: `components/Footer.tsx` + `data/footerData.ts`

**Quick Links**:
- `/products` → Products
- `/more/about` → About
- `/contacts` → Contact

**Support Links**:
- `/more/warranty` → Warranty
- `/more/return` → Return Policy
- `/more/faq` → FAQ

**Legal Links**:
- `/privacy` → Privacy Policy
- `/terms` → Terms of Service

---

## 🔄 Page Flow & User Journeys

### **1. Shopping Flow (Public)**
```
Homepage (/)
  ↓
Products Catalog (/products)
  ↓
Product Detail (/products/[id])
  ↓
Add to Cart → Cart (/cart)
  ↓
Checkout (/checkout)
  ├── Step 1: Authentication (?step=auth)
  ├── Step 2: Shipping Info (?step=shipping)
  ├── Step 3: Payment (?step=payment)
  └── Step 4: Review (?step=review)
  ↓
Order Confirmation → Track Order (/track-order)
```

### **2. Customer Account Flow**
```
Login/Register (via NavBar modal)
  ↓
Account Dashboard (/account)
  ├── Profile (/account/profile)
  ├── Orders (/account/orders)
  ├── Returns (/account/returns)
  ├── Messages (/account/messages)
  ├── Service Requests (/account/service-requests)
  └── Addresses (/account/addresses)
```

### **3. Service Request Flow**
```
Services Page (/services)
  ↓
Fill Service Request Form
  ↓
Service Request Submitted
  ↓
View in Account (/account/service-requests)
  OR
View in Admin Panel (/admin/service-requests)
```

### **4. Contact Flow**
```
Contact Page (/contacts)
  ↓
Fill Contact Form
  ↓
Message Submitted
  ↓
View in Account (/account/messages) [if logged in]
  OR
View in Admin Panel (/admin/messages)
```

### **5. Admin Management Flow**
```
Admin Login (/admin/login)
  ↓
Admin Dashboard (/admin)
  ├── Products Management
  │   ├── List (/admin/products)
  │   ├── Create (/admin/products/create)
  │   ├── View (/admin/products/[id])
  │   └── Edit (/admin/products/[id]/edit)
  ├── Orders Management
  │   ├── List (/admin/orders)
  │   ├── View (/admin/orders/[id])
  │   └── Edit (/admin/orders/[id]/edit)
  ├── Users Management
  │   ├── List (/admin/users)
  │   ├── Create (/admin/users/create)
  │   ├── View (/admin/users/[id])
  │   └── Edit (/admin/users/[id]/edit)
  ├── Messages (/admin/messages)
  ├── Service Requests (/admin/service-requests)
  ├── Coupons (/admin/coupons)
  ├── Warranty (/admin/warranty)
  ├── Stock (/admin/stock)
  ├── Sales (/admin/sales)
  └── Settings (/admin/settings/categories)
```

---

## 🗺️ Page Relationships Map

### **Homepage (`/`) Connections:**
- Links to: `/products` (multiple CTAs)
- Links to: `/track-order` (order tracking)
- Contains: Featured products → `/products/[id]`
- Contains: Reviews section
- Contains: "Why Choose Us" section
- Contains: User review form (if logged in)

### **Products Page (`/products`) Connections:**
- Links from: Homepage, NavBar, Footer
- Links to: `/products/[id]` (each product card)
- Contains: Support section with contact info
- Filters and search functionality

### **Product Detail (`/products/[id]`) Connections:**
- Links from: Products page, Homepage featured products
- Links to: `/cart` (Add to Cart button)
- Links to: `/checkout` (Buy Now button)
- Related products section

### **Cart (`/cart`) Connections:**
- Links from: Product pages, NavBar cart icon
- Links to: `/checkout` (Checkout button)
- Links to: `/products` (Continue Shopping)
- Updates: Real-time cart count in NavBar

### **Checkout (`/checkout`) Connections:**
- Links from: Cart page
- Links to: `/account/orders` (after order completion)
- Links to: `/track-order` (order tracking)
- Multi-step process with URL parameters

### **Account Dashboard (`/account`) Connections:**
- Links to: All account sub-pages (6 cards)
  - `/account/profile`
  - `/account/orders`
  - `/account/returns`
  - `/account/messages`
  - `/account/service-requests`
  - `/account/addresses`
- Protected route (requires login)

### **Account Sub-Pages Connections:**
- All link back to: `/account` (dashboard)
- `/account/orders` → Links to `/track-order`
- `/account/returns` → Related to orders
- `/account/messages` → Links to `/contacts`
- `/account/service-requests` → Links to `/services`

### **Services Page (`/services`) Connections:**
- Links from: NavBar, Homepage
- Links to: `/account/service-requests` (after submission)
- Contains: Service request form

### **Contact Page (`/contacts`) Connections:**
- Links from: NavBar, Footer
- Links to: `/account/messages` (after submission, if logged in)
- Contains: Contact form, FAQ section

### **Admin Pages Connections:**
- All protected by: `/admin/login`
- Admin Dashboard links to all admin sub-sections
- Each management section has CRUD operations
- Orders link to customer accounts
- Messages link to customer accounts

---

## 🔐 Authentication & Protection

### **Public Pages** (No Auth Required):
- `/` (Homepage)
- `/products` and `/products/[id]`
- `/cart`
- `/checkout` (guest checkout allowed)
- `/track-order`
- `/services`
- `/contacts` or `/contact`
- `/more/*` (About, FAQ, Warranty, Return)
- `/privacy`, `/terms`
- `/forgot-password`, `/reset-password`

### **Customer Pages** (Auth Required):
- `/account/*` (all account pages)
- Uses: `components/Protected.tsx`
- Redirects to: `/?login=1` if not authenticated

### **Admin Pages** (Admin Auth Required):
- `/admin/*` (all admin pages except login)
- Uses: `components/AdminProtected.tsx` or admin layout protection
- Requires: `user.email === 'admin@pixelpad.com'`
- Redirects to: `/admin/login` if not authenticated

---

## 📱 Page Categories by Function

### **E-Commerce Pages:**
- Homepage, Products, Product Detail, Cart, Checkout, Track Order

### **Information Pages:**
- About, FAQ, Warranty, Return Policy, Privacy, Terms

### **Service Pages:**
- Services, Service Requests (account & admin)

### **Communication Pages:**
- Contact, Messages (account & admin)

### **Account Management:**
- Dashboard, Profile, Orders, Returns, Addresses

### **Administrative:**
- Admin Dashboard, Product Management, Order Management, User Management, etc.

---

## 🔄 Data Flow & Relationships

### **Order Flow:**
```
Checkout → Order Created → 
  ├── Customer: /account/orders
  ├── Admin: /admin/orders
  └── Tracking: /track-order
```

### **Message Flow:**
```
Contact Form → Message Created →
  ├── Customer: /account/messages (if logged in)
  └── Admin: /admin/messages
```

### **Service Request Flow:**
```
Services Form → Request Created →
  ├── Customer: /account/service-requests
  └── Admin: /admin/service-requests
```

### **Product Flow:**
```
Admin: /admin/products/create →
  Product Created →
  Public: /products → /products/[id]
```

---

## 📊 Page Statistics

**Total Pages**: 67 page files

**Breakdown**:
- **Public Pages**: ~25 pages
- **Customer Account Pages**: 7 pages
- **Admin Pages**: ~35 pages

**Dynamic Routes**:
- `/products/[id]` - Product detail
- `/admin/products/[id]` - Admin product view/edit
- `/admin/orders/[id]` - Admin order view/edit
- `/admin/users/[id]` - Admin user view/edit
- `/admin/coupons/[id]` - Admin coupon view/edit
- `/admin/messages/[id]` - Admin message view
- `/admin/service-requests/[id]` - Admin service request view/edit
- `/admin/warranty/[id]` - Admin warranty view
- `/admin/settings/categories/[id]` - Admin category view/edit

---

## 🎯 Key Navigation Components

1. **NavBar** (`components/NavBar.tsx`)
   - Main navigation
   - User menu
   - Cart icon
   - Language switcher
   - Theme toggle

2. **Footer** (`components/Footer.tsx`)
   - Quick links
   - Support links
   - Legal links
   - Social media

3. **AccountLayout** (`components/AccountLayout.tsx`)
   - Account section navigation
   - Breadcrumbs

4. **AdminLayout** (`app/admin/layout.tsx`)
   - Admin sidebar navigation
   - Permission-based menu items

---

## 🔍 Special Features

### **Multi-language Support:**
- All pages support: English (en), French (fr), Arabic (ar)
- Language switcher in NavBar
- RTL support for Arabic

### **Dark Mode:**
- All pages support dark/light theme
- Theme toggle in NavBar
- Consistent styling across all pages

### **Responsive Design:**
- All pages are mobile-responsive
- Mobile menu in NavBar
- Adaptive layouts

---

## 📝 Notes

1. **Duplicate Routes**: Some pages exist in multiple locations (e.g., `/about` and `/more/about`, `/contact` and `/contacts`)

2. **Legacy Routes**: Some routes like `/orders`, `/messages`, `/profile` exist but may redirect to `/account/*` equivalents

3. **Protected Routes**: Customer and Admin sections use different protection mechanisms

4. **Dynamic Routing**: Next.js App Router uses file-based routing with `[id]` for dynamic segments

5. **Layout Files**: Some sections have `layout.tsx` files for shared layouts (products, services, contacts, more/about, more/faq)

---

## 🎨 Design Consistency

All pages follow consistent design patterns:
- Same NavBar and Footer
- Consistent card styling (now fixed for dark mode)
- Unified color scheme (primary blue)
- Responsive breakpoints
- Dark mode support

---

*Last Updated: Based on current codebase structure*


