import { authenticatedFetch } from './api-client'

export interface Category {
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

export async function getAllCategories(activeOnly: boolean = false): Promise<Category[]> {
  try {
    const url = activeOnly ? '/api/categories?active=true' : '/api/categories'
    // Use regular fetch for categories (public endpoint, no auth needed)
    const response = await fetch(url, {
      cache: 'force-cache',
      next: { revalidate: 600 } // 10 minutes cache for faster loading
    })
    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status, response.statusText)
      return []
    }
    const data = await response.json()
    return data.map((cat: any) => ({
      ...cat,
      id: cat.id || cat._id?.toString()
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const response = await authenticatedFetch(`/api/categories/${id}`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return {
      ...data,
      id: data.id || data._id?.toString()
    }
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

export async function createCategory(categoryData: Partial<Category>): Promise<Category | null> {
  try {
    const response = await authenticatedFetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create category')
    }
    const data = await response.json()
    return {
      ...data,
      id: data.id || data._id?.toString()
    }
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

export async function updateCategory(id: string, categoryData: Partial<Category>): Promise<Category | null> {
  try {
    const response = await authenticatedFetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update category')
    }
    const data = await response.json()
    return {
      ...data,
      id: data.id || data._id?.toString()
    }
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const response = await authenticatedFetch(`/api/categories/${id}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting category:', error)
    return false
  }
}

// Helper function to match product category (ID or slug) to category object
export function matchProductToCategory(productCategory: string, categories: Category[]): Category | null {
  // First try to find by ID
  const byId = categories.find(cat => cat.id === productCategory || (cat as any)._id?.toString() === productCategory)
  if (byId) return byId
  
  // Then try to find by slug
  const bySlug = categories.find(cat => cat.slug === productCategory)
  if (bySlug) return bySlug
  
  return null
}

// Helper function to get category name for a product
export function getCategoryName(productCategory: string, categories: Category[], language: 'en' | 'fr' | 'ar' = 'en'): string {
  const category = matchProductToCategory(productCategory, categories)
  if (!category) return productCategory
  
  if (language === 'fr' && category.nameFr) return category.nameFr
  if (language === 'ar' && category.nameAr) return category.nameAr
  return category.name
}

