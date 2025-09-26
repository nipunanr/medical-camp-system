'use client'

import { useState, useEffect } from 'react'

export default function MaintenancePage() {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString())
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <img 
              src="/church-logo.png" 
              alt="St. Sebastian's Church" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Medical Camp System
          </h1>
          <p className="text-lg text-gray-600">St. Sebastian's Church</p>
        </div>

        {/* Maintenance Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              System Under Maintenance
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We are currently performing scheduled maintenance to improve our services. 
              The Medical Camp System will be temporarily unavailable during this time.
            </p>
          </div>

          {/* Expected Time */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Maintenance Details</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• System upgrades and performance optimizations</p>
              <p>• Database maintenance and security updates</p>
              <p>• Enhanced features and bug fixes</p>
            </div>
          </div>

          {/* Current Time */}
          <div className="text-sm text-gray-500">
            Current Time: {currentTime}
          </div>
        </div>

        {/* Progress Animation */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <p className="text-sm text-gray-600 mb-3">Maintenance in progress...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-gray-500">We appreciate your patience</p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-400">
          <p>© 2025 Medical Camp System. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}