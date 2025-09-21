'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, Building, Bookmark, Share2, ArrowLeft } from 'lucide-react'
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

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return

      setLoading(true)
      try {
        const response = await fetch(`/api/dashboard/jobs/${jobId}`)
        if (response.ok) {
          const data = await response.json()
          setJob(data.job)
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

  const handleSave = () => {
    // TODO: Implement job saving logic
    alert('Save job feature coming soon!')
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
      <div className="min-h-screen">
        <NavbarComponent />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="text-gray-600">Loading job details...</div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen">
        <NavbarComponent />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/jobs')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <p className="text-orange-500 font-semibold text-lg mb-2">
                    {getCompanyDisplayName(job)}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
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
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSave}>
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
                  <p className="text-gray-700 leading-relaxed">
                    This is a placeholder for the job description. In a real application,
                    this would contain the full job description with requirements,
                    responsibilities, and company information.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    We&apos;re looking for a talented professional to join our team and help
                    us build amazing products. You&apos;ll work with cutting-edge technologies
                    and collaborate with a diverse team of experts.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Bachelor&apos;s degree in relevant field</li>
                  <li>3+ years of experience in the role</li>
                  <li>Strong technical skills</li>
                  <li>Excellent communication skills</li>
                  <li>Ability to work in a team environment</li>
                </ul>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Competitive salary and benefits package</li>
                  <li>Visa sponsorship available</li>
                  <li>Flexible working arrangements</li>
                  <li>Professional development opportunities</li>
                  <li>Great work-life balance</li>
                </ul>
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
                    {job.salaryMode} • {job.salaryCurrency}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Job Type:</span>
                    <Badge variant="secondary">{job.salaryType || 'Full-time'}</Badge>
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

                <Separator />

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
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">⚡</span>
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
                    We&apos;re a leading technology company focused on innovation
                    and creating amazing products for our customers worldwide.
                  </p>

                  <div className="pt-3 border-t">
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