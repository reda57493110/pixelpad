'use client'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function TermsPage() {
  const { t } = useLanguage()
  
  const navItems = [
    { id: 'overview', labelKey: 'terms.overview' },
    { id: 'accounts', labelKey: 'terms.accounts' },
    { id: 'orders', labelKey: 'terms.orders' },
    { id: 'returns', labelKey: 'terms.returns' },
    { id: 'acceptable', labelKey: 'terms.acceptableUse' },
    { id: 'privacy', labelKey: 'terms.privacy' },
    { id: 'law', labelKey: 'terms.governingLaw' },
    { id: 'changes', labelKey: 'terms.changes' },
    { id: 'contact', labelKey: 'terms.contact' }
  ]

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
          <section id="overview" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('terms.overviewTitle')}</h2>
            <p>{t('terms.overviewText')}</p>
          </section>

          <section id="accounts" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('terms.accountsTitle')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.accountsItem1')}</li>
              <li>{t('terms.accountsItem2')}</li>
              <li>{t('terms.accountsItem3')}</li>
            </ul>
          </section>

          <section id="orders" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('terms.ordersTitle')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.ordersItem1')}</li>
              <li>{t('terms.ordersItem2')}</li>
              <li>{t('terms.ordersItem3')}</li>
            </ul>
          </section>

          <section id="returns" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('terms.returnsTitle')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.returnsItem1')}</li>
              <li>{t('terms.returnsItem2')}</li>
              <li>
                {t('terms.returnsItem3')}{' '}
                <Link href="/contacts" className="text-primary-600 dark:text-primary-400 underline">{t('terms.returnsContactLink')}</Link>.
              </li>
            </ul>
          </section>

          <section id="acceptable" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('terms.acceptableTitle')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('terms.acceptableItem1')}</li>
              <li>{t('terms.acceptableItem2')}</li>
              <li>{t('terms.acceptableItem3')}</li>
            </ul>
          </section>

          <section id="privacy" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('terms.privacyTitle')}</h2>
            <p>
              {t('terms.privacyText')}{' '}
              <Link href="/privacy" className="text-primary-600 dark:text-primary-400 underline">{t('terms.privacyPolicyLink')}</Link>,{' '}
              {t('terms.privacyText2')}
            </p>
          </section>

          <section id="law" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('terms.lawTitle')}</h2>
            <p>{t('terms.lawText')}</p>
          </section>

          <section id="changes" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('terms.changesTitle')}</h2>
            <p>{t('terms.changesText')}</p>
          </section>

          <section id="contact" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('terms.contactTitle')}</h2>
            <p>
              {t('terms.contactText')}{' '}
              <Link href="/contacts" className="text-primary-600 dark:text-primary-400 underline">{t('terms.contactLink')}</Link>{' '}
              {t('terms.contactText2')}
            </p>
          </section>

          {/* Back to top */}
          <div className="pt-2">
            <a href="#overview" className="inline-block text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:shadow">{t('terms.backToTop')}</a>
          </div>
        </div>
      </div>
    </div>
  )
}


