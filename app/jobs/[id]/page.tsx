/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, Building, Share2, ArrowLeft, BriefcaseBusiness, Building2, Bookmark } from 'lucide-react'
import NavbarComponent from '@/components/ui/navbar'
import Footer from '@/components/footer'
import { formatSalary, getCompanyDisplayName, type Job } from '@/lib/homepage-data'

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return

      setLoading(true)
      try {
        const [jobResponse, savedJobsResponse] = await Promise.all([
          fetch(`/api/dashboard/jobs/${jobId}`),
          fetch('/api/user/saved-jobs')
        ])

        if (jobResponse.ok) {
          const jobData = await jobResponse.json()
          setJob(jobData.job)

          // Check if job is saved
          if (savedJobsResponse.ok) {
            const savedJobsData = await savedJobsResponse.json()
            setIsSaved(savedJobsData.savedJobs.some((savedJob: any) => savedJob.id === jobId))
          }
        } else {
          setError('Job not found')
        }
      } catch (error) {
        console.error('Failed to fetch job details:', error)
        setError('Failed to load job details')
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId])

  const handleApply = () => {
    // TODO: Implement job application logic
    alert('Application feature coming soon!')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = isSaved ? 'DELETE' : 'POST'
      const response = await fetch(`/api/user/saved-jobs`, {
        method,
        body: JSON.stringify({ jobId }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setIsSaved(!isSaved)
        alert(isSaved ? 'Job removed from saved jobs' : 'Job saved successfully')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save job')
      }
    } catch (error) {
      console.error('Error saving job:', error)
      alert('Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${getCompanyDisplayName(job!)}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Job link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Getting {jobId} Data</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen">
        <NavbarComponent />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error || 'Job not found'}</div>
            <Button onClick={() => router.push('/jobs')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Job Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between">
              <div className="flex flex-col lg:justify-between w-full mb-4 lg:mb-0">
                <div className="flex items-start space-x-4">
                  <div className="w-18 h-18 border border-input rounded-lg flex items-center justify-center">
                    {job.logo ? <img src={job.logo} className='rounded-lg' alt="" /> : <BriefcaseBusiness className="text-input w-8 h-8" />}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {job.title}
                    </h1>
                    <p className="text-orange-500 font-semibold text-lg mb-2">
                      {getCompanyDisplayName(job)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap lg:flex-row items-center gap-2 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {job.salaryType || 'Full-time'}
                  </div>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    {job.category?.name || 'Not specified'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSave}
                  className={`${saving ? 'opacity-50 pointer-events-none' : ''} ${isSaved ? 'bg-green-100 text-green-700 border-green-700 hover:bg-green-200' : ''}`}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <span className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description || 'No description provided.' }} />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.requirements || 'No requirements provided.' }} />
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.benefits || 'No benefits provided.' }} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Salary & Application */}
            <Card>
              <CardHeader>
                <CardTitle>Salary & Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {formatSalary(job)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {job.salaryMode} Salary • {job.salaryCurrency} per {job.salaryType}
                  </p>
                </div>

                <Separator className='border-input' />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Job Type:</span>
                    <Badge variant="secondary">{job.jobType || 'Full-time'}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span>{job.category?.name || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span>{job.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={job.isActive ? "default" : "secondary"}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                <Separator className='border-input' />

                <Button
                  onClick={handleApply}
                  className="w-full"
                  size="lg"
                >
                  Apply for this Job
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Application deadline: Rolling basis
                </p>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-18 h-18 border border-input rounded-lg flex items-center justify-center">
                      {job.logo ? <img src={job.logo} className='rounded-lg' alt="" /> : <Building2 className="text-input w-8 h-8" />}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {getCompanyDisplayName(job)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Technology Company
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">
                    <span className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job?.about || 'No about provided.' }} />
                  </p>

                  <div className="pt-3 border-t border-input">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Industry:</span>
                      <span>Technology</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Company Size:</span>
                      <span>100-500 employees</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Similar job listings will appear here based on your preferences.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}