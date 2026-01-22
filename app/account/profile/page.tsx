"use client"

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import AccountLayout from '@/components/AccountLayout'
import Protected from '@/components/Protected'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading, updateProfile, changePassword, logout } = useAuth()
  const { t } = useLanguage()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="animate-pulse h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('profile.signInRequired')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('profile.signInMessage')}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white"
        >
          {t('profile.goToHome')}
        </button>
      </div>
    )
  }

  const handleSave = async () => {
    setMessage('')
    setSaving(true)
    const ok = await updateProfile({ name, email })
    setSaving(false)
    setMessage(ok ? t('profile.profileUpdated') : t('profile.profileUpdateFailed'))
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdMsg('')
    if (newPwd.length < 6) { setPwdMsg(t('profile.passwordMinLength')); return }
    if (newPwd !== confirmPwd) { setPwdMsg(t('profile.passwordsDoNotMatch')); return }
    const ok = await changePassword(oldPwd, newPwd)
    setPwdMsg(ok ? t('profile.passwordUpdated') : t('profile.passwordUpdateFailed'))
    if (ok) { setOldPwd(''); setNewPwd(''); setConfirmPwd('') }
  }

  return (
    <Protected>
      <AccountLayout title={t('account.profile.title')}>

      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('profile.fullName')}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('profile.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {message && (
          <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">{message}</div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 text-center font-semibold transition-colors"
          >
            {saving ? t('profile.saving') : t('profile.saveChanges')}
          </button>
          <button
            onClick={() => { logout(); router.push('/') }}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-center font-semibold transition-colors"
          >
            {t('profile.logout')}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{t('profile.changePassword')}</h2>
        <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('profile.currentPassword')}</label>
            <input type="password" value={oldPwd} onChange={(e)=>setOldPwd(e.target.value)} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('profile.newPassword')}</label>
              <input type="password" value={newPwd} onChange={(e)=>setNewPwd(e.target.value)} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">{t('profile.confirmNewPassword')}</label>
              <input type="password" value={confirmPwd} onChange={(e)=>setConfirmPwd(e.target.value)} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          {pwdMsg && <div className={`text-xs sm:text-sm p-2 rounded-lg ${pwdMsg.includes(t('profile.passwordUpdated')) ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'}`}>{pwdMsg}</div>}
          <button className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors">{t('profile.updatePassword')}</button>
        </form>
      </div>

      </AccountLayout>
    </Protected>
  )
}















