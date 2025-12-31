'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Protected({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="animate-pulse h-40 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('protected.signInRequired')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('protected.signInMessage')}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => router.push('/?login=1')}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('protected.signIn')}
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            {t('protected.goToHome')}
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}





