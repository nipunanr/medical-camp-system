'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeftIcon, BeakerIcon, QrCodeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  contactNumber: string
  age: number
  gender: string
}

interface Registration {
  id: string
  patient: Patient
  registrationTests: Array<{
    testType: {
      name: string
    }
  }>
  createdAt: string
}

export default function MedicineIssuePage() {
  const [registrationId, setRegistrationId] = useState('')
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!registrationId.trim()) {
      setError('Please enter a registration ID')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/registration/${registrationId}`)
      if (response.ok) {
        const data = await response.json()
        setRegistration(data)
      } else {
        setError('Registration not found')
        setRegistration(null)
      }
    } catch (err) {
      setError('Error fetching registration details')
      setRegistration(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BeakerIcon className="h-8 w-8 text-purple-600 mr-3" />
              Medicine Issue
            </h1>
            <p className="text-gray-600">Scan QR codes and dispense medicines to patients</p>
          </div>
        </div>

        {/* QR Scanner Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center mb-6">
            <QrCodeIcon className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Patient Lookup</h2>
          </div>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Registration ID or scan QR code"
              className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent touch-manipulation text-lg"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation flex items-center space-x-2 disabled:opacity-50"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Patient Details */}
        {registration && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Patient Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <p className="text-lg font-medium text-gray-900">{registration.patient.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <p className="text-lg text-gray-900">{registration.patient.contactNumber}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age / Gender</label>
                <p className="text-lg text-gray-900">{registration.patient.age} years / {registration.patient.gender}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                <p className="text-lg text-gray-900">
                  {new Date(registration.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Prescribed Tests</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {registration.registrationTests.map((regTest, index) => (
                  <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <span className="text-purple-800 font-medium">{regTest.testType.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Medicine Dispensing</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <p className="text-yellow-800 font-medium">💊 Medicine dispensing functionality will be added here</p>
                <p className="text-yellow-600 text-sm mt-2">
                  This will allow selecting and dispensing prescribed medicines to the patient
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!registration && !error && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <QrCodeIcon className="h-24 w-24 text-purple-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Scan</h2>
            <p className="text-gray-600 mb-8">
              Enter a registration ID in the search box above or scan a patient&apos;s QR code to view their prescription details.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <p className="text-purple-800 font-medium">📱 Camera scanning feature coming soon</p>
              <p className="text-purple-600 text-sm mt-2">
                Currently supports manual registration ID entry
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}