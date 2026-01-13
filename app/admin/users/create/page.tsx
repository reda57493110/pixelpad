'use client'

export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS, PERMISSION_GROUPS, type Permission } from '@/lib/permissions'
import { authenticatedFetch } from '@/lib/api-client'
import {
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

export default function CreateUserPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { user: currentUser } = useAuth()
  const { can } = usePermissions()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'team' as 'admin' | 'team',
    permissions: [] as string[],
  })

  // Check if current user is admin (only admins can create admin users)
  const isAdmin = currentUser?.role === 'admin'

  // Check permission
  if (!can('users.create')) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t('admin.accessDenied') || 'Access denied'}</p>
        <Link href="/admin/users" className="mt-4 inline-block text-blue-600 hover:underline">
          {t('admin.users.backToList')}
        </Link>
      </div>
    )
  }

  const handlePermissionToggle = (permission: Permission) => {
    setFormData(prev => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
      return { ...prev, permissions }
    })
  }

  const handlePermissionGroupToggle = (group: Permission[]) => {
    setFormData(prev => {
      const allSelected = group.every(p => prev.permissions.includes(p))
      const permissions = allSelected
        ? prev.permissions.filter(p => !group.includes(p as Permission))
        : Array.from(new Set([...prev.permissions, ...group]))
      return { ...prev, permissions }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError(t('admin.users.fillAllFields') || 'Please fill all required fields')
      return
    }

    if (formData.password.length < 6) {
      setError(t('admin.users.passwordMinLength') || 'Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('admin.users.passwordsDoNotMatch') || 'Passwords do not match')
      return
    }

    // Only admins can create admin users
    if (formData.role === 'admin' && !isAdmin) {
      setError(t('admin.users.onlyAdminCanCreateAdmin') || 'Only admins can create admin users')
      return
    }

    // Team users must have at least one permission
    if (formData.role === 'team' && formData.permissions.length === 0) {
      setError(t('admin.users.selectAtLeastOnePermission') || 'Please select at least one permission for team users')
      return
    }

    setIsSubmitting(true)

    try {
      const userData: any = {
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
        isActive: true,
      }

      // Only add permissions for team users (admins have all permissions)
      if (formData.role === 'team') {
        userData.permissions = formData.permissions
      }

      const response = await authenticatedFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }

      // Success - redirect to users list
      router.push('/admin/users')
    } catch (error: any) {
      console.error('Error creating user:', error)
      setError(error.message || t('admin.errorCreatingUser') || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const permissionGroups = [
    { name: 'Manager', permissions: PERMISSION_GROUPS.MANAGER },
    { name: 'Support', permissions: PERMISSION_GROUPS.SUPPORT },
    { name: 'Inventory', permissions: PERMISSION_GROUPS.INVENTORY },
    { name: 'Sales', permissions: PERMISSION_GROUPS.SALES },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.users.createUser') || 'Create User'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('admin.users.createUserDesc') || 'Create a new admin or team user'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('admin.users.userInfo') || 'User Information'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.users.name')} *
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
                {t('admin.users.email')} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.users.password') || 'Password'} *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                minLength={6}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('admin.users.passwordMinLength') || 'Minimum 6 characters'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('admin.users.confirmPassword') || 'Confirm Password'} *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                minLength={6}
              />
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('admin.users.role') || 'Role'}
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={formData.role === 'admin'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'team', permissions: [] })}
                disabled={!isAdmin}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {t('admin.users.roleAdmin') || 'Admin'}
                  {!isAdmin && <span className="text-xs text-gray-500 ml-2">({t('admin.users.onlyAdminCanCreate') || 'Admin only'})</span>}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('admin.users.roleAdminDesc') || 'Full access to all features and settings'}
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="team"
                checked={formData.role === 'team'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'team' })}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {t('admin.users.roleTeam') || 'Team'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('admin.users.roleTeamDesc') || 'Limited access based on assigned permissions'}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Permissions (only for team users) */}
        {formData.role === 'team' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('admin.users.permissions') || 'Permissions'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('admin.users.selectPermissions') || 'Select the permissions for this team user'}
            </p>

            {/* Permission Groups */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.users.permissionGroups') || 'Quick Select Groups'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissionGroups.map((group) => {
                  const allSelected = group.permissions.every(p => formData.permissions.includes(p))
                  return (
                    <button
                      key={group.name}
                      type="button"
                      onClick={() => handlePermissionGroupToggle(group.permissions)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        allSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {group.name}
                        </span>
                        {allSelected && (
                          <CheckIcon className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {group.permissions.length} {t('admin.users.permissions') || 'permissions'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Individual Permissions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.users.allPermissions') || 'All Permissions'}
              </h4>
              <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {Object.entries(PERMISSIONS).map(([key, description]) => (
                  <label
                    key={key}
                    className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(key)}
                      onChange={() => handlePermissionToggle(key as Permission)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {key}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {(() => {
                          const translationKey = `permissions.${key}`
                          const translated = t(translationKey)
                          // If translation returns the key itself, it means translation not found, use description
                          return translated === translationKey ? description : translated
                        })()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/users"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('admin.cancel') || 'Cancel'}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (t('admin.creating') || 'Creating...') : (t('admin.users.createUser') || 'Create User')}
          </button>
        </div>
      </form>
    </div>
  )
}

