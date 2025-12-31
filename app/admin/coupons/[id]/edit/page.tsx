'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { getAllCoupons, updateCoupon } from '@/lib/coupons'
import { Coupon } from '@/lib/coupons'
import {
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'

export default function EditCouponPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<Coupon>>({})

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
      if (found) {
        setCoupon(found)
        setFormData({
          code: found.code,
          discountPercent: found.discountPercent,
          discountAmount: found.discountAmount,
          type: found.type,
          minPurchase: found.minPurchase,
          maxDiscount: found.maxDiscount,
          validFrom: found.validFrom.split('T')[0],
          validUntil: found.validUntil.split('T')[0],
          usageLimit: found.usageLimit,
          isActive: found.isActive,
          description: found.description,
        })
      }
    } catch (error) {
      console.error('Error loading coupon:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coupon) return

    setIsSubmitting(true)
    try {
      await updateCoupon(coupon.id, formData as Partial<Coupon>)
      window.dispatchEvent(new Event('pixelpad_coupons_changed'))
      router.push(`/admin/coupons/${coupon.id}`)
    } catch (error) {
      console.error('Error updating coupon:', error)
      if (typeof window !== 'undefined') {
        window.alert(t('admin.errorUpdating') || 'Failed to update coupon')
      }
    } finally {
      setIsSubmitting(false)
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
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/coupons/${params.id}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.coupons.editCoupon')}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.coupons.code')} *
            </label>
            <input
              type="text"
              required
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.coupons.type')} *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percent' | 'fixed' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="percent">{t('admin.coupons.percent')}</option>
              <option value="fixed">{t('admin.coupons.amount')}</option>
            </select>
          </div>
          {formData.type === 'percent' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.coupons.discountPercent')} *
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={formData.discountPercent || 0}
                onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.coupons.discountAmount')} (DH) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.discountAmount || 0}
                onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.coupons.validFrom')} *
              </label>
              <input
                type="date"
                required
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.coupons.validUntil')} *
              </label>
              <input
                type="date"
                required
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('admin.coupons.usageLimit')}
            </label>
            <input
              type="number"
              min="0"
              value={formData.usageLimit || 0}
              onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              {t('admin.coupons.isActive')}
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link
            href={`/admin/coupons/${params.id}`}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('admin.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('admin.saving') : t('admin.coupons.updateCoupon')}
          </button>
        </div>
      </form>
    </div>
  )
}

