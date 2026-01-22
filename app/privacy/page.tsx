'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMemo, memo } from 'react'

// Memoize sections to prevent unnecessary re-renders
const PrivacySection = memo(({ id, titleKey, children }: { id: string, titleKey: string, children: React.ReactNode }) => {
  const { t } = useLanguage()
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(titleKey)}</h2>
      {children}
    </section>
  )
})
PrivacySection.displayName = 'PrivacySection'

export default function PrivacyPage() {
  const { t } = useLanguage()
  
  // Memoize navItems to avoid recreating on every render
  const navItems = useMemo(() => [
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
  ], [])

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
          <PrivacySection id="intro" titleKey="privacy.introTitle">
            <p>{t('privacy.introText')}</p>
          </PrivacySection>

          <PrivacySection id="data" titleKey="privacy.dataTitle">
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.dataItem1')}</li>
              <li>{t('privacy.dataItem2')}</li>
              <li>{t('privacy.dataItem3')}</li>
            </ul>
          </PrivacySection>

          <PrivacySection id="use" titleKey="privacy.useTitle">
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.useItem1')}</li>
              <li>{t('privacy.useItem2')}</li>
              <li>{t('privacy.useItem3')}</li>
            </ul>
          </PrivacySection>

          <PrivacySection id="legal" titleKey="privacy.legalTitle">
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('privacy.legalItem1')}</li>
              <li>{t('privacy.legalItem2')}</li>
              <li>{t('privacy.legalItem3')}</li>
              <li>{t('privacy.legalItem4')}</li>
            </ul>
          </PrivacySection>

          <PrivacySection id="share" titleKey="privacy.shareTitle">
            <p>{t('privacy.shareText')}</p>
          </PrivacySection>

          <PrivacySection id="security" titleKey="privacy.securityTitle">
            <p>{t('privacy.securityText')}</p>
          </PrivacySection>

          <PrivacySection id="retention" titleKey="privacy.retentionTitle">
            <p>{t('privacy.retentionText')}</p>
          </PrivacySection>

          <PrivacySection id="rights" titleKey="privacy.rightsTitle">
            <p>
              {t('privacy.rightsText')}{' '}
              <Link href="/contacts" className="text-primary-600 dark:text-primary-400 underline">{t('privacy.rightsContactLink')}</Link>.
            </p>
          </PrivacySection>

          <PrivacySection id="cookies" titleKey="privacy.cookiesTitle">
            <p>{t('privacy.cookiesText')}</p>
          </PrivacySection>

          <PrivacySection id="changes" titleKey="privacy.changesTitle">
            <p>{t('privacy.changesText')}</p>
          </PrivacySection>

          <PrivacySection id="contact" titleKey="privacy.contactTitle">
            <p>
              {t('privacy.contactText')}{' '}
              <Link href="/contacts" className="text-primary-600 dark:text-primary-400 underline">{t('privacy.contactLink')}</Link>.
            </p>
          </PrivacySection>

          {/* Back to top */}
          <div className="pt-2">
            <a href="#intro" className="inline-block text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:shadow">{t('privacy.backToTop')}</a>
          </div>
        </div>
      </div>
    </div>
  )
}


