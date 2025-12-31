/**
 * Helper script to generate JWT_SECRET and check environment setup
 * Run with: node scripts/setup-env.js
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')

console.log('🔐 Security Setup Helper\n')

// Generate JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex')
console.log('Generated JWT_SECRET:', jwtSecret)
console.log('')

// Check if .env.local exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists')
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  if (envContent.includes('JWT_SECRET=')) {
    console.log('⚠️  JWT_SECRET already exists in .env.local')
    console.log('   If you want to regenerate it, update the value manually')
  } else {
    console.log('📝 Adding JWT_SECRET to .env.local...')
    fs.appendFileSync(envPath, `\n# JWT Configuration\nJWT_SECRET=${jwtSecret}\nJWT_EXPIRES_IN=7d\n`)
    console.log('✅ JWT_SECRET added to .env.local')
  }
  
  if (!envContent.includes('MONGODB_URI=')) {
    console.log('⚠️  MONGODB_URI not found in .env.local')
    console.log('   Please add your MongoDB connection string:')
    console.log('   MONGODB_URI=your-mongodb-connection-string')
  } else {
    console.log('✅ MONGODB_URI found in .env.local')
  }
} else {
  console.log('📝 Creating .env.local file...')
  const defaultEnv = `# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Admin User Creation (optional)
ADMIN_EMAIL=admin@pixelpad.com
ADMIN_PASSWORD=change-this-password
ADMIN_NAME=Admin User
`
  fs.writeFileSync(envPath, defaultEnv)
  console.log('✅ .env.local file created')
  console.log('⚠️  Please update MONGODB_URI with your actual connection string')
  console.log('⚠️  Please update ADMIN_PASSWORD with a secure password')
}

console.log('\n📋 Next Steps:')
console.log('1. Update MONGODB_URI in .env.local with your MongoDB connection string')
console.log('2. Update ADMIN_PASSWORD in .env.local (optional, for create-admin script)')
console.log('3. Run: npx ts-node scripts/create-admin.ts')
console.log('4. Start your dev server: npm run dev')
console.log('')

