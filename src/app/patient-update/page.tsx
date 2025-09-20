'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, UserIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline'
import ModernLayout from '@/components/ModernLayout'

interface Patient {
  id: string
  name: string
  address: string
  contactNumber: string
  dateOfBirth: string
  age: number
  gender: string
  weight: number
  height: number
  bmi: number
  bloodPressure: string
  registrations: Array<{
    id: string
    status: string
    createdAt: string
  }>
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
}

export default function PatientUpdatePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingAll, setLoadingAll] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    contactNumber: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    height: '',
    bloodPressure: ''
  })

  // Load all patients on component mount
  useEffect(() => {
    fetchAllPatients()
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [])

  const fetchAllPatients = async () => {
    setLoadingAll(true)
    try {
      // Fetch all patients by searching with empty query or create a new endpoint
      const response = await fetch('/api/patients/search?q=')
      const data = await response.json()
      
      if (data.success) {
        setAllPatients(data.patients || [])
      }
    } catch (error) {
      console.error('Error fetching all patients:', error)
      setAllPatients([])
    }
    setLoadingAll(false)
  }

  const searchPatients = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.patients)
      }
    } catch (error) {
      console.error('Error searching patients:', error)
    }
    setLoading(false)
  }

  // Handle search with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout for auto-search
    const newTimeout = setTimeout(() => {
      if (value.trim()) {
        searchPatientsDebounced(value)
      } else {
        setSearchResults([])
      }
    }, 500) // 500ms delay
    
    setSearchTimeout(newTimeout)
  }

  const searchPatientsDebounced = async (query: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/patients/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.patients)
      }
    } catch (error) {
      console.error('Error searching patients:', error)
    }
    setLoading(false)
  }

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData({
      name: patient.name,
      address: patient.address,
      contactNumber: patient.contactNumber,
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
      gender: patient.gender,
      weight: patient.weight.toString(),
      height: patient.height.toString(),
      bloodPressure: patient.bloodPressure
    })
  }

  // Get patients to display - search results if searching, otherwise all patients
  const patientsToDisplay = searchQuery.trim() ? searchResults : allPatients

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const calculateBMI = (weight: number, height: number) => {
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100
      return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1))
    }
    return 0
  }

  const savePatient = async () => {
    if (!selectedPatient) return

    setSaving(true)
    try {
      const age = calculateAge(formData.dateOfBirth)
      const bmi = calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))

      const response = await fetch(`/api/patients/${selectedPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          age,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          bmi
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSelectedPatient(data.patient)
        setIsEditing(false)
        alert('Patient information updated successfully!')
      }
    } catch (error) {
      console.error('Error updating patient:', error)
      alert('Failed to update patient information')
    }
    setSaving(false)
  }

  return (
    <ModernLayout 
      title="Update Patient Details"
      subtitle="Search and modify patient information"
      showBackButton={true}
      headerIcon={<MagnifyingGlassIcon className="h-8 w-8" />}
      backgroundColor="from-red-50 via-orange-50 to-yellow-50"
    >
      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Patient List</h2>
          </div>
          
          <div className="flex space-x-4 mb-6">
            <input
              type="text"
              placeholder="Search by patient name, patient ID, contact number, or registration ID"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900"
            />
            <button
              onClick={searchPatients}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSearchResults([])
                  if (searchTimeout) {
                    clearTimeout(searchTimeout)
                  }
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Patient List */}
          {loadingAll ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">Loading patients...</div>
            </div>
          ) : patientsToDisplay.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {searchQuery.trim() ? 'Search Results' : 'All Patients'} ({patientsToDisplay.length})
              </h3>
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {patientsToDisplay.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => selectPatient(patient)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                        <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
                        <p className="text-sm text-gray-600">Contact: {patient.contactNumber}</p>
                        <p className="text-sm text-gray-600">Age: {patient.age} • Gender: {patient.gender}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Registered
                          </span>
                          {patient.registrations.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(patient.registrations[0]?.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">
                {searchQuery.trim() ? 'No patients found matching your search.' : 'No patients registered yet.'}
              </div>
            </div>
          )}
        </div>

        {/* Patient Details Section */}
        {selectedPatient && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <UserIcon className="h-8 w-8 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Patient Information</h2>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={savePatient}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        selectPatient(selectedPatient)
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Patient ID</label>
                <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg font-mono text-lg font-bold text-blue-600">
                  {selectedPatient.id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Pressure</label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={formData.bloodPressure}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., 120/80"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
                />
              </div>

              {/* Display calculated values */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                <div className="px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg font-semibold text-blue-800">
                  {formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : selectedPatient.age} years
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">BMI</label>
                <div className="px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg font-semibold text-green-800">
                  {formData.weight && formData.height 
                    ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height)).toFixed(1)
                    : selectedPatient.bmi}
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Details</h3>
              {selectedPatient.registrations.length > 0 ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">Registration ID:</span>
                        <span className="ml-2 font-mono bg-white px-2 py-1 rounded border text-blue-800 font-semibold">
                          {selectedPatient.registrations[0].id}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedPatient.registrations[0].status === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedPatient.registrations[0].status === 'medicines_issued' ? 'bg-blue-100 text-blue-800' :
                          selectedPatient.registrations[0].status === 'tests_done' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedPatient.registrations[0].status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Registered on</div>
                      <div className="font-semibold text-gray-800">
                        {new Date(selectedPatient.registrations[0].createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(selectedPatient.registrations[0].createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No registration found for this patient.
                </div>
              )}
            </div>
          </div>
        )}
    </ModernLayout>
  )
}