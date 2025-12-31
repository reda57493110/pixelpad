'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { HomeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t, language } = useLanguage()

  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error)
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600 dark:text-red-500 mb-4">
            {t('error.general.title')}
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('error.general.heading')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            {t('error.general.description')}
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowPathIcon className="w-5 h-5" />
            {t('error.general.tryAgain')}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
          >
            <HomeIcon className="w-5 h-5" />
            {t('error.general.goHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}





















