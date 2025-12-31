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
          className="mt-6 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
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

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.fullName')}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {message && (
          <div className="text-sm text-green-600 dark:text-green-400">{message}</div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 min-w-[140px] text-center"
          >
            {saving ? t('profile.saving') : t('profile.saveChanges')}
          </button>
          <button
            onClick={() => { logout(); router.push('/') }}
            className="flex-1 px-5 py-3 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white min-w-[140px] text-center"
          >
            {t('profile.logout')}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">{t('profile.changePassword')}</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.currentPassword')}</label>
            <input type="password" value={oldPwd} onChange={(e)=>setOldPwd(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.newPassword')}</label>
              <input type="password" value={newPwd} onChange={(e)=>setNewPwd(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('profile.confirmNewPassword')}</label>
              <input type="password" value={confirmPwd} onChange={(e)=>setConfirmPwd(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          {pwdMsg && <div className={`text-sm ${pwdMsg.includes(t('profile.passwordUpdated')) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{pwdMsg}</div>}
          <button className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">{t('profile.updatePassword')}</button>
        </form>
      </div>

      </AccountLayout>
    </Protected>
  )
}


