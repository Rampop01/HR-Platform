'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { api, Employee, EmployeesResponse } from '@/lib/api'
import { auth } from '@/lib/auth'
import { Search, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchEmployees = useCallback(async (page: number = 1, query: string = '') => {
    const token = auth.getToken()
    if (!token) {
      router.push('/auth/login')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      let response: EmployeesResponse
      if (query.trim()) {
        response = await api.searchEmployees(token, { name: query.trim() }, page)
      } else {
        response = await api.getEmployees(token, page)
      }

      if (!response.data || !Array.isArray(response.data)) {
        setEmployees([])
        setPagination(null)
        return
      }

      setEmployees(response.data)
      setPagination({
        currentPage: response.current_page,
        total: response.total,
        perPage: response.per_page,
        hasNext: !!response.next_page_url,
        hasPrev: !!response.prev_page_url,
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load employees'
      setError(errorMsg)
      setEmployees([])
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchEmployees(1)
  }, [fetchEmployees])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setCurrentPage(1)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchEmployees(1, value)
    }, 500)
  }

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      const next = currentPage + 1
      setCurrentPage(next)
      fetchEmployees(next, searchQuery)
    }
  }

  const handlePrevPage = () => {
    if (pagination?.hasPrev) {
      const prev = currentPage - 1
      setCurrentPage(prev)
      fetchEmployees(prev, searchQuery)
    }
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

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 1

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header title="" />

        <main className="flex-1 p-8">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Employees</h1>
              <p className="text-gray-500">Manage and view your organization&apos;s workforce</p>
            </div>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium">
              <Plus className="w-4 h-4" />
              Add New Employee
            </Button>
          </div>

          {/* Search Bar & Export */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, email, title, or department..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="ml-auto">
              <Button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-medium text-sm">
                <Download className="w-4 h-4" />
                Export to CSV
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Employees Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center p-16">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-3 text-gray-500 text-sm">Loading employees...</p>
                </div>
              </div>
            ) : employees.length === 0 ? (
              <div className="flex items-center justify-center p-16">
                <div className="text-center">
                  <p className="text-gray-500 mb-1">No employees found</p>
                  {searchQuery && (
                    <p className="text-sm text-gray-400">Try adjusting your search</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/80">
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Title</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/employees/${employee.id}`}>
                              <div className="cursor-pointer">
                                <p className="font-medium text-blue-600 hover:text-blue-700">{employee.name || 'N/A'}</p>
                                <p className="text-sm text-gray-500">{employee.email || ''}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{employee.job_title || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{employee.department || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{employee.location || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{employee.employment_type || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {employee.start_date
                              ? new Date(employee.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(employee.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Page <span className="font-semibold text-gray-900">{pagination?.currentPage || 1}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={!pagination?.hasPrev}
                      className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!pagination?.hasNext}
                      className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
