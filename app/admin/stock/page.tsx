'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'
import { usePermissions } from '@/hooks/usePermissions'
import { getAllProducts, updateProduct } from '@/lib/products'
import { getAllCategories, matchProductToCategory, Category } from '@/lib/categories'
import { Product } from '@/types'
import {
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default function StockManagementPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { can } = usePermissions()

  useEffect(() => {
    if (!can('stock.view')) {
      router.replace('/admin/orders')
    }
  }, [can, router])

  if (!can('stock.view')) {
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
  const [stockFilter, setStockFilter] = useState<string>('all')
  // Removed bypass stock functionality for security

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

  // Helper function to get category name
  const getCategoryName = (categoryId: string): string => {
    const category = matchProductToCategory(categoryId, categories)
    return category?.name || categoryId
  }

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      await updateProduct(productId, { stockQuantity: newStock, inStock: newStock > 0 })
      await loadProducts()
      window.dispatchEvent(new Event('pixelpad_products_changed'))
    } catch (error) {
      console.error('Error updating stock:', error)
      alert(t('admin.errorUpdating') || 'Failed to update stock')
    }
  }

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStock = stockFilter === 'all' || 
        (stockFilter === 'low' && (p.stockQuantity || 0) <= 5 && (p.stockQuantity || 0) > 0) ||
        (stockFilter === 'out' && (p.stockQuantity || 0) === 0) ||
        (stockFilter === 'inStock' && (p.stockQuantity || 0) > 5)
      return matchesSearch && matchesStock
    })
    .sort((a, b) => (a.stockQuantity || 0) - (b.stockQuantity || 0))

  const lowStockProducts = products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) <= 5)
  const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) === 0)
  const totalStock = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0)

  if (isLoading) {
    return <div className="text-center py-12">{t('admin.loading')}</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.stockManagement')}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.stockManagement.subtitle') || t('admin.stock.manageInventory')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.stockManagement.totalInStock') || t('admin.stock.totalStock')}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {totalStock}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded-lg shadow border border-yellow-200 dark:border-yellow-800">
          <div className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 mb-1 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {t('admin.stockManagement.lowStock') || t('admin.stock.lowStock')}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-yellow-900 dark:text-yellow-200">
            {lowStockProducts.length}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg shadow border border-red-200 dark:border-red-800">
          <div className="text-xs sm:text-sm text-red-600 dark:text-red-400 mb-1">
            {t('admin.stockManagement.outOfStock') || t('admin.stock.outOfStock')}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-200">
            {outOfStockProducts.length}
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.products.search') || t('admin.stock.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">{t('admin.products.allCategories') || t('admin.stock.all')}</option>
            <option value="low">{t('admin.stockManagement.lowStock') || t('admin.stock.lowStock')}</option>
            <option value="out">{t('admin.stockManagement.outOfStock') || t('admin.stock.outOfStock')}</option>
            <option value="inStock">{t('admin.stockManagement.inStock') || t('admin.stock.inStock')}</option>
          </select>
        </div>
        
        {/* Bulk Actions */}
        {outOfStockProducts.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('admin.stock.bulkActions') || 'Quick Actions:'}
            </span>
            <button
              type="button"
              onClick={async () => {
                if (typeof window !== 'undefined' && window.confirm(`Add 50 stock to all ${outOfStockProducts.length} out-of-stock products?`)) {
                  for (const product of outOfStockProducts) {
                    await handleStockUpdate(product.id, 50)
                  }
                  await loadProducts()
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              {t('admin.stock.add50ToAll') || `Add 50 to All (${outOfStockProducts.length})`}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (typeof window !== 'undefined' && window.confirm(`Set all ${outOfStockProducts.length} out-of-stock products to 100?`)) {
                  for (const product of outOfStockProducts) {
                    await handleStockUpdate(product.id, 100)
                  }
                  await loadProducts()
                }
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              {t('admin.stock.set100ToAll') || `Set 100 to All (${outOfStockProducts.length})`}
            </button>
          </div>
        )}
      </div>

      {/* Products Table - desktop */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.stockManagement.product') || t('admin.stock.product')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.stockManagement.currentStock') || t('admin.stock.currentStock')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.stockManagement.sold') || t('admin.stock.sold')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.stockManagement.updateStock') || t('admin.stock.update')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    {t('admin.stockManagement.noProductsFound') || t('admin.stock.noProducts')}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stock = product.stockQuantity || 0
                  const isLowStock = stock > 0 && stock <= 5
                  const isOutOfStock = stock === 0
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image && (
                            <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {getCategoryName(product.category)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          isOutOfStock 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : isLowStock
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {product.soldQuantity || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            defaultValue={stock}
                            id={`stock-${product.id}`}
                            onBlur={(e) => {
                              const newStock = parseInt(e.target.value) || 0
                              if (newStock !== stock) {
                                handleStockUpdate(product.id, newStock)
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const newStock = parseInt((e.target as HTMLInputElement).value) || 0
                                if (newStock !== stock) {
                                  handleStockUpdate(product.id, newStock)
                                }
                              }
                            }}
                            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(`stock-${product.id}`) as HTMLInputElement
                              if (input) {
                                const currentValue = parseInt(input.value) || 0
                                const newValue = currentValue + 10
                                input.value = newValue.toString()
                                handleStockUpdate(product.id, newValue)
                              }
                            }}
                            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                            title="Add 10 to stock"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(`stock-${product.id}`) as HTMLInputElement
                              if (input) {
                                const newValue = 100
                                input.value = newValue.toString()
                                handleStockUpdate(product.id, newValue)
                              }
                            }}
                            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                            title="Set to 100"
                          >
                            100
                          </button>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-xs text-blue-600 hover:underline ml-1"
                          >
                            {t('admin.products.edit') || t('admin.stock.edit')}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Cards - mobile */}
      <div className="grid gap-2 md:hidden">
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 text-center text-gray-500 text-sm">
            {t('admin.stockManagement.noProductsFound') || t('admin.stock.noProducts')}
          </div>
        ) : (
          filteredProducts.map((product) => {
            const stock = product.stockQuantity || 0
            const isLowStock = stock > 0 && stock <= 5
            const isOutOfStock = stock === 0

            return (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 space-y-3">
                <div className="flex gap-3">
                  {product.image && (
                    <div className="w-18 h-18 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{product.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {getCategoryName(product.category)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.stockManagement.currentStock') || t('admin.stock.currentStock')}</div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      isOutOfStock
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : isLowStock
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {stock}
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('admin.stockManagement.sold') || t('admin.stock.sold')}</div>
                    <div className="text-sm">{product.soldQuantity || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    defaultValue={stock}
                    id={`stock-mobile-${product.id}`}
                    onBlur={(e) => {
                      const newStock = parseInt(e.target.value) || 0
                      if (newStock !== stock) {
                        handleStockUpdate(product.id, newStock)
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const newStock = parseInt((e.target as HTMLInputElement).value) || 0
                        if (newStock !== stock) {
                          handleStockUpdate(product.id, newStock)
                        }
                      }
                    }}
                    className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(`stock-mobile-${product.id}`) as HTMLInputElement
                      if (input) {
                        const currentValue = parseInt(input.value) || 0
                        const newValue = currentValue + 10
                        input.value = newValue.toString()
                        handleStockUpdate(product.id, newValue)
                      }
                    }}
                    className="px-2.5 py-1.5 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(`stock-mobile-${product.id}`) as HTMLInputElement
                      if (input) {
                        const newValue = 100
                        input.value = newValue.toString()
                        handleStockUpdate(product.id, newValue)
                      }
                    }}
                    className="px-2.5 py-1.5 text-[11px] bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    100
                  </button>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="ml-auto px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-xs font-medium"
                  >
                    {t('admin.products.edit') || t('admin.stock.edit')}
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

