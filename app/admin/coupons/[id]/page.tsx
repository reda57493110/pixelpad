'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllCoupons } from '@/lib/coupons'
import { Coupon } from '@/lib/coupons'
import {
  ArrowLeftIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'

export default function ViewCouponPage() {
  const params = useParams()
  const { t } = useLanguage()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadCoupon(params.id as string)
    }
  }, [params.id])

  const loadCoupon = async (id: string) => {
    try {
      setIsLoading(true)
      const coupons = await getAllCoupons()
      const found = coupons.find(c => c.id === id)
      setCoupon(found || null)
    } catch (error) {
      console.error('Error loading coupon:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  if (!coupon) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('admin.coupons.notFound')}</p>
        <Link href="/admin/coupons" className="mt-4 inline-block text-blue-600 hover:underline">
          {t('admin.coupons.backToList')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/coupons"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
              {coupon.code}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.coupons.couponDetails')}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/coupons/${coupon.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
        >
          <PencilIcon className="w-5 h-5" />
          {t('admin.coupons.edit')}
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('admin.coupons.discount')}
            </label>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {coupon.type === 'percent' 
                ? `${coupon.discountPercent}%`
                : `${coupon.discountAmount} DH`}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('admin.coupons.status')}
            </label>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              coupon.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {coupon.isActive ? t('admin.coupons.active') : t('admin.coupons.inactive')}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('admin.coupons.validFrom')}
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(coupon.validFrom).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('admin.coupons.validUntil')}
            </label>
            <p className="text-gray-900 dark:text-white">
              {new Date(coupon.validUntil).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('admin.coupons.usage')}
            </label>
            <p className="text-gray-900 dark:text-white">
              {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
            </p>
          </div>
          {coupon.minPurchase && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('admin.coupons.minPurchase')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {coupon.minPurchase} DH
              </p>
            </div>
          )}
          {coupon.maxDiscount && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('admin.coupons.maxDiscount')}
              </label>
              <p className="text-gray-900 dark:text-white">
                {coupon.maxDiscount} DH
              </p>
            </div>
          )}
        </div>
        {coupon.description && (
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t('admin.coupons.description')}
            </label>
            <p className="text-gray-900 dark:text-white">{coupon.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

