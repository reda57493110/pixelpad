# Setup Admin Password

## Quick Setup (After Vercel Deployment)

After your Vercel deployment completes, use one of these methods to set your admin password:

### Method 1: Using curl (Terminal/PowerShell)

```bash
curl -X POST https://YOUR_VERCEL_URL.vercel.app/api/admin/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"password": "123456789"}'
```

**PowerShell version:**
```powershell
Invoke-RestMethod -Uri "https://YOUR_VERCEL_URL.vercel.app/api/admin/setup-admin" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"password": "123456789"}'
```

### Method 2: Using Browser Console

1. Open your website in the browser
2. Press F12 to open Developer Tools
3. Go to the Console tab
4. Paste and run this code:

```javascript
fetch('/api/admin/setup-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: '123456789' })
})
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err))
```

### Method 3: Using Postman or Similar Tool

1. Create a POST request to: `https://YOUR_VERCEL_URL.vercel.app/api/admin/setup-admin`
2. Set Headers: `Content-Type: application/json`
3. Set Body (raw JSON):
```json
{
  "password": "123456789"
}
```

## After Setup

Once the password is set, you can login with:
- **Email:** `admin@pixelpad.com`
- **Password:** `123456789` (or whatever password you set)

## Security Note

For additional security, you can set `ADMIN_SETUP_SECRET` in your Vercel environment variables. If set, you'll need to include it in the request:

```json
{
  "password": "123456789",
  "secret": "your-secret-key"
}
```

## Alternative: Local Script

If you have local access to the codebase:

1. Create/update `.env.local`:
```env
MONGODB_URI=your-mongodb-connection-string
ADMIN_EMAIL=admin@pixelpad.com
ADMIN_PASSWORD=123456789
ADMIN_NAME=Admin User
```

2. Run the script:
```bash
npx ts-node scripts/create-admin.ts
```
