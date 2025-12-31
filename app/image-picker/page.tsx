'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ImagePickerPage() {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Check if image URL was passed via query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url')
    if (url) {
      setImageUrl(decodeURIComponent(url))
    }
  }, [])

  const handleDownloadAndAdd = async () => {
    if (!imageUrl.trim()) {
      setError('Please enter an image URL')
      return
    }

    setDownloading(true)
    setError('')
    setSuccess(false)

    try {
      // Download the image to server
      const response = await fetch('/api/download-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageUrl.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Failed to download image')
      }

      const data = await response.json()
      
      // Try to find existing admin window or open new one
      let adminWindow = (window as any).adminWindow
      
      if (!adminWindow || adminWindow.closed) {
        // Open admin panel in new tab
        adminWindow = window.open('/admin', '_blank')
        ;(window as any).adminWindow = adminWindow
      } else {
        // Focus existing window
        adminWindow.focus()
      }
      
      // Wait for admin window to load, then send the image URL
      const sendImage = () => {
        if (adminWindow && !adminWindow.closed) {
          adminWindow.postMessage({ 
            type: 'ADD_IMAGE_TO_PRODUCT', 
            imageUrl: data.url 
          }, window.location.origin)
          setSuccess(true)
          setTimeout(() => {
            setImageUrl('')
            setSuccess(false)
          }, 2000)
        } else {
          setTimeout(sendImage, 500)
        }
      }
      
      setTimeout(sendImage, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to download image')
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📥 Add Image to PixelPad
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Paste an image URL below to download and add it to your product
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Image URL:
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleDownloadAndAdd()
                }
              }}
              placeholder="Paste image URL here (right-click image → Copy image address)"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200">✅ Image downloaded successfully! Redirecting...</p>
            </div>
          )}

          <button
            onClick={handleDownloadAndAdd}
            disabled={downloading || !imageUrl.trim()}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Downloading & Adding...
              </>
            ) : (
              <>
                📥 Download & Add to Admin Panel
              </>
            )}
          </button>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
              💡 How to use:
            </p>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside mb-3">
              <li>Browse Google Images or any website</li>
              <li><strong>Click on the image</strong> to open it in full size (important for quality!)</li>
              <li>Right-click on the <strong>full-size image</strong> → "Copy image address"</li>
              <li>Paste the URL above and click "Download & Add"</li>
              <li>You'll be redirected to the admin panel with the image ready!</li>
            </ol>
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Important:</strong> Always click the image first to open it in full size before copying the URL. Copying from the thumbnail will give you a low-quality image!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

