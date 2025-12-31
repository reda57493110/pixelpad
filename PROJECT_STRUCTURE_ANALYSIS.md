# Pixel Pad Project Structure Analysis

## Overview
This is a **Next.js 14** e-commerce application built with **TypeScript**, **React**, and **MongoDB**. The project uses the **App Router** architecture and implements a multi-facing system with three distinct interfaces.

---

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Next.js 14.0.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (via Mongoose)
- **Authentication**: LocalStorage-based (with MongoDB integration)
- **State Management**: React Context API
- **UI Components**: Heroicons

---

## 📁 Project Structure

```
pixelpad/
├── app/                          # Next.js App Router directory
│   ├── layout.tsx               # Root layout (shared across all facings)
│   ├── page.tsx                 # Public landing page (Homepage)
│   ├── landing/                  # Alternative landing page route
│   ├── admin/                   # 🔐 ADMIN PANEL
│   ├── account/                 # 👤 CUSTOMER INTERFACE
│   ├── products/                # Public product browsing
│   ├── cart/                     # Shopping cart
│   ├── orders/                  # Public order pages
│   ├── contacts/                # Contact pages
│   ├── api/                     # API routes
│   └── [other public routes]    # About, Privacy, Terms, etc.
├── components/                  # Reusable React components
│   ├── Protected.tsx            # Customer route protection
│   ├── AdminProtected.tsx      # Admin route protection
│   ├── NavBar.tsx              # Main navigation (shared)
│   └── Footer.tsx              # Footer (shared)
├── contexts/                    # React Context providers
│   ├── AuthContext.tsx         # Authentication state
│   ├── CartContext.tsx         # Shopping cart state
│   ├── LanguageContext.tsx     # i18n (EN/FR/AR)
│   ├── ThemeContext.tsx        # Dark/Light theme
│   └── NavigationLoadingContext.tsx
├── lib/                        # Business logic & utilities
│   ├── mongodb.ts              # Database connection
│   ├── products.ts             # Product operations
│   ├── orders.ts               # Order operations
│   ├── admin.ts                # Admin operations
│   └── [other lib files]
├── models/                     # MongoDB schemas
│   ├── User.ts
│   ├── Product.ts
│   ├── Order.ts
│   ├── Message.ts
│   ├── ServiceRequest.ts
│   └── Coupon.ts
├── translations/               # i18n files
│   ├── en.ts
│   ├── fr.ts
│   └── ar.ts
└── public/                    # Static assets
```

---

## 🎯 Three Facings Architecture

### 1. 🌐 **Public Landing Website**
**Purpose**: Marketing, product discovery, and public information

**Routes**:
- `/` - Main homepage (`app/page.tsx`)
- `/landing` - Alternative landing page (`app/landing/page.tsx`)
- `/products` - Product catalog (public browsing)
- `/products/[id]` - Product detail pages
- `/about` - About page
- `/contact` - Contact page
- `/contacts` - Contact form
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/help` - Help/FAQ
- `/more/*` - Additional info pages (FAQ, Warranty, Returns)

**Features**:
- ✅ No authentication required
- ✅ Product browsing and search
- ✅ Shopping cart (guest mode supported)
- ✅ Multi-language support (EN/FR/AR)
- ✅ Dark/Light theme
- ✅ SEO optimized
- ✅ Responsive design

**Key Components**:
- `app/page.tsx` - Main landing with hero, featured products, testimonials
- `app/landing/page.tsx` - Alternative landing with category filters
- `components/NavBar.tsx` - Shared navigation
- `components/Footer.tsx` - Shared footer

---

### 2. 👤 **Customer Interface**
**Purpose**: Authenticated user account management and shopping

**Routes** (All under `/account/*`):
- `/account` - Dashboard (`app/account/page.tsx`)
- `/account/profile` - User profile management
- `/account/orders` - Order history
- `/account/returns` - Return requests
- `/account/messages` - Customer messages
- `/account/service-requests` - Service request management
- `/account/addresses` - Address management

**Additional Customer Routes**:
- `/cart` - Shopping cart
- `/wishlist` - Wishlist
- `/orders` - Order tracking
- `/service-requests` - Service requests
- `/messages` - Messages
- `/addresses` - Addresses
- `/payment-methods` - Payment methods
- `/settings` - User settings

**Protection**: 
- Uses `components/Protected.tsx` wrapper
- Requires `isLoggedIn === true` from `AuthContext`
- Redirects to `/?login=1` if not authenticated

**Features**:
- ✅ User authentication required
- ✅ Order management
- ✅ Profile editing
- ✅ Address management
- ✅ Service requests
- ✅ Message center
- ✅ Account dashboard with quick access cards

**Key Components**:
- `components/Protected.tsx` - Route protection wrapper
- `components/AccountLayout.tsx` - Shared account layout
- `app/account/page.tsx` - Account dashboard

---

### 3. 🔐 **Admin Panel**
**Purpose**: Administrative control and management

**Routes**:
- `/admin` - Main admin dashboard (`app/admin/page.tsx`)
- `/admin/migrate-users` - User migration tool

**Protection**: 
- Uses `components/AdminProtected.tsx` wrapper
- Requires `user.email === 'admin@pixelpad.com'`
- Hardcoded admin check (security concern - see notes)

**Features**:
- ✅ Full CRUD for products
- ✅ Order management and status updates
- ✅ User management
- ✅ Message management
- ✅ Service request management
- ✅ Coupon management
- ✅ Stock management
- ✅ Sales analytics
- ✅ Warranty management
- ✅ Dashboard with statistics

**Admin Tabs** (in `app/admin/page.tsx`):
1. **Dashboard** - Statistics and overview
2. **Products** - Product CRUD operations
3. **Stock** - Stock management
4. **Orders** - Order management
5. **Coupons** - Coupon management
6. **Users** - User management
7. **Messages** - Contact message management
8. **Service Requests** - Service request management
9. **Warranty** - Warranty management
10. **Sales** - Sales analytics

**Key Components**:
- `components/AdminProtected.tsx` - Admin route protection
- `app/admin/page.tsx` - Main admin interface (5863 lines - comprehensive)
- `lib/admin.ts` - Admin business logic

---

## 🔒 Authentication & Authorization

### Authentication System
- **Method**: LocalStorage-based with MongoDB backend
- **Context**: `contexts/AuthContext.tsx`
- **Storage**: `localStorage.getItem('pixelpad_user')`

### Authorization Levels

1. **Public** (No auth required):
   - Homepage, products, cart (guest mode), public pages

2. **Customer** (Logged in users):
   - All `/account/*` routes
   - Protected by `components/Protected.tsx`
   - Checks: `isLoggedIn === true`

3. **Admin** (Admin email only):
   - `/admin/*` routes
   - Protected by `components/AdminProtected.tsx`
   - Checks: `user.email === 'admin@pixelpad.com'`
   - ⚠️ **Security Issue**: Hardcoded admin check

---

## 🗄️ Database Structure

### MongoDB Collections

1. **Users** (`models/User.ts`)
   - User accounts, authentication data

2. **Products** (`models/Product.ts`)
   - Product catalog, inventory, pricing

3. **Orders** (`models/Order.ts`)
   - Customer orders, order status

4. **Messages** (`models/Message.ts`)
   - Contact form submissions

5. **ServiceRequests** (`models/ServiceRequest.ts`)
   - Service/repair requests

6. **Coupons** (`models/Coupon.ts`)
   - Discount coupons

---

## 🌍 Internationalization (i18n)

### Supported Languages
- **English** (`en`) - Default
- **French** (`fr`)
- **Arabic** (`ar`) - RTL support

### Implementation
- Context: `contexts/LanguageContext.tsx`
- Translation files: `translations/{lang}.ts`
- RTL support for Arabic
- Language switcher in NavBar

---

## 🎨 Theming

### Theme System
- **Context**: `contexts/ThemeContext.tsx`
- **Modes**: Light / Dark
- **Storage**: `localStorage.getItem('theme')`
- **Toggle**: Available in NavBar

---

## 📡 API Routes Structure

All API routes are under `app/api/`:

```
api/
├── auth/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
├── products/
│   ├── route.ts              # GET all, POST create
│   ├── [id]/route.ts         # GET, PUT, DELETE by ID
│   ├── featured/route.ts    # Featured products
│   └── landing/route.ts      # Landing page products
├── orders/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── delete-*/route.ts
├── users/
│   ├── route.ts
│   └── [id]/route.ts
├── messages/
│   ├── route.ts
│   └── [id]/route.ts
├── service-requests/
│   ├── route.ts
│   └── [id]/route.ts
├── coupons/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── validate/route.ts
├── upload/route.ts
└── download-image/route.ts
```

---

## 🔄 State Management

### React Context Providers (in `app/layout.tsx`)

1. **ThemeProvider** - Dark/Light theme
2. **LanguageProvider** - i18n and language switching
3. **AuthProvider** - Authentication state
4. **CartProvider** - Shopping cart state
5. **NavigationLoadingProvider** - Loading states

### Data Flow
- **Client-side**: React Context + LocalStorage
- **Server-side**: MongoDB via API routes
- **Real-time updates**: Custom events (`pixelpad_products_changed`, etc.)

---

## 🛡️ Route Protection Summary

| Route Pattern | Protection | Component | Access Level |
|--------------|-----------|-----------|--------------|
| `/` | None | - | Public |
| `/products/*` | None | - | Public |
| `/account/*` | `Protected` | `components/Protected.tsx` | Authenticated Users |
| `/admin/*` | `AdminProtected` | `components/AdminProtected.tsx` | Admin Only |
| `/cart` | None | - | Public (Guest mode) |
| `/orders` | None | - | Public (but filtered by user) |

---

## 📦 Key Features by Facing

### Public Landing
- ✅ Hero section with CTA
- ✅ Featured products carousel
- ✅ Category browsing
- ✅ Product search
- ✅ Testimonials
- ✅ Trust indicators
- ✅ Service highlights
- ✅ Multi-language support

### Customer Interface
- ✅ Account dashboard
- ✅ Order history & tracking
- ✅ Profile management
- ✅ Address book
- ✅ Service requests
- ✅ Message center
- ✅ Returns management
- ✅ Wishlist

### Admin Panel
- ✅ Comprehensive dashboard
- ✅ Product management (CRUD)
- ✅ Order management
- ✅ User management
- ✅ Stock management
- ✅ Coupon system
- ✅ Message management
- ✅ Service request management
- ✅ Sales analytics
- ✅ Warranty management

---

## ⚠️ Security Considerations

1. **Hardcoded Admin Credentials**
   - Location: `contexts/AuthContext.tsx` (line 70)
   - Issue: `admin@pixelpad.com` / `admin123` hardcoded
   - Recommendation: Move to environment variables, use proper auth

2. **Route Protection**
   - Client-side only (can be bypassed)
   - Recommendation: Add server-side middleware

3. **API Security**
   - Some routes may lack authentication
   - Recommendation: Add authentication middleware to API routes

---

## 🚀 Development Notes

### Running the Project
```bash
npm run dev    # Development server (0.0.0.0:3000)
npm run build  # Production build
npm start      # Production server
```

### Environment Variables
- `NEXT_PUBLIC_SITE_URL` - Site URL for SEO
- MongoDB connection string (in `lib/mongodb.ts`)

### Key Scripts
- `create-admin.js` - Admin user creation script
- `scripts/migrate-to-mongodb.ts` - Migration script

---

## 📊 Project Statistics

- **Total Pages**: ~36 page routes
- **API Routes**: ~27 API endpoints
- **Components**: ~20 reusable components
- **Contexts**: 5 React contexts
- **Models**: 6 MongoDB models
- **Languages**: 3 (EN, FR, AR)
- **Admin Page Size**: 5863 lines (comprehensive admin panel)

---

## 🎯 Summary

This is a well-structured Next.js e-commerce application with clear separation between:
1. **Public-facing** marketing and product discovery
2. **Customer-facing** authenticated account management
3. **Admin-facing** comprehensive management panel

The architecture uses modern React patterns (Context API, App Router) and provides a solid foundation for an e-commerce platform with room for security improvements.

