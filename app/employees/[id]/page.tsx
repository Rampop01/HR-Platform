'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { api, EmployeeDetail } from '@/lib/api'
import { auth } from '@/lib/auth'
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, DollarSign, User2, Heart } from 'lucide-react'

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
    if (!status) return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">N/A</span>
    const statusMap: Record<string, { bg: string; text: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-700' },
      onboarding: { bg: 'bg-blue-100', text: 'text-blue-700' },
      'on leave': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      onleave: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
      terminated: { bg: 'bg-red-100', text: 'text-red-700' },
    }
    const config = statusMap[status.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-700' }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const InfoField = ({ icon: Icon, label, value }: { icon?: any; label: string; value: any }) => (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div>
        <label className="block text-sm text-gray-500 mb-0.5">{label}</label>
        <p className="text-gray-900 font-medium">{value || 'N/A'}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-8">
          {/* Back Button */}
          <Link href="/employees" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Employees
          </Link>

          {/* Employee Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {employee.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{employee.name || 'Unknown'}</h1>
                <p className="text-lg text-gray-600 mt-1">{employee.job_title || 'No title'}</p>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  {getStatusBadge(employee.status)}
                  {employee.employment_type && (
                    <span className="text-gray-600">{employee.employment_type}</span>
                  )}
                  {employee.department && (
                    <span className="text-gray-500">•  {employee.department}</span>
                  )}
                  {employee.location && (
                    <span className="text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {employee.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="border-b border-gray-200 flex">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-4 font-medium transition-colors ${activeTab === 'personal'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Personal Info
              </button>
              <button
                onClick={() => setActiveTab('employment')}
                className={`px-6 py-4 font-medium transition-colors ${activeTab === 'employment'
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField icon={Mail} label="Email" value={employee.email} />
                    <InfoField icon={Phone} label="Phone" value={employee.phone} />
                    <InfoField icon={Calendar} label="Date of Birth" value={
                      employee.date_of_birth
                        ? new Date(employee.date_of_birth).toLocaleDateString()
                        : null
                    } />
                    <InfoField icon={Building2} label="Department" value={employee.department} />
                    <div className="md:col-span-2">
                      <InfoField icon={MapPin} label="Address" value={employee.address} />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mt-10 mb-6 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Emergency Contact / Next of Kin
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoField label="Name" value={employee.next_of_kin_name} />
                    <InfoField label="Relationship" value={employee.next_of_kin_relationship} />
                    <InfoField icon={Phone} label="Phone" value={employee.next_of_kin_phone} />
                  </div>
                </div>
              )}

              {activeTab === 'employment' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Employment Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <InfoField label="Job Title" value={employee.job_title} />
                    <InfoField icon={Building2} label="Department" value={employee.department} />
                    <InfoField label="Employment Type" value={employee.employment_type} />
                    <InfoField icon={Calendar} label="Start Date" value={
                      employee.start_date
                        ? new Date(employee.start_date).toLocaleDateString()
                        : null
                    } />
                    <InfoField icon={User2} label="Manager" value={employee.manager} />
                    <InfoField icon={DollarSign} label="Current Salary" value={
                      employee.salary != null
                        ? `₦${employee.salary.toLocaleString()}`
                        : null
                    } />
                    <InfoField icon={MapPin} label="Location" value={employee.location} />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-4">Tenure at Company</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                    <p className="text-blue-900 font-medium text-lg">
                      {employee.tenure_years != null
                        ? `${employee.tenure_years} year${employee.tenure_years !== 1 ? 's' : ''}${employee.tenure_months != null ? `, ${employee.tenure_months} month${employee.tenure_months !== 1 ? 's' : ''}` : ''}`
                        : 'N/A'}
                    </p>
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
