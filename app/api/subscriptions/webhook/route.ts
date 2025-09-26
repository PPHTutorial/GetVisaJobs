import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
  typescript: true
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = (await headersList).get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, planType } = session.metadata!

        // Update user subscription
        await prisma.userSubscription.upsert({
          where: { userId },
          update: {
            status: 'ACTIVE',
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + (session.metadata?.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
            interval: session.metadata?.interval || 'monthly',
            applicationsUsed: 0
          },
          create: {
            userId,
            planId: planType,
            status: 'ACTIVE',
            stripeSubscriptionId: session.subscription as string,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + (session.metadata?.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
            interval: session.metadata?.interval || 'monthly',
            applicationsUsed: 0
          }
        })

        // Update user subscription status
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: 'ACTIVE' }
        })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userSubscription = await prisma.userSubscription.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        })

        if (userSubscription) {
          await prisma.userSubscription.update({
            where: { id: userSubscription.id },
            data: { status: 'CANCELLED' }
          })

          await prisma.user.update({
            where: { id: userSubscription.userId },
            data: { subscriptionStatus: 'INACTIVE' }
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}