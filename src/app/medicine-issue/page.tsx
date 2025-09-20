'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeftIcon, BeakerIcon, QrCodeIcon, MagnifyingGlassIcon, PlusIcon, MinusIcon, ChevronDownIcon, ChevronRightIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  contactNumber: string
  age: number
  gender: string
}

interface Medicine {
  id: string
  name: string
  dosage: string
  stock: number
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

interface MedicineIssueForm {
  medicineId: string
  customMedicine: string
  quantity: number
  dosage: {
    amount: number
    unit: string
    frequency: {
      morning: boolean
      day: boolean
      night: boolean
    }
    timing: string
  }
  instructions: string
}

interface IssuedMedicine {
  id: string
  registrationId: string
  medicineId: string | null
  customMedicine: string | null
  quantity: number
  dosage: string | null
  instructions: string | null
  issuedBy: string
  issuedAt: string
  medicine?: {
    id: string
    name: string
    description: string
    stock: number
  }
}

export default function MedicineIssuePage() {
  const [registrationId, setRegistrationId] = useState('')
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [issuedMedicines, setIssuedMedicines] = useState<IssuedMedicine[]>([])
  const [allMedicineIssues, setAllMedicineIssues] = useState<IssuedMedicine[]>([])
  const [showAllIssues, setShowAllIssues] = useState(false)
  const [loadingAllIssues, setLoadingAllIssues] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [issuingMedicine, setIssuingMedicine] = useState(false)
  const [issueSuccess, setIssueSuccess] = useState(false)
  
  const [medicineForm, setMedicineForm] = useState<MedicineIssueForm>({
    medicineId: '',
    customMedicine: '',
    quantity: 1,
    dosage: {
      amount: 1,
      unit: 'tablet',
      frequency: {
        morning: false,
        day: false,
        night: false
      },
      timing: 'before'
    },
    instructions: ''
  })

  // Fetch available medicines
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch('/api/medicines')
        if (response.ok) {
          const data = await response.json()
          setMedicines(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Error fetching medicines:', err)
      }
    }
    fetchMedicines()
  }, [])

  // Fetch initial count of all medicine issues for display
  useEffect(() => {
    const fetchInitialCount = async () => {
      try {
        const response = await fetch('/api/medicine-issues')
        if (response.ok) {
          const data = await response.json()
          setAllMedicineIssues(data.medicineIssues || [])
        }
      } catch (err) {
        console.error('Error fetching initial medicine issues count:', err)
      }
    }
    fetchInitialCount()
  }, [])

  const fetchIssuedMedicines = async (regId: string) => {
    try {
      console.log('Fetching issued medicines for registration:', regId)
      const response = await fetch(`/api/medicine-issues?registrationId=${regId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Issued medicines response:', data)
        setIssuedMedicines(data.medicineIssues || [])
      } else {
        console.error('Failed to fetch issued medicines:', response.status)
      }
    } catch (err) {
      console.error('Error fetching issued medicines:', err)
    }
  }

  const fetchAllMedicineIssues = async () => {
    if (allMedicineIssues.length > 0) {
      setShowAllIssues(!showAllIssues)
      return
    }

    setLoadingAllIssues(true)
    try {
      const response = await fetch('/api/medicine-issues')
      if (response.ok) {
        const data = await response.json()
        setAllMedicineIssues(data.medicineIssues || [])
        setShowAllIssues(true)
      } else {
        console.error('Failed to fetch all medicine issues:', response.status)
      }
    } catch (err) {
      console.error('Error fetching all medicine issues:', err)
    } finally {
      setLoadingAllIssues(false)
    }
  }

  const formatDosage = (dosage: typeof medicineForm.dosage) => {
    const frequencyParts = []
    if (dosage.frequency.morning) frequencyParts.push('Morning')
    if (dosage.frequency.day) frequencyParts.push('Day')
    if (dosage.frequency.night) frequencyParts.push('Night')
    
    const frequencyText = frequencyParts.length > 0 ? frequencyParts.join(', ') : 'As needed'
    const timingText = dosage.timing === 'before' ? 'Before Meals' :
                      dosage.timing === 'after' ? 'After Meals' :
                      dosage.timing === 'with' ? 'With Meals' :
                      dosage.timing === 'empty' ? 'On Empty Stomach' : 'Any Time'
    
    return `${dosage.amount} ${dosage.unit} - ${frequencyText} - ${timingText}`
  }

  const handleSearch = async () => {
    if (!registrationId.trim()) {
      setError('Please enter a registration ID')
      return
    }

    setLoading(true)
    setError('')
    setIssueSuccess(false)
    
    try {
      const response = await fetch(`/api/registration/${registrationId}`)
      if (response.ok) {
        const data = await response.json()
        setRegistration(data)
        // Fetch issued medicines for this registration using the registration's actual ID
        fetchIssuedMedicines(data.id)
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

  const handleMedicineIssue = async () => {
    if (!registration) return
    
    if (!medicineForm.medicineId && !medicineForm.customMedicine.trim()) {
      setError('Please select a medicine or enter a custom medicine name')
      return
    }

    if (medicineForm.quantity < 1) {
      setError('Quantity must be at least 1')
      return
    }

    // Check if at least one frequency is selected
    const { morning, day, night } = medicineForm.dosage.frequency
    if (!morning && !day && !night) {
      setError('Please select at least one frequency (Morning, Day, or Night)')
      return
    }

    setIssuingMedicine(true)
    setError('')
    
    try {
      const response = await fetch('/api/medicine-issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registrationId: registration.id,
          medicineId: medicineForm.medicineId || null,
          customMedicine: medicineForm.customMedicine || null,
          quantity: medicineForm.quantity,
          dosage: formatDosage(medicineForm.dosage),
          instructions: medicineForm.instructions,
          issuedBy: 'pharmacist' // In a real app, this would be the logged-in user
        })
      })

      if (response.ok) {
        setIssueSuccess(true)
        setMedicineForm({
          medicineId: '',
          customMedicine: '',
          quantity: 1,
          dosage: {
            amount: 1,
            unit: 'tablet',
            frequency: {
              morning: false,
              day: false,
              night: false
            },
            timing: 'before'
          },
          instructions: ''
        })
        // Refresh medicines to update stock
        const medicinesResponse = await fetch('/api/medicines')
        if (medicinesResponse.ok) {
          const data = await medicinesResponse.json()
          setMedicines(Array.isArray(data) ? data : [])
        }
        // Refresh issued medicines list
        fetchIssuedMedicines(registration.id)
        
        // Refresh all medicine issues list to update the count
        try {
          const allIssuesResponse = await fetch('/api/medicine-issues')
          if (allIssuesResponse.ok) {
            const allIssuesData = await allIssuesResponse.json()
            setAllMedicineIssues(allIssuesData.medicineIssues || [])
          }
        } catch (err) {
          console.error('Error refreshing all medicine issues:', err)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error issuing medicine')
      }
    } catch (err) {
      setError('Error issuing medicine')
    } finally {
      setIssuingMedicine(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const selectedMedicine = medicines.find(m => m.id === medicineForm.medicineId)

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

        {/* All Medicine Issues - Collapsible Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <button
            onClick={fetchAllMedicineIssues}
            disabled={loadingAllIssues}
            className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600 mr-3" />
              <span className="text-lg font-semibold text-gray-800">
                {loadingAllIssues ? 'Loading...' : `All Medicine Issues (${allMedicineIssues.length})`}
              </span>
            </div>
            {showAllIssues ? (
              <ChevronDownIcon className="h-5 w-5 text-purple-600" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-purple-600" />
            )}
          </button>

          {showAllIssues && (
            <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
              {allMedicineIssues.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No medicine issues found</p>
              ) : (
                allMedicineIssues.map((issue) => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {issue.medicine?.name || issue.customMedicine}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Registration ID: {issue.registrationId}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          Qty: {issue.quantity}
                        </span>
                      </div>
                    </div>
                    {issue.dosage && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Dosage:</strong> {issue.dosage}
                      </p>
                    )}
                    {issue.instructions && (
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Instructions:</strong> {issue.instructions}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Issued by: {issue.issuedBy}</span>
                      <span>{new Date(issue.issuedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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

          {issueSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-green-600">✅ Medicine issued successfully!</p>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Medicine Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Medicine</label>
                  <select
                    value={medicineForm.medicineId}
                    onChange={(e) => setMedicineForm({ ...medicineForm, medicineId: e.target.value, customMedicine: '' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select from inventory...</option>
                    {medicines.map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.name} ({medicine.dosage}) - Stock: {medicine.stock}
                      </option>
                    ))}
                  </select>
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Or enter custom medicine</label>
                    <input
                      type="text"
                      value={medicineForm.customMedicine}
                      onChange={(e) => setMedicineForm({ ...medicineForm, customMedicine: e.target.value, medicineId: '' })}
                      placeholder="Enter custom medicine name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Quantity and Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center space-x-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setMedicineForm({ ...medicineForm, quantity: Math.max(1, medicineForm.quantity - 1) })}
                      className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={medicineForm.quantity}
                      onChange={(e) => setMedicineForm({ ...medicineForm, quantity: parseInt(e.target.value) || 1 })}
                      className="w-20 p-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => setMedicineForm({ ...medicineForm, quantity: medicineForm.quantity + 1 })}
                      className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    {selectedMedicine && (
                      <span className="text-sm text-gray-600">
                        (Available: {selectedMedicine.stock})
                      </span>
                    )}
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-4">Dosage Instructions</label>
                  
                  {/* Amount and Unit */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Amount</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={medicineForm.dosage.amount}
                        onChange={(e) => setMedicineForm({ 
                          ...medicineForm, 
                          dosage: { 
                            ...medicineForm.dosage, 
                            amount: parseFloat(e.target.value) || 1 
                          } 
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Unit</label>
                      <select
                        value={medicineForm.dosage.unit}
                        onChange={(e) => setMedicineForm({ 
                          ...medicineForm, 
                          dosage: { 
                            ...medicineForm.dosage, 
                            unit: e.target.value 
                          } 
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="tablet">Tablet(s)</option>
                        <option value="pill">Pill(s)</option>
                        <option value="ml">ML</option>
                        <option value="capsule">Capsule(s)</option>
                        <option value="drop">Drop(s)</option>
                        <option value="tsp">Teaspoon(s)</option>
                        <option value="tbsp">Tablespoon(s)</option>
                      </select>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Frequency</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={medicineForm.dosage.frequency.morning}
                          onChange={(e) => setMedicineForm({ 
                            ...medicineForm, 
                            dosage: { 
                              ...medicineForm.dosage, 
                              frequency: { 
                                ...medicineForm.dosage.frequency, 
                                morning: e.target.checked 
                              } 
                            } 
                          })}
                          className="mr-2 rounded focus:ring-purple-500"
                        />
                        Morning
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={medicineForm.dosage.frequency.day}
                          onChange={(e) => setMedicineForm({ 
                            ...medicineForm, 
                            dosage: { 
                              ...medicineForm.dosage, 
                              frequency: { 
                                ...medicineForm.dosage.frequency, 
                                day: e.target.checked 
                              } 
                            } 
                          })}
                          className="mr-2 rounded focus:ring-purple-500"
                        />
                        Day
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={medicineForm.dosage.frequency.night}
                          onChange={(e) => setMedicineForm({ 
                            ...medicineForm, 
                            dosage: { 
                              ...medicineForm.dosage, 
                              frequency: { 
                                ...medicineForm.dosage.frequency, 
                                night: e.target.checked 
                              } 
                            } 
                          })}
                          className="mr-2 rounded focus:ring-purple-500"
                        />
                        Night
                      </label>
                    </div>
                  </div>

                  {/* Meal Timing */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Meal Timing</label>
                    <select
                      value={medicineForm.dosage.timing}
                      onChange={(e) => setMedicineForm({ 
                        ...medicineForm, 
                        dosage: { 
                          ...medicineForm.dosage, 
                          timing: e.target.value 
                        } 
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="before">Before Meals</option>
                      <option value="after">After Meals</option>
                      <option value="with">With Meals</option>
                      <option value="empty">On Empty Stomach</option>
                      <option value="anytime">Any Time</option>
                    </select>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                  <textarea
                    value={medicineForm.instructions}
                    onChange={(e) => setMedicineForm({ ...medicineForm, instructions: e.target.value })}
                    placeholder="Additional instructions for the patient"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleMedicineIssue}
                  disabled={issuingMedicine || (!medicineForm.medicineId && !medicineForm.customMedicine.trim())}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {issuingMedicine ? 'Issuing Medicine...' : 'Issue Medicine'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Issued Medicines List */}
        {registration && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="h-8 w-8 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Previously Issued Medicines
            </h2>
            
            {issuedMedicines.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Medicine</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Dosage</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Instructions</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Issued By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedMedicines.map((issue, index) => (
                      <tr key={issue.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(issue.issuedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {issue.medicine?.name || issue.customMedicine}
                          </div>
                          {issue.medicine?.description && (
                            <div className="text-sm text-gray-500">{issue.medicine.description}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {issue.quantity}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {issue.dosage || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {issue.instructions || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {issue.issuedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v2a1 1 0 001 1h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-600">No medicines issued yet</p>
                  <p className="text-sm text-gray-500">Medicines issued to this patient will appear here</p>
                </div>
              </div>
            )}
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