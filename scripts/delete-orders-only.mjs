/**
 * Deletes every document in the `orders` collection only.
 * Safety: pass --yes or set CONFIRM_DELETE_ORDERS=yes
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import mongoose from 'mongoose'

config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const uri = process.env.MONGODB_URI
const confirmed =
  process.argv.includes('--yes') || process.env.CONFIRM_DELETE_ORDERS === 'yes'

if (!uri) {
  console.error('Missing MONGODB_URI')
  process.exit(1)
}
if (!confirmed) {
  console.error('Refusing to run without confirmation. This deletes ALL orders.')
  console.error('Run:  node scripts/delete-orders-only.mjs --yes')
  console.error('Or:   CONFIRM_DELETE_ORDERS=yes node scripts/delete-orders-only.mjs')
  process.exit(1)
}

async function main() {
  await mongoose.connect(uri)
  const col = mongoose.connection.db.collection('orders')
  const result = await col.deleteMany({})
  console.log(`Deleted ${result.deletedCount} order(s).`)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
