'use client'

import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Button } from '../../../components/ui/button'
import { ThemeToggle } from '../../../components/theme-toggle'
import { LogOut, Menu } from 'lucide-react'

interface DashboardHeaderProps {
  user: {
    id: string
    name?: string
    email?: string
    avatar?: string
    role?: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps ) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      // Call our custom logout endpoint
      const response = await fetch('/api/auth/refresh', {
        method: 'DELETE',
      })

      if (response.ok) {
        // Clear any local storage or state if needed
        router.push('/')
      } else {
        console.error('Logout failed')
        // Fallback to redirect
        router.push('/')
      }
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/')
    }
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="md:hidden mr-2">
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Welcome back, {user?.name || 'Admin'}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />

        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
            <AvatarFallback className="text-xs">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.name || 'Admin'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  )
}