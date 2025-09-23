import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { SalaryMode } from '@prisma/client'

const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().nullish(),
  responsibilities: z.string().nullish(),
  benefits: z.string().nullish(),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  country: z.string().nullish(),
  state: z.string().nullish(),
  city: z.string().nullish(),
  jobType: z.string(),
  employmentType: z.string().min(1, 'Employment type is required'),
  experienceLevel: z.string().nullish(),
  salaryMin: z.number().nullish(),
  salaryMax: z.number().nullish(),
  salaryCurrency: z.string().default('GBP'),
  salaryType: z.string().default('Yearly'),
  salaryMode: z.string().default('RANGE'),
  degreeRequired: z.string().nullish(),
  skillsRequired: z.array(z.string()).optional().default([]),
  applicationUrl: z.string().nullish(),
  applicationEmail: z.string().nullish(),
  applicationDeadline: z.string().nullish(),
  applicationMethod: z.string().default('INTERNAL'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  employerId: z.string().nullish(),
  categoryId: z.string().nullish(),
  logo: z.string().nullish(),
})

// GET /api/dashboard/jobs - List all jobs
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
    const status = searchParams.get('status') // 'active', 'inactive', or 'all'

    // New filter parameters
    const categoryId = searchParams.get('categoryId')
    const location = searchParams.get('location')
    const country = searchParams.get('country')
    const state = searchParams.get('state')
    const city = searchParams.get('city')
    const jobTypes = searchParams.get('jobTypes')?.split(',') || []
    const employmentType = searchParams.get('employmentType')
    const experienceLevel = searchParams.get('experienceLevel')
    const salaryMin = searchParams.get('salaryMin')
    const salaryMax = searchParams.get('salaryMax')
    const degreeRequired = searchParams.get('degreeRequired')
    const skills = searchParams.get('skills')?.split(',') || []
    const applicationMethod = searchParams.get('applicationMethod')
    const isFeatured = searchParams.get('isFeatured') === 'true'
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    // Add new filters
    if (categoryId) {
      where.categoryId = categoryId
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' }
    }

    if (state) {
      where.state = { contains: state, mode: 'insensitive' }
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    if (jobTypes.length > 0) {
      where.jobType = { in: jobTypes }
    }

    if (employmentType) {
      where.employmentType = employmentType
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel
    }

    if (salaryMin) {
      where.salaryMin = { gte: parseInt(salaryMin) }
    }

    if (salaryMax) {
      where.salaryMax = { lte: parseInt(salaryMax) }
    }

    if (degreeRequired) {
      where.degreeRequired = degreeRequired
    }

    if (skills.length > 0) {
      where.skillsRequired = { hasSome: skills }
    }

    if (applicationMethod) {
      where.applicationMethod = applicationMethod
    }

    if (isFeatured) {
      where.isFeatured = true
    }

    // Build orderBy
    const orderBy: any = {}
    switch (sortBy) {
      case 'createdAt':
        orderBy.createdAt = sortOrder
        break
      case 'salaryMin':
        orderBy.salaryMin = sortOrder
        break
      case 'salaryMax':
        orderBy.salaryMax = sortOrder
        break
      case 'title':
        orderBy.title = sortOrder
        break
      case 'company':
        orderBy.company = sortOrder
        break
      default:
        orderBy.createdAt = 'desc'
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
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
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy,
        /* skip,
        take: limit, */
      }),
      prisma.job.count({ where }),
    ])

    // Transform the data to match the expected format
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      employmentType: job.employmentType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      salaryType: job.salaryType,
      salaryMode: job.salaryMode,
      isActive: job.isActive,
      isFeatured: job.isFeatured,
      viewCount: job.viewCount,
      applicationCount: job._count.applications,
      createdAt: job.createdAt.toISOString(),
      employer: job.employer,
      category: job.category,
      logo: job.logo,
    }))

    return NextResponse.json({
      jobs: transformedJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
     const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    

    const body = await request.json()

    // Validate the request body
    const validatedData = createJobSchema.parse(body)

    // Create the job
    const job = await prisma.job.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements,
        responsibilities: validatedData.responsibilities,
        benefits: validatedData.benefits,
        company: validatedData.company,
        location: validatedData.location,
        country: validatedData.country,
        state: validatedData.state,
        city: validatedData.city,
        jobType: validatedData.jobType as any,
        employmentType: validatedData.employmentType,
        experienceLevel: validatedData.experienceLevel,
        salaryMin: validatedData.salaryMin,
        salaryMax: validatedData.salaryMax,
        salaryCurrency: validatedData.salaryCurrency,
        salaryType: validatedData.salaryType,
        salaryMode: validatedData.salaryMode as SalaryMode,
        degreeRequired: validatedData.degreeRequired,
        skillsRequired: validatedData.skillsRequired,
        applicationUrl: validatedData.applicationUrl,
        applicationEmail: validatedData.applicationEmail,
        applicationDeadline: validatedData.applicationDeadline ? new Date(validatedData.applicationDeadline) : null,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        employerId: validatedData.employerId,
        categoryId: validatedData.categoryId,
        logo: validatedData.logo,
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
    console.error('Failed to create job:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}