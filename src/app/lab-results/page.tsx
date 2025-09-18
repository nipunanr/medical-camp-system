'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeftIcon, DocumentTextIcon, MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  contactNumber: string
  age: number
  gender: string
}

interface TestType {
  id: string
  name: string
}

interface Registration {
  id: string
  patient: Patient
  registrationTests: Array<{
    testType: TestType
  }>
  createdAt: string
}

export default function LabResultsPage() {
  const [registrationId, setRegistrationId] = useState('')
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [testResults, setTestResults] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

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
        setTestResults({})
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

  const handleResultChange = (testId: string, result: string) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: result
    }))
  }

  const handleSaveResults = async () => {
    if (!registration) return

    setSaving(true)
    setSaveSuccess(false)

    try {
      // Simulate saving results - in real app, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError('Error saving test results')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-yellow-600 mr-3" />
              Lab Results Entry
            </h1>
            <p className="text-gray-600">Enter test results from laboratory</p>
          </div>
        </div>

        {/* Patient Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center mb-6">
            <MagnifyingGlassIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Patient Lookup</h2>
          </div>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Registration ID"
              className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent touch-manipulation text-lg"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation flex items-center space-x-2 disabled:opacity-50"
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

          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-600">Test results saved successfully!</p>
            </div>
          )}
        </div>

        {/* Patient Details and Results Entry */}
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

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-6">Test Results Entry</h4>
              
              <div className="space-y-6">
                {registration.registrationTests.map((regTest, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {regTest.testType.name} - Results
                    </label>
                    <textarea
                      value={testResults[regTest.testType.id] || ''}
                      onChange={(e) => handleResultChange(regTest.testType.id, e.target.value)}
                      placeholder="Enter test results, observations, and measurements..."
                      rows={4}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent touch-manipulation text-lg"
                    />
                  </div>
                ))}
              </div>

              {registration.registrationTests.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleSaveResults}
                    disabled={saving}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation flex items-center space-x-2 disabled:opacity-50"
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>{saving ? 'Saving Results...' : 'Save Test Results'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Initial State */}
        {!registration && !error && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <DocumentTextIcon className="h-24 w-24 text-yellow-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Laboratory Results</h2>
            <p className="text-gray-600 mb-8">
              Enter a registration ID above to find a patient and enter their test results.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <p className="text-yellow-800 font-medium">🔬 Ready for lab result entry</p>
              <p className="text-yellow-600 text-sm mt-2">
                Search for a patient to begin entering their test results
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}