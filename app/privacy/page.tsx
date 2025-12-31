'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PrivacyPage() {
  const { t } = useLanguage()
  
  const navItems = [
    { id: 'intro', labelKey: 'privacy.introduction' },
    { id: 'data', labelKey: 'privacy.dataWeCollect' },
    { id: 'use', labelKey: 'privacy.howWeUseData' },
    { id: 'share', labelKey: 'privacy.sharing' },
    { id: 'legal', labelKey: 'privacy.legalBasis' },
    { id: 'security', labelKey: 'privacy.security' },
    { id: 'retention', labelKey: 'privacy.retention' },
    { id: 'rights', labelKey: 'privacy.yourRights' },
    { id: 'cookies', labelKey: 'privacy.cookies' },
    { id: 'changes', labelKey: 'privacy.changes' },
    { id: 'contact', labelKey: 'privacy.contact' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-primary-600 dark:bg-primary-700 text-white pt-32 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{t('privacy.title')}</h1>
          <p className="opacity-90">{t('privacy.lastUpdated')}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Quick nav */}
        <div className="mb-8 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="text-xs sm:text-sm px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:shadow transition">
              {t(item.labelKey)}
            </a>
          ))}
        </div>

        <div className="space-y-10 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section id="intro" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.introTitle')}</h2>
            <p>{t('privacy.introText')}</p>
          </section>

          <section id="data" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.dataTitle')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.dataItem1')}</li>
              <li>{t('privacy.dataItem2')}</li>
              <li>{t('privacy.dataItem3')}</li>
            </ul>
          </section>

          <section id="use" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.useTitle')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.useItem1')}</li>
              <li>{t('privacy.useItem2')}</li>
              <li>{t('privacy.useItem3')}</li>
            </ul>
          </section>

          <section id="legal" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.legalTitle')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.legalItem1')}</li>
              <li>{t('privacy.legalItem2')}</li>
              <li>{t('privacy.legalItem3')}</li>
              <li>{t('privacy.legalItem4')}</li>
            </ul>
          </section>

          <section id="share" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.shareTitle')}</h2>
            <p>{t('privacy.shareText')}</p>
          </section>

          <section id="security" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.securityTitle')}</h2>
            <p>{t('privacy.securityText')}</p>
          </section>

          <section id="retention" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.retentionTitle')}</h2>
            <p>{t('privacy.retentionText')}</p>
          </section>

          <section id="rights" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.rightsTitle')}</h2>
            <p>
              {t('privacy.rightsText')}{' '}
              <Link href="/contacts" className="text-primary-600 dark:text-primary-400 underline">{t('privacy.rightsContactLink')}</Link>.
            </p>
          </section>

          <section id="cookies" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.cookiesTitle')}</h2>
            <p>{t('privacy.cookiesText')}</p>
          </section>

          <section id="changes" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.changesTitle')}</h2>
            <p>{t('privacy.changesText')}</p>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('privacy.contactTitle')}</h2>
            <p>
              {t('privacy.contactText')}{' '}
              <Link href="/contacts" className="text-primary-600 dark:text-primary-400 underline">{t('privacy.contactLink')}</Link>.
            </p>
          </section>

          {/* Back to top */}
          <div className="pt-2">
            <a href="#intro" className="inline-block text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:shadow">{t('privacy.backToTop')}</a>
          </div>
        </div>
      </div>
    </div>
  )
}


