'use client'

import { useState } from 'react'
import { 
  ComputerDesktopIcon,
  CameraIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

export default function ServicesPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    city: '',
    emailOrPhone: '',
    numberOfComputers: '',
    needCameras: '',
    preferredDate: '',
    additionalDetails: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitStatus('success')
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        fullName: '',
        companyName: '',
        city: '',
        emailOrPhone: '',
        numberOfComputers: '',
        needCameras: '',
        preferredDate: '',
        additionalDetails: ''
      })
      setSubmitStatus('idle')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse delay-2000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Office Setup Service
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Complete office technology solutions for your business
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <ComputerDesktopIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Computer Installation</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <CameraIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Security Cameras</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Professional Setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Description */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Office Setup Service
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                We provide complete office setup solutions, including computer installation, 
                accessories, and security camera setup.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <ComputerDesktopIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Computer Installation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Professional setup of workstations, servers, and network infrastructure
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <CameraIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Security Cameras
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete security camera installation and monitoring system setup
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <WrenchScrewdriverIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Accessories & Setup
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Installation of keyboards, mice, monitors, and all office accessories
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                Please fill out the form below so we can prepare the best solution for your company.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Request Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center mr-4">
                <PaperAirplaneIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                📝 Request Form
              </h3>
            </div>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Request submitted successfully! We'll contact you soon to discuss your office setup needs.
                </span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
                <span className="text-red-800 dark:text-red-200 font-medium">
                  There was an error submitting your request. Please try again.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name (optional)
                  </label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City *
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder="Enter your city"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email or Phone *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="emailOrPhone"
                      name="emailOrPhone"
                      value={formData.emailOrPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      placeholder="Enter email or phone number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="numberOfComputers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Computers to Install *
                </label>
                <div className="relative">
                  <ComputerDesktopIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="numberOfComputers"
                    name="numberOfComputers"
                    value={formData.numberOfComputers}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    placeholder="Enter number of computers"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="needCameras" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Do you need cameras or accessories? *
                </label>
                <select
                  id="needCameras"
                  name="needCameras"
                  value={formData.needCameras}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Not sure">Not sure</option>
                </select>
              </div>

              <div>
                <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preferred installation date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional details
                </label>
                <textarea
                  id="additionalDetails"
                  name="additionalDetails"
                  value={formData.additionalDetails}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none"
                  placeholder="Please provide any additional details about your office setup requirements..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}