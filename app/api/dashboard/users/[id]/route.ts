import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema for user update
const userUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  otherNames: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'EMPLOYER']).optional(),
  bio: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  currentLocation: z.string().optional(),
  preferredLocation: z.string().optional(),
  experienceYears: z.number().min(0).optional(),
  degree: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.number().min(1900).max(new Date().getFullYear() + 10).optional(),
  skills: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/dashboard/users/[id] - Get a specific user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getAuthUser()

    if (!currentUser) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin or employer role
    const userRole = (currentUser as any).role
    if (userRole !== 'ADMIN' && userRole !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        otherNames: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        bio: true,
        linkedinUrl: true,
        currentLocation: true,
        preferredLocation: true,
        experienceYears: true,
        degree: true,
        university: true,
        graduationYear: true,
        skills: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            applications: true,
            savedJobs: true,
            reviews: true,
            payments: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/dashboard/users/[id] - Update a specific user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser()

    if (!user) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    const userRole = (user as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()

    // Validate input
    const validatedData = userUpdateSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is being changed and if it already exists
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(validatedData.firstName && { firstName: validatedData.firstName }),
        ...(validatedData.otherNames !== undefined && { otherNames: validatedData.otherNames }),
        ...(validatedData.lastName && { lastName: validatedData.lastName }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
        ...(validatedData.role && { role: validatedData.role }),
        ...(validatedData.bio !== undefined && { bio: validatedData.bio }),
        ...(validatedData.linkedinUrl !== undefined && { linkedinUrl: validatedData.linkedinUrl }),
        ...(validatedData.currentLocation !== undefined && { currentLocation: validatedData.currentLocation }),
        ...(validatedData.preferredLocation !== undefined && { preferredLocation: validatedData.preferredLocation }),
        ...(validatedData.experienceYears !== undefined && { experienceYears: validatedData.experienceYears }),
        ...(validatedData.degree !== undefined && { degree: validatedData.degree }),
        ...(validatedData.university !== undefined && { university: validatedData.university }),
        ...(validatedData.graduationYear !== undefined && { graduationYear: validatedData.graduationYear }),
        ...(validatedData.skills && { skills: validatedData.skills }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        ...(validatedData.emailVerified !== undefined && { emailVerified: validatedData.emailVerified }),
        ...(validatedData.phoneVerified !== undefined && { phoneVerified: validatedData.phoneVerified }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedUser)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/users/[id] - Delete a specific user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser()

    if (!user) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    const userRole = (user as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = params.id

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user (this will cascade delete related records due to Prisma schema)
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: 'User deleted successfully' })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}