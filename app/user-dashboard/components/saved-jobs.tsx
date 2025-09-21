'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Heart, MapPin, Building, Calendar, ExternalLink, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

interface SavedJob {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  type: string
  description: string
  requirements: string[]
  postedAt: string
  applicationDeadline?: string
  employer: {
    name: string
    logo?: string
  }
}

export function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSavedJobs()
  }, [])

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch('/api/user/saved-jobs')
      if (response.ok) {
        const data = await response.json()
        setSavedJobs(data.savedJobs)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to load saved jobs')
      }
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error)
      setError('Failed to load saved jobs')
    } finally {
      setLoading(false)
    }
  }

  const removeSavedJob = async (jobId: string) => {
    setRemoving(jobId)
    try {
      const response = await fetch(`/api/user/saved-jobs?jobId=${jobId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedJobs(savedJobs.filter(job => job.id !== jobId))
        toast.success('Job removed from saved jobs')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to remove job')
      }
    } catch (error) {
      console.error('Failed to remove saved job:', error)
      setError('Failed to remove job')
    } finally {
      setRemoving(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (savedJobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No saved jobs yet</p>
          <p className="text-sm">Jobs you save will appear here for easy access</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Saved Jobs</h2>
          <p className="text-muted-foreground">
            {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {savedJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {job.employer.logo ? (
                        <Image
                          src={job.employer.logo}
                          alt={job.employer.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {job.employer.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Posted {formatDate(job.postedAt)}
                    </div>

                    {job.salary && (
                      <Badge variant="secondary">
                        {job.salary}
                      </Badge>
                    )}

                    <Badge variant="outline">
                      {job.type}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {job.description}
                    </p>

                    {job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.slice(0, 3).map((requirement, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {requirement}
                          </Badge>
                        ))}
                        {job.requirements.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.requirements.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {job.applicationDeadline && (
                    <div className="text-sm text-orange-600 dark:text-orange-400">
                      Application deadline: {formatDate(job.applicationDeadline)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Job
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSavedJob(job.id)}
                    disabled={removing === job.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    {removing === job.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}