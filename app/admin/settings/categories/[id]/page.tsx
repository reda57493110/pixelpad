'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { authenticatedFetch } from '@/lib/api-client'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
  nameFr?: string
  nameAr?: string
  slug: string
  description?: string
  descriptionFr?: string
  descriptionAr?: string
  icon?: string
  order: number
  isActive: boolean
}

export default function ViewCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadCategory(params.id as string)
    }
  }, [params.id])

  const loadCategory = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await authenticatedFetch(`/api/categories/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCategory(data)
      }
    } catch (error) {
      console.error('Error loading category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmMessage = t('admin.deleteConfirm') || 'Are you sure you want to delete this category?'
    if (typeof window !== 'undefined' && window.confirm(confirmMessage)) {
      try {
        const response = await authenticatedFetch(`/api/categories/${params.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          router.push('/admin/settings/categories')
        } else {
          const error = await response.json()
          alert(error.error || t('admin.errorDeleting') || 'Failed to delete category')
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        alert(t('admin.errorDeleting') || 'Failed to delete category')
      }
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('admin.settings.categoryNotFound') || 'Category not found'}</p>
        <Link href="/admin/settings/categories" className="mt-4 inline-block text-blue-600 hover:underline">
          {t('admin.settings.backToCategories') || 'Back to Categories'}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/settings/categories"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.settings.categoryDetails') || 'Category Details'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/settings/categories/${category.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
            {t('admin.products.edit') || 'Edit'}
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
            {t('admin.products.delete') || 'Delete'}
          </button>
        </div>
      </div>

      {/* Category Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('admin.products.basicInfo') || 'Basic Information'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('admin.settings.categoryName') || 'Name'}
              </label>
              <p className="text-base text-gray-900 dark:text-white">{category.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('admin.settings.slug') || 'Slug'}
              </label>
              <p className="text-base text-gray-900 dark:text-white">{category.slug}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('admin.settings.order') || 'Display Order'}
              </label>
              <p className="text-base text-gray-900 dark:text-white">{category.order}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('admin.settings.status') || 'Status'}
              </label>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                category.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {category.isActive ? (t('admin.active') || 'Active') : (t('admin.inactive') || 'Inactive')}
              </span>
            </div>
            {category.description && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.settings.description') || 'Description'}
                </label>
                <p className="text-base text-gray-900 dark:text-white">{category.description}</p>
              </div>
            )}
            {category.icon && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.settings.icon') || 'Icon'}
                </label>
                <img src={category.icon} alt={category.name} className="w-16 h-16 object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Translations */}
        {(category.nameFr || category.nameAr || category.descriptionFr || category.descriptionAr) && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.settings.translations') || 'Translations'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.nameFr && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.products.nameFr') || 'Name (French)'}
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">{category.nameFr}</p>
                </div>
              )}
              {category.nameAr && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Name (Arabic)
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">{category.nameAr}</p>
                </div>
              )}
              {category.descriptionFr && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.products.descriptionFr') || 'Description (French)'}
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">{category.descriptionFr}</p>
                </div>
              )}
              {category.descriptionAr && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Description (Arabic)
                  </label>
                  <p className="text-base text-gray-900 dark:text-white">{category.descriptionAr}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

