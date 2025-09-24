import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/subscriptions/plans - Get all available subscription plans
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/subscriptions/plans - Create a new subscription plan (Admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, description, price, features, maxApplications, isPopular } = body

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        type,
        description,
        price: parseFloat(price),
        features,
        maxApplications: parseInt(maxApplications),
        isPopular: isPopular || false,
      },
    })

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error('Failed to create subscription plan:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}