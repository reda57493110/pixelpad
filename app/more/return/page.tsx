'use client'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

// Static page - no dynamic data
export const dynamic = 'force-static'

export default function ReturnPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative pt-20 sm:pt-20 md:pt-24 lg:pt-16">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900 shadow-lg overflow-hidden z-10 pt-4 sm:pt-4 md:pt-4 lg:pt-4">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-500 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8 pt-2 sm:pt-4 md:py-4 lg:pt-2 lg:pb-5 pb-4 sm:pb-5 md:pb-6 lg:pb-6 relative z-10">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-3 animate-in fade-in duration-1000 delay-300">
              {t('return.hero.title')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-5 lg:mb-4 animate-in slide-in-from-bottom duration-1000 delay-500 px-2">
              {t('return.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('return.overview.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              {t('return.overview.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Product Return Policy */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('return.products.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('return.products.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('return.products.computers.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.products.computers.desc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('return.products.monitors.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.products.monitors.desc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('return.products.accessories.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.products.accessories.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Conditions */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('return.conditions.title')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('return.conditions.computers.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('return.conditions.computers.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('return.conditions.monitors.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('return.conditions.monitors.desc')}</p>
                </div>
                  </div>
                </div>

            <div className="space-y-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('return.conditions.accessories.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('return.conditions.accessories.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('return.conditions.data.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('return.conditions.data.desc')}</p>
                </div>
                  </div>
                </div>
              </div>
        </div>
      </section>

      {/* Non-Returnable Items */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('return.notReturnable.title')}</h2>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('return.notReturnable.custom.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('return.notReturnable.custom.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('return.notReturnable.software.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('return.notReturnable.software.desc')}</p>
                </div>
                  </div>
                </div>

            <div className="space-y-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('return.notReturnable.damaged.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('return.notReturnable.damaged.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('return.notReturnable.services.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('return.notReturnable.services.desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('return.process.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('return.process.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('return.process.step1.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.process.step1.desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('return.process.step2.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.process.step2.desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('return.process.step3.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.process.step3.desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('return.process.step4.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.process.step4.desc')}</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('return.contact.title')}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('return.contact.subtitle')}
              </p>
              <div className="flex justify-center">
                <Link href="/contacts" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-2">
                  {t('return.contact.form')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}