import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AuthError, createAccessToken, createRefreshToken, setAuthCookies, verifyToken } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshTokenValue = cookieStore.get('refreshToken')?.value

    if (!refreshTokenValue) {
      return NextResponse.json(
        { message: 'No refresh token provided' },
        { status: 401 }
      )
    }

    // Verify the refresh token
    const refreshPayload = await verifyToken(refreshTokenValue)

    if (refreshPayload.type !== 'refresh') {
      return NextResponse.json(
        { message: 'Invalid token type' },
        { status: 401 }
      )
    }

    // Check if refresh token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenValue },
      include: { user: true }
    })

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { message: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    const user = storedToken.user

    // Update last used timestamp
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { lastUsedAt: new Date() }
    })

    // Update user's last login and sync any profile changes
    const updatedUserData = {
      lastLoginAt: new Date(),
      // Sync any changes that might have occurred in the database
      // This ensures the token reflects the most current user state
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updatedUserData
    })

    // Fetch the most current user data from database
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
        linkedinUrl: true,
        resumeUrl: true,
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
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!currentUser) {
      throw new AuthError('User not found after refresh')
    }

    // Create new tokens with fresh user data
    const newAccessToken = await createAccessToken({
      userId: currentUser.id,
      email: currentUser.email,
      role: currentUser.role
    })

    const newRefreshTokenValue = await createRefreshToken(currentUser.id)

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true }
    })

    // Store new refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId: currentUser.id,
        token: newRefreshTokenValue,
        deviceInfo: request.headers.get('user-agent') || 'Unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    })

    // Set new cookies
    await setAuthCookies(newAccessToken, newRefreshTokenValue)

    return NextResponse.json({
      message: 'Tokens refreshed successfully',
      user: currentUser,
      accessToken: newAccessToken,
    })

  } catch (error) {
    console.error('Refresh token error:', error)

    if (error instanceof AuthError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle token revocation (logout)
export async function DELETE(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshTokenValue = cookieStore.get('refreshToken')?.value

    if (refreshTokenValue) {
      // Revoke the refresh token in database
      await prisma.refreshToken.updateMany({
        where: { token: refreshTokenValue },
        data: { isRevoked: true }
      })
    }

    // Clear cookies
    const response = NextResponse.json({ message: 'Logged out successfully' })
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}