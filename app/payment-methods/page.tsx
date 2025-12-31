"use client"

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PaymentMethodsPage() {
  const { t } = useLanguage()
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{t('paymentMethods.title')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          {t('paymentMethods.description')}
        </p>
        <div className="flex gap-3">
          <Link href="/products" className="px-4 py-2 rounded bg-blue-600 text-white">{t('paymentMethods.browseProducts')}</Link>
          <Link href="/account/orders" className="px-4 py-2 rounded border">{t('paymentMethods.goToCart')}</Link>
        </div>
      </div>
    </div>
  )
}


