'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function OfficeSetupPage() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    city: '',
    emailOrPhone: '',
    numberOfWorkstations: '',
    officeSize: '',
    networkRequirements: '',
    additionalServices: '',
    preferredDate: '',
    additionalDetails: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) newErrors.fullName = `${t('office.form.fullName')} ${t('office.form.required')}`
    if (!formData.city.trim()) newErrors.city = `${t('office.form.city')} ${t('office.form.required')}`
    if (!formData.emailOrPhone.trim()) newErrors.emailOrPhone = `${t('office.form.phone')} ${t('office.form.required')}`
    if (!formData.numberOfWorkstations) newErrors.numberOfWorkstations = `${t('office.form.numberOfWorkstations')} ${t('office.form.required')}`
    if (!formData.officeSize) newErrors.officeSize = `${t('office.form.officeSize')} ${t('office.form.required')}`
    if (!formData.networkRequirements) newErrors.networkRequirements = `${t('office.form.networkRequirements')} ${t('office.form.required')}`
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitStatus('success')
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setFormData({
        fullName: '',
        companyName: '',
        city: '',
        emailOrPhone: '',
        numberOfWorkstations: '',
        officeSize: '',
        networkRequirements: '',
        additionalServices: '',
        preferredDate: '',
        additionalDetails: ''
      })
      setSubmitStatus('')
      setCurrentStep(1)
    }, 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900"></div>
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`text-center text-white transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 dark:from-white dark:to-blue-200 bg-clip-text text-transparent">
              {t('office.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 dark:text-blue-200">
              {t('office.hero.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 animate-pulse">
                <span className="text-2xl mr-2">💻</span>
                <span className='text-sm font-medium'>{t('office.hero.officeSetup')}</span>
              </div>
              <div className="flex items-center bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 animate-pulse delay-300">
                <span className="text-2xl mr-2">📹</span>
                <span className='text-sm font-medium'>{t('office.hero.securityCameras')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Service Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 hover:shadow-2xl dark:hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 group border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors">
                <span className="text-3xl">💻</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('office.service.officeSetup.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t('office.service.officeSetup.desc')}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 hover:shadow-2xl dark:hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 group border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800/70 transition-colors">
                <span className="text-3xl">📹</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('office.service.securityCameras.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{t('office.service.securityCameras.desc')}</p>
            </div>
          </div>
          
        </div>

        {/* Form */}
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-3xl p-8 transition-all duration-1000 delay-500 border border-gray-100 dark:border-gray-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-white text-xl">📝</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('office.form.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300">{t('office.form.subtitle')}</p>
            </div>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl animate-pulse">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-green-800 dark:text-green-300 font-semibold text-lg">{t('office.form.success.title')}</h3>
                  <p className="text-green-700 dark:text-green-400">{t('office.form.success.desc')}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t('office.form.fullName')} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.fullName ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    placeholder={t('office.form.enterFullName')}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.fullName}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t('office.form.companyName')}
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder={t('office.form.enterCompanyName')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t('office.form.city')} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.city ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    placeholder={t('office.form.enterCity')}
                  />
                  {errors.city && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t('office.form.phone')} *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="emailOrPhone"
                    value={formData.emailOrPhone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.emailOrPhone ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    placeholder={t('office.form.enterPhone')}
                  />
                  {errors.emailOrPhone && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.emailOrPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('office.form.numberOfWorkstations')} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="numberOfWorkstations"
                  value={formData.numberOfWorkstations}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.numberOfWorkstations ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  placeholder={t('office.form.enterWorkstations')}
                />
                {errors.numberOfWorkstations && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.numberOfWorkstations}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t('office.form.officeSize')} *
                </label>
                <div className="relative">
                  <select
                    name="officeSize"
                    value={formData.officeSize}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.officeSize ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <option value="">{t('office.form.selectOfficeSize')}</option>
                    <option value="small">{t('office.form.small')}</option>
                    <option value="medium">{t('office.form.medium')}</option>
                    <option value="large">{t('office.form.large')}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {errors.officeSize && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.officeSize}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t('office.form.networkRequirements')} *
                </label>
                <div className="relative">
                  <select
                    name="networkRequirements"
                    value={formData.networkRequirements}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.networkRequirements ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <option value="">{t('office.form.selectNetwork')}</option>
                    <option value="basic">{t('office.form.basic')}</option>
                    <option value="standard">{t('office.form.standard')}</option>
                    <option value="advanced">{t('office.form.advanced')}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {errors.networkRequirements && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.networkRequirements}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('office.form.additionalServices')}
              </label>
              <div className="relative">
                <select
                  name="additionalServices"
                  value={formData.additionalServices}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500"
                >
                  <option value="">{t('office.form.selectServices')}</option>
                  <option value="securityCameras">{t('office.form.securityCameras')}</option>
                  <option value="serverSetup">{t('office.form.serverSetup')}</option>
                  <option value="printerSetup">{t('office.form.printerSetup')}</option>
                  <option value="softwareInstallation">{t('office.form.softwareInstallation')}</option>
                  <option value="none">{t('office.form.none')}</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('office.form.preferredDate')}
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('office.form.additionalDetails')}
              </label>
              <textarea
                name="additionalDetails"
                value={formData.additionalDetails}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder={t('office.form.additionalPlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-700 dark:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl dark:shadow-2xl dark:hover:shadow-3xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  {t('office.form.submitting')}
                </>
              ) : (
                <>
                  <span className="text-xl mr-3">📤</span>
                  {t('office.form.submit')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
