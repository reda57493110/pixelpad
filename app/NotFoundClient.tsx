'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function NotFoundClient() {
  const { t, language } = useLanguage()

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-500 mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('error.notFound.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            {t('error.notFound.description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <HomeIcon className="w-5 h-5" />
            {t('error.notFound.goHome')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ArrowLeftIcon className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            {t('error.notFound.goBack')}
          </button>
        </div>
      </div>
    </div>
  )
}





















