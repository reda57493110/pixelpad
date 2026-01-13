'use client'
import { useLanguage } from '@/contexts/LanguageContext'

// Static page - no dynamic data
export const dynamic = 'force-static'

export default function WarrantyPage() {
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
              {t('warranty.hero.title')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-5 lg:mb-4 animate-in slide-in-from-bottom duration-1000 delay-500 px-2">
              {t('warranty.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Warranty Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('warranty.overview.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              {t('warranty.overview.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('warranty.new.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('warranty.new.desc')}</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• {t('warranty.new.hardware')}</li>
                <li>• {t('warranty.new.manufacturing')}</li>
                <li>• {t('warranty.new.battery')}</li>
                <li>• {t('warranty.new.support')}</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('warranty.used.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('warranty.used.desc')}</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• {t('warranty.used.hardware')}</li>
                <li>• {t('warranty.used.functionality')}</li>
                <li>• {t('warranty.used.cleaning')}</li>
                <li>• {t('warranty.used.support')}</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('warranty.monitors.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('warranty.monitors.desc')}</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• {t('warranty.monitors.pixels')}</li>
                <li>• {t('warranty.monitors.backlight')}</li>
                <li>• {t('warranty.monitors.display')}</li>
                <li>• {t('warranty.monitors.color')}</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('warranty.accessories.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('warranty.accessories.desc')}</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• {t('warranty.accessories.mechanical')}</li>
                <li>• {t('warranty.accessories.connectivity')}</li>
                <li>• {t('warranty.accessories.buttons')}</li>
                <li>• {t('warranty.accessories.cables')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('warranty.covered.title')}</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('warranty.covered.hardware.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{t('warranty.covered.hardware.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('warranty.covered.components.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{t('warranty.covered.components.desc')}</p>
                  </div>
                </div>


                <div className="flex items-start">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('warranty.covered.display.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{t('warranty.covered.display.desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('warranty.notCovered.title')}</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('warranty.notCovered.physical.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{t('warranty.notCovered.physical.desc')}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('warranty.notCovered.software.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{t('warranty.notCovered.software.desc')}</p>
                  </div>
                </div>


                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('warranty.notCovered.modifications.title')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{t('warranty.notCovered.modifications.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Claims Process */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('warranty.process.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('warranty.process.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('warranty.process.step1.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('warranty.process.step1.desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('warranty.process.step2.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('warranty.process.step2.desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('warranty.process.step3.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('warranty.process.step3.desc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{t('warranty.process.step4.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">{t('warranty.process.step4.desc')}</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('warranty.claim.title')}</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('warranty.claim.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:pixelpad77@gmail.com" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                  {t('warranty.claim.email')}
                </a>
                <a href="tel:0779318061" className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-500 dark:hover:border-primary-500 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                  {t('warranty.claim.phone')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}




