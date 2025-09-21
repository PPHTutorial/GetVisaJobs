'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import {
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

interface StatsData {
  totalUsers: number
  activeUsers: number
  totalJobs: number
  activeJobs: number
  totalEmployers: number
  totalApplications: number
  recentUsers: number
  recentJobs: number
  recentApplications: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/statistics')
        if (response.ok) {
          const data = await response.json()
          setStats(data.overview)
        }
      } catch (_error) {
        toast.error('Failed to fetch dashboard statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center justify-center h-24">
            <p className="text-muted-foreground">Failed to load statistics</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.recentUsers}`,
      changeType: 'positive' as const,
      icon: Users,
      subtitle: 'registered users'
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs.toLocaleString(),
      change: `+${stats.recentJobs}`,
      changeType: 'positive' as const,
      icon: Briefcase,
      subtitle: 'active postings'
    },
    {
      title: 'Employers',
      value: stats.totalEmployers.toLocaleString(),
      change: `+${stats.recentApplications}`,
      changeType: 'positive' as const,
      icon: Building2,
      subtitle: 'total employers'
    },
    {
      title: 'Applications',
      value: stats.totalApplications.toLocaleString(),
      change: `+${stats.recentApplications}`,
      changeType: 'positive' as const,
      icon: FileText,
      subtitle: 'total applications'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <p className={`text-xs flex items-center ${
              stat.changeType === 'positive'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {stat.change} {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}