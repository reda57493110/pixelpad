'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useMemo, lazy, Suspense } from 'react'

// Static page - no dynamic data
export const dynamic = 'force-static'

// Lazy load FAQSchema to improve initial page load
const FAQSchema = lazy(() => import('@/components/FAQSchema'))

export default function FAQPage() {
  const { t, language } = useLanguage()
  
  // Use useMemo instead of useState + useEffect for better performance
  const faqs = useMemo(() => {
    return [
      { question: t('faq.basic.what.question'), answer: t('faq.basic.what.answer') },
      { question: t('faq.basic.location.question'), answer: t('faq.basic.location.answer') },
      { question: t('faq.basic.contact.question'), answer: t('faq.basic.contact.answer') },
      { question: t('faq.products.types.question'), answer: t('faq.products.types.answer') },
      { question: t('faq.products.brands.question'), answer: t('faq.products.brands.answer') },
      { question: t('faq.products.pricing.question'), answer: t('faq.products.pricing.answer') },
      { question: t('faq.services.office.question'), answer: t('faq.services.office.answer') },
      { question: t('faq.services.time.question'), answer: t('faq.services.time.answer') },
      { question: t('faq.services.remote.question'), answer: t('faq.services.remote.answer') },
      { question: t('faq.warranty.new.question'), answer: t('faq.warranty.new.answer') },
      { question: t('faq.warranty.used.question'), answer: t('faq.warranty.used.answer') },
      { question: t('faq.warranty.repair.question'), answer: t('faq.warranty.repair.answer') },
      { question: t('faq.security.protection.question'), answer: t('faq.security.protection.answer') },
      { question: t('faq.security.sharing.question'), answer: t('faq.security.sharing.answer') },
    ]
  }, [t, language])
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative pt-20 sm:pt-20 md:pt-24 lg:pt-16">
      <Suspense fallback={null}>
        <FAQSchema faqs={faqs} />
      </Suspense>
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
              {t('faq.hero.title')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-base xl:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-5 lg:mb-4 animate-in slide-in-from-bottom duration-1000 delay-500 px-2">
              {t('faq.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Getting Started */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('faq.basic.title')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.basic.what.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.basic.what.answer')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.basic.location.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.basic.location.answer')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.basic.contact.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.basic.contact.answer')}
                  </p>
                </div>

              </div>
            </div>

            {/* Products & Pricing */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('faq.products.title')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.products.types.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.products.types.answer')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.products.brands.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.products.brands.answer')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.products.pricing.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.products.pricing.answer')}
                  </p>
                </div>

              </div>
            </div>

            {/* Services & Setup */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('faq.services.title')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.services.office.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.services.office.answer')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.services.time.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.services.time.answer')}
                  </p>
                </div>


                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.services.remote.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.services.remote.answer')}
                  </p>
                </div>
              </div>
            </div>

            {/* Warranty & Support */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('faq.warranty.title')}</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.warranty.new.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.warranty.new.answer')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.warranty.used.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.warranty.used.answer')}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('faq.warranty.repair.question')}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('faq.warranty.repair.answer')}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Data Security */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('faq.security.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('faq.security.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('faq.security.protection.question')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('faq.security.protection.answer')}
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• {t('faq.security.protection.list1')}</li>
                <li>• {t('faq.security.protection.list2')}</li>
                <li>• {t('faq.security.protection.list3')}</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('faq.security.sharing.question')}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('faq.security.sharing.answer')}
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• {t('faq.security.sharing.list1')}</li>
                <li>• {t('faq.security.sharing.list2')}</li>
                <li>• {t('faq.security.sharing.list3')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('faq.contact.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t('faq.contact.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:pixelpad77@gmail.com" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                {t('faq.contact.email')}
              </a>
              <a href="tel:0779318061" className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-500 dark:hover:border-primary-500 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                {t('faq.contact.phone')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}