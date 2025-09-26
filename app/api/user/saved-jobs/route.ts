import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: user.id },
      include: {
        job: {
          include: {
            employer: {
              select: {
                companyName: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    })

    const formattedJobs = savedJobs.map((savedJob) => ({
      id: savedJob.job.id,
      title: savedJob.job.title,
      company: savedJob.job.company,
      location: savedJob.job.location,
      salary: savedJob.job.salaryMin && savedJob.job.salaryMax
        ? `£${savedJob.job.salaryMin.toLocaleString()} - £${savedJob.job.salaryMax.toLocaleString()}`
        : null,
      type: savedJob.job.jobType,
      description: savedJob.job.description,
      requirements: savedJob.job.skillsRequired,
      postedAt: savedJob.job.createdAt.toISOString(),
      applicationDeadline: savedJob.job.applicationDeadline?.toISOString(),
      employer: {
        name: savedJob.job.employer?.companyName || savedJob.job.company,
        logo: savedJob.job.employer?.logo,
      },
    }))

    return NextResponse.json({ savedJobs: formattedJobs })
  } catch (error) {
    console.error('Failed to fetch saved jobs:', error)
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

    if (!user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json(
        { message: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      )
    }

    // Check if already saved
    const existingSavedJob = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId: jobId,
        },
      },
    })

    if (existingSavedJob) {
      return NextResponse.json(
        { message: 'Job already saved' },
        { status: 409 }
      )
    }

    // Save the job
    await prisma.savedJob.create({
      data: {
        userId: user.id,
        jobId: jobId,
      },
    })

    return NextResponse.json({ message: 'Job saved successfully' })
  } catch (error) {
    console.error('Failed to save job:', error)
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

    if (!user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return NextResponse.json(
        { message: 'Job ID is required' },
        { status: 400 }
      )
    }

    const deletedSavedJob = await prisma.savedJob.deleteMany({
      where: {
        userId: user.id,
        jobId: jobId,
      },
    })

    if (deletedSavedJob.count === 0) {
      return NextResponse.json(
        { message: 'Saved job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Job removed from saved jobs' })
  } catch (error) {
    console.error('Failed to remove saved job:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}