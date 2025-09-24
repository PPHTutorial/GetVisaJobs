import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const currentUser = await getAuthUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!currentUser.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all applications for the user
    const applications = await prisma.jobApplication.findMany({
      where: { userId: currentUser.id },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        reviewedAt: true,
      },
    })

    // Calculate statistics
    const totalApplications = applications.length

    const statusCounts = {
      PENDING: 0,
      REVIEWED: 0,
      INTERVIEWED: 0,
      ACCEPTED: 0,
      REJECTED: 0,
    }

    applications.forEach(app => {
      statusCounts[app.status]++
    })

    const successRate = totalApplications > 0
      ? ((statusCounts.ACCEPTED / totalApplications) * 100).toFixed(1)
      : '0'

    // Recent applications (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentApplications = applications.filter(
      app => app.appliedAt >= thirtyDaysAgo
    ).length

    // Applications by month (last 6 months)
    const monthlyStats = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.getMonth()
      const year = date.getFullYear()

      const monthApplications = applications.filter(app => {
        const appDate = new Date(app.appliedAt)
        return appDate.getMonth() === month && appDate.getFullYear() === year
      }).length

      monthlyStats.push({
        month: date.toLocaleString('default', { month: 'short' }),
        year: year,
        count: monthApplications,
      })
    }

    // Average response time (days between applied and reviewed)
    const reviewedApplications = applications.filter(app => app.reviewedAt)
    const avgResponseTime = reviewedApplications.length > 0
      ? reviewedApplications.reduce((sum, app) => {
          const applied = new Date(app.appliedAt)
          const reviewed = new Date(app.reviewedAt!)
          const diffTime = Math.abs(reviewed.getTime() - applied.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return sum + diffDays
        }, 0) / reviewedApplications.length
      : null

    const stats = {
      totalApplications,
      statusCounts,
      successRate: `${successRate}%`,
      recentApplications,
      monthlyStats,
      avgResponseTime: avgResponseTime ? `${avgResponseTime.toFixed(1)} days` : 'N/A',
      reviewedApplications: reviewedApplications.length,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Failed to fetch application stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}