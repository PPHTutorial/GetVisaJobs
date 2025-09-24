import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const reviewUpdateSchema = z.object({
  isVerified: z.boolean().optional(),
})

// GET /api/dashboard/reviews - List all reviews
export async function GET(request: NextRequest) {
  try {
     const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const verified = searchParams.get('verified')

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (verified !== null) {
      where.isVerified = verified === 'true'
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          job: {
            select: {
              id: true,
              title: true,
              company: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
       //skip,
//take: limit,
      }),
      prisma.review.count({ where })
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}