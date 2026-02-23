'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { api, DashboardData } from '@/lib/api'
import { auth } from '@/lib/auth'
import { Users, Briefcase, Calendar, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import Image from 'next/image'

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = auth.getToken()
    if (!token) {
      router.push('/auth/login')
      return
    }

    const fetchDashboard = async () => {
      try {
        const data = await api.getDashboard(token)
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const attendanceData = [
    { name: 'In Office / Remote', value: 189, fill: '#10b981' },
    { name: 'Out / On Leave', value: 58, fill: '#6b7280' },
  ]

  const headcountData = [
    { month: 'Aug', value: 195 },
    { month: 'Sep', value: 210 },
    { month: 'Oct', value: 215 },
    { month: 'Nov', value: 225 },
    { month: 'Dec', value: 230 },
    { month: 'Jan', value: 240 },
    { month: 'Feb', value: 247 },
  ]

  const departmentData = [
    { name: 'Engineering', value: 85, fill: '#3b82f6' },
    { name: 'Sales', value: 52, fill: '#10b981' },
    { name: 'Marketing', value: 38, fill: '#f59e0b' },
    { name: 'HR', value: 15, fill: '#8b5cf6' },
    { name: 'Product', value: 28, fill: '#ec4899' },
    { name: 'Finance', value: 12, fill: '#06b6d4' },
    { name: 'Other', value: 17, fill: '#6b7280' },
  ]

  const actionItems = [
    { id: 1, title: 'Approve 3 leave requests', priority: 'high', status: false },
    { id: 2, title: 'Schedule interviews for Marketing position', priority: 'medium', status: true },
    { id: 3, title: 'Send benefits enrollment reminder', priority: 'low', status: false },
  ]

  const upcomingBirthdays = [
    { name: 'Sarah Johnson', date: 'Feb 15' },
    { name: 'Michael Rodriguez', date: 'Feb 18' },
    { name: 'Emily Chen', date: 'Feb 22' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header title="Dashboard" />
        
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Welcome back! Here's what's happening with your organization.</h2>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData?.total_employees || 0}</p>
                  <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +12% from last month
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">New Hires This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData?.new_hire_count || 0}</p>
                  <p className="text-gray-600 text-sm mt-2">5 more next week</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Upcoming Events</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData?.upcoming_event || 0}</p>
                  <p className="text-gray-600 text-sm mt-2">Birthdays & anniversaries</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Open Positions</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData?.open_positions || 0}</p>
                  <p className="text-gray-600 text-sm mt-2">Across 6 departments</p>
                </div>
                <Briefcase className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Attendance */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Today's Attendance
              </h3>
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-700">In Office / Remote</span>
                    </div>
                    <span className="font-bold text-gray-900">189</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span className="text-gray-700">Out / On Leave</span>
                    </div>
                    <span className="font-bold text-gray-900">58</span>
                  </div>
                </div>
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">77% workforce active today</p>
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Action Items
              </h3>
              <div className="space-y-3">
                {actionItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={item.status}
                      readOnly
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className={item.status ? 'line-through text-gray-500' : 'text-gray-900'}>
                      {item.title}
                    </span>
                    <span className={`ml-auto text-xs px-2 py-1 rounded font-medium ${
                      item.priority === 'high' ? 'bg-red-100 text-red-700' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                View All Tasks
              </button>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Headcount Growth */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Headcount Growth</h3>
              <p className="text-sm text-gray-600 mb-4">Last 7 months</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={headcountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Department Distribution */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Department Distribution</h3>
              <p className="text-sm text-gray-600 mb-4">Current workforce breakdown</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Birthdays */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Birthdays & Anniversaries
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingBirthdays.map((person, index) => (
                <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                      <span className="text-xl">🎂</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{person.name}</p>
                      <p className="text-sm text-gray-600">{person.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
