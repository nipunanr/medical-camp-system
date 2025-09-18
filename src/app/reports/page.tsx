'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  ArrowLeftIcon, 
  ChartBarIcon, 
  PrinterIcon, 
  DocumentArrowDownIcon,
  UsersIcon,
  BeakerIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline'

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  // Mock data for demonstration
  const mockStats = {
    totalPatients: 156,
    testsCompleted: 342,
    medicinesDispensed: 89,
    avgSatisfaction: 4.6,
    todayRegistrations: 23,
    pendingResults: 12
  }

  const reportTypes = [
    {
      id: 'daily',
      title: 'Daily Summary Report',
      description: 'Summary of today&apos;s activities and patient registrations',
      icon: ChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      id: 'patient-list',
      title: 'Patient List Report',
      description: 'Complete list of registered patients with details',
      icon: UsersIcon,
      color: 'bg-green-500'
    },
    {
      id: 'test-results',
      title: 'Test Results Report',
      description: 'Summary of all completed and pending test results',
      icon: BeakerIcon,
      color: 'bg-yellow-500'
    },
    {
      id: 'satisfaction',
      title: 'Satisfaction Report',
      description: 'Patient satisfaction ratings and feedback analysis',
      icon: StarIcon,
      color: 'bg-pink-500'
    }
  ]

  const handleGenerateReport = (reportType: string) => {
    setSelectedReportType(reportType)
    // In a real app, this would generate and download the report
    alert(`Generating ${reportTypes.find(r => r.id === reportType)?.title}...`)
  }

  const handlePrintReport = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-3" />
              Reports &amp; Analytics
            </h1>
            <p className="text-gray-600">Generate and print reports for medical camp data</p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <BeakerIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tests Completed</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.testsCompleted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <HeartIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Medicines Dispensed</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.medicinesDispensed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.avgSatisfaction}/5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-full mr-4">
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today&apos;s Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.todayRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <DocumentArrowDownIcon className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Results</p>
                <p className="text-2xl font-bold text-gray-900">{mockStats.pendingResults}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Report Date Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent touch-manipulation text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent touch-manipulation text-lg"
              />
            </div>
          </div>
        </div>

        {/* Report Types */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Available Reports</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTypes.map((report) => {
              const IconComponent = report.icon
              return (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleGenerateReport(report.id)}
                >
                  <div className="flex items-start">
                    <div className={`p-3 ${report.color} rounded-full mr-4`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                      <div className="flex space-x-3">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2">
                          <DocumentArrowDownIcon className="h-4 w-4" />
                          <span>Generate</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePrintReport()
                          }}
                          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
                        >
                          <PrinterIcon className="h-4 w-4" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
            <p className="text-indigo-800 font-medium">📊 Report Generation</p>
            <p className="text-indigo-600 text-sm mt-2">
              Click on any report type above to generate a detailed report. Reports can be viewed on screen, downloaded as PDF, or printed directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}