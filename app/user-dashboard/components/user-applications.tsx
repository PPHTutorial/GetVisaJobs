'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, ExternalLink } from 'lucide-react'

interface JobApplication {
  id: string
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEWED' | 'ACCEPTED' | 'REJECTED'
  appliedAt: string
  coverLetter?: string
  notes?: string
  job: {
    id: string
    title: string
    company: string
    location: string
    applicationUrl?: string
    applicationEmail?: string
  }
}

const statusConfig = {
  PENDING: { label: 'Pending', variant: 'secondary' as const, color: 'text-yellow-600' },
  REVIEWED: { label: 'Reviewed', variant: 'outline' as const, color: 'text-blue-600' },
  INTERVIEWED: { label: 'Interviewed', variant: 'outline' as const, color: 'text-purple-600' },
  ACCEPTED: { label: 'Accepted', variant: 'default' as const, color: 'text-green-600' },
  REJECTED: { label: 'Rejected', variant: 'destructive' as const, color: 'text-red-600' },
}

export function UserApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/user/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm">Start applying to jobs to see your applications here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => {
            const statusInfo = statusConfig[application.status]
            return (
              <TableRow key={application.id}>
                <TableCell className="font-medium">
                  {application.job.title}
                </TableCell>
                <TableCell>{application.job.company}</TableCell>
                <TableCell>{application.job.location}</TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant} className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {(application.job.applicationUrl || application.job.applicationEmail) && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={application.job.applicationUrl || `mailto:${application.job.applicationEmail}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Link
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}