'use client'

import { Bell, HelpCircle, User, Menu } from 'lucide-react'
import Image from 'next/image'

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="h-[65px] bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {title && (
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-4">
        <button className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </button>
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 relative">
            <Image
              src="/primitive.img.png"
              alt="User"
              fill
              className="object-cover"
            />
          </div>
        </button>
      </div>
    </header>
  )
}
