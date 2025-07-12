'use client'

import MainLayout from '@/components/layout/MainLayout'
import { useState, useEffect } from 'react'
import { FiTrendingUp, FiUsers, FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiPlay, FiEye } from 'react-icons/fi'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalFollowers: 0,
    totalLikes: 0,
    totalViews: 0
  })
  type Post = { id: number; caption: string; likes: number; comments: number; shares: number; time: string; image: string }
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [trendingTopics, setTrendingTopics] = useState<{ tag: string; posts: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setStats({
        totalPosts: 42,
        totalFollowers: 1247,
        totalLikes: 8924,
        totalViews: 45281
      })
      setRecentPosts([
        { id: 1, caption: "Beautiful sunset today! 🌅", likes: 234, comments: 12, shares: 8, time: '2h ago', image: '/api/placeholder/400/300' },
        { id: 2, caption: "New project launch! So excited to share this with you all 🚀", likes: 156, comments: 24, shares: 15, time: '4h ago', image: '/api/placeholder/400/300' },
        { id: 3, caption: "Coffee and coding session ☕💻", likes: 89, comments: 7, shares: 3, time: '6h ago', image: '/api/placeholder/400/300' },
      ])
      setTrendingTopics([
        { tag: '#WebDesign', posts: 12500 },
        { tag: '#React', posts: 8400 },
        { tag: '#NextJS', posts: 5600 },
        { tag: '#TailwindCSS', posts: 4200 },
        { tag: '#TypeScript', posts: 3800 },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const StatCard = ({ title, value, icon, color, trend }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div className="flex items-center space-x-1 text-green-500">
          <FiTrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 h-32 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 rounded-3xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Welcome back, Alex! 👋</h1>
            <p className="text-xl opacity-90">Here's what's happening with your social presence today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Posts" 
            value={stats.totalPosts} 
            icon={<FiMessageCircle className="w-6 h-6 text-blue-500" />}
            color="bg-blue-50 dark:bg-blue-900/20"
            trend="+12%"
          />
          <StatCard 
            title="Followers" 
            value={stats.totalFollowers} 
            icon={<FiUsers className="w-6 h-6 text-green-500" />}
            color="bg-green-50 dark:bg-green-900/20"
            trend="+8%"
          />
          <StatCard 
            title="Total Likes" 
            value={stats.totalLikes} 
            icon={<FiHeart className="w-6 h-6 text-red-500" />}
            color="bg-red-50 dark:bg-red-900/20"
            trend="+15%"
          />
          <StatCard 
            title="Total Views" 
            value={stats.totalViews} 
            icon={<FiEye className="w-6 h-6 text-purple-500" />}
            color="bg-purple-50 dark:bg-purple-900/20"
            trend="+23%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
                <button className="text-blue-500 hover:text-blue-600 font-medium">View All</button>
              </div>
              <div className="space-y-4">
                {recentPosts.map((post: any) => (
                  <div key={post.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        A
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Alex Johnson</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{post.time}</p>
                          </div>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <FiMoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="mt-2 text-gray-800 dark:text-gray-200">{post.caption}</p>
                        <div className="flex items-center space-x-6 mt-4 text-gray-500 dark:text-gray-400">
                          <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                            <FiHeart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                            <FiMessageCircle className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-green-500 transition-colors">
                            <FiShare2 className="w-4 h-4" />
                            <span>{post.shares}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Trending Topics</h2>
              <div className="space-y-4">
                {trendingTopics.map((topic: any, index: number) => (
                  <div key={topic.tag} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{topic.tag}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{topic.posts.toLocaleString()} posts</p>
                      </div>
                    </div>
                    <FiTrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <FiMessageCircle className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New Post</p>
                </button>
                <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                  <FiPlay className="w-6 h-6 text-purple-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Go Live</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
