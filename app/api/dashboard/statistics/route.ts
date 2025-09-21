import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '../../../../lib/prisma'

// GET /api/dashboard/statistics - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
     const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d' // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get real-time statistics
    const [
      totalUsers,
      activeUsers,
      totalJobs,
      activeJobs,
      totalEmployers,
      totalApplications,
      totalEvents,
      totalBlogs,
      recentUsers,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      // User statistics
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),

      // Job statistics
      prisma.job.count(),
      prisma.job.count({ where: { isActive: true } }),

      // Employer statistics
      prisma.employerProfile.count(),

      // Application statistics
      prisma.jobApplication.count(),

      // Event statistics
      prisma.event.count(),

      // Blog statistics
      prisma.blog.count({ where: { isPublished: true } }),

      // Recent activity (last 7 days)
      prisma.user.count({
        where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
      }),
      prisma.job.count({
        where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
      }),
      prisma.jobApplication.count({
        where: { appliedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
      }),
    ])

    // Get monthly statistics for charts
    // Get monthly statistics for charts
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true }
    })
    const jobs = await prisma.job.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true }
    })
    const applications = await prisma.jobApplication.findMany({
      where: { appliedAt: { gte: startDate } },
      select: { appliedAt: true }
    })

    // Helper function to group by month
    const groupByMonth = (items: any[], dateField: string) => {
      const grouped: { [key: string]: number } = {}
      items.forEach(item => {
        const date = new Date(item[dateField])
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
        grouped[monthKey] = (grouped[monthKey] || 0) + 1
      })
      return grouped
    }

    const userStats = groupByMonth(users, 'createdAt')
    const jobStats = groupByMonth(jobs, 'createdAt')
    const applicationStats = groupByMonth(applications, 'appliedAt')

    // Combine into monthly stats
    const allMonths = new Set([...Object.keys(userStats), ...Object.keys(jobStats), ...Object.keys(applicationStats)])
    const monthlyStats = Array.from(allMonths)
      .map(month => ({
        month,
        users: userStats[month] || 0,
        jobs: jobStats[month] || 0,
        applications: applicationStats[month] || 0
      }))
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())
      .slice(0, 12)

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        totalJobs,
        activeJobs,
        totalEmployers,
        totalApplications,
        totalEvents,
        totalBlogs,
        recentUsers,
        recentJobs,
        recentApplications,
      },
      charts: {
        monthlyStats,
      },
      period,
    })

  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}