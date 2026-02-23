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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
          <p className="mt-4 text-gray-600 font-medium tracking-tight">Loading employee details...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-8">
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-red-600 font-bold mb-4">{error || 'Employee not found'}</p>
              <Link href="/employees" className="text-blue-600 hover:text-blue-700 font-bold items-center gap-2 inline-flex group transition-all">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Employees
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    if (!status) return <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">N/A</span>
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
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Back Button */}
          <Link href="/employees" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-all group font-bold text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Employees
          </Link>

          {/* Employee Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
              <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-gray-100">
                <Image
                  src="/primitive.img.png"
                  alt={employee.name || 'Employee'}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{employee.name || 'Unknown'}</h1>
                <p className="text-gray-500 font-medium mt-1">{employee.job_title || 'No title'}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                  {getStatusBadge(employee.status)}
                  {employee.employment_type && (
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 border-l border-gray-200 pl-4">
                      {employee.employment_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs + Content */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Tab Switcher */}
            <div className="border-b border-gray-100 bg-gray-50/30 px-6 pt-4 pb-0">
              <div className="inline-flex bg-gray-100/80 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'personal'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('employment')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'employment'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Employment
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              {activeTab === 'personal' && (
                <div className="space-y-10">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                        <p className="text-sm text-gray-900 font-bold truncate" title={employee.email}>{employee.email || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                        <p className="text-sm text-gray-900 font-bold">{employee.phone || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</p>
                        <p className="text-sm text-gray-900 font-bold items-center gap-1.5 flex">
                          {employee.date_of_birth
                            ? new Date(employee.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1 lg:col-span-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</p>
                        <p className="text-sm text-gray-900 font-bold leading-relaxed">{employee.address || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</p>
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {employee.department || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</p>
                        <p className="text-sm text-gray-900 font-bold">{employee.next_of_kin_name || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Relationship</p>
                        <p className="text-sm text-gray-900 font-bold">{employee.next_of_kin_relationship || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                        <p className="text-sm text-gray-900 font-bold">{employee.next_of_kin_phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'employment' && (
                <div className="space-y-10">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      Employment Details
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Title</p>
                        <p className="text-sm text-gray-900 font-bold">{employee.job_title || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</p>
                        <p className="text-sm text-gray-900 font-bold">{employee.department || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employment Type</p>
                        <p className="text-sm text-gray-900 font-bold">{employee.employment_type || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Date</p>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl w-fit border border-gray-100">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <p className="text-sm text-gray-900 font-bold">
                            {employee.start_date
                              ? new Date(employee.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Manager</p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold border border-gray-200">
                            {employee.manager ? employee.manager.charAt(0) : '?'}
                          </div>
                          <p className="text-sm text-gray-900 font-bold">{employee.manager || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Salary</p>
                        <p className="text-xl font-black text-gray-900">
                          {employee.salary != null
                            ? `$ ${employee.salary.toLocaleString()}`
                            : 'N/A'}
                          <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">/ Year</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Tenure at Company</h3>
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 inline-block">
                      <p className="text-sm text-blue-700 font-bold">
                        {employee.tenure_years != null
                          ? `${employee.tenure_years} year${employee.tenure_years !== 1 ? 's' : ''}${employee.tenure_months != null ? `, ${employee.tenure_months} month${employee.tenure_months !== 1 ? 's' : ''}` : ''}`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
