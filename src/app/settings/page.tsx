'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  ArrowLeftIcon, 
  CogIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  PrinterIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  BellIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const [campSettings, setCampSettings] = useState({
    campName: 'Community Health Camp',
    location: 'Community Center, Main Street',
    organizer: 'Health Ministry',
    contactEmail: 'contact@healthcamp.org',
    contactPhone: '+1-234-567-8900'
  })

  const [printSettings, setPrintSettings] = useState({
    printerName: 'Default Printer',
    paperSize: 'A5',
    printQuality: 'High',
    autoprint: true
  })

  const [systemSettings, setSystemSettings] = useState({
    language: 'English',
    timezone: 'UTC+0',
    dateFormat: 'MM/DD/YYYY',
    notifications: true
  })

  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    // Read from environment variable
    return process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
  })

  const [saveMessage, setSaveMessage] = useState('')

  const handleSaveSettings = () => {
    // Simulate saving settings
    setSaveMessage('Settings saved successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  const handleMaintenanceToggle = async () => {
    try {
      const newMode = !maintenanceMode
      
      // Call API to update maintenance mode
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maintenanceMode: newMode }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setMaintenanceMode(newMode)
        setSaveMessage(result.message)
      } else {
        setSaveMessage('Error updating maintenance mode: ' + (result.error || 'Unknown error'))
      }
      
      setTimeout(() => setSaveMessage(''), 5000)
    } catch (error) {
      setSaveMessage('Error toggling maintenance mode')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CogIcon className="h-8 w-8 text-gray-600 mr-3" />
              System Settings
            </h1>
            <p className="text-gray-600">Configure system settings and preferences</p>
          </div>
        </div>

        {saveMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-600 font-medium">{saveMessage}</p>
          </div>
        )}

        {/* Camp Information */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center mb-6">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Camp Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Camp Name</label>
              <input
                type="text"
                value={campSettings.campName}
                onChange={(e) => setCampSettings(prev => ({ ...prev, campName: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={campSettings.location}
                onChange={(e) => setCampSettings(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organizer</label>
              <input
                type="text"
                value={campSettings.organizer}
                onChange={(e) => setCampSettings(prev => ({ ...prev, organizer: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={campSettings.contactEmail}
                onChange={(e) => setCampSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={campSettings.contactPhone}
                onChange={(e) => setCampSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation text-lg"
              />
            </div>
          </div>
        </div>

        {/* Print Settings */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center mb-6">
            <PrinterIcon className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Print Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Printer</label>
              <select
                value={printSettings.printerName}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, printerName: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent touch-manipulation text-lg"
              >
                <option value="Default Printer">Default Printer</option>
                <option value="HP LaserJet">HP LaserJet</option>
                <option value="Canon Printer">Canon Printer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paper Size</label>
              <select
                value={printSettings.paperSize}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, paperSize: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent touch-manipulation text-lg"
              >
                <option value="A4">A4</option>
                <option value="A5">A5</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Print Quality</label>
              <select
                value={printSettings.printQuality}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, printQuality: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent touch-manipulation text-lg"
              >
                <option value="Draft">Draft</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoprint"
                checked={printSettings.autoprint}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, autoprint: e.target.checked }))}
                className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="autoprint" className="ml-3 text-sm font-medium text-gray-700">
                Auto-print prescriptions
              </label>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center mb-6">
            <CircleStackIcon className="h-8 w-8 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">System Preferences</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={systemSettings.language}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent touch-manipulation text-lg"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={systemSettings.timezone}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent touch-manipulation text-lg"
              >
                <option value="UTC+0">UTC+0 (GMT)</option>
                <option value="UTC-5">UTC-5 (EST)</option>
                <option value="UTC-8">UTC-8 (PST)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <select
                value={systemSettings.dateFormat}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent touch-manipulation text-lg"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                checked={systemSettings.notifications}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="notifications" className="ml-3 text-sm font-medium text-gray-700">
                Enable notifications
              </label>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center mb-6">
            <ShieldCheckIcon className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">System Actions</h2>
          </div>
          
          {/* Maintenance Mode Toggle */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-800">Maintenance Mode</h3>
                <p className="text-sm text-orange-600">
                  {maintenanceMode 
                    ? 'System is currently in maintenance mode. Users will see the maintenance page.'
                    : 'System is running normally. Users can access all features.'
                  }
                </p>
              </div>
              <button
                onClick={handleMaintenanceToggle}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  maintenanceMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-4 px-6 rounded-xl transition-all">
              Backup Data
            </button>
            <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium py-4 px-6 rounded-xl transition-all">
              Export Reports
            </button>
            <button className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-4 px-6 rounded-xl transition-all">
              Clear Cache
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSaveSettings}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation flex items-center space-x-2"
          >
            <CogIcon className="h-5 w-5" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}