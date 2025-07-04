'use client'  
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiMessageSquare, FiCamera, FiMonitor, FiVideo } from 'react-icons/fi'
import { FaWaveSquare } from 'react-icons/fa'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { href: '/chat', label: 'Chat', icon: <FiMessageSquare className="w-5 h-5" /> },
    { href: '/reels', label: 'Reels', icon: <FiCamera className="w-5 h-5" /> },
    { href: '/stream', label: 'Stream', icon: <FiMonitor className="w-5 h-5" /> },
    { href: '/video-call', label: 'Video Call', icon: <FiVideo className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-2">
            <FaWaveSquare className="text-blue-500 text-2xl" />
            <h1 className="text-2xl font-bold text-gray-800">SocialWave</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className={`${pathname === item.href ? 'text-blue-500' : 'text-gray-500'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium">U</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">User Name</p>
              <p className="text-xs text-gray-500">user@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Optional header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <span className="sr-only">Notifications</span>
                <span className="relative">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  )
}

export default MainLayout
