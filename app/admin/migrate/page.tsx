'use client'

export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MigratePage() {
  const { t } = useLanguage()
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runMigration = async () => {
    setIsRunning(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/products/migrate', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Migration failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to run migration')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Database Migration
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This migration will:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
          <li>Remove the old <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">showOnLanding</code> field from all products</li>
          <li>Add missing new fields (<code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">showInHero</code>, <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">showInNewArrivals</code>, etc.) with default values</li>
        </ul>

        <button
          onClick={runMigration}
          disabled={isRunning}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isRunning ? 'Running Migration...' : 'Run Migration'}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 font-semibold">Error:</p>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-semibold mb-2">Migration Completed!</p>
            <div className="text-green-700 dark:text-green-300 space-y-1">
              <p>Updated: {result.updated} products</p>
              <p>Total: {result.total} products</p>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Errors:</p>
                  <ul className="list-disc list-inside">
                    {result.errors.map((err: string, idx: number) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

