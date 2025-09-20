'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  ArrowLeftIcon, 
  ChartBarIcon, 
  PrinterIcon, 
  DocumentArrowDownIcon,
  UsersIcon,
  BeakerIcon,
  HeartIcon,
  StarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function ReportsPage() {
  const [showHourlyAnalysis, setShowHourlyAnalysis] = useState(true)
  const [satisfactionData, setSatisfactionData] = useState<any[]>([])
  const [showSatisfactionReport, setShowSatisfactionReport] = useState(false)
  const [stats, setStats] = useState({
    totalPatients: 0,
    testsCompleted: 0,
    medicinesDispensed: 0,
    avgSatisfaction: 0,
    todayRegistrations: 0,
    pendingResults: 0
  })

  // Fetch stats data
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch various statistics from APIs
      const [
        registrationsResponse,
        testResultsResponse,
        medicinesResponse,
        satisfactionResponse,
        pendingResultsResponse
      ] = await Promise.all([
        fetch('/api/registration'),
        fetch('/api/test-results?limit=1000'),
        fetch('/api/medicines'),
        fetch('/api/satisfaction'),
        fetch('/api/test-results/pending')
      ])

      let totalPatients = 0
      let testsCompleted = 0
      let medicinesDispensed = 0
      let avgSatisfaction = 0
      let todayRegistrations = 0
      let pendingResults = 0

      // Count registrations
      if (registrationsResponse.ok) {
        const registrations = await registrationsResponse.json()
        totalPatients = registrations.length || 0
        
        // Count today's registrations
        const today = new Date().toDateString()
        todayRegistrations = registrations.filter((reg: any) => 
          new Date(reg.createdAt).toDateString() === today
        ).length || 0
      }

      // Count completed tests
      if (testResultsResponse.ok) {
        const testResults = await testResultsResponse.json()
        testsCompleted = testResults.testResults?.length || 0
      }

      // Count medicines (stock)
      if (medicinesResponse.ok) {
        const medicines = await medicinesResponse.json()
        medicinesDispensed = medicines.reduce((total: number, med: any) => total + (med.stock || 0), 0)
      }

      // Calculate average satisfaction
      if (satisfactionResponse.ok) {
        const satisfaction = await satisfactionResponse.json()
        if (satisfaction.length > 0) {
          avgSatisfaction = satisfaction.reduce((sum: number, item: any) => sum + item.rating, 0) / satisfaction.length
        }
      }

      // Count pending results
      if (pendingResultsResponse.ok) {
        const pending = await pendingResultsResponse.json()
        pendingResults = pending.length || 0
      }

      setStats({
        totalPatients,
        testsCompleted,
        medicinesDispensed: Math.round(medicinesDispensed),
        avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
        todayRegistrations,
        pendingResults
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Fallback to default values
      setStats({
        totalPatients: 0,
        testsCompleted: 0,
        medicinesDispensed: 0,
        avgSatisfaction: 0,
        todayRegistrations: 0,
        pendingResults: 0
      })
    }
  }

  // Sample hourly data for analytics (7AM to 5PM) - this would be replaced with actual data
  const [hourlyData, setHourlyData] = useState([
    { hour: '7AM', patients: 0, tests: 0, medicines: 0 },
    { hour: '8AM', patients: 0, tests: 0, medicines: 0 },
    { hour: '9AM', patients: 0, tests: 0, medicines: 0 },
    { hour: '10AM', patients: 0, tests: 0, medicines: 0 },
    { hour: '11AM', patients: 0, tests: 0, medicines: 0 },
    { hour: '12PM', patients: 0, tests: 0, medicines: 0 },
    { hour: '1PM', patients: 0, tests: 0, medicines: 0 },
    { hour: '2PM', patients: 0, tests: 0, medicines: 0 },
    { hour: '3PM', patients: 0, tests: 0, medicines: 0 },
    { hour: '4PM', patients: 0, tests: 0, medicines: 0 },
    { hour: '5PM', patients: 0, tests: 0, medicines: 0 },
  ])

  // Fetch hourly data (this would be replaced with actual API calls)
  const fetchHourlyData = async () => {
    try {
      // This would fetch actual hourly analytics data
      // For now, using simulated data based on current hour
      const currentHour = new Date().getHours()
      const updatedData = hourlyData.map((item, index) => {
        const hourValue = index + 7 // 7AM = index 0
        if (hourValue <= currentHour) {
          return {
            ...item,
            patients: Math.floor(Math.random() * 20) + 5,
            tests: Math.floor(Math.random() * 15) + 3,
            medicines: Math.floor(Math.random() * 25) + 8
          }
        }
        return item
      })
      setHourlyData(updatedData)
    } catch (error) {
      console.error('Error fetching hourly data:', error)
    }
  }

  // Fetch hourly data when component mounts
  useEffect(() => {
    fetchHourlyData()
  }, [])

  const reportTypes = [
    {
      id: 'satisfaction',
      title: 'Satisfaction Report',
      description: 'Patient satisfaction ratings and feedback analysis',
      icon: StarIcon,
      color: 'bg-pink-500'
    }
  ]

  const handleGenerateReport = async (reportType: string) => {
    if (reportType === 'satisfaction') {
      try {
        const response = await fetch('/api/satisfaction')
        if (response.ok) {
          const data = await response.json()
          setSatisfactionData(data)
          setShowSatisfactionReport(true)
        }
      } catch (error) {
        console.error('Error fetching satisfaction data:', error)
        alert('Error loading satisfaction report')
      }
    }
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
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.testsCompleted}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.medicinesDispensed}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.avgSatisfaction}/5</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.todayRegistrations}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.pendingResults}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hourly Analytics Dashboard */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div 
            className="flex items-center justify-between cursor-pointer mb-6"
            onClick={() => setShowHourlyAnalysis(!showHourlyAnalysis)}
          >
            <h2 className="text-xl font-semibold text-gray-800">Hourly Progress Analytics (7AM - 5PM)</h2>
            {showHourlyAnalysis ? (
              <ChevronDownIcon className="h-6 w-6 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-gray-500" />
            )}
          </div>
          
          {showHourlyAnalysis && (
            <div className="space-y-4">
            {hourlyData.map((data, index) => {
              const maxValue = Math.max(...hourlyData.map(d => Math.max(d.patients, d.tests, d.medicines)));
              const patientWidth = (data.patients / maxValue) * 100;
              const testWidth = (data.tests / maxValue) * 100;
              const medicineWidth = (data.medicines / maxValue) * 100;
              const currentHour = new Date().getHours();
              const isCurrentHour = (index + 7) === currentHour;
              
              return (
                <div key={data.hour} className={`p-4 rounded-lg ${isCurrentHour ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold ${isCurrentHour ? 'text-yellow-800' : 'text-gray-700'}`}>
                      {data.hour} {isCurrentHour && '(Current)'}
                    </span>
                    <div className="flex space-x-4 text-sm">
                      <span className="text-red-600">Patients: {data.patients}</span>
                      <span className="text-green-600">Tests: {data.tests}</span>
                      <span className="text-blue-600">Medicines: {data.medicines}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{width: `${patientWidth}%`}}></div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{width: `${testWidth}%`}}></div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{width: `${medicineWidth}%`}}></div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>

        {/* Available Reports */}
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

        {/* Satisfaction Report Display */}
        {showSatisfactionReport && satisfactionData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <StarIcon className="h-8 w-8 text-pink-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Patient Satisfaction Report</h2>
              </div>
              <button
                onClick={() => setShowSatisfactionReport(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Average Rating</h3>
                <p className="text-3xl font-bold text-green-600">
                  {(satisfactionData.reduce((sum, item) => sum + item.rating, 0) / satisfactionData.length).toFixed(1)}/5
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Responses</h3>
                <p className="text-3xl font-bold text-blue-600">{satisfactionData.length}</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = satisfactionData.filter(item => item.rating === rating).length
                  const percentage = satisfactionData.length > 0 ? (count / satisfactionData.length) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center">
                      <div className="flex items-center w-20">
                        <span className="text-sm font-medium text-gray-700 mr-2">{rating}</span>
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                            style={{width: `${percentage}%`}}
                          ></div>
                        </div>
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-sm font-medium text-gray-600">{count}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Comments Section */}
            {satisfactionData.filter(item => item.feedback && item.feedback.trim()).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Comments</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {satisfactionData
                    .filter(item => item.feedback && item.feedback.trim())
                    .map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= item.rating 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-600">
                              {item.rating}/5
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{item.feedback}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}