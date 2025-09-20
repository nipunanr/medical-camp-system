'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import MaintenancePage from '../app/maintenance/page'

interface MaintenanceWrapperProps {
  children: React.ReactNode
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const pathname = usePathname()

  useEffect(() => {
    // Check maintenance mode from environment variable
    const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
    setIsMaintenanceMode(maintenanceMode)
    setIsLoading(false)
  }, [])

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If maintenance mode is enabled and not on maintenance page, show maintenance page
  if (isMaintenanceMode && pathname !== '/maintenance') {
    return <MaintenancePage />
  }

  // Normal app rendering
  return <>{children}</>
}