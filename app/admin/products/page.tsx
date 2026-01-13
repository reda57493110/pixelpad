'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePermissions } from '@/hooks/usePermissions'
import { getAllProducts, deleteProduct } from '@/lib/products'
import { getAllCategories, matchProductToCategory, Category } from '@/lib/categories'
import { Product } from '@/types'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

export default function ProductsListPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { can } = usePermissions()

  // Check permission and redirect if not allowed
  useEffect(() => {
    if (!can('products.view')) {
      router.replace('/admin/orders')
    }
  }, [can, router])

  // Show nothing while checking permissions
  if (!can('products.view')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Access denied. Redirecting...</p>
      </div>
    )
  }
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadProducts(),
        loadCategories()
      ])
    }
    loadData()
    const handleChange = () => loadData()
    window.addEventListener('pixelpad_products_changed', handleChange)
    return () => window.removeEventListener('pixelpad_products_changed', handleChange)
  }, [])

  const loadCategories = async () => {
    try {
      const categoriesData = await getAllCategories(true) // Only active categories
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await getAllProducts(true) // Bypass cache to get fresh data
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
      alert(t('admin.errorLoading') || 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (typeof window !== 'undefined' && window.confirm(t('admin.deleteConfirm') || 'Are you sure you want to delete this product?')) {
      try {
        const success = await deleteProduct(id)
        if (success) {
          // Clear client-side cache and reload products to reflect the deletion
          // Force bypass cache to get fresh data
          await loadProducts()
          // Dispatch event to notify other components
          window.dispatchEvent(new Event('pixelpad_products_changed'))
          // Force a hard refresh of the page cache by adding timestamp
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                if (name.includes('products') || name.includes('next')) {
                  caches.delete(name)
                }
              })
            })
          }
        } else {
          alert(t('admin.errorDeleting') || 'Failed to delete product')
        }
      } catch (error: any) {
        console.error('Error deleting product:', error)
        const errorMessage = error?.message || error?.errorData?.error || t('admin.errorDeleting') || 'Failed to delete product'
        alert(errorMessage)
      }
    }
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      // Convert category to string for comparison (handles ObjectId)
      const productCategoryId = typeof p.category === 'object' && p.category !== null && '_id' in p.category
        ? (p.category as any)._id?.toString() || String(p.category)
        : p.category?.toString() || String(p.category)
      const selectedCategoryId = selectedCategory === 'all' ? 'all' : String(selectedCategory)
      const matchesCategory = selectedCategoryId === 'all' || productCategoryId === selectedCategoryId
      const matchesStock = stockFilter === 'all' || 
        (stockFilter === 'inStock' && p.inStock) ||
        (stockFilter === 'outOfStock' && !p.inStock)
      return matchesSearch && matchesCategory && matchesStock
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'price': return a.price - b.price
        case 'stock': return (a.stockQuantity || 0) - (b.stockQuantity || 0)
        case 'sold': return (a.soldQuantity || 0) - (b.soldQuantity || 0)
        default: return 0
      }
    })

  // Helper function to get category name
  const getCategoryName = (categoryId: string): string => {
    const category = matchProductToCategory(categoryId, categories)
    return category?.name || categoryId
  }

  // Get unique category IDs from products
  // Get unique category IDs from products (convert ObjectId to string)
  const uniqueCategoryIds = Array.from(new Set(products.map(p => {
    const catId = typeof p.category === 'object' && p.category !== null && '_id' in p.category
      ? (p.category as any)._id?.toString() || String(p.category)
      : p.category?.toString() || String(p.category)
    return catId
  })))

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.tabs.products')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.products.manageProducts')} ({products.length})
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          {t('admin.products.addProduct')}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.products.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('admin.products.allCategories')}</option>
            {uniqueCategoryIds.map(catId => {
              const category = matchProductToCategory(catId, categories)
              return (
                <option key={catId} value={catId}>
                  {category?.name || catId}
                </option>
              )
            })}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('admin.products.allStock')}</option>
            <option value="inStock">{t('admin.products.inStock')}</option>
            <option value="outOfStock">{t('admin.products.outOfStock')}</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="name">{t('admin.products.sortByName')}</option>
            <option value="price">{t('admin.products.sortByPrice')}</option>
            <option value="stock">{t('admin.products.sortByStock')}</option>
            <option value="sold">{t('admin.products.sortBySold')}</option>
          </select>
        </div>
      </div>

      {/* Products Table - desktop */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.products.image')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.products.name')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.products.category')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.products.price')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.products.stock')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.products.sold')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.products.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {t('admin.products.noProducts')}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FunnelIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      {product.badge && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          {product.badge}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {getCategoryName(product.category)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      {product.price.toFixed(2)} DH
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.inStock && (product.stockQuantity || 0) > 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {product.stockQuantity || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {product.soldQuantity || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={t('admin.products.view')}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title={t('admin.products.edit')}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t('admin.products.delete')}
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

      {/* Products Cards - mobile */}
      <div className="grid gap-3 md:hidden">
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 text-center text-gray-500 text-sm">
            {t('admin.products.noProducts')}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 space-y-3">
              <div className="flex gap-3">
                <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FunnelIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{product.name}</div>
                  {product.badge && (
                    <span className="inline-block text-[11px] text-blue-600 dark:text-blue-400">
                      {product.badge}
                    </span>
                  )}
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{getCategoryName(product.category)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.products.price')}</div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-white">{product.price.toFixed(2)} DH</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.products.stock')}</div>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    product.inStock && (product.stockQuantity || 0) > 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {product.stockQuantity || 0}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.products.sold')}</div>
                  <div className="text-sm">{product.soldQuantity || 0}</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-xs font-medium"
                  >
                    {t('admin.products.view')}
                  </Link>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="px-3 py-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors text-xs font-medium"
                  >
                    {t('admin.products.edit')}
                  </Link>
                </div>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title={t('admin.products.delete')}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {t('admin.products.showing')} {filteredProducts.length} {t('admin.products.of')} {products.length} {t('admin.products.products')}
      </div>
    </div>
  )
}

