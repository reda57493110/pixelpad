# MongoDB Integration Setup Guide

## Overview
Your website has been migrated from localStorage to MongoDB for persistent data storage.

## Setup Instructions

### 1. Get MongoDB Connection String

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority`)

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Connection string: `mongodb://localhost:27017/pixelpad`

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Replace `your_mongodb_connection_string_here` with your actual MongoDB connection string.

### 3. Important Changes

**All data functions are now ASYNC!**

All functions in `lib/products.ts`, `lib/orders.ts`, `lib/messages.ts`, etc. are now async and return Promises.

**Before (localStorage):**
```typescript
const products = getAllProducts() // Synchronous
```

**After (MongoDB):**
```typescript
const products = await getAllProducts() // Async
```

### 4. Code Updates Required

You'll need to update all components that use these functions to handle async calls:

**Example Update:**
```typescript
// Before
useEffect(() => {
  const products = getAllProducts()
  setProducts(products)
}, [])

// After
useEffect(() => {
  const loadProducts = async () => {
    const products = await getAllProducts()
    setProducts(products)
  }
  loadProducts()
}, [])
```

### 5. Data Migration

Existing localStorage data will NOT be automatically migrated. You'll need to:
1. Export data from localStorage (if needed)
2. Use the admin panel to re-add products
3. Or create a migration script

### 6. Testing

1. Start your development server: `npm run dev`
2. Check the console for MongoDB connection errors
3. Test creating/updating/deleting products in the admin panel
4. Verify data persists after page refresh

## API Endpoints Created

- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/landing` - Get landing page products
- `GET /api/products/page` - Get product page products

Similar endpoints for:
- `/api/orders`
- `/api/messages`
- `/api/service-requests`
- `/api/coupons`
- `/api/users`

## Troubleshooting

**Connection Error:**
- Check your MONGODB_URI in `.env.local`
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0` (for development)
- Check network connectivity

**Data Not Loading:**
- Check browser console for errors
- Verify API routes are working (check Network tab)
- Ensure MongoDB connection is established

## Next Steps

1. ✅ Set up MongoDB Atlas account
2. ✅ Add MONGODB_URI to `.env.local`
3. ✅ Update all components to use async functions (COMPLETED)
4. Test the application
5. Migrate existing data if needed (migration script available)

## Migration Script

A migration script has been created to help you move data from localStorage to MongoDB:

**Option 1: Browser Console**
1. Open your website in the browser
2. Open Developer Console (F12)
3. Copy the code from `scripts/migrate-to-mongodb.ts`
4. Paste and run it in the console

**Option 2: API Route**
Use the `/api/migrate` endpoint to migrate data programmatically.

## Status

✅ All lib files updated to use MongoDB API
✅ All main components updated to handle async calls
✅ Migration script created
✅ API routes created for all data operations
✅ Database models created

**Ready to use!** Just add your MongoDB connection string to `.env.local` and you're good to go!

