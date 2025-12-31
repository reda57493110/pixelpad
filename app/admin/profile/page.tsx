'use client'

export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import AdminProtected from '@/components/AdminProtected'
import { 
  UserCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function AdminProfilePage() {
  const router = useRouter()
  const { user, isLoading, token, logout, refreshAuth } = useAuth()
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)

  useEffect(() => {
    if (user && user.type === 'user') {
      setName(user.name || '')
      setEmail(user.email || '')
      setAvatar(user.avatar || '')
    }
  }, [user])

  if (isLoading) {
    return (
      <AdminProtected>
        <div className="max-w-3xl mx-auto p-6">
          <div className="animate-pulse h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="animate-pulse h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </AdminProtected>
    )
  }

  const handleSave = async () => {
    if (!user || !token) return

    setMessage('')
    setSaving(true)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, avatar })
      })

      if (!response.ok) {
        const error = await response.json()
        setMessage(error.error || 'Failed to update profile')
        setSaving(false)
        return
      }

      const updatedUser = await response.json()
      // Refresh auth context
      await refreshAuth()
      setMessage('Profile updated successfully')
      setSaving(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Failed to update profile')
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !token) return

    setPwdMsg('')
    setPwdSaving(true)

    if (newPwd.length < 6) {
      setPwdMsg('Password must be at least 6 characters')
      setPwdSaving(false)
      return
    }

    if (newPwd !== confirmPwd) {
      setPwdMsg('Passwords do not match')
      setPwdSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/users/${user.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: oldPwd,
          newPassword: newPwd
        })
      })

      if (!response.ok) {
        const error = await response.json()
        setPwdMsg(error.error || 'Failed to change password')
        setPwdSaving(false)
        return
      }

      setPwdMsg('Password changed successfully')
      setOldPwd('')
      setNewPwd('')
      setConfirmPwd('')
      setPwdSaving(false)
    } catch (error) {
      console.error('Error changing password:', error)
      setPwdMsg('Failed to change password')
      setPwdSaving(false)
    }
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return 'A'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AdminProtected>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            {t('admin.profile') || 'Admin Profile'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Manage your admin account settings
          </p>
        </div>

        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6 mb-6">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xl sm:text-2xl shadow-lg">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{getInitials(name)}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {name || 'Admin User'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
              {user?.role && (
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                  {user.role === 'admin' ? 'Administrator' : 'Team Member'}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5" />
                {t('profile.fullName') || 'Full Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5" />
                {t('profile.email') || 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar URL (optional)
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {message && (
              <div className={`text-sm p-3 rounded-lg ${
                message.includes('successfully') 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                  : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
              }`}>
                {message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-5 py-3 text-base rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 text-center font-semibold transition-colors"
              >
                {saving ? (t('profile.saving') || 'Saving...') : (t('profile.saveChanges') || 'Save Changes')}
              </button>
              <button
                onClick={() => { logout(); router.push('/admin/login') }}
                className="flex-1 sm:flex-none px-5 py-3 text-base rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-center font-semibold transition-colors"
              >
                {t('admin.logout') || 'Logout'}
              </button>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <LockClosedIcon className="w-6 h-6" />
            {t('profile.changePassword') || 'Change Password'}
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('profile.currentPassword') || 'Current Password'}
              </label>
              <input
                type="password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.newPassword') || 'New Password'}
                </label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.confirmNewPassword') || 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="w-full px-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            {pwdMsg && (
              <div className={`text-sm p-3 rounded-lg ${
                pwdMsg.includes('successfully')
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
              }`}>
                {pwdMsg}
              </div>
            )}
            <button
              type="submit"
              disabled={pwdSaving}
              className="w-full px-5 py-3 text-base rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
            >
              {pwdSaving ? (t('profile.saving') || 'Saving...') : (t('profile.updatePassword') || 'Update Password')}
            </button>
          </form>
        </div>
      </div>
    </AdminProtected>
  )
}

