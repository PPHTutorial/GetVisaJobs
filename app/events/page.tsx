'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Users, Search, Clock, Video, Star } from 'lucide-react'
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

interface Category {
  id: string
  name: string
  slug: string
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedEventType, setSelectedEventType] = useState('')
  const [_selectedLocation, _setSelectedLocation] = useState('')
  const [isVirtual, setIsVirtual] = useState('')
  const [sortBy, setSortBy] = useState('startDate')

  const eventTypes = [
    'WEBINAR', 'WORKSHOP', 'SEMINAR', 'NETWORKING',
    'JOB_HUNTING', 'JOB_FAIR', 'CONFERENCE', 'MEETUP'
  ]

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        search: searchTerm,
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedEventType && { eventType: selectedEventType }),
        ...(isVirtual && { isVirtual: isVirtual }),
        sortBy,
        sortOrder: sortBy === 'startDate' ? 'asc' : 'desc'
      })

      const response = await fetch(`/api/dashboard/events?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
        setTotalPages(Math.ceil(data.pagination.total / data.pagination.limit))
      } else {
        setError('Failed to fetch events')
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, selectedCategory, selectedEventType, isVirtual, sortBy])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/dashboard/categories?type=event')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  

  useEffect(() => {
    fetchEvents()
    fetchCategories()
  }, [fetchEvents])

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchEvents()
  }

  const formatEventDate = (startDate: string, endDate?: string) => {
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : null

    if (end && start.toDateString() !== end.toDateString()) {
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
    }
    return start.toLocaleDateString()
  }

  const formatEventTime = (startDate: string) => {
    const start = new Date(startDate)
    return start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Getting Data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <NavbarComponent />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load events</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <NavbarComponent />

      {/* Header */}
      <section className="bg-gradient-to-br from-accent to-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Events</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover webinars, workshops, and networking events to advance your career
            </p>

            <div className="mt-8 flex justify-center space-x-4">
              <div className="relative min-w-96">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 " />
                <Input
                  placeholder="Event title or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="px-8">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b border-input hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-input p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Search Events</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Event title or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {/* <SelectItem value="">All categories</SelectItem> */}
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {/* <SelectItem value="">All types</SelectItem> */}
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Virtual/In-Person */}
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <Select value={isVirtual} onValueChange={setIsVirtual}>
                  <SelectTrigger>
                    <SelectValue placeholder="All formats" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">

                    {/* <SelectItem value="">All formats</SelectItem> */}
                    <SelectItem value="true">Virtual</SelectItem>
                    <SelectItem value="false">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="startDate">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="createdAt">Recently Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSearch} className="px-8">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {events.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {events.slice((currentPage - 1) * 12, currentPage * 12).map((event) => (
                  <Card
                    key={event.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEventClick(event.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-primary text-white rounded-lg p-3 text-center min-w-[80px]">
                          <div className="text-xs font-medium">
                            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                          </div>
                          <div className="text-2xl font-bold">
                            {new Date(event.startDate).getDate()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="text-base font-bold text-gray-900 line-clamp-2">
                              {event.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-input">
                              {event.eventType.replace('_', ' ')}
                            </Badge>
                            {event.category && (
                              <Badge variant="secondary" className="text-xs border-ring">
                                {event.category.name}
                              </Badge>
                            )}
                            {event.isFeatured && (
                              <Star className="text-yellow-500 size-4" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="relative grid space-y-2 my-6 text-sm text-gray-600">
                        <div className='space-y-2'>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatEventDate(event.startDate, event.endDate)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              {formatEventTime(event.startDate)}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {event.isVirtual ? (
                              <>
                                <Video className="w-4 h-4 mr-2" />
                                <span>Virtual Event</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{event.location || 'Location TBA'}</span>
                              </>
                            )}
                          </div>
                          <div>
                            {event.capacity && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2" />
                                <span>{event.registeredCount}/{event.capacity} registered</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="default" className="mt-4 self-start font-bold">
                          Attend Meeting
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}