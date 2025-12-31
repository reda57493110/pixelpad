'use client'

export const dynamic = 'force-dynamic'
import { useState } from 'react'
import AdminProtected from '@/components/AdminProtected'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MigrateUsersPage() {
  const { t } = useLanguage()
  const [isMigrating, setIsMigrating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleMigrate = async () => {
    setIsMigrating(true)
    setResult(null)

    try {
      // Get users from localStorage
      const usersData = localStorage.getItem('pixelpad_users')
      if (!usersData) {
        setResult({
          success: false,
          message: 'No users found in localStorage'
        })
        setIsMigrating(false)
        return
      }

      const users = JSON.parse(usersData)
      if (users.length === 0) {
        setResult({
          success: false,
          message: 'No users found in localStorage'
        })
        setIsMigrating(false)
        return
      }

      // Migrate users to MongoDB
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'users',
          data: users
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully migrated ${data.count} user(s) to MongoDB. They will now appear in the Users tab.`
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Migration failed'
        })
      }
    } catch (error) {
      console.error('Migration error:', error)
      setResult({
        success: false,
        message: 'Error during migration: ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <AdminProtected>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Migrate Users from localStorage</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This will migrate users from localStorage to MongoDB so they appear in the admin panel.
            Users will be able to log in with their existing passwords.
          </p>
          
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMigrating ? 'Migrating...' : 'Migrate Users'}
          </button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className={result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
              {result.message}
            </p>
          </div>
        )}
      </div>
    </AdminProtected>
  )
}


