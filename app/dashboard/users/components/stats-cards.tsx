'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Users as UsersIcon, Shield, Building } from 'lucide-react'

interface StatsData {
  totalUsers: number
  activeUsers: number
  totalEmployers: number
  adminUsers: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/statistics')
        if (!response.ok) {
          throw new Error('Failed to fetch statistics')
        }
        const data = await response.json()

        // Get admin count from users API
        const usersResponse = await fetch('/api/dashboard/users?role=ADMIN&limit=1000')
        const usersData = await usersResponse.json()
        const adminCount = usersData.users?.length || 0

        setStats({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          totalEmployers: data.totalEmployers || 0,
          adminUsers: adminCount
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded"></div>
              <p className="text-xs text-muted-foreground animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded mt-1"></p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-4">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error || 'Unable to load statistics'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activePercentage = stats.totalUsers > 0
    ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)
    : '0'

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Registered users on platform
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {activePercentage}% of total users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admins</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.adminUsers}</div>
          <p className="text-xs text-muted-foreground">
            Platform administrators
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employers</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEmployers}</div>
          <p className="text-xs text-muted-foreground">
            Verified employers
          </p>
        </CardContent>
      </Card>
    </div>
  )
}