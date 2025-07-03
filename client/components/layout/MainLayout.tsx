import Link from 'next/link'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h1 className="text-2xl font-bold mb-6">🌊 SocialWave</h1>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block hover:text-blue-400">Dashboard</Link>
          <Link href="/chat" className="block hover:text-blue-400">Chat</Link>
          <Link href="/reels" className="block hover:text-blue-400">Reels</Link>
          <Link href="/stream" className="block hover:text-blue-400">Stream</Link>
          <Link href="/video-call" className="block hover:text-blue-400">Video Call</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  )
}

export default MainLayout
