'use client'

import MainLayout from '@/components/layout/MainLayout'
import { useEffect, useState, useRef } from 'react'
import { Heart, MessageCircle, Share, Bookmark, Play, Pause, Volume2, VolumeX, MoreHorizontal } from 'lucide-react'

interface Reel {
  id: string
  video_url: string
  title: string
  user: {
    name: string
    avatar: string
    verified: boolean
  }
  stats: {
    likes: number
    comments: number
    shares: number
  }
  description: string
  tags: string[]
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [currentReelIndex, setCurrentReelIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set())
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set())
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reels`)
      .then(res => res.json())
      .then(setReels)
      .catch(() => {
        // Fallback demo data
        setReels([
          {
            id: '1',
            video_url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            title: 'Amazing Nature Video',
            user: { name: 'NatureExplorer', avatar: '🌿', verified: true },
            stats: { likes: 12500, comments: 340, shares: 89 },
            description: 'Beautiful landscapes that will take your breath away! 🌄',
            tags: ['nature', 'landscape', 'travel']
          }
        ])
      })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          const index = parseInt(video.dataset.index || '0')
          
          if (entry.isIntersecting) {
            setCurrentReelIndex(index)
            if (isPlaying) {
              video.play()
            }
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.7 }
    )

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video)
    })

    return () => observer.disconnect()
  }, [reels, isPlaying])

  const togglePlay = () => {
    const currentVideo = videoRefs.current[currentReelIndex]
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.pause()
      } else {
        currentVideo.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = !isMuted
      }
    })
    setIsMuted(!isMuted)
  }

  const toggleLike = (reelId: string) => {
    setLikedReels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reelId)) {
        newSet.delete(reelId)
      } else {
        newSet.add(reelId)
      }
      return newSet
    })
  }

  const toggleSave = (reelId: string) => {
    setSavedReels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reelId)) {
        newSet.delete(reelId)
      } else {
        newSet.add(reelId)
      }
      return newSet
    })
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <MainLayout>
      <div 
        ref={containerRef}
        className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide bg-black"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="relative h-screen w-full snap-center flex items-center justify-center overflow-hidden"
          >
            {/* Video */}
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              data-index={index}
              className="w-full h-full object-cover"
              src={reel.video_url}
              autoPlay={false}
              muted={isMuted}
              loop
              playsInline
              onClick={togglePlay}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 pointer-events-none" />

            {/* Play/Pause Indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-6 animate-pulse">
                  <Play className="w-12 h-12 text-white ml-1" fill="white" />
                </div>
              </div>
            )}

            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {reel.user.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-white font-semibold">{reel.user.name}</span>
                    {reel.user.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button className="p-2 bg-black/30 backdrop-blur-sm rounded-full">
                <MoreHorizontal className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              <div className="flex items-end justify-between">
                {/* Content Info */}
                <div className="flex-1 mr-4">
                  <h3 className="text-white font-bold text-lg mb-2">{reel.title}</h3>
                  <p className="text-white/90 text-sm mb-3 leading-relaxed">
                    {reel.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {reel.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Audio Controls */}
                  <button
                    onClick={toggleMute}
                    className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                    <span className="text-white text-sm">
                      {isMuted ? 'Unmute' : 'Mute'}
                    </span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col items-center space-y-6">
                  <button
                    onClick={() => toggleLike(reel.id)}
                    className="group flex flex-col items-center space-y-1 transform transition-all duration-200 hover:scale-110"
                  >
                    <div className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                      likedReels.has(reel.id) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-black/30 text-white group-hover:bg-red-500/20'
                    }`}>
                      <Heart 
                        className={`w-6 h-6 transition-all duration-200 ${
                          likedReels.has(reel.id) ? 'fill-current' : ''
                        }`} 
                      />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {formatCount(reel.stats.likes + (likedReels.has(reel.id) ? 1 : 0))}
                    </span>
                  </button>

                  <button className="group flex flex-col items-center space-y-1 transform transition-all duration-200 hover:scale-110">
                    <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm text-white group-hover:bg-blue-500/20 transition-all duration-200">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {formatCount(reel.stats.comments)}
                    </span>
                  </button>

                  <button className="group flex flex-col items-center space-y-1 transform transition-all duration-200 hover:scale-110">
                    <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm text-white group-hover:bg-green-500/20 transition-all duration-200">
                      <Share className="w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {formatCount(reel.stats.shares)}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleSave(reel.id)}
                    className="group flex flex-col items-center space-y-1 transform transition-all duration-200 hover:scale-110"
                  >
                    <div className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                      savedReels.has(reel.id) 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-black/30 text-white group-hover:bg-yellow-500/20'
                    }`}>
                      <Bookmark 
                        className={`w-6 h-6 transition-all duration-200 ${
                          savedReels.has(reel.id) ? 'fill-current' : ''
                        }`} 
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: currentReelIndex === index ? '100%' : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </MainLayout>
  )
}
