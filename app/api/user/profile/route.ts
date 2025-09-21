import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import  prisma  from '@/lib/prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  currentLocation: z.string().optional(),
  preferredLocation: z.string().optional(),
  experienceYears: z.number().optional(),
  degree: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.number().optional(),
  skills: z.array(z.string()),
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

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        linkedinUrl: true,
        currentLocation: true,
        preferredLocation: true,
        experienceYears: true,
        degree: true,
        university: true,
        graduationYear: true,
        skills: true,
        avatar: true,
        resumeUrl: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      profile: {
        ...user,
        skills: user.skills || [],
      },
    })
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
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

    if (! user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
        bio: validatedData.bio || null,
        linkedinUrl: validatedData.linkedinUrl || null,
        currentLocation: validatedData.currentLocation || null,
        preferredLocation: validatedData.preferredLocation || null,
        experienceYears: validatedData.experienceYears || null,
        degree: validatedData.degree || null,
        university: validatedData.university || null,
        graduationYear: validatedData.graduationYear || null,
        skills: validatedData.skills,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        linkedinUrl: true,
        currentLocation: true,
        preferredLocation: true,
        experienceYears: true,
        degree: true,
        university: true,
        graduationYear: true,
        skills: true,
        avatar: true,
        resumeUrl: true,
      },
    })

    return NextResponse.json({
      profile: {
        ...updatedUser,
        skills: updatedUser.skills || [],
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to update user profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}