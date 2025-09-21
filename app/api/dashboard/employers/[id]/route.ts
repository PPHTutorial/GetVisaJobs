import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateEmployerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  logo: z.string().optional(),
  address: z.string().optional(),
  verified: z.boolean().optional(),
})

// GET /api/dashboard/employers/[id] - Get single employer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const employer = await prisma.employerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        _count: {
          select: {
            jobs: true,
          }
        }
      },
    })

    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 })
    }

    const transformedEmployer = {
      id: employer.id,
      companyName: employer.companyName,
      companySize: employer.companySize,
      industry: employer.industry,
      website: employer.website,
      description: employer.description,
      logo: employer.logo,
      address: employer.address,
      verified: employer.verified,
      user: employer.user,
      jobsCount: employer._count.jobs,
      createdAt: employer.createdAt.toISOString(),
      updatedAt: employer.updatedAt.toISOString(),
    }

    return NextResponse.json(transformedEmployer)

  } catch (error) {
    console.error('Error fetching employer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/dashboard/employers/[id] - Update employer
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = updateEmployerSchema.parse(body)

    // Check if employer exists
    const existingEmployer = await prisma.employerProfile.findUnique({
      where: { id },
    })

    if (!existingEmployer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 })
    }

    const employer = await prisma.employerProfile.update({
      where: { id },
      data: {
        ...validatedData,
        website: validatedData.website === '' ? null : validatedData.website,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        _count: {
          select: {
            jobs: true,
          }
        }
      },
    })

    const transformedEmployer = {
      id: employer.id,
      companyName: employer.companyName,
      companySize: employer.companySize,
      industry: employer.industry,
      website: employer.website,
      description: employer.description,
      logo: employer.logo,
      address: employer.address,
      verified: employer.verified,
      user: employer.user,
      jobsCount: employer._count.jobs,
      createdAt: employer.createdAt.toISOString(),
      updatedAt: employer.updatedAt.toISOString(),
    }

    return NextResponse.json(transformedEmployer)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating employer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/employers/[id] - Delete employer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Check if employer exists
    const employer = await prisma.employerProfile.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobs: true,
          }
        }
      }
    })

    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 })
    }

    // Optional: Prevent deletion if employer has active jobs
    if (employer._count.jobs > 0) {
      return NextResponse.json(
        { error: 'Cannot delete employer with active jobs' },
        { status: 400 }
      )
    }

    await prisma.employerProfile.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Employer deleted successfully' })

  } catch (error) {
    console.error('Error deleting employer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}