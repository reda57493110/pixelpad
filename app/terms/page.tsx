'use client'

// Static page - no dynamic data
export const dynamic = 'force-static'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMemo, memo } from 'react'

// Memoize sections to prevent unnecessary re-renders
const TermsSection = memo(({ id, titleKey, children }: { id: string, titleKey: string, children: React.ReactNode }) => {
  const { t } = useLanguage()
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(titleKey)}</h2>
      {children}
    </section>
  )
})
TermsSection.displayName = 'TermsSection'

export default function TermsPage() {
  const { t } = useLanguage()
  
  // Memoize navItems to avoid recreating on every render
  const navItems = useMemo(() => [
    { id: 'overview', labelKey: 'terms.overview' },
    { id: 'accounts', labelKey: 'terms.accounts' },
    { id: 'orders', labelKey: 'terms.orders' },
    { id: 'returns', labelKey: 'terms.returns' },
    { id: 'acceptable', labelKey: 'terms.acceptableUse' },
    { id: 'privacy', labelKey: 'terms.privacy' },
    { id: 'law', labelKey: 'terms.governingLaw' },
    { id: 'changes', labelKey: 'terms.changes' },
    { id: 'contact', labelKey: 'terms.contact' }
  ], [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-primary-600 dark:bg-primary-700 text-white pt-32 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{t('terms.title')}</h1>
          <p className="opacity-90">{t('terms.lastUpdated')}</p>
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
          <TermsSection id="overview" titleKey="terms.overviewTitle">
            <p>{t('terms.overviewText')}</p>
          </TermsSection>

          <TermsSection id="accounts" titleKey="terms.accountsTitle">
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.accountsItem1')}</li>
              <li>{t('terms.accountsItem2')}</li>
              <li>{t('terms.accountsItem3')}</li>
            </ul>
          </TermsSection>

          <TermsSection id="orders" titleKey="terms.ordersTitle">
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.ordersItem1')}</li>
              <li>{t('terms.ordersItem2')}</li>
              <li>{t('terms.ordersItem3')}</li>
            </ul>
          </TermsSection>

          <TermsSection id="returns" titleKey="terms.returnsTitle">
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.returnsItem1')}</li>
              <li>{t('terms.returnsItem2')}</li>
              <li>
                {t('terms.returnsItem3')}{' '}
                <Link href="/contacts" className="text-primary-600 dark:text-primary-400 underline">{t('terms.returnsContactLink')}</Link>.
              </li>
            </ul>
          </TermsSection>

          <TermsSection id="acceptable" titleKey="terms.acceptableTitle">
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.acceptableItem1')}</li>
              <li>{t('terms.acceptableItem2')}</li>
              <li>{t('terms.acceptableItem3')}</li>
            </ul>
          </TermsSection>

          <TermsSection id="privacy" titleKey="terms.privacyTitle">
            <p>
              {t('terms.privacyText')}{' '}
              <Link href="/privacy" className="text-primary-600 dark:text-primary-400 underline">{t('terms.privacyPolicyLink')}</Link>,{' '}
              {t('terms.privacyText2')}
            </p>
          </TermsSection>

          <TermsSection id="law" titleKey="terms.lawTitle">
            <p>{t('terms.lawText')}</p>
          </TermsSection>

          <TermsSection id="changes" titleKey="terms.changesTitle">
            <p>{t('terms.changesText')}</p>
          </TermsSection>

          <TermsSection id="contact" titleKey="terms.contactTitle">
            <p>
              {t('terms.contactText')}{' '}
              <Link href="/contacts" className="text-primary-600 dark:text-primary-400 underline">{t('terms.contactLink')}</Link>{' '}
              {t('terms.contactText2')}
            </p>
          </TermsSection>

          {/* Back to top */}
          <div className="pt-2">
            <a href="#overview" className="inline-block text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:shadow">{t('terms.backToTop')}</a>
          </div>
        </div>
      </div>
    </div>
  )
}


