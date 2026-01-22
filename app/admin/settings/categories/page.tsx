'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { authenticatedFetch } from '@/lib/api-client'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
  nameFr?: string
  nameAr?: string
  slug: string
  description?: string
  icon?: string
  order: number
  isActive: boolean
}

export default function CategoriesListPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const response = await authenticatedFetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmMessage = t('admin.deleteConfirm') || 'Are you sure you want to delete this category?'
    if (typeof window !== 'undefined' && window.confirm(confirmMessage)) {
      try {
        const response = await authenticatedFetch(`/api/categories/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await loadCategories()
        } else {
          const error = await response.json()
          if (typeof window !== 'undefined') {
            window.alert(error.error || t('admin.errorDeleting') || 'Failed to delete category')
          }
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        if (typeof window !== 'undefined') {
          window.alert(t('admin.errorDeleting') || 'Failed to delete category')
        }
      }
    }
  }

  const filteredCategories = categories.filter(cat => {
    const search = searchQuery.toLowerCase()
    return cat.name.toLowerCase().includes(search) ||
           cat.slug.toLowerCase().includes(search) ||
           (cat.description && cat.description.toLowerCase().includes(search))
  })

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.settings.categories') || 'Categories'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.settings.manageCategories') || 'Manage product categories'} ({categories.length})
          </p>
        </div>
        <Link
          href="/admin/settings/categories/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          {t('admin.settings.addCategory') || 'Add Category'}
        </Link>
      </div>

      {/* Search */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.settings.searchCategories') || 'Search categories...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Categories Table - desktop */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.settings.categoryName') || 'Name'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.settings.slug') || 'Slug'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.settings.order') || 'Order'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.settings.status') || 'Status'}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.products.actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    {t('admin.settings.noCategories') || 'No categories found'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {category.description.substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {category.slug}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {category.order}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {category.isActive ? (t('admin.active') || 'Active') : (t('admin.inactive') || 'Inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/settings/categories/${category.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={t('admin.products.view') || 'View'}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/settings/categories/${category.id}/edit`}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title={t('admin.products.edit') || 'Edit'}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t('admin.products.delete') || 'Delete'}
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

      {/* Categories Cards - mobile */}
      <div className="grid gap-3 md:hidden">
        {filteredCategories.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 text-center text-gray-500 text-sm">
            {t('admin.settings.noCategories') || 'No categories found'}
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{category.name}</div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{category.slug}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  category.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {category.isActive ? (t('admin.active') || 'Active') : (t('admin.inactive') || 'Inactive')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.settings.order') || 'Order'}</div>
                  <div className="text-sm">{category.order}</div>
                </div>
                {category.description && (
                  <div className="col-span-2 text-[11px] text-gray-600 dark:text-gray-400">
                    {category.description.substring(0, 80)}{category.description.length > 80 ? '...' : ''}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/settings/categories/${category.id}`}
                  className="px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-xs font-medium"
                >
                  {t('admin.products.view') || 'View'}
                </Link>
                <Link
                  href={`/admin/settings/categories/${category.id}/edit`}
                  className="px-3 py-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors text-xs font-medium"
                >
                  {t('admin.products.edit') || 'Edit'}
                </Link>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title={t('admin.products.delete') || 'Delete'}
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

