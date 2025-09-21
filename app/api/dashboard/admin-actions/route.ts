import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '../../../../lib/prisma'

// GET /api/dashboard/admin-actions - List all admin actions
export async function GET(request: NextRequest) {
  try {
     const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    

    // Check if user has admin role
    const userRole = user.role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resourceType')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { admin: { firstName: { contains: search, mode: 'insensitive' } } },
        { admin: { lastName: { contains: search, mode: 'insensitive' } } },
        { admin: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (action) {
      where.action = action
    }

    if (resourceType) {
      where.resourceType = resourceType
    }

    const [adminActions, total] = await Promise.all([
      prisma.adminAction.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
       //skip,
//take: limit,
      }),
      prisma.adminAction.count({ where })
    ])

    return NextResponse.json({
      adminActions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching admin actions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}