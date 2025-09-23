'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Calendar, Users, Video, ArrowLeft, Share2, UserPlus } from 'lucide-react'
import NavbarComponent from '@/components/ui/navbar'
import Footer from '@/components/footer'

interface Event {
    id: string
    title: string
    description: string
    eventType: string
    startDate: string
    endDate?: string
    location?: string
    isVirtual: boolean
    virtualLink?: string
    capacity?: number
    registeredCount: number
    isActive: boolean
    isFeatured: boolean
    imageUrl?: string
    category?: {
        id: string
        name: string
    }
}

export default function EventDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const eventId = params.id as string

    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isRegistered, setIsRegistered] = useState(false)

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (!eventId) return

            setLoading(true)
            try {
                const response = await fetch(`/api/dashboard/events/${eventId}`)
                if (response.ok) {
                    const data = await response.json()
                    console.log('Fetched event data:', data.data)
                    setEvent(data)
                    // TODO: Check if user is registered for this event
                    setIsRegistered(false)
                } else {
                    setError('Event not found')
                }
            } catch (error) {
                console.error('Failed to fetch event details:', error)
                setError('Failed to load event details')
            } finally {
                setLoading(false)
            }
        }

        fetchEventDetails()
    }, [eventId])

    const handleRegister = () => {
        // TODO: Implement event registration logic
        alert('Registration feature coming soon!')
    }

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: event?.title,
                text: event?.description,
                url: window.location.href,
            })
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
        }
    }

    const formatEventDate = (startDate: string, endDate?: string) => {
        const start = new Date(startDate)
        const end = endDate ? new Date(endDate) : null

        if (end && start.toDateString() !== end.toDateString()) {
            return `${start.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })} - ${end.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`
        }
        return start.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatEventTime = (startDate: string, endDate?: string) => {
        const start = new Date(startDate)
        const end = endDate ? new Date(endDate) : null

        const startTime = start.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })

        if (end) {
            const endTime = end.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
            return `${startTime} - ${endTime}`
        }

        return startTime
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Getting Data</p>
                </div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen">
                <NavbarComponent />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
                        <Button onClick={() => router.push('/events')}>
                            Back to Events
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <NavbarComponent />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-secondary to-secondary py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/*  <Button
            variant="ghost"
            onClick={() => router.push('/events')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button> */}

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="bg-primary text-white rounded-lg p-4 text-center">
                                <div className="text-sm font-medium">
                                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                                </div>
                                <div className="text-3xl font-bold">
                                    {new Date(event.startDate).getDate()}
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
                                <div className="flex items-center justify-center gap-4 text-gray-600">
                                    <Badge variant="outline" className='border-input'>{event.eventType/* .replace('_', ' ') */}</Badge>
                                    {event.category && (
                                        <Badge variant="secondary">{event.category.name}</Badge>
                                    )}
                                    {event.isFeatured && (
                                        <Badge className="bg-blue-500 text-white">Featured</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Details */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About This Event</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                            {event.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Event Details Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Event Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="font-medium">Date & Time</p>
                                            <p className="text-sm text-gray-600">
                                                {formatEventDate(event.startDate, event.endDate)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {formatEventTime(event.startDate, event.endDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex items-start space-x-3">
                                        {event.isVirtual ? (
                                            <>
                                                <Video className="w-5 h-5 text-primary mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Virtual Event</p>
                                                    <p className="text-sm text-gray-600">Online via video conference</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Location</p>
                                                    <p className="text-sm text-gray-600">{event.location || 'Location TBA'}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {event.capacity && (
                                        <>
                                            <Separator />
                                            <div className="flex items-start space-x-3">
                                                <Users className="w-5 h-5 text-primary mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Capacity</p>
                                                    <p className="text-sm text-gray-600">
                                                        {event.registeredCount} / {event.capacity} registered
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Registration Card */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center space-y-4">
                                        {isRegistered ? (
                                            <div>
                                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <UserPlus className="w-8 h-8 text-green-600" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-green-600 mb-2">
                                                    You&apos;re Registered!
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    You&apos;ll receive updates about this event via email.
                                                </p>
                                                <Button variant="outline" onClick={handleShare}>
                                                    <Share2 className="w-4 h-4 mr-2" />
                                                    Share Event
                                                </Button>
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-2">
                                                    Register for this event
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Join this event and connect with other professionals.
                                                </p>
                                                <Button onClick={handleRegister} className="w-full">
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Register Now
                                                </Button>
                                                <Button variant="ghost" onClick={handleShare} className="w-full mt-2">
                                                    <Share2 className="w-4 h-4 mr-2" />
                                                    Share Event
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}