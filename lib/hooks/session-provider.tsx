/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import type { AuthUser } from '@/lib/types'

interface SessionContextType {
  user: AuthUser | null
  isLoading: boolean
  refreshSession: () => Promise<void>
  refreshTokens: () => Promise<boolean>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        return true
      } else {
        setUser(null)
        return false
      }
    } catch (error) {
      console.error('Failed to refresh tokens:', error)
      setUser(null)
      return false
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else if (response.status === 401) {
        // Try to refresh tokens
        const refreshed = await refreshTokens()
        if (!refreshed) {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [refreshTokens])

  useEffect(() => {
    refreshSession()

    // Set up periodic token refresh (every 5 minutes)
    const interval = setInterval(async () => {
      if (user) {
        await refreshTokens()
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const value = {
    user,
    isLoading,
    refreshSession,
    refreshTokens,
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}