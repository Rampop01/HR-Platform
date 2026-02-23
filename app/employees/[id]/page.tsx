'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { api, EmployeeDetail } from '@/lib/api'
import { auth } from '@/lib/auth'
import { ArrowLeft } from 'lucide-react'

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
            <div className="text-center">
              <p className="text-red-600">{error || 'Employee not found'}</p>
              <Link href="/employees" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                Back to Employees
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-700' },
      onboarding: { bg: 'bg-blue-100', text: 'text-blue-700' },
      onleave: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
    }
    const config = statusMap[status.toLowerCase()] || statusMap['active']
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
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
          <Link href="/employees" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Employees
          </Link>

          {/* Employee Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {employee.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{employee.job_title}</p>
                <div className="flex items-center gap-4 mt-4">
                  {getStatusBadge(employee.status)}
                  <span className="text-gray-600">{employee.employment_type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="border-b border-gray-200 flex">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'personal'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Personal Info
              </button>
              <button
                onClick={() => setActiveTab('employment')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'employment'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Employment
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'personal' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h2>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email</label>
                      <p className="text-gray-900 font-medium">{employee.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Phone</label>
                      <p className="text-gray-900 font-medium">{employee.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
                      <p className="text-gray-900 font-medium">
                        {new Date(employee.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Department</label>
                      <p className="text-gray-900 font-medium">{employee.department}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Address</label>
                      <p className="text-gray-900 font-medium">{employee.address}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mt-8 mb-6">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Name</label>
                      <p className="text-gray-900 font-medium">{employee.next_of_kin_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Relationship</label>
                      <p className="text-gray-900 font-medium">{employee.next_of_kin_relationship}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Phone</label>
                      <p className="text-gray-900 font-medium">{employee.next_of_kin_phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'employment' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Employment Details</h2>
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Job Title</label>
                      <p className="text-gray-900 font-medium">{employee.job_title}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Department</label>
                      <p className="text-gray-900 font-medium">{employee.department}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Employment Type</label>
                      <p className="text-gray-900 font-medium">{employee.employment_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                      <p className="text-gray-900 font-medium">
                        {new Date(employee.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Manager</label>
                      <p className="text-gray-900 font-medium">{employee.manager}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Current Salary</label>
                      <p className="text-gray-900 font-medium">${employee.salary?.toLocaleString()}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-6">Tenure at Company</h3>
                  <p className="text-gray-900 font-medium">
                    {employee.tenure_years} years, {employee.tenure_months} months
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
