'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { 
  UserPlusIcon, 
  ClipboardDocumentCheckIcon, 
  BeakerIcon, 
  HeartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  StarIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'

const menuItems = [
  {
    title: 'Patient Registration',
    description: 'Register new patients and print prescription sheets',
    icon: UserPlusIcon,
    href: '/registration',
    gradient: 'from-blue-500 to-blue-700',
    hoverGradient: 'hover:from-blue-600 hover:to-blue-800',
  },
  {
    title: 'Update Patient Details',
    description: 'Search and update existing patient information',
    icon: MagnifyingGlassIcon,
    href: '/patient-update',
    gradient: 'from-cyan-500 to-blue-600',
    hoverGradient: 'hover:from-cyan-600 hover:to-blue-700',
  },
  {
    title: 'Test Type Master',
    description: 'Manage available medical tests and configurations',
    icon: ClipboardDocumentCheckIcon,
    href: '/test-types',
    gradient: 'from-emerald-500 to-green-700',
    hoverGradient: 'hover:from-emerald-600 hover:to-green-800',
  },
  {
    title: 'Medicine Management',
    description: 'Manage medicine inventory and dispensing',
    icon: HeartIcon,
    href: '/medicines',
    gradient: 'from-rose-500 to-red-700',
    hoverGradient: 'hover:from-rose-600 hover:to-red-800',
  },
  {
    title: 'Medicine Issue',
    description: 'Scan QR codes and dispense medicines to patients',
    icon: BeakerIcon,
    href: '/medicine-issue',
    gradient: 'from-purple-500 to-violet-700',
    hoverGradient: 'hover:from-purple-600 hover:to-violet-800',
  },
  {
    title: 'Lab Results Entry',
    description: 'Enter test results from laboratory',
    icon: DocumentTextIcon,
    href: '/lab-results',
    gradient: 'from-amber-500 to-orange-600',
    hoverGradient: 'hover:from-amber-600 hover:to-orange-700',
  },
  {
    title: 'Lab Report Printing',
    description: 'Print official laboratory reports for patients',
    icon: PrinterIcon,
    href: '/lab-report-printing',
    gradient: 'from-teal-500 to-cyan-600',
    hoverGradient: 'hover:from-teal-600 hover:to-cyan-700',
  },
  {
    title: 'Reports & Analytics',
    description: 'Generate comprehensive reports and analytics dashboard',
    icon: ChartBarIcon,
    href: '/reports',
    gradient: 'from-indigo-500 to-blue-700',
    hoverGradient: 'hover:from-indigo-600 hover:to-blue-800',
  },
  {
    title: 'Satisfaction Survey',
    description: 'Patient feedback and satisfaction management',
    icon: StarIcon,
    href: '/satisfaction',
    gradient: 'from-pink-500 to-rose-700',
    hoverGradient: 'hover:from-pink-600 hover:to-rose-800',
  },
  {
    title: 'System Settings',
    description: 'Configure system preferences and camp details',
    icon: Cog6ToothIcon,
    href: '/settings',
    gradient: 'from-slate-500 to-gray-700',
    hoverGradient: 'hover:from-slate-600 hover:to-gray-800',
  },
]

export default function HomePage() {
  // State for real-time clock and data
  const [currentTime, setCurrentTime] = useState(new Date());
  const [totalPatients, setTotalPatients] = useState(0);
  const [completedTests, setCompletedTests] = useState(0);
  const [medicinesDispensed, setMedicinesDispensed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch actual data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/registration', {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const registrations = await response.json();
          setTotalPatients(registrations.length || 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentHour = currentTime.getHours();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Compact Header Row */}
      <header className="bg-white shadow-lg border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-lg">SC</div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">St. Sebastian&apos;s Church</h1>
                <p className="text-sm text-red-600 font-semibold">Free Medical Camp - Today Only (7AM - 5PM)</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{totalPatients}</div>
                <div className="text-xs text-gray-600 uppercase">Patients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedTests}</div>
                <div className="text-xs text-gray-600 uppercase">Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{medicinesDispensed}</div>
                <div className="text-xs text-gray-600 uppercase">Medicines</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{currentTime.toLocaleTimeString()}</div>
                <div className="text-xs text-gray-600 uppercase">Current Time</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="relative py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hourly Analytics Dashboard */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Today&apos;s Medical Camp Dashboard</h2>
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-3xl font-bold text-red-600">
                      {loading ? '...' : totalPatients}
                    </p>
                    <p className="text-sm text-gray-500">{totalPatients > 0 ? 'Live count' : 'No registrations yet'}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <UserPlusIcon className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tests Completed</p>
                    <p className="text-3xl font-bold text-green-600">
                      {loading ? '...' : completedTests}
                    </p>
                    <p className="text-sm text-gray-500">{completedTests > 0 ? 'Results entered' : 'No test results yet'}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <BeakerIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Medicines Dispensed</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {loading ? '...' : medicinesDispensed}
                    </p>
                    <p className="text-sm text-gray-500">{medicinesDispensed > 0 ? 'Medicines issued' : 'No medicines dispensed yet'}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <HeartIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Medical Camp Services Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Medical Camp Services</h3>
            <p className="text-lg text-gray-600 mb-8">Quick access to all medical camp functions</p>
            
            {/* Compact Service Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="group bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-600 leading-tight">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-red-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-800/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <div className="text-white font-bold text-sm">SC</div>
            </div>
            <h4 className="text-lg font-bold mb-1">St. Sebastian&apos;s Church, Moragoda</h4>
            <p className="text-gray-300 text-sm mb-4">Medical Camp Management System v2.0</p>
            <div className="border-t border-white/20 pt-4">
              <p className="text-xs text-gray-400">
                Free Medical Camp Today • © 2025 All rights reserved
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}