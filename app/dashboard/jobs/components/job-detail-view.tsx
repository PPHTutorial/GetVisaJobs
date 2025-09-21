'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { JobDescriptionRenderer, JobRequirementsRenderer } from '@/components/ui/html-renderer'
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  Bookmark,
  Share2,
  ExternalLink,
  Calendar,
  Users,
  GraduationCap
} from 'lucide-react'
import { format } from 'date-fns'

interface Job {
  id: string
  title: string
  description: string
  requirements?: string
  responsibilities?: string
  benefits?: string
  company: string
  location: string
  jobType: string
  employmentType: string
  experienceLevel?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  salaryType: string
  salaryMode: string
  degreeRequired?: string
  skillsRequired: string[]
  applicationUrl?: string
  applicationEmail?: string
  applicationDeadline?: string
  isActive: boolean
  isFeatured: boolean
  viewCount: number
  applicationCount: number
  createdAt: string
  employer?: {
    companyName: string
    user: {
      firstName: string
      lastName: string
    }
  }
  category?: {
    name: string
  }
  applications?: Array<{
    id: string
    status: string
  }>
}

interface JobDetailViewProps {
  job: Job
}

export function JobDetailView({ job }: JobDetailViewProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  const formatSalary = () => {
    if (job.salaryMode === 'COMPETITIVE') {
      return 'Competitive salary'
    }

    if (job.salaryMode === 'FIXED' && job.salaryMin) {
      const formattedAmount = `${job.salaryCurrency}${job.salaryMin.toLocaleString()}`
      return `${formattedAmount} per ${job.salaryType.toLowerCase()}`
    }

    if (job.salaryMode === 'RANGE') {
      if (!job.salaryMin && !job.salaryMax) return 'Salary not specified'

      const min = job.salaryMin ? `${job.salaryCurrency}${job.salaryMin.toLocaleString()}` : ''
      const max = job.salaryMax ? `${job.salaryCurrency}${job.salaryMax.toLocaleString()}` : ''
      const type = job.salaryType.toLowerCase()

      if (min && max) {
        return `${min} - ${max} per ${type}`
      } else if (min) {
        return `From ${min} per ${type}`
      } else if (max) {
        return `Up to ${max} per ${type}`
      }
    }

    return 'Salary not specified'
  }

  const handleApply = () => {
    if (job.applicationUrl) {
      window.open(job.applicationUrl, '_blank')
    } else if (job.applicationEmail) {
      window.location.href = `mailto:${job.applicationEmail}?subject=Application for ${job.title} position`
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.title} at ${job.company}`,
          text: `Check out this job opportunity: ${job.title} at ${job.company}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                {job.isFeatured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Featured
                  </Badge>
                )}
              </div>

              <div className="flex flex-col items-start lg:flex-row lg:items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-blue-100 text-blue-800" variant="outline">{job.jobType.replace('_', ' ')}</Badge>
                <Badge className="bg-blue-100 text-blue-800" variant="outline">{job.employmentType}</Badge>
                {job.experienceLevel && (
                  <Badge className="bg-blue-100 text-blue-800" variant="outline">{job.experienceLevel}yrs+</Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2 ">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <JobDescriptionRenderer html={job.description} />
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <JobRequirementsRenderer html={job.requirements} />
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <JobRequirementsRenderer html={job.responsibilities} />
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <JobRequirementsRenderer html={job.benefits} />
                </CardContent>
              </Card>
            )}

            {/* Skills Required */}
            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleApply}
                  disabled={!job.isActive}
                >
                  {job.applicationUrl || job.applicationEmail ? (
                    <>
                      Apply Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </Button>

                {!job.isActive && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    This job is no longer accepting applications
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{formatSalary()}</p>
                    <p className="text-sm text-gray-500">{job.salaryType}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{job.company}</p>
                    <p className="text-sm text-gray-500">Company</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{job.location}</p>
                    <p className="text-sm text-gray-500">Location</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{job.applicationCount} applicants</p>
                    <p className="text-sm text-gray-500">Applications</p>
                  </div>
                </div>

                {job.degreeRequired && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{job.degreeRequired}</p>
                        <p className="text-sm text-gray-500">Degree Required</p>
                      </div>
                    </div>
                  </>
                )}

                {job.applicationDeadline && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {format(new Date(job.applicationDeadline), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">Application Deadline</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            {job.employer && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.employer.companyName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Posted by {job.employer.user.firstName} {job.employer.user.lastName}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}