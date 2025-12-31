const API_BASE = '/api/coupons'

// Helper function to convert MongoDB document to Coupon
function toCoupon(doc: any): Coupon {
  // Handle date conversion - MongoDB dates can be Date objects or ISO strings
  const validFrom = doc.validFrom instanceof Date 
    ? doc.validFrom.toISOString() 
    : doc.validFrom || new Date().toISOString()
  const validUntil = doc.validUntil instanceof Date 
    ? doc.validUntil.toISOString() 
    : doc.validUntil || new Date().toISOString()
  
  return {
    id: doc._id?.toString() || doc.id,
    code: doc.code || '',
    discountPercent: doc.discountPercent || 0,
    discountAmount: doc.discountAmount,
    type: doc.type || 'percent',
    minPurchase: doc.minPurchase,
    maxDiscount: doc.maxDiscount,
    validFrom: validFrom,
    validUntil: validUntil,
    usageLimit: doc.usageLimit,
    usedCount: doc.usedCount || 0,
    isActive: doc.isActive !== undefined ? doc.isActive : true,
    description: doc.description,
  }
}

export async function getAllCoupons(): Promise<Coupon[]> {
  try {
    const response = await fetch(API_BASE)
    if (!response.ok) {
      console.error('Failed to fetch coupons:', response.status, response.statusText)
      return []
    }
    const data = await response.json()
    console.log('Raw coupons from API:', data.length)
    const coupons = data.map(toCoupon)
    console.log('Converted coupons:', coupons.length)
    return coupons
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return []
  }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const coupons = await getAllCoupons()
    const normalized = code.trim().toUpperCase().replace(/\s+/g, '')
    return coupons.find(c => c.code.toUpperCase().replace(/\s+/g, '') === normalized && c.isActive) || null
  } catch (error) {
    console.error('Error fetching coupon by code:', error)
    return null
  }
}

export async function validateCoupon(code: string, total: number): Promise<{ valid: boolean; coupon: Coupon | null; discount: number; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, total }),
    })
    if (!response.ok) {
      return { valid: false, coupon: null, discount: 0, message: 'Invalid coupon code' }
    }
    const data = await response.json()
    return {
      valid: data.valid,
      coupon: data.coupon ? toCoupon(data.coupon) : null,
      discount: data.discount || 0,
      message: data.message,
    }
  } catch (error) {
    console.error('Error validating coupon:', error)
    return { valid: false, coupon: null, discount: 0, message: 'Error validating coupon' }
  }
}

export async function addCoupon(coupon: Omit<Coupon, 'id' | 'usedCount'>): Promise<Coupon | null> {
  try {
    const couponData = {
      ...coupon,
      usedCount: 0,
    }
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData),
    })
    if (!response.ok) throw new Error('Failed to create coupon')
    const data = await response.json()
    return toCoupon(data)
  } catch (error) {
    console.error('Error creating coupon:', error)
    return null
  }
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    return response.ok
  } catch (error) {
    console.error('Error updating coupon:', error)
    return false
  }
}

export async function deleteCoupon(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return false
  }
}

export async function incrementCouponUsage(code: string): Promise<boolean> {
  try {
    const coupon = await getCouponByCode(code)
    if (!coupon) return false
    return updateCoupon(coupon.id, { usedCount: (coupon.usedCount || 0) + 1 })
  } catch (error) {
    console.error('Error incrementing coupon usage:', error)
    return false
  }
}

// Export type
export interface Coupon {
  id: string
  code: string
  discountPercent: number
  discountAmount?: number
  type: 'percent' | 'fixed'
  minPurchase?: number
  maxDiscount?: number
  validFrom: string
  validUntil: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
  description?: string
}
