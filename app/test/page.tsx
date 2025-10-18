'use client'

import { useEffect } from 'react'

export default function TestPage() {
  useEffect(() => {
    console.log('TEST PAGE LOADED! Navigation is working!')
    alert('TEST PAGE LOADED! Navigation is working!')
  }, [])

  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-red-500 mb-4">
          🎉 SUCCESS! 🎉
        </h1>
        <p className="text-2xl text-gray-800 mb-8">
          Navigation is working perfectly!
        </p>
        <p className="text-lg text-gray-600 mb-8">
          You successfully navigated to the test page.
        </p>
        <a 
          href="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-xl transition-colors"
        >
          ← Go Back Home
        </a>
      </div>
    </div>
  )
}
