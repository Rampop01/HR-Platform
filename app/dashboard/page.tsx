'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { api, DashboardData } from '@/lib/api'
import { auth } from '@/lib/auth'
import { Users, Briefcase, Calendar, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Attendance data
  const inOffice = 189
  const outLeave = 58
  const totalAttendance = inOffice + outLeave
  const attendancePercent = Math.round((inOffice / totalAttendance) * 100)

  // Headcount growth chart data
  const headcountData = [
    { month: 'Aug', value: 195 },
    { month: 'Sep', value: 210 },
    { month: 'Oct', value: 215 },
    { month: 'Nov', value: 225 },
    { month: 'Dec', value: 230 },
    { month: 'Jan', value: 240 },
    { month: 'Feb', value: dashboardData?.total_employees || 247 },
  ]

  // Department distribution data
  const departmentData = [
    { name: 'Engineering', value: 85, fill: '#3b82f6' },
    { name: 'Sales', value: 52, fill: '#10b981' },
    { name: 'Marketing', value: 38, fill: '#f59e0b' },
    { name: 'HR', value: 15, fill: '#8b5cf6' },
    { name: 'Product', value: 28, fill: '#ec4899' },
    { name: 'Finance', value: 12, fill: '#06b6d4' },
    { name: 'Other', value: 17, fill: '#6b7280' },
  ]

  // Action items
  const actionItems = [
    { id: 1, title: 'Approve 3 leave requests', priority: 'high', done: false },
    { id: 2, title: 'Schedule interviews for Marketing position', priority: 'medium', done: true },
    { id: 3, title: 'Send benefits enrollment reminder', priority: 'low', done: false },
  ]

  // Upcoming birthdays
  const upcomingBirthdays = [
    { name: 'Sarah Johnson', date: 'Feb 15' },
    { name: 'Michael Rodriguez', date: 'Feb 18' },
    { name: 'Emily Chen', date: 'Feb 22' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-500">Welcome back! Here&apos;s what&apos;s happening with your organization.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">Total Employees</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{dashboardData?.total_employees ?? 0}</p>
                  <p className="text-green-600 text-xs sm:text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +12% from last month
                  </p>
                </div>
                <div className="p-2 sm:p-2.5 bg-blue-50 rounded-xl">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">New Hires This Month</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{dashboardData?.new_hire_count ?? 0}</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">5 more next week</p>
                </div>
                <div className="p-2 sm:p-2.5 bg-green-50 rounded-xl">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">Upcoming Events</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{dashboardData?.upcoming_event ?? 0}</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">Birthdays &amp; anniversaries</p>
                </div>
                <div className="p-2 sm:p-2.5 bg-purple-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">Open Positions</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{dashboardData?.open_positions ?? 0}</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-2">Across 6 departments</p>
                </div>
                <div className="p-2 sm:p-2.5 bg-orange-50 rounded-xl">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Today's Attendance */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                Today&apos;s Attendance
              </h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-700">In Office / Remote</span>
                  </div>
                  <span className="font-bold text-gray-900">{inOffice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-sm font-medium text-gray-700">Out / On Leave</span>
                  </div>
                  <span className="font-bold text-gray-900">{outLeave}</span>
                </div>
              </div>

              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-1000"
                  style={{ width: `${attendancePercent}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 font-medium">{attendancePercent}% workforce active today</p>
            </div>

            {/* Action Items */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                Action Items
              </h3>
              <div className="space-y-3 flex-1 mb-6">
                {actionItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={item.done}
                      readOnly
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-colors"
                    />
                    <span className={`flex-1 text-sm font-medium ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {item.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.priority === 'high' ? 'bg-red-100 text-red-700' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                      }`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all text-sm shadow-sm active:scale-[0.98]">
                View All Tasks
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Headcount Growth */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <h3 className="text-base font-bold text-gray-900 mb-1">Headcount Growth</h3>
              <p className="text-sm text-gray-500 mb-6">Last 7 months</p>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={headcountData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <h3 className="text-base font-bold text-gray-900 mb-1">Department Distribution</h3>
              <p className="text-sm text-gray-500 mb-6">Current workforce breakdown</p>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {departmentData.slice(0, 4).map((dept) => (
                  <div key={dept.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.fill }}></div>
                    <span className="text-xs font-medium text-gray-600">{dept.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Birthdays */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Upcoming Birthdays &amp; Anniversaries
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingBirthdays.map((person, index) => (
                <div key={index} className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center gap-4 group hover:bg-purple-50 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white border border-purple-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                    🎂
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{person.name}</p>
                    <p className="text-xs font-medium text-purple-600">{person.date}</p>
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
