'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  ClipboardDocumentCheckIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface TestType {
  id: string
  name: string
  requiresResult: boolean
  requiresPrintSheet: boolean
  requiresBarcode: boolean
  createdAt: string
  updatedAt: string
}

interface FormData {
  name: string
  requiresResult: boolean
  requiresPrintSheet: boolean
  requiresBarcode: boolean
}

export default function TestTypesPage() {
  const [testTypes, setTestTypes] = useState<TestType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    requiresResult: false,
    requiresPrintSheet: false,
    requiresBarcode: false
  })

  useEffect(() => {
    fetchTestTypes()
  }, [])

  const fetchTestTypes = async () => {
    try {
      const response = await fetch('/api/test-types')
      
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array
        if (Array.isArray(data)) {
          setTestTypes(data)
        } else {
          console.error('Expected array but got:', data)
          setTestTypes([])
        }
      } else {
        console.error('Failed to fetch test types:', response.status)
        setTestTypes([])
      }
    } catch (error) {
      console.error('Error fetching test types:', error)
      setTestTypes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/test-types/${editingId}` : '/api/test-types'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchTestTypes()
        resetForm()
      } else {
        throw new Error('Failed to save test type')
      }
    } catch (error) {
      console.error('Error saving test type:', error)
      alert('Failed to save test type')
    }
  }

  const handleEdit = (testType: TestType) => {
    setFormData({
      name: testType.name,
      requiresResult: testType.requiresResult,
      requiresPrintSheet: testType.requiresPrintSheet,
      requiresBarcode: testType.requiresBarcode
    })
    setEditingId(testType.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test type?')) return

    try {
      const response = await fetch(`/api/test-types/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTestTypes()
      } else {
        throw new Error('Failed to delete test type')
      }
    } catch (error) {
      console.error('Error deleting test type:', error)
      alert('Failed to delete test type')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      requiresResult: false,
      requiresPrintSheet: false,
      requiresBarcode: false
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all">
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-green-600 mr-3" />
                Test Type Master
              </h1>
              <p className="text-gray-600">Manage available medical tests and configurations</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Test Type</span>
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingId ? 'Edit Test Type' : 'Add New Test Type'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent touch-manipulation text-lg"
                    placeholder="Enter test name"
                  />
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="requiresResult"
                      checked={formData.requiresResult}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Requires Result Entry
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="requiresPrintSheet"
                      checked={formData.requiresPrintSheet}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Requires Printed Data Sheet
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="requiresBarcode"
                      checked={formData.requiresBarcode}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label className="ml-3 text-sm font-medium text-gray-700">
                      Requires Barcode
                    </label>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all touch-manipulation"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all touch-manipulation"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Test Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testTypes.map((testType) => (
            <div key={testType.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{testType.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(testType)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all touch-manipulation"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(testType.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all touch-manipulation"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${testType.requiresResult ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={`text-sm ${testType.requiresResult ? 'text-green-700' : 'text-gray-500'}`}>
                    Result Entry Required
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${testType.requiresPrintSheet ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <span className={`text-sm ${testType.requiresPrintSheet ? 'text-blue-700' : 'text-gray-500'}`}>
                    Print Sheet Required
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${testType.requiresBarcode ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                  <span className={`text-sm ${testType.requiresBarcode ? 'text-purple-700' : 'text-gray-500'}`}>
                    Barcode Required
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Created: {new Date(testType.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {testTypes.length === 0 && (
          <div className="text-center py-12">
            <ClipboardDocumentCheckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test types found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first test type</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
            >
              Add Test Type
            </button>
          </div>
        )}
      </div>
    </div>
  )
}