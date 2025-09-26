import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateJobSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  company: z.string().min(1, 'Company is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  jobType: z.string().optional(),
  employmentType: z.string().min(1, 'Employment type is required').optional(),
  experienceLevel: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().default('GBP').optional(),
  salaryType: z.string().default('Yearly').optional(),
  salaryMode: z.string().default('RANGE').optional(),
  degreeRequired: z.string().optional(),
  skillsRequired: z.array(z.string()).optional(),
  applicationUrl: z.string().optional(),
  applicationEmail: z.string().optional(),
  applicationDeadline: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  employerId: z.string().optional(),
  categoryId: z.string().optional(),
})

// GET /api/dashboard/jobs/[id] - Get a specific job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        employer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: true,
        applications: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        benefits: job.benefits,
        company: job.company,
        location: job.location,
        logo: job.logo,
        country: job.country,
        state: job.state,
        city: job.city,
        jobType: job.jobType,
        employmentType: job.employmentType,
        experienceLevel: job.experienceLevel,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        salaryType: job.salaryType,
        salaryMode: job.salaryMode,
        degreeRequired: job.degreeRequired,
        skillsRequired: job.skillsRequired,
        applicationUrl: job.applicationUrl,
        applicationEmail: job.applicationEmail,
        applicationDeadline: job.applicationDeadline?.toISOString(),
        isActive: job.isActive,
        isFeatured: job.isFeatured,
        viewCount: job.viewCount,
        applicationCount: job._count.applications,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
        employer: job.employer,
        category: job.category,
        applications: job.applications,
      },
    })
  } catch (error) {
    console.error('Failed to fetch job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

// PUT /api/dashboard/jobs/[id] - Update a specific job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate the request body
    const validatedData = updateJobSchema.parse(body)

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: params.id },
    })

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Update the job
    const job = await prisma.job.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements,
        responsibilities: validatedData.responsibilities,
        benefits: validatedData.benefits,
        company: validatedData.company,
        location: validatedData.location,
        jobType: validatedData.jobType as any,
        employmentType: validatedData.employmentType,
        experienceLevel: validatedData.experienceLevel,
        salaryMin: validatedData.salaryMin,
        salaryMax: validatedData.salaryMax,
        salaryCurrency: validatedData.salaryCurrency,
        salaryType: validatedData.salaryType,
        degreeRequired: validatedData.degreeRequired,
        skillsRequired: validatedData.skillsRequired,
        applicationUrl: validatedData.applicationUrl,
        applicationEmail: validatedData.applicationEmail,
        applicationDeadline: validatedData.applicationDeadline ? new Date(validatedData.applicationDeadline) : null,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        employerId: validatedData.employerId,
        categoryId: validatedData.categoryId,
      },
      include: {
        employer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        category: true,
      },
    })

    return NextResponse.json({
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        country: job.country,
        state: job.state,
        city: job.city,
        jobType: job.jobType,
        employmentType: job.employmentType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        salaryType: job.salaryType,
        isActive: job.isActive,
        isFeatured: job.isFeatured,
        viewCount: job.viewCount,
        applicationCount: job.applicationCount,
        createdAt: job.createdAt.toISOString(),
        employer: job.employer,
        category: job.category,
      },
    })
  } catch (error) {
    console.error('Failed to update job:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/jobs/[id] - Delete a specific job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: params.id },
    })

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Delete the job
    await prisma.job.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Failed to delete job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}