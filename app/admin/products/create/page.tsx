'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { addProduct, getAllProducts } from '@/lib/products'
import { getAllCategories, Category } from '@/lib/categories'
import { Product } from '@/types'
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export default function CreateProductPage() {
  const router = useRouter()
  const { t } = useLanguage()
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
    order: 1,
  })

  const [productImages, setProductImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('url')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [variants, setVariants] = useState<Array<{ ram: string; storage: string; storageType: string; price: number; originalPrice?: number }>>([])
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
        // Set default category if available
        if (categoriesData.length > 0) {
          setFormData(prev => ({ ...prev, category: categoriesData[0].id as Product['category'] }))
        }
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
      const newImages = [...productImages, data.url]
      setProductImages(newImages)
      setFormData({ 
        ...formData, 
        image: newImages[0] || data.url, // Set first image as main image
        images: newImages 
      })
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

    handleImageUpload(file)
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.price || (!formData.image && productImages.length === 0) || !formData.category) {
      setNotification({ message: t('admin.fillRequired') || 'Please fill all required fields', type: 'error' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    // Ensure images array is set and first image is set as main image
    if (productImages.length > 0 && !formData.image) {
      formData.image = productImages[0]
    }
    if (productImages.length > 0) {
      formData.images = productImages
    }

    setIsSubmitting(true)
    try {
      // Explicitly include all visibility flags to ensure they're saved
      const productData = {
        ...formData,
        category: formData.category || 'laptops',
        // Set price from first variant if variants exist, otherwise use form price
        price: variants.length > 0 ? variants[0].price : (formData.price || 0),
        // Explicitly set all visibility flags (use ?? to preserve false values)
        showInHero: formData.showInHero ?? false,
        showOnHomeCarousel: formData.showOnHomeCarousel ?? false,
        showInNewArrivals: formData.showInNewArrivals ?? false,
        showInBestSellers: formData.showInBestSellers ?? false,
        showInSpecialOffers: formData.showInSpecialOffers ?? false,
        showInTrending: formData.showInTrending ?? false,
        // Explicitly set showOnProductPage to true by default (unless explicitly set to false)
        showOnProductPage: formData.showOnProductPage !== false,
        variants: variants.length > 0 ? variants : undefined,
      } as Omit<Product, 'id'>
      
      await addProduct(productData)
      window.dispatchEvent(new Event('pixelpad_products_changed'))
      router.push('/admin/products')
    } catch (error: any) {
      console.error('Error creating product:', error)
      setNotification({ 
        message: error?.message || t('admin.errorCreating') || 'Failed to create product', 
        type: 'error' 
      })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.products.addProduct')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.products.createNewProduct')}
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t('admin.products.basicInfo')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.descriptionFr')}
                  </label>
                  <textarea
                    rows={4}
                    value={formData.descriptionFr || ''}
                    onChange={(e) => setFormData({ ...formData, descriptionFr: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.products.badge')}
                    </label>
                    <select
                      value={formData.badge || ''}
                      onChange={(e) => {
                        const badge = e.target.value
                        const badgeMap: Record<string, string> = {
                          'HOT DEAL': 'products.badge.hotDeal',
                          'BESTSELLER': 'product.badge.bestseller',
                          'POPULAR': 'product.badge.popular',
                          'GAMING': 'product.badge.gaming',
                          'LIMITED': 'products.badge.limited',
                          'PRO': 'products.badge.pro',
                          'PREMIUM': 'products.badge.premium',
                          'WIRELESS': 'products.badge.wireless',
                          'EXCLUSIVE': 'products.badge.exclusive',
                          'PORTABLE': 'products.badge.portable'
                        }
                        setFormData({ 
                          ...formData, 
                          badge: badge,
                          badgeKey: badge ? badgeMap[badge] || 'products.badge.hotDeal' : ''
                        })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">No Badge</option>
                      <option value="HOT DEAL">HOT DEAL</option>
                      <option value="BESTSELLER">BESTSELLER</option>
                      <option value="POPULAR">POPULAR</option>
                      <option value="GAMING">GAMING</option>
                      <option value="LIMITED">LIMITED</option>
                      <option value="PRO">PRO</option>
                      <option value="PREMIUM">PREMIUM</option>
                      <option value="WIRELESS">WIRELESS</option>
                      <option value="EXCLUSIVE">EXCLUSIVE</option>
                      <option value="PORTABLE">PORTABLE</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t('admin.products.pricing')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

            {/* RAM - Storage Variants */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                RAM - Disque Dur (Variants)
              </h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          RAM
                        </label>
                        <select
                          value={variant.ram}
                          onChange={(e) => {
                            const newVariants = [...variants]
                            newVariants[index].ram = e.target.value
                            setVariants(newVariants)
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="4 GB">4 GB</option>
                          <option value="8 GB">8 GB</option>
                          <option value="16 GB">16 GB</option>
                          <option value="32 GB">32 GB</option>
                          <option value="64 GB">64 GB</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Storage
                        </label>
                        <select
                          value={variant.storage}
                          onChange={(e) => {
                            const newVariants = [...variants]
                            newVariants[index].storage = e.target.value
                            setVariants(newVariants)
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="128 GB">128 GB</option>
                          <option value="256 GB">256 GB</option>
                          <option value="512 GB">512 GB</option>
                          <option value="1 TB">1 TB</option>
                          <option value="2 TB">2 TB</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Storage Type
                        </label>
                        <select
                          value={variant.storageType}
                          onChange={(e) => {
                            const newVariants = [...variants]
                            newVariants[index].storageType = e.target.value
                            setVariants(newVariants)
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="SSD">SSD</option>
                          <option value="HDD">HDD</option>
                          <option value="NVMe SSD">NVMe SSD</option>
                          <option value="SSD + HDD">SSD + HDD</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Price (DH)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => {
                            const newVariants = [...variants]
                            newVariants[index].price = parseFloat(e.target.value) || 0
                            setVariants(newVariants)
                            // Update main price if this is the first variant
                            if (index === 0) {
                              setFormData({ ...formData, price: newVariants[index].price })
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Original Price (DH)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.originalPrice || ''}
                          onChange={(e) => {
                            const newVariants = [...variants]
                            newVariants[index].originalPrice = parseFloat(e.target.value) || undefined
                            setVariants(newVariants)
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newVariants = variants.filter((_, i) => i !== index)
                            setVariants(newVariants)
                            // Update main price if first variant was removed
                            if (index === 0 && newVariants.length > 0) {
                              setFormData({ ...formData, price: newVariants[0].price })
                            } else if (newVariants.length === 0) {
                              setFormData({ ...formData, price: 0 })
                            }
                          }}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newVariants = [...variants, { ram: '8 GB', storage: '256 GB', storageType: 'SSD', price: formData.price || 0 }]
                    setVariants(newVariants)
                    // Update main price to first variant's price
                    if (variants.length === 0) {
                      setFormData({ ...formData, price: newVariants[0].price })
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  + Add Variant
                </button>
                {variants.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    The first variant&apos;s price will be used as the main product price. You can change it by selecting a variant.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t('admin.products.image')} *
              </h3>
              <div className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      imageInputMode === 'url'
                        ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Enter URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      imageInputMode === 'upload'
                        ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {/* Add Image Input */}
                {imageInputMode === 'url' ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Copy Image Address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && imageUrl.trim()) {
                            e.preventDefault()
                            const newImages = [...productImages, imageUrl.trim()]
                            setProductImages(newImages)
                            setFormData({ 
                              ...formData, 
                              image: newImages[0] || imageUrl.trim(),
                              images: newImages 
                            })
                            setImageUrl('')
                          }
                        }}
                        placeholder="https://jpm.ma/cdn/shop/files/image.webp"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (imageUrl.trim()) {
                            const newImages = [...productImages, imageUrl.trim()]
                            setProductImages(newImages)
                            setFormData({ 
                              ...formData, 
                              image: newImages[0] || imageUrl.trim(),
                              images: newImages 
                            })
                            setImageUrl('')
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Right-click on an image and select &quot;Copy image address&quot; or copy the URL from your browser
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
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

                {/* Image Gallery */}
                {productImages.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Product Images ({productImages.length})
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {productImages.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600">
                          <Image
                            src={img}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          {index === 0 && (
                            <div className="absolute top-1 left-1 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                              Main
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = productImages.filter((_, i) => i !== index)
                              setProductImages(newImages)
                              setFormData({ 
                                ...formData, 
                                image: newImages[0] || '',
                                images: newImages 
                              })
                            }}
                            className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (index > 0) {
                                const newImages = [...productImages]
                                ;[newImages[0], newImages[index]] = [newImages[index], newImages[0]]
                                setProductImages(newImages)
                                setFormData({ 
                                  ...formData, 
                                  image: newImages[0],
                                  images: newImages 
                                })
                              }
                            }}
                            className="absolute bottom-1 left-1 px-2 py-1 bg-gray-800/70 text-white text-xs rounded hover:bg-gray-800"
                            title="Set as main image"
                          >
                            Set Main
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      First image will be used as the main product image
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stock & Visibility */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t('admin.products.stockVisibility')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.products.stockQuantity')}
                  </label>
                  <input
                    type="number"
                    value={formData.stockQuantity || 0}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    {t('admin.products.inStock')}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomeCarousel}
                    onChange={(e) => setFormData({ ...formData, showOnHomeCarousel: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
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
                  <label className="text-sm text-gray-700 dark:text-gray-300">
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
                  <label className="text-sm text-gray-700 dark:text-gray-300">
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
                  <label className="text-sm text-gray-700 dark:text-gray-300">
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
                  <label className="text-sm text-gray-700 dark:text-gray-300">
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
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Trending Now <span className="text-blue-600 dark:text-blue-400 font-semibold">({productCounts.trending})</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('admin.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('admin.saving') : t('admin.products.createProduct')}
          </button>
        </div>
      </form>
    </div>
  )
}

