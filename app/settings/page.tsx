"use client"

export const dynamic = 'force-dynamic'
import Protected from '@/components/Protected'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { t } = useLanguage()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [notify, setNotify] = useState(false)

  useEffect(() => {
    setName(user?.name || '')
    setEmail(user?.email || '')
    try { setNotify(localStorage.getItem('pixelpad_notify') === '1') } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load notification preference from localStorage:', error)
      }
    }
  }, [user?.name, user?.email])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const ok = await updateProfile({ name, email })
    setSaving(false)
    setMsg(ok ? t('settings.savedSuccessfully') : t('settings.saveError'))
    setTimeout(() => setMsg(''), 1500)
  }

  const toggleNotify = () => {
    const next = !notify
    setNotify(next)
    try { localStorage.setItem('pixelpad_notify', next ? '1' : '0') } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to save notification preference to localStorage:', error)
      }
    }
  }

  return (
    <Protected>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>

        <form onSubmit={saveProfile} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">{t('settings.fullName')}</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm mb-1">{t('settings.email')}</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">{saving ? t('settings.saving') : t('settings.saveChanges')}</button>
          </div>
          {msg && <div className="text-sm text-green-600 dark:text-green-400">{msg}</div>}
        </form>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <div className="font-semibold">{t('settings.orderNotifications')}</div>
            <div className="text-sm text-gray-500">{t('settings.orderNotificationsDesc')}</div>
          </div>
          <button onClick={toggleNotify} className={`w-12 h-7 rounded-full relative transition-colors ${notify ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`} aria-pressed={notify}>
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${notify ? 'translate-x-5' : ''}`}></span>
          </button>
        </div>
      </div>
    </Protected>
  )
}


