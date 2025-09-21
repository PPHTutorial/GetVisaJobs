import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

// Validation schema for user creation/update
const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  otherNames: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'EMPLOYER']).default('USER'),
  bio: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  currentLocation: z.string().optional(),
  preferredLocation: z.string().optional(),
  experienceYears: z.number().min(0).optional(),
  degree: z.string().optional(),
  university: z.string().optional(),
  graduationYear: z.number().min(1900).max(new Date().getFullYear() + 10).optional(),
  skills: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false),
})

// GET /api/dashboard/users - List all users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
     const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    

    // Check if user has admin or employer role
    const userRole = (user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              applications: true,
              savedJobs: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
       //skip,
//take: limit,
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/users - Create a new user
export async function POST(request: NextRequest) {
  try {
     const currentUser = await getAuthUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    const userRole = (currentUser as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Validate input
    const validatedData = userSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        otherNames: validatedData.otherNames || null,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        role: validatedData.role,
        bio: validatedData.bio || null,
        linkedinUrl: validatedData.linkedinUrl || null,
        currentLocation: validatedData.currentLocation || null,
        preferredLocation: validatedData.preferredLocation || null,
        experienceYears: validatedData.experienceYears || null,
        degree: validatedData.degree || null,
        university: validatedData.university || null,
        graduationYear: validatedData.graduationYear || null,
        skills: validatedData.skills || [],
        isActive: validatedData.isActive,
        emailVerified: validatedData.emailVerified,
        phoneVerified: validatedData.phoneVerified,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json(user, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}