import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/api'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    getCurrentUser(token)
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}

export function useRequireAuth() {
  const { user, loading } = useAuth()

  if (loading) return { user: null, loading: true }

  if (!user) {
    window.location.href = '/auth/login'
    return { user: null, loading: false }
  }

  return { user, loading: false }
}

export function useRequireGuest() {
  const { user, loading } = useAuth()

  if (loading) return { user: null, loading: true }

  if (user) {
    window.location.href = '/dashboard'
    return { user: null, loading: false }
  }

  return { user, loading: false }
}

export function useCurrentUser() {
  const { user, loading } = useAuth()

  if (loading) return { user: null, loading: true }

  return { user, loading: false }
}   

export function useIsAuthenticated() {
  const { user, loading } = useAuth()

  if (loading) return { isAuthenticated: false, loading: true }

  return { isAuthenticated: !!user, loading: false }
}

