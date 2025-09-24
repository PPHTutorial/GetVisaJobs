import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const subscribeSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
})

// POST /api/subscriptions/subscribe - Subscribe to a plan
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId } = subscribeSchema.parse(body)

    // Check if plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json(
        { message: 'Subscription plan not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: { userId: user.id },
    })

    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      return NextResponse.json(
        { message: 'You already have an active subscription' },
        { status: 400 }
      )
    }

    // Calculate subscription period
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1) // Monthly subscription

    // Create or update subscription
    const subscription = await prisma.userSubscription.upsert({
      where: { userId: user.id },
      update: {
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        applicationsUsed: 0,
      },
      create: {
        userId: user.id,
        planId,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        applicationsUsed: 0,
      },
      include: {
        plan: true,
      },
    })

    // Update user's subscription status
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'ACTIVE' },
    })

    return NextResponse.json({
      subscription,
      message: 'Successfully subscribed to plan'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to subscribe:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}