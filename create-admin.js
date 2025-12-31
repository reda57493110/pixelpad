// Script to create admin account in localStorage
// Run this in browser console: node create-admin.js won't work, use browser console instead

// Copy and paste this into your browser console at http://localhost:3000

const adminUser = {
  id: 'admin_' + Date.now(),
  name: 'Admin User',
  email: 'admin@pixelpad.com',
  password: 'admin123',
  orders: 0,
  wishlist: 0,
  createdAt: new Date().toISOString()
}

// Get existing users
const existingUsers = JSON.parse(localStorage.getItem('pixelpad_users') || '[]')

// Check if admin already exists
const adminExists = existingUsers.find(u => u.email === 'admin@pixelpad.com')

if (adminExists) {
  console.log('Admin account already exists!')
  console.log('Email: admin@pixelpad.com')
  console.log('Password: admin123')
} else {
  // Add admin to users list
  existingUsers.push(adminUser)
  localStorage.setItem('pixelpad_users', JSON.stringify(existingUsers))
  console.log('✅ Admin account created successfully!')
  console.log('Email: admin@pixelpad.com')
  console.log('Password: admin123')
  console.log('You can now log in with these credentials.')
}

