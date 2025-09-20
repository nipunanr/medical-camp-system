'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, UserPlusIcon, PrinterIcon, HeartIcon, CheckIcon } from '@heroicons/react/24/outline'

interface TestType {
  id: string
  name: string
  requiresResult: boolean
  requiresPrintSheet: boolean
  requiresBarcode: boolean
}

interface FormData {
  name: string
  address: string
  contactNumber: string
  dateOfBirth: string
  gender: string
  weight: string
  height: string
  bloodPressure: string
  selectedTests: string[]
}

export default function RegistrationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    contactNumber: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    height: '',
    bloodPressure: '',
    selectedTests: []
  })
  
  const [testTypes, setTestTypes] = useState<TestType[]>([])
  const [age, setAge] = useState<number | null>(null)
  const [bmi, setBmi] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [registrationResult, setRegistrationResult] = useState<{
    registrationId: string
    patientId: string // This is now the readable ID like R250920001
  } | null>(null)

  useEffect(() => {
    fetchTestTypes()
  }, [])

  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setAge(calculatedAge - 1)
      } else {
        setAge(calculatedAge)
      }
    }
  }, [formData.dateOfBirth])

  useEffect(() => {
    if (formData.weight && formData.height) {
      const weightKg = parseFloat(formData.weight)
      const heightM = parseFloat(formData.height) / 100
      if (weightKg > 0 && heightM > 0) {
        const calculatedBmi = weightKg / (heightM * heightM)
        setBmi(Math.round(calculatedBmi * 10) / 10)
      }
    }
  }, [formData.weight, formData.height])

  const fetchTestTypes = async () => {
    try {
      const response = await fetch('/api/test-types')
      const data = await response.json()
      setTestTypes(data)
    } catch (error) {
      console.error('Error fetching test types:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTestSelection = (testId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(testId)
        ? prev.selectedTests.filter(id => id !== testId)
        : [...prev.selectedTests, testId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const registrationData = {
        ...formData,
        age: age || 0,
        bmi: bmi || 0,
        weight: parseFloat(formData.weight) || 0,
        height: parseFloat(formData.height) || 0,
      }

      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      })

      if (response.ok) {
        const result = await response.json()
        setRegistrationResult(result)
        setRegistrationComplete(true)
        
        // Fetch QR code for display
        const qrResponse = await fetch(`/api/qr/${result.registrationId}`)
        const qrData = await qrResponse.json()
        if (qrData.success) {
          setQrCode(qrData.qrCode)
        }
        
        // Print prescription sheet and other required documents
        await printDocuments(result.registrationId)
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      console.error('Error registering patient:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const printDocuments = async (registrationId: string) => {
    // Open print window for prescription sheet
    window.open(`/print/prescription/${registrationId}`, '_blank')
    
    // Print additional sheets for selected tests
    const selectedTestObjects = testTypes.filter(test => formData.selectedTests.includes(test.id))
    
    for (const test of selectedTestObjects) {
      if (test.requiresPrintSheet) {
        setTimeout(() => {
          window.open(`/print/test-sheet/${registrationId}/${test.id}`, '_blank')
        }, 1000)
      }
      
      if (test.requiresBarcode) {
        setTimeout(() => {
          window.open(`/print/barcode/${registrationId}/${test.id}`, '_blank')
        }, 2000)
      }
    }
  }

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' }
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' }
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' }
    return { category: 'Obese', color: 'text-red-600' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Modern Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-sm">SC</div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
                  St. Sebastian&apos;s Church
                </h1>
                <p className="text-xs text-gray-600 font-medium">Medical Camp System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            <Link 
              href="/"
              className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-red-100 hover:border-red-200"
            >
              <ArrowLeftIcon className="h-6 w-6 text-red-600" />
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-lg">
                <UserPlusIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Patient Registration</h2>
                <p className="text-lg text-gray-600 font-medium">Register new patients for medical camp services</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!registrationComplete ? (
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-red-100">
            {/* Personal Information */}
            <div className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <HeartIcon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
                  placeholder="Enter contact number"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
                  placeholder="Enter complete address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
                />
                {age !== null && (
                  <p className="mt-2 text-sm text-gray-600">Age: <span className="font-semibold">{age} years</span></p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  required
                  step="0.1"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
                  placeholder="Enter weight"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm) *</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  required
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
                  placeholder="Enter height"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BMI</label>
                <div className="p-4 bg-gray-50 rounded-xl">
                  {bmi !== null ? (
                    <div>
                      <span className="text-2xl font-bold text-gray-800">{bmi}</span>
                      <br />
                      <span className={`text-sm font-medium ${getBmiCategory(bmi).color}`}>
                        {getBmiCategory(bmi).category}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Auto-calculated</span>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
                  placeholder="e.g., 120/80"
                />
              </div>
            </div>
          </div>

          {/* Test Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Required Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testTypes.map(test => (
                <div
                  key={test.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all touch-manipulation ${
                    formData.selectedTests.includes(test.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleTestSelection(test.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.selectedTests.includes(test.id)}
                      onChange={() => handleTestSelection(test.id)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">{test.name}</p>
                      <div className="flex space-x-2 mt-1">
                        {test.requiresResult && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Result Entry</span>
                        )}
                        {test.requiresPrintSheet && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Print Sheet</span>
                        )}
                        {test.requiresBarcode && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Barcode</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <PrinterIcon className="h-5 w-5" />
                  <span>Register & Print Documents</span>
                </>
              )}
            </button>
          </div>
        </form>
        ) : (
          /* Registration Success Screen */
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-green-100 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
              <p className="text-lg text-gray-600 mb-8">Patient has been successfully registered for the medical camp.</p>
            </div>

            {/* Patient ID Display */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Patient ID</h3>
              <div className="text-5xl font-bold text-blue-600 font-mono mb-4">
                {registrationResult?.patientId}
              </div>
              <p className="text-gray-600">This unique ID serves as the QR code for all medical camp services</p>
              
              {/* QR Code Display */}
              {qrCode && (
                <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 inline-block">
                  <img 
                    src={qrCode} 
                    alt="Patient QR Code" 
                    className="w-32 h-32 mx-auto"
                  />
                </div>
              )}
            </div>

            {/* Patient Details Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {formData.name}</div>
                <div><strong>Contact:</strong> {formData.contactNumber}</div>
                <div><strong>Age:</strong> {age} years</div>
                <div><strong>Gender:</strong> {formData.gender}</div>
                <div><strong>Weight:</strong> {formData.weight} kg</div>
                <div><strong>Height:</strong> {formData.height} cm</div>
                <div><strong>BMI:</strong> {bmi}</div>
                <div><strong>Blood Pressure:</strong> {formData.bloodPressure || 'Not recorded'}</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setRegistrationComplete(false)
                  setRegistrationResult(null)
                  setFormData({
                    name: '',
                    address: '',
                    contactNumber: '',
                    dateOfBirth: '',
                    gender: '',
                    weight: '',
                    height: '',
                    bloodPressure: '',
                    selectedTests: []
                  })
                  setAge(null)
                  setBmi(null)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Register Another Patient
              </button>
              <Link
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}