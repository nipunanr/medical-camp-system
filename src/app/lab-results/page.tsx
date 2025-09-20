'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  registrationId: string
}

interface TestType {
  id: string
  name: string
  normalRange?: string
}

interface TestResult {
  id: string
  result: string
  testType: TestType
  registration: {
    id: string
    registrationId?: string
    patient: Patient
  }
  enteredAt: string
  enteredBy?: string
}

interface PendingRegistration {
  id: string
  registrationId: string
  patient: Patient
  testTypes: TestType[]
  existingResults: TestResult[]
}

export default function LabResults() {
  const [allResultsLoading, setAllResultsLoading] = useState(false)
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([])
  const [allResults, setAllResults] = useState<TestResult[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showPending, setShowPending] = useState(true)
  const [showAllResults, setShowAllResults] = useState(true)
  const [editingResult, setEditingResult] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetchPendingRegistrations()
    fetchAllResults()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm || allResults.length === 0) {
        fetchAllResults()
      }
    }, 300) // Debounce search

    return () => clearTimeout(delayedSearch)
  }, [searchTerm]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch('/api/test-results/pending')
      if (response.ok) {
        const data = await response.json()
        // Extract pendingResults array from API response and transform to expected format
        const pendingResults = data.pendingResults || []
        const transformedData = pendingResults.map((item: any) => ({
          id: item.id,
          registrationId: item.id, // Use id as registrationId
          patient: item.patient,
          testTypes: item.pendingTests?.map((pt: any) => pt.testType) || [],
          existingResults: item.completedTests || []
        }))
        setPendingRegistrations(Array.isArray(transformedData) ? transformedData : [])
      } else {
        console.error('Failed to fetch pending registrations:', response.statusText)
        setPendingRegistrations([])
      }
    } catch (err) {
      console.error('Error fetching pending registrations:', err)
      setPendingRegistrations([])
    }
  }

  const fetchAllResults = async () => {
    setAllResultsLoading(true)
    try {
      const response = await fetch(`/api/test-results?limit=50&search=${searchTerm}`)
      if (response.ok) {
        const data = await response.json()
        // Extract testResults array from API response
        const results = data.testResults || []
        setAllResults(Array.isArray(results) ? results : [])
      } else {
        console.error('Failed to fetch all results:', response.statusText)
        setAllResults([])
      }
    } catch (err) {
      console.error('Error fetching all results:', err)
      setAllResults([])
    } finally {
      setAllResultsLoading(false)
    }
  }

  const savePendingResult = async (registrationId: string, testTypeId: string, result: string) => {
    try {
      const response = await fetch('/api/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId,
          testTypeId,
          result
        })
      })

      if (response.ok) {
        fetchPendingRegistrations()
        fetchAllResults()
        return true
      }
      return false
    } catch (err) {
      console.error('Error saving result:', err)
      return false
    }
  }

  const updateResult = async (resultId: string, newValue: string) => {
    try {
      const response = await fetch('/api/test-results', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resultId,
          result: newValue
        })
      })

      if (response.ok) {
        setEditingResult(null)
        setEditValue('')
        fetchAllResults()
      }
    } catch (err) {
      console.error('Error updating result:', err)
    }
  }

  const startEditing = (resultId: string, currentValue: string) => {
    setEditingResult(resultId)
    setEditValue(currentValue)
  }

  const cancelEditing = () => {
    setEditingResult(null)
    setEditValue('')
  }

  const pendingCount = Array.isArray(pendingRegistrations) ? pendingRegistrations.reduce((acc, reg) => 
    acc + reg.testTypes.filter(tt => !reg.existingResults.some(er => er.testType.id === tt.id)).length, 0
  ) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-yellow-600 mr-3" />
              Lab Results Entry
            </h1>
            <p className="text-gray-600">Enhanced lab results with pending tests and search</p>
          </div>
        </div>

        {/* Pending Results Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-6">
          <button
            onClick={() => setShowPending(!showPending)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 rounded-t-2xl"
          >
            <div className="flex items-center">
              <div className="h-8 w-8 text-yellow-600 mr-3">
                {showPending ? <ChevronDownIcon /> : <ChevronRightIcon />}
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Pending Test Results
                {pendingCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-sm rounded-full">
                    {pendingCount} pending
                  </span>
                )}
              </h2>
            </div>
          </button>
          
          {showPending && (
            <div className="p-6 pt-0 border-t">
              {!Array.isArray(pendingRegistrations) || pendingRegistrations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending test results</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Age
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Test Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Normal Range
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Result
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingRegistrations.map((registration) => {
                        const pendingTests = registration.testTypes.filter(tt => 
                          !registration.existingResults.some(er => er.testType.id === tt.id)
                        )
                        
                        if (pendingTests.length === 0) return null
                        
                        return pendingTests.map((testType, index) => (
                          <PendingTestRow
                            key={`${registration.id}-${testType.id}`}
                            patient={registration.patient}
                            registrationId={registration.id}
                            testType={testType}
                            showPatientInfo={index === 0}
                            rowSpan={pendingTests.length}
                            onSave={savePendingResult}
                          />
                        ))
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* All Results Section */}
        <div className="bg-white rounded-2xl shadow-xl mb-6">
          <button
            onClick={() => setShowAllResults(!showAllResults)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 rounded-t-2xl"
          >
            <div className="flex items-center">
              <div className="h-8 w-8 text-yellow-600 mr-3">
                {showAllResults ? <ChevronDownIcon /> : <ChevronRightIcon />}
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                All Test Results ({allResults.length})
              </h2>
            </div>
          </button>
          
          {showAllResults && (
            <div className="p-6 pt-0 border-t">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchAllResults()}
                    placeholder="Search by patient name, registration ID, or test type..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={fetchAllResults}
                  className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Results */}
              {allResultsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                    <span className="text-gray-500">Loading test results...</span>
                  </div>
                </div>
              ) : allResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No test results found</p>
                  {searchTerm && (
                    <p className="text-sm mt-2">Try searching with different keywords or clear the search</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{result.registration.patient.name}</h4>
                            <p className="text-sm text-gray-600">
                              Patient ID: {result.registration.patient.id} | {result.testType.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400 mb-1">Entered</p>
                            <p className="text-sm text-gray-500">
                              {(() => {
                                try {
                                  const date = new Date(result.enteredAt);
                                  if (isNaN(date.getTime())) {
                                    return 'Date not available';
                                  }
                                  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                                } catch (e) {
                                  return 'Date not available';
                                }
                              })()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {editingResult === result.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                  autoFocus
                                />
                                <button
                                  onClick={() => updateResult(result.id, editValue)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{result.result}</span>
                                <button
                                  onClick={() => startEditing(result.id, result.result)}
                                  className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                                  title="Edit result"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {result.testType.normalRange && (
                          <p className="text-xs text-gray-500 mt-1">
                            Normal range: {result.testType.normalRange}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Component for pending test row in table
function PendingTestRow({ 
  patient, 
  registrationId, 
  testType, 
  showPatientInfo, 
  rowSpan, 
  onSave 
}: { 
  patient: Patient; 
  registrationId: string; 
  testType: TestType; 
  showPatientInfo: boolean; 
  rowSpan: number; 
  onSave: (registrationId: string, testTypeId: string, result: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!value.trim()) return
    
    setSaving(true)
    const success = await onSave(registrationId, testType.id, value.trim())
    if (success) {
      setValue('')
    }
    setSaving(false)
  }

  return (
    <tr className="hover:bg-gray-50">
      {showPatientInfo && (
        <>
          <td rowSpan={rowSpan} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
            {patient.name}
          </td>
          <td rowSpan={rowSpan} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r">
            {patient.id}
          </td>
          <td rowSpan={rowSpan} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r">
            {patient.age}
          </td>
          <td rowSpan={rowSpan} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r">
            {patient.gender}
          </td>
        </>
      )}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {testType.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {testType.normalRange || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter result..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={handleSave}
          disabled={!value.trim() || saving}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </td>
    </tr>
  )
}

// Component for pending test input
function PendingTestInput({ 
  testType, 
  registrationId, 
  onSave 
}: { 
  testType: TestType; 
  registrationId: string; 
  onSave: (registrationId: string, testTypeId: string, result: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!value.trim()) return
    
    setSaving(true)
    const success = await onSave(registrationId, testType.id, value.trim())
    if (success) {
      setValue('')
    }
    setSaving(false)
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-white rounded border">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {testType.name}
        </label>
        {testType.normalRange && (
          <p className="text-xs text-gray-500 mb-2">Normal: {testType.normalRange}</p>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter result..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={!value.trim() || saving}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
