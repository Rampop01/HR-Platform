'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { api, Employee, EmployeesResponse } from '@/lib/api'
import { auth } from '@/lib/auth'
import { Search, Plus, Download, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
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
  const [filterField, setFilterField] = useState<string>('name')
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const fetchEmployees = useCallback(async (page: number = 1, query: string = '', field: string = 'name') => {
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
        response = await api.searchEmployees(token, { [field]: query.trim() }, page)
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

  // Initial load
  useEffect(() => {
    fetchEmployees(1)
  }, [fetchEmployees])

  // Debounced search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setCurrentPage(1)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchEmployees(1, value, filterField)
    }, 500)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const field = e.target.value
    setFilterField(field)
    setCurrentPage(1)
    if (searchQuery.trim()) {
      fetchEmployees(1, searchQuery, field)
    }
  }

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      const next = currentPage + 1
      setCurrentPage(next)
      fetchEmployees(next, searchQuery, filterField)
    }
  }

  const handlePrevPage = () => {
    if (pagination?.hasPrev) {
      const prev = currentPage - 1
      setCurrentPage(prev)
      fetchEmployees(prev, searchQuery, filterField)
    }
  }

  const getStatusBadge = (status: string) => {
    if (!status) return <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">N/A</span>
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
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header title="Employees" />

        <main className="flex-1 p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employees</h1>
            <p className="text-gray-600">Manage and view your organization's workforce</p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center justify-between mb-8">
            <div>
              {pagination && (
                <p className="text-sm text-gray-600">
                  {pagination.total} employee{pagination.total !== 1 ? 's' : ''} total
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                <Plus className="w-4 h-4" />
                Add New Employee
              </Button>
              <Button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg">
                <Download className="w-4 h-4" />
                Export to CSV
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={`Search by ${filterField}...`}
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterField}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="job_title">Job Title</option>
                <option value="department">Department</option>
                <option value="employment_type">Employment Type</option>
                <option value="status">Status</option>
                <option value="location">Location</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Employees Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-3 text-gray-600">Loading employees...</p>
                </div>
              </div>
            ) : employees.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">No employees found</p>
                  {searchQuery && (
                    <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Job Title</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/employees/${employee.id}`}>
                              <div className="flex items-center gap-3 hover:text-blue-600 cursor-pointer">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                  {employee.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{employee.name || 'N/A'}</p>
                                  <p className="text-sm text-gray-600">{employee.email || ''}</p>
                                </div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{employee.job_title || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-700">{employee.department || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-700">{employee.location || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-700">{employee.employment_type || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-700">
                            {employee.start_date
                              ? new Date(employee.start_date).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(employee.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Page {pagination?.currentPage || 1} of {totalPages}
                      {' '}&middot;{' '}
                      Showing {employees.length} of {pagination?.total} employees
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handlePrevPage}
                        disabled={!pagination?.hasPrev}
                        className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 disabled:opacity-50 rounded-lg"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        onClick={handleNextPage}
                        disabled={!pagination?.hasNext}
                        className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 disabled:opacity-50 rounded-lg"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
