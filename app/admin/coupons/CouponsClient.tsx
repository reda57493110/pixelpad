'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePermissions } from '@/hooks/usePermissions'
import { getAllCoupons, deleteCoupon } from '@/lib/coupons'
import { Coupon } from '@/lib/coupons'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function CouponsClient() {
  const router = useRouter()
  const { t } = useLanguage()
  const { can } = usePermissions()

  useEffect(() => {
    if (!can('coupons.view')) {
      router.replace('/admin/orders')
    }
  }, [can, router])

  if (!can('coupons.view')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Access denied. Redirecting...</p>
      </div>
    )
  }
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCoupons()
    const handleChange = () => loadCoupons()
    window.addEventListener('pixelpad_coupons_changed', handleChange)
    return () => window.removeEventListener('pixelpad_coupons_changed', handleChange)
  }, [])

  const loadCoupons = async () => {
    try {
      setIsLoading(true)
      const data = await getAllCoupons()
      setCoupons(data)
    } catch (error) {
      console.error('Error loading coupons:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && window.confirm(t('admin.deleteConfirm'))) {
      try {
        await deleteCoupon(id)
        await loadCoupons()
        window.dispatchEvent(new Event('pixelpad_coupons_changed'))
      } catch (error) {
        console.error('Error deleting coupon:', error)
        if (typeof window !== 'undefined') {
          window.alert(t('admin.errorDeleting'))
        }
      }
    }
  }

  const filteredCoupons = coupons.filter(coupon => {
    const search = searchQuery.toLowerCase()
    return coupon.code.toLowerCase().includes(search) ||
      (coupon.description || '').toLowerCase().includes(search)
  })

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.tabs.coupons')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.coupons.manageCoupons')} ({coupons.length})
          </p>
        </div>
        <Link
          href="/admin/coupons/create"
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
        >
          <PlusIcon className="w-5 h-5" />
          {t('admin.coupons.addCoupon')}
        </Link>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.coupons.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.coupons.code')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.coupons.discount')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.coupons.validity')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.coupons.usage')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.coupons.status')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.coupons.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {t('admin.coupons.noCoupons')}
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white">
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {coupon.type === 'percent' 
                        ? `${coupon.discountPercent}%`
                        : `${coupon.discountAmount} DH`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        coupon.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {coupon.isActive ? t('admin.coupons.active') : t('admin.coupons.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/coupons/${coupon.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={t('admin.coupons.view')}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/coupons/${coupon.id}/edit`}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title={t('admin.coupons.edit')}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t('admin.coupons.delete')}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupons Cards - mobile */}
      <div className="grid gap-4 md:hidden">
        {filteredCoupons.length === 0 ? (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 text-center text-gray-500 text-sm">
            {t('admin.coupons.noCoupons')}
          </div>
        ) : (
          filteredCoupons.map((coupon) => (
            <div key={coupon.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{coupon.code}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  coupon.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {coupon.isActive ? t('admin.coupons.active') : t('admin.coupons.inactive')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.coupons.discount')}</div>
                  <div className="text-sm">
                    {coupon.type === 'percent' ? `${coupon.discountPercent}%` : `${coupon.discountAmount} DH`}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.coupons.usage')}</div>
                  <div className="text-sm">{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</div>
                </div>
                {coupon.description && (
                  <div className="col-span-2 text-[11px] text-gray-600 dark:text-gray-400">
                    {coupon.description}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/coupons/${coupon.id}`}
                  className="px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover.bg-blue-900/20 rounded-lg transition-colors text-xs font-medium"
                >
                  {t('admin.coupons.view')}
                </Link>
                <Link
                  href={`/admin/coupons/${coupon.id}/edit`}
                  className="px-3 py-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors text-xs font-medium"
                >
                  {t('admin.coupons.edit')}
                </Link>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title={t('admin.coupons.delete')}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
