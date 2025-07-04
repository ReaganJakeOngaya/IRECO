'use client'

import { useEffect, useState } from 'react'

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/feed/posts`)
      .then(res => res.json())
      .then(setPosts)
  }, [])

  return (
    <div className="max-w-xl mx-auto mt-8 space-y-6">
      <h1 className="text-3xl font-bold">📸 Feed</h1>
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded shadow">
          <div className="font-semibold">{post.user.username}</div>
          <p className="mt-2">{post.caption}</p>
          {post.image_url && (
            <img src={post.image_url} alt="" className="mt-2 rounded" />
          )}
        </div>
      ))}
    </div>
  )
}
