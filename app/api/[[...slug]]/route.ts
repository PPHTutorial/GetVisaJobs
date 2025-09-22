// UK Visa Jobs - Catch-all API Route Handler
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { ApiResponse } from '@/lib/types'

// API route handlers
const handlers = {
  // User routes
  async getUser(request: NextRequest, params: string[]) {
    try {
      const auth = await requireAuth(request)
      const userId = params[1] || auth.userId

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          employerProfile: true,
          _count: {
            select: {
              applications: true,
              savedJobs: true,
            }
          }
        }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' } as ApiResponse,
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: user
      } as ApiResponse)
    } catch (_error) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }
  },

  async updateUser(request: NextRequest, params: string[]) {
    try {
      const auth = await requireAuth(request)
      const userId = params[1] || auth.userId

      if (userId !== auth.userId && auth.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, message: 'Forbidden' } as ApiResponse,
          { status: 403 }
        )
      }

      const body = await request.json()
      const { firstName, lastName, phone, bio, linkedinUrl, currentLocation, preferredLocation } = body

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phone,
          bio,
          linkedinUrl,
          currentLocation,
          preferredLocation,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      } as ApiResponse)
    } catch (_error) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' } as ApiResponse,
        { status: 500 }
      )
    }
  },

  // Job routes
  async getJobs(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const search = searchParams.get('search')
      const location = searchParams.get('location')
      const jobType = searchParams.get('jobType')
      const categoryId = searchParams.get('categoryId')

      const skip = (page - 1) * limit

      const where: any = {
        isActive: true
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (location) {
        where.location = { contains: location, mode: 'insensitive' }
      }

      if (jobType) {
        where.jobType = jobType
      }

      if (categoryId) {
        where.categoryId = categoryId
      }

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            employer: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            },
            category: true,
            _count: {
              select: { applications: true }
            }
          },
          //skip,
         // take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.job.count({ where })
      ])

      return NextResponse.json({
        success: true,
        data: jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      } as ApiResponse)
    } catch (_error) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch jobs' } as ApiResponse,
        { status: 500 }
      )
    }
  },

  async getJob(request: NextRequest, params: string[]) {
    try {
      const jobId = params[1]

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          employer: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          },
          category: true,
          applications: {
            where: { userId: params[2] }, // If userId provided, check if applied
            select: { id: true, status: true }
          },
          _count: {
            select: { applications: true, savedBy: true }
          }
        }
      })

      if (!job) {
        return NextResponse.json(
          { success: false, message: 'Job not found' } as ApiResponse,
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: job
      } as ApiResponse)
    } catch (_error) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch job' } as ApiResponse,
        { status: 500 }
      )
    }
  },

  async createJob(request: NextRequest) {
    try {
      const auth = await requireAuth(request)

      if (auth.role !== 'EMPLOYER' && auth.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, message: 'Only employers can create jobs' } as ApiResponse,
          { status: 403 }
        )
      }

      const body = await request.json()
      const jobData = {
        ...body,
        employerId: auth.userId,
        isActive: true
      }

      const job = await prisma.job.create({
        data: jobData,
        include: {
          employer: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          },
          category: true
        }
      })

      return NextResponse.json({
        success: true,
        data: job,
        message: 'Job created successfully'
      } as ApiResponse, { status: 201 })
    } catch (_error) {
      return NextResponse.json(
        { success: false, message: 'Failed to create job' } as ApiResponse,
        { status: 500 }
      )
    }
  },

  // Application routes
  async applyForJob(request: NextRequest, params: string[]) {
    try {
      const auth = await requireAuth(request)
      const jobId = params[1]

      // Check if already applied
      const existingApplication = await prisma.jobApplication.findUnique({
        where: {
          userId_jobId: {
            userId: auth.userId,
            jobId
          }
        }
      })

      if (existingApplication) {
        return NextResponse.json(
          { success: false, message: 'Already applied for this job' } as ApiResponse,
          { status: 400 }
        )
      }

      const body = await request.json()
      const application = await prisma.jobApplication.create({
        data: {
          userId: auth.userId,
          jobId,
          coverLetter: body.coverLetter,
          resumeUrl: body.resumeUrl
        },
        include: {
          job: {
            include: {
              employer: {
                include: {
                  user: {
                    select: { firstName: true, lastName: true }
                  }
                }
              }
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: application,
        message: 'Application submitted successfully'
      } as ApiResponse, { status: 201 })
    } catch (_error) {
      return NextResponse.json(
        { success: false, message: 'Failed to submit application' } as ApiResponse,
        { status: 500 }
      )
    }
  },

  // Event routes
  async getEvents(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')

      const skip = (page - 1) * limit

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where: { isActive: true },
          include: {
            category: true,
            _count: {
              select: { registrations: true }
            }
          },
          //skip,
         // take: limit,
          orderBy: { startDate: 'asc' }
        }),
        prisma.event.count({ where: { isActive: true } })
      ])

      return NextResponse.json({
        success: true,
        data: events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      } as ApiResponse)
    } catch (_error) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch events' } as ApiResponse,
        { status: 500 }
      )
    }
  },

  // Blog routes
  async getBlogs(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')

      const skip = (page - 1) * limit

      const [blogs, total] = await Promise.all([
        prisma.blog.findMany({
          where: { isPublished: true },
          include: {
            author: {
              select: { firstName: true, lastName: true }
            },
            category: true
          },
          //skip,
         // take: limit,
          orderBy: { publishedAt: 'desc' }
        }),
        prisma.blog.count({ where: { isPublished: true } })
      ])

      return NextResponse.json({
        success: true,
        data: blogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      } as ApiResponse)
    } catch (_error) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch blogs' } as ApiResponse,
        { status: 500 }
      )
    }
  },

  async getBlog(request: NextRequest, params: string[]) {
    try {
      const blogId = params[1]

      const blog = await prisma.blog.findUnique({
        where: { id: blogId, isPublished: true },
        include: {
          author: {
            select: { firstName: true, lastName: true, email: true }
          },
          category: true
        }
      })

      if (!blog) {
        return NextResponse.json(
          { success: false, message: 'Blog not found' } as ApiResponse,
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: blog
      } as ApiResponse)
    } catch (_error) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch blog' } as ApiResponse,
        { status: 500 }
      )
    }
  },

  // Dashboard stats
  async getDashboardStats(request: NextRequest) {
    try {
      const _auth = await requireAuth(request)

      const [
        totalJobs,
        totalApplications,
        totalUsers,
        totalEvents,
        totalBlogs,
        recentApplications,
        recentJobs,
        recentEvents
      ] = await Promise.all([
        prisma.job.count({ where: { isActive: true } }),
        prisma.jobApplication.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.event.count({ where: { isActive: true } }),
        prisma.blog.count({ where: { isPublished: true } }),
        prisma.jobApplication.findMany({
          take: 5,
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            job: { select: { title: true, company: true } }
          },
          orderBy: { appliedAt: 'desc' }
        }),
        prisma.job.findMany({
          take: 5,
          include: {
            employer: {
              include: {
                user: { select: { firstName: true, lastName: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.event.findMany({
          take: 5,
          orderBy: { startDate: 'asc' }
        })
      ])

      return NextResponse.json({
        success: true,
        data: {
          totalJobs,
          totalApplications,
          totalUsers,
          totalEvents,
          totalBlogs,
          recentApplications,
          recentJobs,
          recentEvents
        }
      } as ApiResponse)
    } catch (_error) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }
  }
}

// Route handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const [resource, id] = slug

  try {
    switch (resource) {
      case 'users':
        if (id) {
          return await handlers.getUser(request, slug)
        }
        break
      case 'jobs':
        if (id) {
          return await handlers.getJob(request, slug)
        } else {
          return await handlers.getJobs(request)
        }
      case 'events':
        return await handlers.getEvents(request)
      case 'blogs':
        if (id) {
          return await handlers.getBlog(request, slug)
        } else {
          return await handlers.getBlogs(request)
        }
      case 'dashboard':
        if (slug[1] === 'stats') {
          return await handlers.getDashboardStats(request)
        }
        break
    }

    return NextResponse.json(
      { success: false, message: 'Endpoint not found' } as ApiResponse,
      { status: 404 }
    )
  } catch (_error) {
    console.error('API Error:', _error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const [resource, id] = slug

  try {
    switch (resource) {
      case 'users':
        if (!id) {
          return await handlers.updateUser(request, slug)
        }
        break
      case 'jobs':
        if (!id) {
          return await handlers.createJob(request)
        } else if (slug[1] === 'apply') {
          return await handlers.applyForJob(request, slug)
        }
        break
    }

    return NextResponse.json(
      { success: false, message: 'Endpoint not found' } as ApiResponse,
      { status: 404 }
    )
  } catch (_error) {
    console.error('API Error:', _error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const [resource, id] = slug

  try {
    switch (resource) {
      case 'users':
        if (id) {
          return await handlers.updateUser(request, slug)
        }
        break
    }

    return NextResponse.json(
      { success: false, message: 'Endpoint not found' } as ApiResponse,
      { status: 404 }
    )
  } catch (_error) {
    console.error('API Error:', _error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}