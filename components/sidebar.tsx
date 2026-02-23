'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import {
  LayoutDashboard,
  Users,
  Clock,
  Briefcase,
  DollarSign,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  HelpCircle,
  Bell,
  User,
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const token = auth.getToken()
      if (token) {
        await api.logout(token)
      }
      auth.clearSession()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      auth.clearSession()
      router.push('/auth/login')
    }
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Employees', href: '/employees' },
    { icon: Clock, label: 'Time & Attendance', href: '/attendance' },
    { icon: Briefcase, label: 'Recruitment', href: '/recruitment' },
    { icon: DollarSign, label: 'Payroll', href: '/payroll' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: FileText, label: 'Documents', href: '/documents' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Header - height matches the main header bar */}
      <div className="h-[65px] px-6 border-b border-gray-200 flex items-center">
        <Image
          src="/logo.png"
          alt="HCMatrix"
          width={120}
          height={40}
          className="w-auto h-9"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Help Section */}
      <div className="p-4 m-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Need Help?</h3>
            <p className="text-xs text-gray-600 mt-1">Contact HR support for assistance</p>
          </div>
        </div>
        <button className="w-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 py-2 rounded font-medium text-sm transition-colors">
          Contact Support
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>
  )
}
