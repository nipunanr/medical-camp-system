'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  PrinterIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  registrationId: string
  height?: number
  weight?: number
  bmi?: number
  bloodPressure?: string
}

interface TestType {
  id: string
  name: string
  normalRange?: string
  unit?: string
}

interface TestResult {
  id: string
  result: string
  enteredAt: string
  testType: TestType
  registration: {
    id: string
    patient: Patient
  }
}

interface PrintRecord {
  id: string
  registrationId: string
  patientName: string
  printedAt: string
  printedBy: string
  testResults: TestResult[]
}

interface GroupedTestResult {
  registration: {
    id: string
    patient: Patient
  }
  results: TestResult[]
}

export default function LabReportPrinting() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
  const [pendingReports, setPendingReports] = useState<GroupedTestResult[]>([])
  const [completedPrints, setCompletedPrints] = useState<PrintRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPendingReports()
    fetchCompletedPrints()
  }, [])

  const fetchPendingReports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/test-results?completed=true&pending_print=true')
      if (response.ok) {
        const data = await response.json()
        // Group by registration ID to show unique patients
        const groupedResults = groupByRegistration(data.testResults || [])
        setPendingReports(groupedResults)
      }
    } catch (error) {
      console.error('Error fetching pending reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompletedPrints = async () => {
    try {
      // This would fetch from a print_records table or similar
      // For now, using localStorage as a placeholder
      const stored = localStorage.getItem('completedPrintRecords')
      if (stored) {
        setCompletedPrints(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error fetching completed prints:', error)
    }
  }

  const groupByRegistration = (results: TestResult[]): GroupedTestResult[] => {
    const grouped = results.reduce((acc, result) => {
      const regId = result.registration.id
      if (!acc[regId]) {
        acc[regId] = {
          registration: result.registration,
          results: []
        }
      }
      acc[regId].results.push(result)
      return acc
    }, {} as Record<string, GroupedTestResult>)

    return Object.values(grouped)
  }

  const handlePrint = async (registrationData: GroupedTestResult) => {
    try {
      // Open print window
      const printWindow = await openLabReportPrint(registrationData)
      
      // Move to completed after successful print
      if (printWindow) {
        const printRecord: PrintRecord = {
          id: Date.now().toString(),
          registrationId: registrationData.registration.patient.id, // Use patient.id (readable ID like P001)
          patientName: registrationData.registration.patient.name,
          printedAt: new Date().toISOString(),
          printedBy: 'Current User', // This would come from auth context
          testResults: registrationData.results
        }

        // Add to completed prints
        const updatedCompleted = [...completedPrints, printRecord]
        setCompletedPrints(updatedCompleted)
        localStorage.setItem('completedPrintRecords', JSON.stringify(updatedCompleted))

        // Remove from pending
        setPendingReports(prev => 
          prev.filter(item => item.registration.id !== registrationData.registration.id)
        )
      }
    } catch (error) {
      console.error('Error printing report:', error)
    }
  }

  const handleReprint = async (printRecord: PrintRecord) => {
    const registrationData: GroupedTestResult = {
      registration: {
        id: printRecord.registrationId, // This is now the patient ID
        patient: {
          id: printRecord.registrationId, // Patient ID (readable like P001)
          name: printRecord.patientName,
          age: 0,
          gender: '',
          registrationId: printRecord.registrationId // Same as patient ID
        }
      },
      results: printRecord.testResults
    }
    
    await openLabReportPrint(registrationData, true)
  }

  const openLabReportPrint = async (registrationData: GroupedTestResult, isReprint = false) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return null

    const patient = registrationData.registration.patient
    const results = registrationData.results

    // Calculate BMI if height and weight are available
    const bmi = patient.height && patient.weight 
      ? (patient.weight / ((patient.height / 100) ** 2)).toFixed(1)
      : 'N/A'

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laboratory Report - ${patient.name}</title>
        <style>
          @page {
            size: A5;
            margin: 10mm;
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 10px;
            background: white;
            font-size: 10px;
            line-height: 1.2;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            border-bottom: 1.5px solid #e53e3e;
            padding-bottom: 6px;
          }
          .logo {
            display: flex;
            align-items: center;
          }
          .logo-symbol {
            width: 35px;
            height: 35px;
            background: #e53e3e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            font-weight: bold;
            margin-right: 8px;
          }
          .logo-text {
            color: #333;
          }
          .logo-main {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
          }
          .logo-sub {
            font-size: 9px;
            color: #666;
          }
          .date-location {
            text-align: right;
            color: #e53e3e;
            font-weight: bold;
            font-size: 9px;
          }
          .report-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin: 12px 0 8px 0;
            color: #333;
          }
          .patient-info {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2px;
            margin-bottom: 15px;
            background: #f8f9fa;
            padding: 8px;
            border: 1px solid #dee2e6;
            font-size: 9px;
          }
          .patient-row {
            display: grid;
            gap: 8px;
            margin-bottom: 2px;
          }
          .patient-row.full-width {
            grid-template-columns: 1fr;
          }
          .patient-row.four-columns {
            grid-template-columns: 1fr 1fr 1fr 1fr;
          }
          .patient-row div {
            display: flex;
            flex-direction: column;
            text-align: left;
            margin-bottom: 1px;
          }
          .patient-row div label {
            font-weight: bold;
            color: #333;
            margin-bottom: 2px;
          }
          .patient-row div span {
            color: #666;
          }
          .patient-info label {
            font-weight: bold;
            color: #333;
          }
          .section-title {
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            margin: 15px 0 10px 0;
            color: #333;
          }
          .results-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 9px;
          }
          .results-table th,
          .results-table td {
            border: 1px solid #333;
            padding: 6px 4px;
            text-align: left;
          }
          .results-table th {
            background: #f8f9fa;
            font-weight: bold;
            text-align: center;
            font-size: 9px;
          }
          .results-table td:nth-child(2),
          .results-table td:nth-child(3) {
            text-align: center;
          }
          .signature-section {
            margin-top: 30px;
            border-top: 1px dotted #666;
            padding-top: 12px;
            font-size: 9px;
          }
          .signature {
            text-align: center;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            color: #e53e3e;
            font-weight: bold;
            margin-top: 15px;
            border-top: 1px solid #e53e3e;
            padding-top: 6px;
            font-size: 9px;
            position: relative;
          }
          .qr-code {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 60px;
            height: 60px;
            border: 1px solid #ddd;
          }
          @media print {
            @page {
              size: A5;
              margin: 8mm;
            }
            body { 
              margin: 0; 
              padding: 8px;
              font-size: 9px;
            }
            .no-print { display: none; }
            .header {
              margin-bottom: 8px;
              padding-bottom: 4px;
            }
            .report-title {
              margin: 8px 0 6px 0;
              font-size: 12px;
            }
            .patient-info {
              margin-bottom: 10px;
              padding: 6px;
              font-size: 8px;
              gap: 1px;
            }
            .patient-row {
              gap: 6px;
              margin-bottom: 1px;
            }
            .patient-row div {
              margin-bottom: 1px;
            }
            .patient-row div label {
              margin-bottom: 1px;
            }
            .section-title {
              margin: 10px 0 6px 0;
              font-size: 10px;
            }
            .results-table {
              font-size: 8px;
              margin-bottom: 15px;
            }
            .results-table th,
            .results-table td {
              padding: 4px 3px;
            }
            .signature-section {
              margin-top: 20px;
              padding-top: 8px;
              font-size: 8px;
            }
            .signature {
              margin-top: 15px;
            }
            .footer {
              margin-top: 10px;
              padding-top: 4px;
              font-size: 8px;
              position: relative;
            }
            .qr-code {
              position: absolute;
              bottom: 0;
              right: 0;
              width: 50px;
              height: 50px;
              border: 1px solid #ddd;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <div class="logo-symbol">+</div>
            <div class="logo-text">
              <div class="logo-main">Medical Camp System</div>
              <div class="logo-sub">Health Camp & Blood Donation</div>
            </div>
          </div>
          <div class="date-location">
            ${new Date().toLocaleDateString('en-GB')}<br>
            Main Hall, Medical Center
          </div>
        </div>

        <div class="report-title">LABORATORY REPORT - CONFIDENTIAL</div>

        <div class="patient-info">
          <!-- Row 1: Name (full width) -->
          <div class="patient-row full-width">
            <div>
              <label>Name:</label>
              <span>${patient.name || 'N/A'}</span>
            </div>
          </div>
          
          <!-- Row 2: Patient ID, BMI, Age, Gender (4 columns) -->
          <div class="patient-row four-columns">
            <div>
              <label>Patient ID:</label>
              <span>${patient.id || 'N/A'}</span>
            </div>
            <div>
              <label>BMI:</label>
              <span>${bmi}</span>
            </div>
            <div>
              <label>Age:</label>
              <span>${patient.age || 'N/A'}</span>
            </div>
            <div>
              <label>Gender:</label>
              <span>${patient.gender || 'N/A'}</span>
            </div>
          </div>
          
          <!-- Row 3: Height, Weight, Collected Date, Blood Pressure (4 columns) -->
          <div class="patient-row four-columns">
            <div>
              <label>Height (cm):</label>
              <span>${patient.height || 'N/A'}</span>
            </div>
            <div>
              <label>Weight (Kg):</label>
              <span>${patient.weight || 'N/A'}</span>
            </div>
            <div>
              <label>Collected Date:</label>
              <span>${new Date().toLocaleDateString('en-GB')}</span>
            </div>
            <div>
              <label>Blood Pressure:</label>
              <span>${patient.bloodPressure || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div class="section-title">CHEMICAL PATHOLOGY</div>

        <table class="results-table">
          <thead>
            <tr>
              <th>Test Parameter</th>
              <th>Result</th>
              <th>Units</th>
              <th>Reference Range</th>
            </tr>
          </thead>
          <tbody>
            ${results.map((result: TestResult) => `
              <tr>
                <td>${result.testType.name}</td>
                <td>${result.result}</td>
                <td>${result.testType.unit || 'mg/dL'}</td>
                <td>${result.testType.normalRange || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="signature">
            <div style="border-bottom: 1px dotted #666; width: 300px; margin: 0 auto;"></div>
            <div style="margin-top: 10px;">
              <strong>Signature</strong><br>
              (Laboratory Technologist)
            </div>
          </div>
        </div>

        <div class="footer">
          A Social Service of Medical Camp System
          <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`Patient ID: ${patient.id || 'N/A'} | Date: ${new Date().toLocaleDateString('en-GB')} | Lab Report`)}" alt="QR Code" />
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="background: #e53e3e; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(reportHTML)
    printWindow.document.close()
    return printWindow
  }

  const filteredPending = pendingReports.filter(item =>
    (item.registration.patient.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.registration.patient.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCompleted = completedPrints.filter(item =>
    (item.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.registrationId || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <PrinterIcon className="h-8 w-8 text-teal-600 mr-3" />
              Lab Report Printing
            </h1>
            <p className="text-gray-600">Print official laboratory reports for patients</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'pending'
                  ? 'border-b-2 border-teal-500 text-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ClockIcon className="h-5 w-5 inline mr-2" />
              Pending Reports ({filteredPending.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'completed'
                  ? 'border-b-2 border-teal-500 text-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckIcon className="h-5 w-5 inline mr-2" />
              Completed Prints ({filteredCompleted.length})
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name or registration ID..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Content */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading pending reports...</div>
              ) : filteredPending.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending reports found</p>
                </div>
              ) : (
                filteredPending.map((item: GroupedTestResult, index) => (
                  <div key={index} className="p-6 border border-gray-200 rounded-xl bg-gray-50 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{item.registration.patient.name}</h4>
                      <p className="text-sm text-gray-600">Patient ID: {item.registration.patient.id}</p>
                      <p className="text-sm text-gray-500">
                        Tests: {item.results.length} test(s) completed
                      </p>
                    </div>
                    <button
                      onClick={() => handlePrint(item)}
                      className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
                    >
                      <PrinterIcon className="h-5 w-5" />
                      <span>Print Report</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="space-y-4">
              {filteredCompleted.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No completed prints found</p>
                </div>
              ) : (
                filteredCompleted.map((record) => (
                  <div key={record.id} className="p-6 border border-gray-200 rounded-xl bg-green-50 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{record.patientName}</h4>
                      <p className="text-sm text-gray-600">Patient ID: {record.registrationId}</p>
                      <p className="text-sm text-gray-500">
                        Printed: {new Date(record.printedAt).toLocaleDateString()} at{' '}
                        {new Date(record.printedAt).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-400">Printed by: {record.printedBy}</p>
                    </div>
                    <button
                      onClick={() => handleReprint(record)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <PrinterIcon className="h-5 w-5" />
                      <span>Reprint</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}