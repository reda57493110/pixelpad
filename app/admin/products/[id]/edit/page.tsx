'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { getProductById, updateProduct, getAllProducts } from '@/lib/products'
import { getAllCategories, Category } from '@/lib/categories'
import { Product } from '@/types'
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null)
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    nameFr: '',
    description: '',
    descriptionFr: '',
    price: 0,
    originalPrice: 0,
    deliveryPrice: 0,
    costPrice: 0,
    category: 'laptops',
    image: '',
    inStock: true,
    stockQuantity: 0,
    soldQuantity: 0,
    rating: 0,
    reviews: 0,
    badge: '',
    badgeKey: 'products.badge.hotDeal',
    discount: 0,
    features: [],
    specifications: {},
    showOnHomeCarousel: false,
    showInHero: false,
    showInNewArrivals: false,
    showInBestSellers: false,
    showInSpecialOffers: false,
    showInTrending: false,
    showOnProductPage: true,
    order: 0,
  })

  const [newFeature, setNewFeature] = useState('')
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [productCounts, setProductCounts] = useState({
    hero: 0,
    carousel: 0,
    newArrivals: 0,
    bestSellers: 0,
    specialOffers: 0,
    trending: 0
  })

  // Load categories and product counts
  useEffect(() => {
    const loadData = async () => {
      try {
        setCategoriesLoading(true)
        const [categoriesData, allProducts] = await Promise.all([
          getAllCategories(true), // Only active categories
          getAllProducts()
        ])
        setCategories(categoriesData)
        // Calculate product counts
        setProductCounts({
          hero: allProducts.filter(p => p.showInHero).length,
          carousel: allProducts.filter(p => p.showOnHomeCarousel).length,
          newArrivals: allProducts.filter(p => p.showInNewArrivals).length,
          bestSellers: allProducts.filter(p => p.showInBestSellers).length,
          specialOffers: allProducts.filter(p => p.showInSpecialOffers).length,
          trending: allProducts.filter(p => p.showInTrending).length
        })
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadData()
    // Listen for product changes to update counts
    const handleChange = () => loadData()
    window.addEventListener('pixelpad_products_changed', handleChange)
    return () => window.removeEventListener('pixelpad_products_changed', handleChange)
  }, [])

  // Load product data
  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string)
    }
  }, [params.id])

  const loadProduct = async (id: string) => {
    try {
      setIsLoading(true)
      const product = await getProductById(id)
      if (product) {
        setFormData({
          name: product.name,
          nameFr: product.nameFr || '',
          description: product.description,
          descriptionFr: product.descriptionFr || '',
          price: product.price,
          originalPrice: product.originalPrice || 0,
          deliveryPrice: product.deliveryPrice || 0,
          costPrice: product.costPrice || 0,
          category: product.category,
          image: product.image,
          inStock: product.inStock,
          stockQuantity: product.stockQuantity || 0,
          soldQuantity: product.soldQuantity || 0,
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          badge: product.badge || '',
          badgeKey: product.badgeKey || 'products.badge.hotDeal',
          discount: product.discount || 0,
          features: product.features || [],
          specifications: product.specifications || {},
          showOnHomeCarousel: product.showOnHomeCarousel || false,
          showInHero: product.showInHero || false,
          showInNewArrivals: product.showInNewArrivals || false,
          showInBestSellers: product.showInBestSellers || false,
          showInSpecialOffers: product.showInSpecialOffers || false,
          showInTrending: product.showInTrending || false,
          showOnProductPage: product.showOnProductPage !== false,
          order: product.order || 0,
        })
        setImagePreview(product.image || '')
      }
    } catch (error) {
      console.error('Error loading product:', error)
      setNotification({ message: t('admin.errorLoading') || 'Failed to load product', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setFormData({ ...formData, image: data.url })
      setImagePreview(data.url)
      setNotification({ message: t('admin.imageUploaded') || 'Image uploaded successfully', type: 'success' })
      setTimeout(() => setNotification(null), 3000)
    } catch (error: any) {
      setNotification({ message: error?.message || 'Failed to upload image', type: 'error' })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setNotification({ message: 'Invalid file type. Only images are allowed.', type: 'error' })
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setNotification({ message: 'File too large. Maximum size is 5MB.', type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    handleImageUpload(file)
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()]
      })
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index) || []
    })
  }

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData({
        ...formData,
        specifications: {
          ...(formData.specifications || {}),
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      })
      setNewSpecKey('')
      setNewSpecValue('')
    }
  }

  const removeSpecification = (key: string) => {
    const specs = { ...(formData.specifications || {}) }
    delete specs[key]
    setFormData({ ...formData, specifications: specs })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.price || !formData.image || !formData.category) {
      setNotification({ message: t('admin.fillRequired') || 'Please fill all required fields', type: 'error' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setIsSubmitting(true)
    try {
      // Explicitly include all visibility flags to ensure they're saved
      const productData = {
        ...formData,
        category: formData.category || 'laptops',
        // Explicitly set all visibility flags (use ?? to preserve false values)
        showInHero: formData.showInHero ?? false,
        showOnHomeCarousel: formData.showOnHomeCarousel ?? false,
        showInNewArrivals: formData.showInNewArrivals ?? false,
        showInBestSellers: formData.showInBestSellers ?? false,
        showInSpecialOffers: formData.showInSpecialOffers ?? false,
        showInTrending: formData.showInTrending ?? false,
      } as Partial<Product>
      
      await updateProduct(params.id as string, productData)
      window.dispatchEvent(new Event('pixelpad_products_changed'))
      router.push(`/admin/products/${params.id}`)
    } catch (error: any) {
      console.error('Error updating product:', error)
      setNotification({ 
        message: error?.message || t('admin.errorUpdating') || 'Failed to update product', 
        type: 'error' 
      })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link
          href={`/admin/products/${params.id}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {t('admin.products.editProduct')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.products.editProductDesc')}
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

      {/* Form - Same structure as create page */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                {t('admin.products.basicInfo')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.name')} *
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.nameFr')}
                  </label>
                  <input
                    type="text"
                    value={formData.nameFr || ''}
                    onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.description')} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.descriptionFr')}
                  </label>
                  <textarea
                    rows={4}
                    value={formData.descriptionFr || ''}
                    onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.products.category')} *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                      disabled={categoriesLoading}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {categoriesLoading ? (
                        <option value="">{t('admin.loading') || 'Loading categories...'}</option>
                      ) : categories.length === 0 ? (
                        <option value="">{t('admin.settings.noCategories') || 'No categories available'}</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.products.badge')}
                    </label>
                    <input
                      type="text"
                      value={formData.badge || ''}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="HOT DEAL, BESTSELLER, etc."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                {t('admin.products.pricing')}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.price')} (DH) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.originalPrice')} (DH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice || 0}
                    onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.deliveryPrice')} (DH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.deliveryPrice || 0}
                    onChange={(e) => setFormData({ ...formData, deliveryPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.costPrice')} (DH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                {t('admin.products.features')}
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder={t('admin.products.addFeature')}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    {t('admin.products.add')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.features?.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-xs sm:text-sm"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                {t('admin.products.specifications')}
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder={t('admin.products.specKey')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                    placeholder={t('admin.products.specValue')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {t('admin.products.addSpec')}
                </button>
                <div className="space-y-2">
                  {Object.entries(formData.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                        <strong>{key}:</strong> {value}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Same as create page */}
          <div className="space-y-4 sm:space-y-6">
            {/* Image Upload */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                {t('admin.products.image')} *
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {imagePreview ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('')
                        setFormData({ ...formData, image: '' })
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <PhotoIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {uploadingImage ? t('admin.uploading') : t('admin.clickToUpload')}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Stock & Visibility */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                {t('admin.products.stockVisibility')}
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.stockQuantity')}
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity || 0}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.soldQuantity')}
                  </label>
                  <input
                    type="number"
                    value={formData.soldQuantity || 0}
                    onChange={(e) => setFormData({ ...formData, soldQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomeCarousel}
                    onChange={(e) => setFormData({ ...formData, showOnHomeCarousel: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {t('admin.products.showOnHomeCarousel')} <span className="text-blue-600 dark:text-blue-400 font-semibold">({productCounts.carousel})</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showInHero}
                    onChange={(e) => setFormData({ ...formData, showInHero: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Hero (Homepage) <span className="text-blue-600 dark:text-blue-400 font-semibold">({productCounts.hero})</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showInNewArrivals}
                    onChange={(e) => setFormData({ ...formData, showInNewArrivals: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    New Arrivals <span className="text-blue-600 dark:text-blue-400 font-semibold">({productCounts.newArrivals})</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showInBestSellers}
                    onChange={(e) => setFormData({ ...formData, showInBestSellers: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Best Sellers <span className="text-blue-600 dark:text-blue-400 font-semibold">({productCounts.bestSellers})</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showInSpecialOffers}
                    onChange={(e) => setFormData({ ...formData, showInSpecialOffers: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Special Offers <span className="text-blue-600 dark:text-blue-400 font-semibold">({productCounts.specialOffers})</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showInTrending}
                    onChange={(e) => setFormData({ ...formData, showInTrending: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Trending Now <span className="text-blue-600 dark:text-blue-400 font-semibold">({productCounts.trending})</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <Link
            href={`/admin/products/${params.id}`}
            className="px-4 sm:px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            {t('admin.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? t('admin.saving') : t('admin.products.updateProduct')}
          </button>
        </div>
      </form>
    </div>
  )
}

