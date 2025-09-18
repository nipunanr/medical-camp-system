'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'

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
}

interface TestType {
  id: string
  name: string
}

interface Registration {
  id: string
  qrCode: string
  patient: Patient
  registrationTests: Array<{
    testType: TestType
  }>
  createdAt: string
}

export default function PrescriptionPrint() {
  const params = useParams()
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRegistration = useCallback(async () => {
    try {
      const response = await fetch(`/api/registration/${params.registrationId}`)
      const data = await response.json()
      setRegistration(data)
    } catch (error) {
      console.error('Error fetching registration:', error)
    } finally {
      setLoading(false)
    }
  }, [params.registrationId])

  useEffect(() => {
    fetchRegistration()
  }, [fetchRegistration])

  useEffect(() => {
    if (registration && !loading) {
      // Auto print after 1 second
      setTimeout(() => {
        window.print()
      }, 1000)
    }
  }, [registration, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Registration not found</h1>
          <button onClick={() => window.close()} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    )
  }

  const { patient } = registration

  return (
    <>
      <style jsx global>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .print-page {
            width: 148mm;
            height: 210mm;
            margin: 0;
            padding: 10mm;
            page-break-after: always;
            font-size: 12px;
          }
        }
        
        @page {
          size: A5;
          margin: 0;
        }
      `}</style>

      <div className="no-print p-4 bg-gray-100 min-h-screen">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-4 text-center">
            <h1 className="text-lg font-bold">Print Preview</h1>
            <p className="text-sm">Prescription Sheet</p>
          </div>
          <div className="p-4">
            <button 
              onClick={() => window.print()} 
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4"
            >
              Print Document
            </button>
            <button 
              onClick={() => window.close()} 
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>

      <div className="print-page bg-white">
        {/* Header */}
        <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
          <h1 className="text-xl font-bold text-blue-600 mb-1">MEDICAL CAMP</h1>
          <h2 className="text-lg font-semibold mb-1">PRESCRIPTION SHEET</h2>
          <p className="text-sm text-gray-600">Patient Registration & Treatment Record</p>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 uppercase">Patient Name</label>
              <p className="text-sm font-medium border-b border-gray-300 pb-1">{patient.name}</p>
            </div>
            
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 uppercase">Age / Gender</label>
              <p className="text-sm font-medium border-b border-gray-300 pb-1">
                {patient.age} years / {patient.gender}
              </p>
            </div>
            
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 uppercase">Contact</label>
              <p className="text-sm font-medium border-b border-gray-300 pb-1">{patient.contactNumber}</p>
            </div>
            
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 uppercase">Weight / Height</label>
              <p className="text-sm font-medium border-b border-gray-300 pb-1">
                {patient.weight} kg / {patient.height} cm
              </p>
            </div>
          </div>
          
          <div>
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 uppercase">Registration Date</label>
              <p className="text-sm font-medium border-b border-gray-300 pb-1">
                {new Date(registration.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 uppercase">BMI</label>
              <p className="text-sm font-medium border-b border-gray-300 pb-1">{patient.bmi}</p>
            </div>
            
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 uppercase">Blood Pressure</label>
              <p className="text-sm font-medium border-b border-gray-300 pb-1">
                {patient.bloodPressure || '_______'}
              </p>
            </div>
            
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-600 uppercase">Registration ID</label>
              <p className="text-xs font-mono border-b border-gray-300 pb-1">{registration.id}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-600 uppercase">Address</label>
          <p className="text-sm font-medium border-b border-gray-300 pb-1">{patient.address}</p>
        </div>

        {/* Requested Tests */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">Requested Tests</label>
          <div className="grid grid-cols-2 gap-2">
            {registration.registrationTests.map((regTest, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm">☐ {regTest.testType.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor&apos;s Section */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">Doctor&apos;s Examination</label>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-600">Symptoms:</span>
              <div className="border-b border-gray-300 h-6"></div>
            </div>
            <div>
              <span className="text-xs text-gray-600">Diagnosis:</span>
              <div className="border-b border-gray-300 h-6"></div>
            </div>
            <div>
              <span className="text-xs text-gray-600">Additional Tests:</span>
              <div className="border-b border-gray-300 h-6"></div>
            </div>
          </div>
        </div>

        {/* Prescription */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">Prescription</label>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((line) => (
              <div key={line} className="border-b border-gray-300 h-5"></div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div className="text-center">
            <div className="w-24 border-b border-gray-400 mb-1"></div>
            <p className="text-xs text-gray-600">Doctor&apos;s Signature</p>
          </div>
          
          <div className="text-center">
            {registration.qrCode && (
              <div>
                <Image src={registration.qrCode} alt="QR Code" width={64} height={64} className="mx-auto mb-1" />
                <p className="text-xs text-gray-600">Scan for Details</p>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <div className="w-24 border-b border-gray-400 mb-1"></div>
            <p className="text-xs text-gray-600">Date & Time</p>
          </div>
        </div>
      </div>
    </>
  )
}