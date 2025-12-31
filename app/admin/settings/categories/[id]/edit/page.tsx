'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { authenticatedFetch } from '@/lib/api-client'
import {
  ArrowLeftIcon,
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

export default function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    nameFr: '',
    nameAr: '',
    slug: '',
    description: '',
    descriptionFr: '',
    descriptionAr: '',
    icon: '',
    order: 0,
    isActive: true,
  })

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
        setFormData({
          name: data.name || '',
          nameFr: data.nameFr || '',
          nameAr: data.nameAr || '',
          slug: data.slug || '',
          description: data.description || '',
          descriptionFr: data.descriptionFr || '',
          descriptionAr: data.descriptionAr || '',
          icon: data.icon || '',
          order: data.order || 0,
          isActive: data.isActive !== false,
        })
      }
    } catch (error) {
      console.error('Error loading category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotification(null)

    if (!formData.name || !formData.slug) {
      setNotification({ message: t('admin.fillRequired') || 'Please fill all required fields', type: 'error' })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await authenticatedFetch(`/api/categories/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        setNotification({ message: error.error || t('admin.errorUpdating') || 'Failed to update category', type: 'error' })
        setIsSubmitting(false)
        return
      }

      setNotification({ message: t('admin.categoryUpdated') || 'Category updated successfully', type: 'success' })
      setTimeout(() => {
        router.push('/admin/settings/categories')
      }, 1000)
    } catch (error: any) {
      setNotification({ message: error?.message || t('admin.errorUpdating') || 'Failed to update category', type: 'error' })
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/settings/categories"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.settings.editCategory') || 'Edit Category'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.settings.updateCategoryInfo') || 'Update category information'}
          </p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg ${
          notification.type === 'error' 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
            : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('admin.products.basicInfo') || 'Basic Information'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.settings.categoryName') || 'Name'} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.settings.slug') || 'Slug'} *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.settings.description') || 'Description'}
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.settings.icon') || 'Icon URL'}
              </label>
              <input
                type="url"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.settings.order') || 'Display Order'}
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.settings.status') || 'Status'}
                </label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">{t('admin.active') || 'Active'}</option>
                  <option value="inactive">{t('admin.inactive') || 'Inactive'}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Translations */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('admin.settings.translations') || 'Translations'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.products.nameFr') || 'Name (French)'}
              </label>
              <input
                type="text"
                value={formData.nameFr}
                onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name (Arabic)
              </label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.products.descriptionFr') || 'Description (French)'}
              </label>
              <textarea
                rows={3}
                value={formData.descriptionFr}
                onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Arabic)
              </label>
              <textarea
                rows={3}
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (t('admin.saving') || 'Saving...') : (t('admin.settings.updateCategory') || 'Update Category')}
          </button>
          <Link
            href="/admin/settings/categories"
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('admin.cancel') || 'Cancel'}
          </Link>
        </div>
      </form>
    </div>
  )
}

