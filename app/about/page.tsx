'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 hero-section relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-green-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          {/* Marketing Badge */}
          <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg animate-bounce">
            <span className="animate-spin">🏆</span>
            <span className="mx-2">#1 TECH STORE IN MOROCCO - 10,000+ HAPPY CUSTOMERS!</span>
            <span className="animate-spin">🏆</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              {t('about.hero.title')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            {t('about.hero.subtitle')}
          </p>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <span className="text-sm font-bold">✅ 10,000+ Customers</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <span className="text-sm font-bold">⭐ 4.9/5 Rating</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <span className="text-sm font-bold">⚡ Fast Delivery</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <span className="text-sm font-bold">🛡️ 2-Year Warranty</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('about.mission.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              {t('about.mission.desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('about.quality.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.quality.desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('about.support.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.support.desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('about.satisfaction.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.satisfaction.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company History */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('about.story.title')}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('about.story.desc1')}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('about.story.desc2')}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">1000+</div>
                  <div className="text-gray-600 dark:text-gray-300">{t('about.stats.customers')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">4.8/5</div>
                  <div className="text-gray-600 dark:text-gray-300">{t('about.stats.rating')}</div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('about.why.title')}</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('about.why.warranty')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('about.why.support')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('about.why.shipping')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('about.why.returns')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{t('about.why.pricing')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('about.team.title')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('about.team.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('about.team.sarah.name')}</h3>
              <p className="text-primary-600 dark:text-primary-400 mb-2">{t('about.team.sarah.position')}</p>
              <p className="text-gray-600 dark:text-gray-300">{t('about.team.sarah.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('about.team.mike.name')}</h3>
              <p className="text-primary-600 dark:text-primary-400 mb-2">{t('about.team.mike.position')}</p>
              <p className="text-gray-600 dark:text-gray-300">{t('about.team.mike.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{t('about.team.emily.name')}</h3>
              <p className="text-primary-600 dark:text-primary-400 mb-2">{t('about.team.emily.position')}</p>
              <p className="text-gray-600 dark:text-gray-300">{t('about.team.emily.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


