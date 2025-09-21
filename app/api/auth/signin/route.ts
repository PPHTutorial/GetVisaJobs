import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyPassword, createAndSetAuthTokens, checkAuthRateLimit } from '@/lib/auth'
import prisma from '@/lib/prisma'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Rate limiting
    if (!checkAuthRateLimit(email)) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate the request body
    const validatedData = signInSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Account is deactivated. Please contact support.' },
        { status: 401 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { message: 'Please sign in with Google or reset your password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Create and set JWT tokens
    await createAndSetAuthTokens(
      user.id,
      user.email,
      user.role,
      request.headers.get('user-agent') || 'Unknown'
    )

    // Return user data (without sensitive information)
    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.emailVerified && user.phoneVerified,
    }

    return NextResponse.json({
      message: 'Sign in successful',
      user: userResponse,
    })

  } catch (error) {
    console.error('Sign in error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}