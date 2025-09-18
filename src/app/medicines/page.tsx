'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  HeartIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Medicine {
  id: string
  name: string
  dosage: string | null
  stock: number
  createdAt: string
  updatedAt: string
}

interface FormData {
  name: string
  dosage: string
  stock: number
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    dosage: '',
    stock: 0
  })

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      const response = await fetch('/api/medicines')
      const data = await response.json()
      setMedicines(data)
    } catch (error) {
      console.error('Error fetching medicines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingId ? `/api/medicines/${editingId}` : '/api/medicines'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchMedicines()
        resetForm()
      } else {
        throw new Error('Failed to save medicine')
      }
    } catch (error) {
      console.error('Error saving medicine:', error)
      alert('Failed to save medicine')
    }
  }

  const handleEdit = (medicine: Medicine) => {
    setFormData({
      name: medicine.name,
      dosage: medicine.dosage || '',
      stock: medicine.stock
    })
    setEditingId(medicine.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return

    try {
      const response = await fetch(`/api/medicines/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchMedicines()
      } else {
        throw new Error('Failed to delete medicine')
      }
    } catch (error) {
      console.error('Error deleting medicine:', error)
      alert('Failed to delete medicine')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      stock: 0
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all">
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <HeartIcon className="h-8 w-8 text-red-600 mr-3" />
                Medicine Management
              </h1>
              <p className="text-gray-600">Manage medicine inventory and dispensing</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Medicine</span>
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingId ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent touch-manipulation text-lg"
                    placeholder="Enter medicine name"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dosage
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent touch-manipulation text-lg"
                    placeholder="e.g., 500mg, 10ml"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent touch-manipulation text-lg"
                    placeholder="Enter stock quantity"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all touch-manipulation"
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

        {/* Medicines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {medicines.map((medicine) => (
            <div key={medicine.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{medicine.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(medicine)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all touch-manipulation"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(medicine.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all touch-manipulation"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {medicine.dosage && (
                  <div>
                    <span className="text-sm text-gray-500">Dosage:</span>
                    <p className="font-medium text-gray-800">{medicine.dosage}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm text-gray-500">Stock:</span>
                  <p className={`font-bold text-lg ${medicine.stock < 10 ? 'text-red-600' : medicine.stock < 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {medicine.stock} units
                  </p>
                  {medicine.stock < 10 && (
                    <p className="text-xs text-red-500 mt-1">Low stock warning!</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Added: {new Date(medicine.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {medicines.length === 0 && (
          <div className="text-center py-12">
            <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
            <p className="text-gray-500 mb-6">Get started by adding your first medicine</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
            >
              Add Medicine
            </button>
          </div>
        )}
      </div>
    </div>
  )
}