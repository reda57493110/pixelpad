'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { getProductById, deleteProduct } from '@/lib/products'
import { getAllCategories, getCategoryById, Category } from '@/lib/categories'
import { Product } from '@/types'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

export default function ViewProductPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string)
    }
  }, [params.id])

  const loadProduct = async (id: string) => {
    try {
      setIsLoading(true)
      const data = await getProductById(id)
      setProduct(data || null)
      
      // Load category if product has category
      if (data?.category) {
        // Try to get category by ID first, then by slug
        const cat = await getCategoryById(data.category) || 
                   (await getAllCategories(true)).find(c => c.slug === data.category)
        setCategory(cat || null)
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (typeof window !== 'undefined' && window.confirm(t('admin.deleteConfirm'))) {
      try {
        await deleteProduct(params.id as string)
        window.dispatchEvent(new Event('pixelpad_products_changed'))
        router.push('/admin/products')
      } catch (error) {
        console.error('Error deleting product:', error)
        alert(t('admin.errorDeleting'))
      }
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('admin.products.notFound')}</p>
        <Link href="/admin/products" className="mt-4 inline-block text-blue-600 hover:underline">
          {t('admin.products.backToList')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.products.productDetails')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors text-sm"
          >
            <PencilIcon className="w-5 h-5" />
            {t('admin.products.edit')}
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-sm"
          >
            <TrashIcon className="w-5 h-5" />
            {t('admin.products.delete')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              {t('admin.products.image')}
            </h3>
            {product.image ? (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">{t('admin.products.noImage')}</span>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              {t('admin.products.basicInfo')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.products.name')}
                </label>
                <p className="text-gray-900 dark:text-white">{product.name}</p>
              </div>
              {product.nameFr && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.products.nameFr')}
                  </label>
                  <p className="text-gray-900 dark:text-white">{product.nameFr}</p>
                </div>
              )}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.products.description')}
                </label>
                <p className="text-gray-900 dark:text-white">{product.description}</p>
              </div>
              {product.descriptionFr && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.products.descriptionFr')}
                  </label>
                  <p className="text-gray-900 dark:text-white">{product.descriptionFr}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.products.category')}
                  </label>
                  <p className="text-gray-900 dark:text-white">{category?.name || product.category}</p>
                </div>
                {product.badge && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {t('admin.products.badge')}
                    </label>
                    <p className="text-gray-900 dark:text-white">{product.badge}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                {t('admin.products.features')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-xs sm:text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                {t('admin.products.specifications')}
              </h3>
              <div className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1.5 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{key}:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
              {t('admin.products.pricing')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.products.price')}
                </label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {product.price.toFixed(2)} DH
                </p>
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.products.originalPrice')}
                  </label>
                  <p className="text-lg text-gray-600 dark:text-gray-400 line-through">
                    {product.originalPrice.toFixed(2)} DH
                  </p>
                  {product.discount && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {product.discount}% {t('admin.products.discount')}
                    </p>
                  )}
                </div>
              )}
              {product.deliveryPrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.products.deliveryPrice')}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {product.deliveryPrice.toFixed(2)} DH
                  </p>
                </div>
              )}
              {product.costPrice && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.products.costPrice')}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {product.costPrice.toFixed(2)} DH
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stock & Stats */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.products.stockStats')}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.products.stockQuantity')}
                </label>
                <p className={`text-xl font-bold ${
                  (product.stockQuantity || 0) > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {product.stockQuantity || 0}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.products.soldQuantity')}
                </label>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {product.soldQuantity || 0}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t('admin.products.status')}
                </label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  product.inStock 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {product.inStock ? t('admin.products.inStock') : t('admin.products.outOfStock')}
                </span>
              </div>
              {product.rating && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('admin.products.rating')}
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {product.rating} / 5 ({product.reviews || 0} {t('admin.products.reviews')})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.products.visibility')}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Hero (Homepage)
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.showInHero 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {product.showInHero ? t('admin.yes') : t('admin.no')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('admin.products.showOnHomeCarousel')}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.showOnHomeCarousel 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {product.showOnHomeCarousel ? t('admin.yes') : t('admin.no')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  New Arrivals
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.showInNewArrivals 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {product.showInNewArrivals ? t('admin.yes') : t('admin.no')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Best Sellers
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.showInBestSellers 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {product.showInBestSellers ? t('admin.yes') : t('admin.no')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Special Offers
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.showInSpecialOffers 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {product.showInSpecialOffers ? t('admin.yes') : t('admin.no')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Trending Now
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  product.showInTrending 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {product.showInTrending ? t('admin.yes') : t('admin.no')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

