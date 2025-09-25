'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Star, Zap, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Footer from '@/components/footer'
import NavbarComponent from '@/components/ui/navbar'

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

export default function PricingPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [subscribing, setSubscribing] = useState<string | null>(null)
    const router = useRouter()

    const pricing: SubscriptionPlan[] = [
        {
            id: 'basic',
            name: 'Basic',
            type: 'BASIC',
            description: 'Perfect for getting started with your job search',
            price: 2.99,
            currency: 'USD',
            features: [
                'Up to 50 job applications per month',
                'Basic job search and filtering',
                'Email notifications for new jobs',
                'Access to job application tracking',
                'Resume upload and storage'
            ],
            maxApplications: 50,
            isPopular: false,
        },
        {
            id: 'professional',
            name: 'Professional',
            type: 'PROFESSIONAL',
            description: 'Advanced features for serious job seekers',
            price: 9.99,
            currency: 'USD',
            features: [
                "Up to 500 job applications per month",
                "Advanced job search with AI matching",
                "Priority customer support",
                "Resume review and optimization tips",
                "Application deadline reminders",
                "Interview preparation resources",
                "Direct messaging with employers",
                "Application analytics and insights"
            ],
            maxApplications: 500,
            isPopular: true,
        },
        {
            id: 'premium',
            name: 'Premium',
            type: 'PREMIUM',
            description: 'Complete solution for career advancement',
            price: 14.99,
            currency: 'USD',
            features: [
                "Unlimited job applications",
                "AI-powered job matching",
                "24/7 premium support",
                "Professional resume writing service",
                "LinkedIn profile optimization",
                "Mock interview sessions",
                "Career coaching sessions",
                "Exclusive access to premium jobs",
                "Salary negotiation assistance",
                "Company insights and reviews"
            ],
            maxApplications: -1,
            isPopular: false,
        },
    ]

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        try {
            const response = await fetch('/api/subscriptions/plans')
            if (response.ok) {
                const data = await response.json()
                if (data.plans.length > 0) {
                    console.log('Fetched plans from API:', data.plans)
                    setPlans(data.plans)
                } else {
                    setPlans(pricing)
                }
            } else {
                // Fallback to hardcoded plans if API fails
                setPlans(pricing)
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error)
            toast.error('Failed to load pricing plans')
        } finally {
            setLoading(false)
        }
    }

    const handleSubscribe = async (planId: string) => {
        setSubscribing(planId)
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
                toast.success(`Successfully subscribed to ${data.subscription.plan.name}!`)
                router.push('/user-dashboard')
            } else if (response.status === 401) {
                toast.error('Please sign in to subscribe')
                router.push('/signin')
            } else {
                const error = await response.json()
                toast.error(error.message || 'Failed to subscribe')
            }
        } catch (error) {
            console.error('Subscription error:', error)
            toast.error('Failed to process subscription')
        } finally {
            setSubscribing(null)
        }
    }

    const getPlanIcon = (type: string) => {
        switch (type) {
            case 'BASIC':
                return <Star className="h-6 w-6 text-emerald-500" />
            case 'PROFESSIONAL':
                return <Zap className="h-6 w-6 text-emerald-600" />
            case 'PREMIUM':
                return <Crown className="h-6 w-6 text-emerald-700" />
            default:
                return <Star className="h-6 w-6 text-gray-500" />
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <>
            <NavbarComponent />
            <div className="min-h-screen bg-gradient-to-br from-emerald-50/10 to-emerald-100/20 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Choose Your Career Acceleration Plan
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Unlock your potential with our professional job search platform.
                            Get access to exclusive opportunities, expert guidance, and tools to land your dream job.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${plan.isPopular
                                    ? 'ring-2 ring-emerald-500 shadow-lg scale-105'
                                    : 'hover:scale-102'
                                    }`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                                        Most Popular
                                    </div>
                                )}

                                <CardHeader className="text-center pb-4">
                                    <div className="flex justify-center mb-4">
                                        {getPlanIcon(plan.type)}
                                    </div>
                                    <CardTitle className="text-2xl font-bold text-gray-900">
                                        {plan.name}
                                    </CardTitle>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold text-gray-900">
                                            ${plan.price}
                                        </span>
                                        <span className="text-gray-600">/month</span>
                                    </div>
                                    <p className="text-gray-600 mt-2">{plan.description}</p>
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => handleSubscribe(plan.id)}
                                        disabled={subscribing === plan.id}
                                        className={`w-full ${plan.isPopular
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-emerald-500 hover:bg-emerald-600'
                                            }`}
                                        size="lg"
                                    >
                                        {subscribing === plan.id ? 'Subscribing...' : `Subscribe to ${plan.name}`}
                                    </Button>

                                    {plan.maxApplications > 0 && (
                                        <p className="text-center text-sm text-gray-500 mt-3">
                                            {plan.maxApplications} applications per month
                                        </p>
                                    )}
                                    {plan.maxApplications === -1 && (
                                        <p className="text-center text-sm text-gray-500 mt-3">
                                            Unlimited applications
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-16 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                            Frequently Asked Questions
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Can I change my plan anytime?
                                </h3>
                                <p className="text-gray-600">
                                    Yes, you can upgrade or downgrade your plan at any time.
                                    Changes take effect at the start of your next billing cycle.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    What happens to my applications when I downgrade?
                                </h3>
                                <p className="text-gray-600">
                                    Your existing applications remain active, but you&apos;ll be limited
                                    to the new plan&apos;s application quota for future applications.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Do you offer refunds?
                                </h3>
                                <p className="text-gray-600">
                                    We offer a 30-day money-back guarantee. If you&apos;re not satisfied,
                                    contact our support team for a full refund.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Is my data secure?
                                </h3>
                                <p className="text-gray-600">
                                    Absolutely. We use industry-standard encryption and security
                                    measures to protect your personal and application data.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="mt-16 text-center bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Ready to Accelerate Your Career?
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Join thousands of professionals who have found their dream jobs
                            with our platform. Start your journey today!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => router.push('/signup')}
                                size="lg"
                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                            >
                                Get Started Free
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.push('/jobs')}
                            >
                                Browse Jobs First
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}