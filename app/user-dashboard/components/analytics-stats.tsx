'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface MonthlyStats {
  month: string
  year: number
  count: number
}

interface AnalyticsData {
  totalApplications: number
  statusCounts: {
    PENDING: number
    REVIEWED: number
    INTERVIEWED: number
    ACCEPTED: number
    REJECTED: number
  }
  successRate: string
  recentApplications: number
  monthlyStats: MonthlyStats[]
  avgResponseTime: string
  reviewedApplications: number
}

export function AnalyticsStats() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch application statistics
        const response = await fetch('/api/user/applications/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data')
        }
        
        const data = await response.json()
        console.log('Fetched analytics data:', data)
        setAnalytics(data.stats)
      } catch (err) {
        setError('Failed to load analytics')
        console.error('Error fetching analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Success Rate</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // No need to calculate success rate as it comes from the API

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Application Success Rate */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Application Success Rate</CardTitle>
          <CardDescription>
            Your application conversion statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-green-600">{analytics?.successRate || '0%'}</div>
              <Progress 
                value={parseFloat(analytics?.successRate || '0')} 
                className="mt-2" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Applications</div>
                <div className="text-gray-500">{analytics?.totalApplications || 0}</div>
              </div>
              <div>
                <div className="font-medium text-green-600">Accepted</div>
                <div className="text-gray-500">{analytics?.statusCounts.ACCEPTED || 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>
            Current status of your applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="font-medium text-yellow-600">Pending</div>
                <div className="text-gray-500">{analytics?.statusCounts.PENDING || 0}</div>
              </div>
              <div>
                <div className="font-medium text-blue-600">Reviewed</div>
                <div className="text-gray-500">{analytics?.statusCounts.REVIEWED || 0}</div>
              </div>
              <div>
                <div className="font-medium text-purple-600">Interviewed</div>
                <div className="text-gray-500">{analytics?.statusCounts.INTERVIEWED || 0}</div>
              </div>
              <div>
                <div className="font-medium text-red-600">Rejected</div>
                <div className="text-gray-500">{analytics?.statusCounts.REJECTED || 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Application Trends */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Application Trends</CardTitle>
          <CardDescription>
            Your application activity over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2 h-32 items-end">
            {analytics?.monthlyStats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full bg-primary/20 rounded-t" 
                     style={{ height: `${(stat.count / Math.max(...analytics.monthlyStats.map(s => s.count), 1)) * 100}%` }}>
                </div>
                <div className="text-xs text-gray-500 mt-1">{stat.month}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">Avg. Response Time</div>
              <div className="text-gray-500">{analytics?.avgResponseTime || 'N/A'}</div>
            </div>
            <div>
              <div className="font-medium">Recent Applications</div>
              <div className="text-gray-500">{analytics?.recentApplications || 0} this month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}