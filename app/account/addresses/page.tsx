"use client"

export const dynamic = 'force-dynamic'
import Protected from '@/components/Protected'
import AccountLayout from '@/components/AccountLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useEffect, useState } from 'react'

interface Address {
  id: string
  fullName: string
  phone: string
  city: string
  line1: string
}

const STORAGE = 'pixelpad_addresses'

export default function AddressesPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const email = user?.email || 'guest'
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ fullName: '', phone: '', city: '', line1: '' })

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE) || '{}')
      setAddresses(all[email] || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load addresses from localStorage:', error)
      }
    }
  }, [email])

  const save = (list: Address[]) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE) || '{}')
      all[email] = list
      localStorage.setItem(STORAGE, JSON.stringify(all))
      setAddresses(list)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save addresses to localStorage:', error)
      }
    }
  }

  const addAddress = (e: React.FormEvent) => {
    e.preventDefault()
    const newAddr: Address = { id: editingId || Date.now().toString(), ...form }
    // keep only one address – replace existing
    save([newAddr])
    setForm({ fullName: '', phone: '', city: '', line1: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const remove = (id: string) => save(addresses.filter(a => a.id !== id))

  return (
    <Protected>
      <AccountLayout title={t('account.addresses.title')}>
        <div className="space-y-4">

        {showForm ? (
          <form onSubmit={addAddress} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('address.fullName')}</label>
                <input value={form.fullName} onChange={(e)=>setForm({ ...form, fullName: e.target.value })} required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('address.phone')}</label>
                <input value={form.phone} onChange={(e)=>setForm({ ...form, phone: e.target.value })} inputMode="tel" required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('address.city')}</label>
                <input value={form.city} onChange={(e)=>setForm({ ...form, city: e.target.value })} required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('address.addressLine')}</label>
                <input value={form.line1} onChange={(e)=>setForm({ ...form, line1: e.target.value })} required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end pt-2">
              <button type="button" onClick={()=>{ setShowForm(false); setEditingId(null); setForm({ fullName: '', phone: '', city: '', line1: '' }) }} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm sm:text-base font-medium transition-colors">{t('messages.cancel')}</button>
              <button className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm sm:text-base font-semibold transition-colors">{t('common.save')}</button>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-5 lg:p-6 space-y-3 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{addresses.length === 0 ? t('address.noAddresses') : t('address.manageAddress')}</p>
            {addresses.length === 0 && (
              <button onClick={()=>{ setEditingId(null); setShowForm(true) }} className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm sm:text-base font-semibold transition-colors">{t('address.addAddress')}</button>
            )}
          </div>
        )}

        {addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.slice(0,1).map(a => (
              <div key={a.id} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base mb-1 text-gray-900 dark:text-white">{a.fullName} — {a.phone}</div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{a.line1}, {a.city}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <button onClick={()=>{ setEditingId(a.id); setForm({ fullName: a.fullName, phone: a.phone, city: a.city, line1: a.line1 }); setShowForm(true) }} className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs sm:text-sm font-medium">{t('address.edit')}</button>
                    <button onClick={()=>remove(a.id)} className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-colors text-xs sm:text-sm font-medium">{t('address.delete')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </AccountLayout>
    </Protected>
  )
}





