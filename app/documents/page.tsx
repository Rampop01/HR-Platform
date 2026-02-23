'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { auth } from '@/lib/auth'

export default function DocumentsPage() {
  const router = useRouter()

  useEffect(() => {
    if (!auth.getToken()) {
      router.push('/auth/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <Header title="Documents" />
        <main className="flex-1 p-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Documents module coming soon...</p>
          </div>
        </main>
      </div>
    </div>
  )
}
