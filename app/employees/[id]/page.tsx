'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { api, EmployeeDetail } from '@/lib/api'
import { auth } from '@/lib/auth'
import { ArrowLeft, Calendar } from 'lucide-react'
import Image from 'next/image'

export default function EmployeeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => {
    const token = auth.getToken()
    if (!token) {
      router.push('/auth/login')
      return
    }

    const fetchEmployee = async () => {
      try {
        const data = await api.getEmployee(token, parseInt(employeeId))
        setEmployee(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load employee')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployee()
  }, [employeeId, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading employee details...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-8">
            <div className="text-center py-16">
              <p className="text-red-600 text-lg mb-4">{error || 'Employee not found'}</p>
              <Link href="/employees" className="text-blue-600 hover:text-blue-700 font-medium">
                ← Back to Employees
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    if (!status) return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">N/A</span>
    const statusMap: Record<string, { bg: string; text: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-700' },
      onboarding: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      'on leave': { bg: 'bg-orange-100', text: 'text-orange-700' },
      onleave: { bg: 'bg-orange-100', text: 'text-orange-700' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
      terminated: { bg: 'bg-red-100', text: 'text-red-700' },
    }
    const config = statusMap[status.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-700' }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-8">
          {/* Back Button */}
          <Link href="/employees" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Employees
          </Link>

          {/* Employee Header Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                  src="/placeholder-user.jpg"
                  alt={employee.name || 'Employee'}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{employee.name || 'Unknown'}</h1>
                <p className="text-gray-500 mt-0.5">{employee.job_title || 'No title'}</p>
                <div className="flex items-center gap-3 mt-3">
                  {getStatusBadge(employee.status)}
                  {employee.employment_type && (
                    <span className="text-sm text-gray-500">{employee.employment_type}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs + Content */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Tab Switcher */}
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 pt-4 pb-0">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'personal'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('employment')}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'employment'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Employment
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'personal' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h2>
                  <div className="grid grid-cols-5 gap-6 mb-10">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {employee.date_of_birth
                          ? new Date(employee.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Department</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.department || 'N/A'}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-6">Emergency Contact</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Name</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.next_of_kin_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Relationship</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.next_of_kin_relationship || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.next_of_kin_phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'employment' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Employment Details</h2>
                  <div className="grid grid-cols-2 gap-x-16 gap-y-6 mb-10">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Job Title</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.job_title || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Department</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.department || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Employment Type</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.employment_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Start Date</p>
                      <p className="text-sm text-gray-900 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {employee.start_date
                          ? new Date(employee.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Manager</p>
                      <p className="text-sm text-gray-900 font-medium">{employee.manager || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Current Salary</p>
                      <p className="text-sm text-gray-900 font-medium">
                        {employee.salary != null
                          ? `$ ${employee.salary.toLocaleString()}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3">Tenure at Company</h3>
                  <p className="text-sm text-gray-900 font-medium">
                    {employee.tenure_years != null
                      ? `${employee.tenure_years} year${employee.tenure_years !== 1 ? 's' : ''}${employee.tenure_months != null ? `, ${employee.tenure_months} month${employee.tenure_months !== 1 ? 's' : ''}` : ''}`
                      : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
