'use client'

import Link from 'next/link'
import { useState } from 'react'
import { loginUser } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await loginUser(email, password)
      localStorage.setItem('token', data.access_token)
      router.push('/dashboard')
    } catch (err) {
      alert('Invalid login')
    }
}

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Sign In
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Don’t have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  )
}
// This code defines a simple login page using React and Next.js.
// It includes a form with email and password fields, a submit button, and a link to the registration page.
// The form uses local state to manage input values and handles submission with a function that currently logs
// the input values to the console. The page is styled with Tailwind CSS classes for a clean and modern look.
// The main layout is centered with a light background, and the form is contained within a white card with rounded corners and a shadow effect.
// The button has a hover effect to enhance user interaction.
// The page is responsive and adapts to different screen sizes, making it user-friendly on both desktop and mobile devices. 
// The use of Next.js's Link component allows for client-side navigation to the registration page without a full page reload.
// This approach provides a smooth user experience and is a common pattern in modern web applications.