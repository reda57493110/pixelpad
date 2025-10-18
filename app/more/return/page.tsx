'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function ReturnPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('return.hero.title')}</h1>
          <p className="text-xl md:text-2xl">
            {t('return.hero.subtitle')}
          </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border-2 border-blue-200 dark:border-blue-700">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('return.products.computers.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.products.computers.desc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border-2 border-green-200 dark:border-green-700">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('return.products.monitors.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.products.monitors.desc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border-2 border-purple-200 dark:border-purple-700">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('return.products.accessories.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.products.accessories.desc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border-2 border-orange-200 dark:border-orange-700">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('return.products.software.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.products.software.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Return Policy */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('return.services.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('return.services.subtitle')}
            </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('return.services.setup.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.services.setup.desc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('return.services.support.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.services.support.desc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('return.services.network.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('return.services.network.desc')}</p>
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
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('return.conditions.computers.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('return.conditions.computers.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('return.conditions.accessories.title')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{t('return.conditions.accessories.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-primary-50 dark:bg-gray-800 rounded-lg p-8 border border-primary-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('return.contact.title')}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('return.contact.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:pixelpad77@gmail.com" className="btn-primary">
                  {t('return.contact.email')}
                </a>
                <a href="tel:0779318061" className="btn-secondary">
                  {t('return.contact.phone')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}