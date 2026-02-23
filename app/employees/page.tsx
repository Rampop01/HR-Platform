'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { api, Employee, EmployeesResponse } from '@/lib/api'
import { auth } from '@/lib/auth'
import { Search, Plus, Download, ChevronLeft, ChevronRight, Users } from 'lucide-react'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 1

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Employees</h1>
              <p className="text-sm text-gray-500">Manage and view your organization&apos;s workforce</p>
            </div>
            <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-all">
              <Plus className="w-5 h-5" />
              Add New Employee
            </Button>
          </div>

          {/* Search Bar & Export */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search by name, email, title..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 h-11 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </div>
            <Button variant="outline" className="flex items-center justify-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-11 px-6 rounded-xl font-bold text-sm shadow-sm">
              <Download className="w-4 h-4" />
              Export to CSV
            </Button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Employees Table Container */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center p-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-500 font-medium">Loading employees...</p>
                </div>
              </div>
            ) : employees.length === 0 ? (
              <div className="flex items-center justify-center p-20">
                <div className="text-center">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-bold mb-1">No employees found</p>
                  <p className="text-sm text-gray-500">Try adjusting your search criteria</p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Job Title</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Location</th>
                        <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <Link href={`/employees/${employee.id}`} className="block">
                              <p className="font-bold text-blue-600 group-hover:text-blue-700 transition-colors">{employee.name || 'N/A'}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{employee.email || ''}</p>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium">{employee.job_title || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              {employee.department || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium">{employee.location || 'N/A'}</td>
                          <td className="px-6 py-4">{getStatusBadge(employee.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-gray-500 font-medium order-2 sm:order-1">
                    Showing page <span className="font-bold text-gray-900">{pagination?.currentPage || 1}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                  </p>
                  <div className="flex gap-2 order-1 sm:order-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={!pagination?.hasPrev}
                      className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={!pagination?.hasNext}
                      className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                      <ChevronRight className="w-5 h-5" />
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
