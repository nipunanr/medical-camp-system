import Link from 'next/link'
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
  ShieldCheckIcon
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Modern Header with Church Branding */}
      <header className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-red-800">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Church Logo Placeholder */}
            <div className="w-24 h-24 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30">
              <div className="text-white font-bold text-2xl">SC</div>
            </div>
            
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
              St. Sebastian&apos;s Church
            </h1>
            <h2 className="text-3xl font-semibold text-red-100 mb-6">
              Medical Camp System
            </h2>
            <p className="text-xl text-red-100/90 max-w-4xl mx-auto leading-relaxed">
              Modern digital solution for comprehensive medical camp management - 
              serving our community with advanced healthcare technology and compassionate care
            </p>
            
            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-center mb-3">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-red-100 text-sm">Secure & Reliable</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-center mb-3">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">Modern</div>
                <div className="text-red-100 text-sm">Touch-Optimized UI</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-center mb-3">
                  <HeartIcon className="h-8 w-8 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">Care</div>
                <div className="text-red-100 text-sm">Community Focused</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Medical Camp Services
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access all medical camp functions through our intuitive dashboard
            </p>
          </div>

          {/* Modern Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="group relative overflow-hidden"
              >
                <div className={`bg-gradient-to-br ${item.gradient} ${item.hoverGradient} rounded-3xl p-8 text-white shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-2`}>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 transition-transform duration-500 group-hover:scale-150"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 transition-transform duration-500 group-hover:scale-125"></div>
                  
                  <div className="relative flex flex-col items-center text-center space-y-6">
                    {/* Icon Container */}
                    <div className="p-6 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 transition-transform duration-300 group-hover:scale-110">
                      <item.icon className="h-12 w-12" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold leading-tight">{item.title}</h3>
                      <p className="text-sm opacity-90 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Arrow Indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-red-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-800/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <div className="text-white font-bold text-lg">SC</div>
            </div>
            <h4 className="text-2xl font-bold mb-2">St. Sebastian&apos;s Church, Moragoda</h4>
            <p className="text-gray-300 mb-6">Medical Camp Management System v2.0</p>
            <div className="border-t border-white/20 pt-6">
              <p className="text-sm text-gray-400">
                Serving our community with modern healthcare technology • © 2025 All rights reserved
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}