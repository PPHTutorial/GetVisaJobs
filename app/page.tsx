/* eslint-disable @next/next/no-img-element */

'use client'

import { Button } from '../components/ui/button'
import Link from 'next/link'
import { Card, CardContent } from '../components/ui/card'
import { useEffect, useState } from 'react'
import { MapPin, Bookmark, GraduationCap, BriefcaseBusiness } from 'lucide-react'
import NavbarComponent from '@/components/ui/navbar'
import Footer from '@/components/footer'
import {
  Blog, formatSalary, getAllBlogs, getAllEvents, getAllJobs, getCompanyDisplayName, getFeaturedJobsLocally,
  getHighSalaryJobsLocally, getLatestBlogsLocally, getUpcomingEventsLocally, Job, Event
} from '@/lib/homepage-data'


export default function Home() {
  const [data, setData] = useState<{
    featuredJobs: Job[]
    highSalaryJobs: Job[]
    upcomingEvents: Event[]
    latestBlogs: Blog[]
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Typing animation state
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayText, setDisplayText] = useState('')


  // Typing animation effect
  useEffect(() => {
    const jobTypes = [
      'Dream Job!',
      'Visa Aided Job!',
      'Remote Job!',
      'Full-Time Job!',
      'Part-Time Job!',
      'Contract Job!',
      'Hybrid Job!',
      'Student Job!',
      'Internship!',
      'Graduate Role!',
      'Entry Level Job!',
      'Senior Position!',
      'Tech Job!',
      'Global Career Job!'
    ]
    const currentWord = jobTypes[currentWordIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseTime = 2000 // Pause before deleting

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentCharIndex < currentWord.length) {
          setDisplayText(currentWord.slice(0, currentCharIndex + 1))
          setCurrentCharIndex(prev => prev + 1)
        } else {
          // Word complete, pause then start deleting
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        // Deleting
        if (currentCharIndex > 0) {
          setDisplayText(currentWord.slice(0, currentCharIndex - 1))
          setCurrentCharIndex(prev => prev - 1)
        } else {
          // Word deleted, move to next word
          setIsDeleting(false)
          setCurrentWordIndex(prev => (prev + 1) % jobTypes.length)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [currentWordIndex, currentCharIndex, isDeleting])


  useEffect(() => {
    async function fetchHomepageData() {
      try {
        // Fetch all data concurrently
        const [jobsData, eventsData, blogsData] = await Promise.all([
          await getAllJobs(),
          await getAllEvents(),
          await getAllBlogs()
        ])

        // Apply local filtering and sorting
        const featuredJobs = getFeaturedJobsLocally(jobsData, 6)
        const highSalaryJobs = getHighSalaryJobsLocally(jobsData, 6)
        const upcomingEvents = getUpcomingEventsLocally(eventsData, 4)
        const latestBlogs = getLatestBlogsLocally(blogsData, 4)
        setData({ featuredJobs, highSalaryJobs, upcomingEvents, latestBlogs })
        console.log('Fetched all data:', jobsData, eventsData, blogsData)
        console.log('Fetched homepage data:', { featuredJobs, highSalaryJobs, upcomingEvents, latestBlogs })
        setLoading(false)

      } catch (error) {
        console.error('Error fetching homepage data:', error)
        setError('Failed to load homepage data')
        setLoading(false)
        setData(null)
      }
    }
    fetchHomepageData()
  }, [])

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load homepage data</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <NavbarComponent />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50/10 to-emerald-100/20 py-10 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center place-content-center">
            {/* Left Content */}
            <div className="flex flex-col items-center lg:items-start">
              <h1 className="text-3xl md:text-5xl lg:text-4xl text-gray-900 leading-tight font-extrabold">
                Just few clicks away
              </h1>
              <h1 className="text-primary font-extrabold text-5xl md:text-7xl">Securing Your</h1>
              <div className="min-h-[80px] flex items-center">
                <h1 className="text-primary font-extrabold text-5xl md:text-7xl border-r-4 border-primary">
                  {displayText}
                </h1>
              </div>

              <p className="text-base md:text-2xl lg:text-xl text-center lg:text-right text-gray-600 leading-snug lg:leading-relaxed">
                Apply for remote, student, graduate, experienced, internship,.. <br />
                Get hired with Visa sponsored and high paid jobs across the globe.
              </p>

              {/* Statistics */}
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-primary">1,500+</div>
                  <div className="text-gray-600">Employers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-primary">12,367+</div>
                  <div className="text-gray-600">Jobs with visas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-primary">301,161+</div>
                  <div className="text-gray-600">Applicants</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6">

                <Link href="/jobs" >
                  <Button className="bg-primary hover:bg-emerald-700 text-white px-8 py-3 text-lg">
                    Search Jobs
                  </Button>
                </Link>

                <Link href="/subscription" >
                  <Button variant="outline" className="border-primary text-primary hover:bg-emerald-50 px-8 py-3 text-lg">
                    Subscribe
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="hidden lg:flex justify-center relative">
              <img src="./hero.svg" alt="hero illustration" className="w-150 h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className='text-center text-gray-900 mb-6 font-extrabold text-4xl'>Trusted by companies worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {['google', 'microsoft', 'airbnb', 'uber', 'lyft', 'doordash'].map((company) => (
              <div key={company} className="flex items-center justify-center h-12">
                <img
                  src={`./partners/${company}.svg`}
                  alt={`${company} logo`}
                  className="h-8 object-contain grayscale opacity-60 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs - Student & Graduate */}
      <section className="py-16 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-2">FEATURED JOBS</p>
            <h2 className="text-4xl font-bold text-gray-900">Top student & graduate jobs</h2>
          </div>

          <div className="space-y-4">
            {data?.featuredJobs.slice(0, 2).map((job) => (
              <Card key={job.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-18 h-18 border border-input rounded-lg flex items-center justify-center">
                        {job.logo ? <img src={job.logo} className='rounded-lg' alt="" /> : <BriefcaseBusiness className="text-input w-8 h-8" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-extrabold text-gray-900">
                          {job.title}
                        </h3>
                        <p className="text-orange-500 font-semibold">{getCompanyDisplayName(job)}</p>
                        <div className="flex items-center space-x-4 text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <GraduationCap className="w-4 h-4 mr-1" />
                            Bachelor&apos;s
                          </div>
                          <div className="flex items-center">
                            <span>{formatSalary(job)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="w-6 h-6 text-neutral-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="border-primary text-primary hover:bg-emerald-50">
              Load More
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Jobs - Experienced */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-2">FEATURED JOBS</p>
            <h2 className="text-4xl font-bold text-gray-900">Top experienced hire jobs</h2>
          </div>

          <div className="flex flex-col gap-4">
            {data?.highSalaryJobs.slice(0, 4).map((job) => (
              <div key={job.id} className="space-y-4">
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-18 h-18 border border-input rounded-lg flex items-center justify-center">
                          {job.logo ? <img src={job.logo} className='rounded-lg' alt="" /> : <BriefcaseBusiness className="text-input w-8 h-8" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-extrabold text-gray-900">
                            {job.title}
                          </h3>
                          <p className="text-orange-500 font-semibold">{getCompanyDisplayName(job)}</p>
                          <div className="flex items-center space-x-4 text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <GraduationCap className="w-4 h-4 mr-1" />
                              Bachelor&apos;s
                            </div>
                            <div className="flex items-center">
                              <span>{formatSalary(job)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="w-6 h-6 text-neutral-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="border-primary text-primary hover:bg-emerald-50">
              Load More
            </Button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-2">FEATURED EVENTS</p>
            <h2 className="text-4xl font-bold text-gray-900">Upcoming events</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data?.upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
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
                      <h3 className="text-xl font-extrabold text-gray-900">
                        {event.title}
                      </h3>
                      <div className=" text-gray-600 mb-2">
                        <div className="flex items-center">
                          <span className="font-semibold">
                            {event.isVirtual ? 'Virtual Event' : (event.location || 'Location TBA')}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span>
                            {new Date(event.startDate).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} @ {new Date(event.startDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm mb-4">
                      {event.description?.substring(0, 150)}...
                    </p>
                    <Button className="bg-primary hover:bg-emerald-700 text-white">
                      Register Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="border-primary text-primary hover:bg-emerald-50">
              See All Events
            </Button>
          </div>
        </div>
      </section>

      {/* Resources/Articles Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-medium mb-2">RESOURCES</p>
            <h2 className="text-4xl font-bold text-gray-900">Latest articles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data?.latestBlogs.map((blog) => (
              <Card key={blog.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  {blog.imageUrl ? (
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-12 bg-red-600 rounded mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">UK VISA</span>
                      </div>
                      <div className="text-red-800 font-medium">ARTICLE</div>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {blog.excerpt?.substring(0, 120)}...
                  </p>
                  <Button variant="ghost" className="text-primary hover:text-emerald-700 p-0">
                    Read More →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" className="border-primary text-primary hover:bg-emerald-50">
              See All
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
