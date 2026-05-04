/**
 * One-time bootstrap: create or update an admin User in MongoDB.
 *
 * Requires (in .env.local or environment):
 *   MONGODB_URI
 *   BOOTSTRAP_ADMIN_EMAIL
 *   BOOTSTRAP_ADMIN_PASSWORD   (min 10 characters)
 *
 * Optional hard gate (recommended for shared machines / CI):
 *   ADMIN_BOOTSTRAP_TOKEN      — if set, you must pass the same value as the first CLI argument:
 *   node scripts/setup-admin.mjs <ADMIN_BOOTSTRAP_TOKEN>
 */

import { createRequire } from 'module'
import { config } from 'dotenv'
import { resolve } from 'path'

const require = createRequire(import.meta.url)
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'team'], default: 'team', required: true },
    avatar: { type: String },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'users' }
)

async function main() {
  const tokenEnv = process.env.ADMIN_BOOTSTRAP_TOKEN
  if (tokenEnv) {
    const passed = process.argv[2]
    if (passed !== tokenEnv) {
      console.error(
        'ADMIN_BOOTSTRAP_TOKEN is set: run with matching token as first argument:\n' +
          '  node scripts/setup-admin.mjs <token>'
      )
      process.exit(1)
    }
  }

  const uri = process.env.MONGODB_URI
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase()
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || ''
  const displayName = (process.env.BOOTSTRAP_ADMIN_NAME || 'Admin').trim() || 'Admin'

  if (!uri) {
    console.error('Missing MONGODB_URI')
    process.exit(1)
  }
  if (!email) {
    console.error('Missing BOOTSTRAP_ADMIN_EMAIL')
    process.exit(1)
  }
  if (password.length < 10) {
    console.error('BOOTSTRAP_ADMIN_PASSWORD must be at least 10 characters')
    process.exit(1)
  }

  await mongoose.connect(uri)
  const User = mongoose.models.BootstrapUser || mongoose.model('BootstrapUser', userSchema)

  const hashed = await bcrypt.hash(password, 10)
  const existing = await User.findOne({ email })

  if (existing) {
    existing.password = hashed
    existing.role = 'admin'
    existing.isActive = true
    if (!existing.name) existing.name = displayName
    await existing.save()
    console.log('Updated existing admin user:', email)
  } else {
    await User.create({
      name: displayName,
      email,
      password: hashed,
      role: 'admin',
      permissions: [],
      isActive: true,
    })
    console.log('Created admin user:', email)
  }

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
