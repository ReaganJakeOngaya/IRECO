import Link from 'next/link'
import { FiMessageSquare, FiCamera, FiMonitor, FiVideo } from 'react-icons/fi'
import { FaWaveSquare } from 'react-icons/fa'

export default function HomePage() {
  const features = [
    {
      icon: <FiMessageSquare className="w-6 h-6" />,
      title: "Real-time Chat",
      description: "Connect with friends through instant messaging"
    },
    {
      icon: <FiCamera className="w-6 h-6" />,
      title: "Share Reels",
      description: "Create and discover short videos"
    },
    {
      icon: <FiMonitor className="w-6 h-6" />,
      title: "Live Stream",
      description: "Broadcast to your audience in real-time"
    },
    {
      icon: <FiVideo className="w-6 h-6" />,
      title: "Video Calls",
      description: "Face-to-face conversations with friends"
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="flex justify-center mb-6">
          <FaWaveSquare className="text-5xl text-blue-400" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welcome to <span className="text-blue-400">SocialWave</span> 🌊
        </h1>
        <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-10">
          The next generation social platform for creators and communities
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/auth/register" 
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
          <Link 
            href="/auth/login" 
            className="px-8 py-3 bg-transparent border border-blue-400 hover:bg-blue-900/50 rounded-lg font-medium transition-colors"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SocialWave?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/50 p-6 rounded-xl hover:bg-slate-800/70 transition-colors">
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-blue-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6">Ready to ride the wave?</h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-8">
            Join millions of users connecting on SocialWave today
          </p>
          <Link 
            href="/auth/register" 
            className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </main>
  )
}
