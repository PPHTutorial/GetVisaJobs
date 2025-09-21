import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Description } from '@radix-ui/react-dialog'

// GET /api/dashboard/employers - List all employers
export async function GET(_request: NextRequest) {
  try {
     const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    

    const employers = await prisma.employerProfile.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const transformedEmployers = employers.map(employer => ({
      id: employer.id,
      companyName: employer.companyName,
      companySize: employer.companySize,
      industry: employer.industry,
      website: employer.website,
      verified: employer.verified,
      user: employer.user,
      logo: employer.logo,
      description: employer.description,
      address: employer.address,
      jobsCount: employer._count.jobs,
      createdAt: employer.createdAt.toISOString(),
    }))

    return NextResponse.json({
      employers: transformedEmployers,
    })
  } catch (error) {
    console.error('Failed to fetch employers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employers' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/employers - Create new employer
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { companyName, companySize, industry, website, description, logo, address, verified } = body

    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    const employer = await prisma.employerProfile.create({
      data: {
        userId: user.id,
        companyName,
        companySize,
        industry,
        website,
        description,
        logo,
        address,
        verified: verified || false,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    })

    const transformedEmployer = {
      id: employer.id,
      companyName: employer.companyName,
      companySize: employer.companySize,
      industry: employer.industry,
      website: employer.website,
      verified: employer.verified,
      user: employer.user,
      jobsCount: employer._count.jobs,
      createdAt: employer.createdAt.toISOString(),
    }

    return NextResponse.json({
      employer: transformedEmployer,
    })
  } catch (error) {
    console.error('Failed to create employer:', error)
    return NextResponse.json(
      { error: 'Failed to create employer' },
      { status: 500 }
    )
  }
}