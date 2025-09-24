import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createApplicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional(),
})

const updateApplicationSchema = z.object({
  id: z.string().min(1, 'Application ID is required'),
  status: z.enum(['PENDING', 'REVIEWED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED']).optional(),
  notes: z.string().optional(),
  reviewedAt: z.date().optional(),
})

const deleteApplicationSchema = z.object({
  id: z.string().min(1, 'Application ID is required'),
})

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

    const applications = await prisma.jobApplication.findMany({
      where: { userId: currentUser.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            jobType: true,
            applicationDeadline: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Failed to fetch applications:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateApplicationSchema.parse(body)

    // Check if the application belongs to the user
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: validatedData.id,
        userId: user.id,
      },
    })

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found or access denied' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (validatedData.status) updateData.status = validatedData.status
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    if (validatedData.reviewedAt) updateData.reviewedAt = validatedData.reviewedAt

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            jobType: true,
            applicationDeadline: true,
          },
        },
      },
    })

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to update application:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createApplicationSchema.parse(body)

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: validatedData.jobId },
    })

    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if user already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId: validatedData.jobId,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { message: 'You have already applied for this job' },
        { status: 400 }
      )
    }

    const application = await prisma.jobApplication.create({
      data: {
        userId: user.id,
        jobId: validatedData.jobId,
        coverLetter: validatedData.coverLetter || null,
        resumeUrl: validatedData.resumeUrl || null,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            jobType: true,
            applicationDeadline: true,
          },
        },
      },
    })

    // Increment application count on job
    await prisma.job.update({
      where: { id: validatedData.jobId },
      data: { applicationCount: { increment: 1 } },
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create application:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = deleteApplicationSchema.parse(body)

    // Check if the application belongs to the user
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: validatedData.id,
        userId: user.id,
      },
    })

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.jobApplication.delete({
      where: { id: validatedData.id },
    })

    // Decrement application count on job
    await prisma.job.update({
      where: { id: application.jobId },
      data: { applicationCount: { decrement: 1 } },
    })

    return NextResponse.json({ message: 'Application deleted successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to delete application:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}