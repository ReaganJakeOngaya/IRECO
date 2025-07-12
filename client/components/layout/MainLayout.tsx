'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FiHome, FiMessageSquare, FiCamera, FiMonitor, FiVideo, FiBell, FiSearch, FiSettings, FiUser, FiMenu, FiX } from 'react-icons/fi'
import { FaWaveSquare } from 'react-icons/fa'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(3)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { href: '/chat', label: 'Chat', icon: <FiMessageSquare className="w-5 h-5" /> },
    { href: '/reels', label: 'Reels', icon: <FiCamera className="w-5 h-5" /> },
    { href: '/stream', label: 'Stream', icon: <FiMonitor className="w-5 h-5" /> },
    { href: '/video-call', label: 'Video Call', icon: <FiVideo className="w-5 h-5" /> },
  ]

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved) setIsDarkMode(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className={`min-h-screen flex transition-all duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-xl border-gray-200'}
        border-r flex flex-col shadow-xl
      `}>
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FaWaveSquare className="text-blue-500 text-2xl animate-pulse" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                SocialWave
              </h1>
            </div>
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`
                group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105
                ${pathname === item.href
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <span className={`
                transition-all duration-200 group-hover:scale-110
                ${pathname === item.href ? 'text-white' : ''}
              `}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              {pathname === item.href && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Settings */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`
                p-2 rounded-lg transition-all duration-200 transform hover:scale-105
                ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}
              `}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
            <button className={`
              p-2 rounded-lg transition-all duration-200 transform hover:scale-105
              ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
            `}>
              <FiSettings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <FiUser className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Alex Johnson</p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>@alexj</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`
          ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 backdrop-blur-xl border-gray-200'}
          border-b p-4 sticky top-0 z-30
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`
                    pl-10 pr-4 py-2 rounded-full w-64 transition-all duration-200 focus:w-80
                    ${isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }
                    border focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  `}
                />
              </div>

              {/* Notifications */}
              <button className={`
                relative p-2 rounded-full transition-all duration-200 transform hover:scale-110
                ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
              `}>
                <FiBell className="w-6 h-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default MainLayout