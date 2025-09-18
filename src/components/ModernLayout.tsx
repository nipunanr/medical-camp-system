import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ModernLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backgroundColor?: string;
  headerIcon?: React.ReactNode;
}

export default function ModernLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false,
  backgroundColor = 'from-red-50 via-orange-50 to-yellow-50',
  headerIcon 
}: ModernLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundColor}`}>
      {/* Header with Church Branding */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b-4 border-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              {/* Church Logo - Replace with actual logo */}
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-lg">SC</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-900 bg-clip-text text-transparent">
                  St. Sebastian&apos;s Church
                </h1>
                <p className="text-sm text-gray-600 font-medium">Moragoda Medical Camp</p>
              </div>
            </div>

            {/* Navigation or Status */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Medical Camp System</p>
                <p className="text-xs text-gray-500">Version 2.0</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Page Header */}
        <div className="bg-white/60 backdrop-blur-sm border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-6">
              {showBackButton && (
                <Link 
                  href="/"
                  className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-red-100 hover:border-red-200"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-red-600" />
                </Link>
              )}
              
              <div className="flex items-center space-x-4">
                {headerIcon && (
                  <div className="p-4 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-lg">
                    <div className="text-white">
                      {headerIcon}
                    </div>
                  </div>
                )}
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">{title}</h2>
                  {subtitle && (
                    <p className="text-lg text-gray-600 font-medium">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-red-800 to-red-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <div className="text-white font-bold">SC</div>
              </div>
              <div>
                <p className="font-semibold">St. Sebastian&apos;s Church, Moragoda</p>
                <p className="text-sm text-red-200">Medical Camp Management System</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-red-200">Serving the community with care</p>
              <p className="text-xs text-red-300 mt-1">© 2025 All rights reserved</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}