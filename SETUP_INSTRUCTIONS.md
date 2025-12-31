# Setup Instructions - Security Implementation

Follow these steps to complete the security setup:

## Step 1: Install Dependencies ✅
Already done! The `jsonwebtoken` package has been installed.

## Step 2: Set Environment Variables

Create or update your `.env.local` file in the root directory with:

```env
# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-characters
JWT_EXPIRES_IN=7d

# Admin User Creation (optional - for create-admin script)
ADMIN_EMAIL=admin@pixelpad.com
ADMIN_PASSWORD=your-secure-password-here
ADMIN_NAME=Admin User
```

**Important**: 
- Replace `JWT_SECRET` with a strong, random string (at least 32 characters)
- You can generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Never commit `.env.local` to git (it's already in .gitignore)

## Step 3: Create Admin User

Run the admin creation script:

```bash
npx ts-node scripts/create-admin.ts
```

Or if you set the environment variables in `.env.local`, just run:
```bash
npx ts-node scripts/create-admin.ts
```

This will create an admin user with:
- Email: `admin@pixelpad.com` (or from ADMIN_EMAIL env var)
- Password: The password you set in ADMIN_PASSWORD
- Role: `admin`

## Step 4: (Optional) Migrate Existing Customers

If you have existing customer accounts in the Users collection, migrate them:

```bash
npx ts-node scripts/migrate-customers.ts
```

**Note**: This script will:
- Find all users that are NOT admins/team members
- Copy them to the Customers collection
- Keep the original users (doesn't delete by default)

## Step 5: Test the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test Login**:
   - Go to your login page
   - Try logging in with the admin credentials you created
   - You should receive a JWT token and be authenticated

3. **Test Admin Access**:
   - Navigate to `/admin`
   - You should be able to access the admin panel
   - Check browser console for any errors

4. **Test API Authentication**:
   - Open browser DevTools → Network tab
   - Make an admin action (e.g., view users)
   - Check that requests include `Authorization: Bearer <token>` header

## Troubleshooting

### "Authentication required" errors
- **Check**: Is JWT_SECRET set in `.env.local`?
- **Check**: Did you create an admin user?
- **Check**: Are you logged in? Check localStorage for `pixelpad_token`

### "Admin access required" errors
- **Check**: Does the user have `role: 'admin'` in the database?
- **Check**: Is the user's `type` field set to `'user'` (not `'customer'`)?
- **Check**: Is `isActive: true` for the user?

### Token not working
- **Clear localStorage**: `localStorage.removeItem('pixelpad_token')` and login again
- **Check JWT_SECRET**: Make sure it's the same in `.env.local`
- **Check token format**: Should be `Bearer <token>` in Authorization header

### Script errors
- **"Cannot find module"**: Make sure you're in the project root directory
- **"Connection refused"**: Check your MONGODB_URI is correct
- **"User already exists"**: The admin user already exists, you can login with it

## What Changed?

### Authentication
- ✅ JWT tokens instead of localStorage-only sessions
- ✅ Server-side token verification
- ✅ Automatic token inclusion in API requests

### Database Structure
- ✅ `users` collection: Admin and team members (with `role` field)
- ✅ `customers` collection: Customer accounts

### API Routes
- ✅ All admin routes require authentication
- ✅ Role-based access control (admin, team, customer)
- ✅ Protected endpoints return 401/403 errors

### Client-Side
- ✅ AuthContext uses JWT tokens
- ✅ Automatic token refresh on app load
- ✅ AdminProtected verifies tokens server-side

## Next Steps After Setup

1. **Change default admin password** after first login
2. **Create team members** through admin panel (they'll have `role: 'team'`)
3. **Test customer registration** - new customers go to `customers` collection
4. **Review API routes** - ensure all sensitive operations are protected

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check server logs for authentication errors
3. Verify environment variables are set correctly
4. Ensure MongoDB connection is working

