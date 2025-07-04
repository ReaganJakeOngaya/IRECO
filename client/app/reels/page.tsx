'use client'

import { useEffect, useState } from 'react'

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reels`)
      .then(res => res.json())
      .then(setReels)
  }, [])

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory">
      {reels.map((reel) => (
        <video
          key={reel.id}
          className="w-full h-screen object-cover snap-center"
          src={reel.video_url}
          controls
          autoPlay
          muted
          loop
        />
      ))}
    </div>
  )
}
