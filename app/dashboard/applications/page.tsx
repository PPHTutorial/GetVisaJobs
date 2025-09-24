'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, User, Briefcase, Calendar, Eye, CheckCircle, Eye as ViewIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable } from '@/components/ui/data-table'
import { Column } from '@/components/ui/data-table'

interface Application {
  id: string
  userId: string
  jobId: string
  status: 'PENDING' | 'REVIEWED' | 'INTERVIEWED' | 'ACCEPTED' | 'REJECTED'
  coverLetter: string | null
  resumeUrl: string | null
  appliedAt: Date
  reviewedAt: Date | null
  notes: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  job: {
    id: string
    title: string
    company: string
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchApplications = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/dashboard/applications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      }
    } catch (_error) {
      toast.error('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Applications Management</h1>
          <p className="text-muted-foreground">Review and manage job applications</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWED">Reviewed</SelectItem>
              <SelectItem value="INTERVIEWED">Interviewed</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'REVIEWED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'ACCEPTED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={applications}
            columns={columns}
            searchPlaceholder="Search applications..."
            actions={getActions()}
          />
        </CardContent>
      </Card>
    </div>
  )
}

const getActions = () => [
  {
    label: 'View Details',
    onClick: (_application: Application) => {
      toast('Application details view coming soon')
    },
    icon: ViewIcon,
  },
]

const columns: Column<Application>[] = [
  {
    key: 'user',
    header: 'Applicant',
    render: (_, application) => (
      <div className="flex items-center">
        <User className="h-4 w-4 mr-2 text-muted-foreground" />
        <div>
          <div className="font-medium">{`${application.user.firstName} ${application.user.lastName}`}</div>
          <div className="text-sm text-muted-foreground">{application.user.email}</div>
        </div>
      </div>
    ),
    sortable: false,
  },
  {
    key: 'job',
    header: 'Job Position',
    render: (_, application) => (
      <div className="flex items-center">
        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
        <div>
          <div className="font-medium">{application.job.title}</div>
          <div className="text-sm text-muted-foreground">{application.job.company}</div>
        </div>
      </div>
    ),
    sortable: false,
  },
  {
    key: 'appliedAt',
    header: 'Applied Date',
    render: (_, application) => (
      <div className="flex items-center">
        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
        {new Date(application.appliedAt).toLocaleDateString()}
      </div>
    ),
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: (_, application) => (
      <Badge
        variant={
          application.status === 'ACCEPTED' ? 'default' :
          application.status === 'REJECTED' ? 'destructive' :
          application.status === 'REVIEWED' ? 'secondary' :
          'outline'
        }
      >
        {application.status}
      </Badge>
    ),
    sortable: true,
  },
]