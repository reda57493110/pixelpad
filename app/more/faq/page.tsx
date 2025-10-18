'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function FAQPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('faq.hero.title')}</h1>
          <p className="text-xl md:text-2xl">
            {t('faq.hero.subtitle')}
          </p>
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
              <a href="mailto:pixelpad77@gmail.com" className="btn-primary text-lg px-8 py-3">
                {t('faq.contact.email')}
              </a>
              <a href="tel:0779318061" className="btn-secondary text-lg px-8 py-3">
                {t('faq.contact.phone')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}