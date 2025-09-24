import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/user/subscription - Get current user's subscription
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

    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: currentUser.id },
      include: {
        plan: true,
      },
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Failed to fetch subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}