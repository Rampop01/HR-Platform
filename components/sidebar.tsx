'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out
        w-64 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="h-[65px] px-6 border-b border-gray-200 flex items-center justify-between">
          <Image
            src="/logo.png"
            alt="HCMatrix"
            width={120}
            height={40}
            className="w-auto h-9"
          />
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Help Section - Hidden on smaller heights if needed, but keeping it for now */}
        <div className="p-4 m-4 bg-blue-50 rounded-xl border border-blue-100 hidden sm:block">
          <div className="flex items-start gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 text-xs">Need Help?</h3>
              <p className="text-[10px] text-gray-600 mt-0.5">Contact HR support for assistance</p>
            </div>
          </div>
          <button className="w-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 py-1.5 rounded-lg font-medium text-xs transition-colors">
            Contact Support
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </>
  )
}
