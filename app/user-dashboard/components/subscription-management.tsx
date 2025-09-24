'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Crown, Star, Zap, Calendar, CreditCard, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface SubscriptionPlan {
  id: string
  name: string
  type: 'BASIC' | 'PROFESSIONAL' | 'PREMIUM'
  description: string
  price: number
  currency: string
  features: string[]
  maxApplications: number
  isPopular: boolean
}

interface UserSubscription {
  id: string
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  applicationsUsed: number
  plan: SubscriptionPlan
}

export function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      // Fetch current subscription
      const subResponse = await fetch('/api/user/subscription')
      if (subResponse.ok) {
        const subData = await subResponse.json()
        setSubscription(subData.subscription)
      }

      // Fetch available plans
      const plansResponse = await fetch('/api/subscriptions/plans')
      if (plansResponse.ok) {
        const plansData = await plansResponse.json()
        setPlans(plansData.plans)
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    setUpgrading(true)
    try {
      const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Successfully upgraded to ${data.subscription.plan.name}!`)
        await fetchSubscriptionData() // Refresh data
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to upgrade subscription')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Failed to upgrade subscription')
    } finally {
      setUpgrading(false)
    }
  }

  const handleCancel = async () => {
    if (!subscription) return

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      })

      if (response.ok) {
        toast.success('Subscription cancelled successfully')
        await fetchSubscriptionData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Cancel error:', error)
      toast.error('Failed to cancel subscription')
    }
  }

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'BASIC':
        return <Star className="h-5 w-5 text-emerald-500" />
      case 'PROFESSIONAL':
        return <Zap className="h-5 w-5 text-emerald-600" />
      case 'PREMIUM':
        return <Crown className="h-5 w-5 text-emerald-700" />
      default:
        return <Star className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-orange-100 text-orange-800'
      case 'PAST_DUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!subscription) {
    // No active subscription - show plans to subscribe
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 mb-4">
            Choose a plan to unlock premium features and apply to more jobs.
          </p>
          <Button onClick={() => router.push('/pricing')}>
            View Plans
          </Button>
        </div>

        {/* Show available plans */}
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative">
              {plan.isPopular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-500">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.type)}
                </div>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-2xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgrading}
                  className="w-full"
                  variant={plan.isPopular ? 'default' : 'outline'}
                >
                  {upgrading ? 'Subscribing...' : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Active subscription - show current plan and management options
  const usagePercentage = subscription.plan.maxApplications > 0
    ? (subscription.applicationsUsed / subscription.plan.maxApplications) * 100
    : 0

  const daysLeft = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getPlanIcon(subscription.plan.type)}
              <div>
                <CardTitle className="text-xl">{subscription.plan.name} Plan</CardTitle>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${subscription.plan.price}</div>
              <div className="text-sm text-gray-600">per month</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Stats */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Applications Used</span>
              <span>
                {subscription.applicationsUsed} / {subscription.plan.maxApplications === -1 ? '∞' : subscription.plan.maxApplications}
              </span>
            </div>
            {subscription.plan.maxApplications > 0 && (
              <Progress value={usagePercentage} className="h-2" />
            )}
          </div>

          {/* Billing Period */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>{daysLeft} days left</span>
            </div>
          </div>

          {/* Plan Features */}
          <div>
            <h4 className="font-medium mb-2">Plan Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {subscription.plan.features.slice(0, 3).map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
              {subscription.plan.features.length > 3 && (
                <li>• +{subscription.plan.features.length - 3} more features</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Management Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Upgrade Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Unlock more features and higher application limits.
            </p>
            <Button onClick={() => router.push('/pricing')} variant="outline">
              View All Plans
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Cancel Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Your subscription will remain active until the end of the current period.
            </p>
            <Button
              onClick={handleCancel}
              variant="destructive"
              disabled={subscription.cancelAtPeriodEnd}
            >
              {subscription.cancelAtPeriodEnd ? 'Cancellation Scheduled' : 'Cancel Subscription'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Usage Warning */}
      {subscription.plan.maxApplications > 0 && usagePercentage > 80 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <h4 className="font-medium text-orange-800">Approaching Limit</h4>
                <p className="text-sm text-orange-700">
                  You&apos;ve used {usagePercentage.toFixed(0)}% of your monthly applications.
                  Consider upgrading for more applications.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}