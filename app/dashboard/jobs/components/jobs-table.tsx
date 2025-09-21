'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable, Column, Action } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Trash2, Star } from 'lucide-react'
import { format } from 'date-fns'

interface Job {
  id: string
  title: string
  company: string
  location: string
  country?: string
  state?: string
  city?: string
  jobType: string
  employmentType: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  salaryType: string
  salaryMode: string
  isActive: boolean
  isFeatured: boolean
  applicationCount: number
  viewCount: number
  createdAt: string
  employer?: {
    companyName: string
  }
  category?: {
    name: string
  }
}

export function JobsTable() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/dashboard/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (job: Job) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const response = await fetch(`/api/dashboard/jobs/${job.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setJobs(jobs.filter(j => j.id !== job.id))
      } else {
        alert('Failed to delete job')
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
      alert('Failed to delete job')
    }
  }

  const formatSalary = (min?: number, max?: number, currency: string = 'GBP', type: string = 'Yearly', mode: string = 'RANGE') => {
    if (mode === 'COMPETITIVE') {
      return 'Competitive'
    }

    if (mode === 'FIXED' && min) {
      const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
        }).format(num)
      }
      return `${formatNumber(min)} ${type}`
    }

    if (mode === 'RANGE') {
      if (!min && !max) return 'Not specified'

      const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
        }).format(num)
      }

      if (min && max) {
        return `${formatNumber(min)} - ${formatNumber(max)} ${type}`
      } else if (min) {
        return `From ${formatNumber(min)} ${type}`
      } else if (max) {
        return `Up to ${formatNumber(max)} ${type}`
      }
    }

    return 'Not specified'
  }

  const columns: Column<Job>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (value, job) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{value}</span>
          {job.isFeatured && (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          )}
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
    },
    {
      key: 'location',
      header: 'Location',
      sortable: true,
      render: (value, job) => {
        const parts = [job.city, job.state, job.country].filter(Boolean)
        return parts.length > 0 ? parts.join(', ') : value
      },
    },
    {
      key: 'jobType',
      header: 'Type',
      sortable: true,
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: 'salaryMin',
      header: 'Salary',
      sortable: true,
      render: (_, job) => formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryType, job.salaryMode),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'applicationCount',
      header: 'Applications',
      sortable: true,
      
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (value) => format(new Date(value), 'MMM dd, yyyy'),
    },
  ]

  const actions: Action<Job>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (job) => router.push(`/dashboard/jobs/${job.id}`),
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (job) => router.push(`/dashboard/jobs/${job.id}/edit`),
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: handleDelete,
      variant: 'destructive',
    },
  ]

  return (
    <DataTable
      data={jobs}
      columns={columns}
      actions={actions}
      loading={loading}
      searchPlaceholder="Search jobs..."
      emptyMessage="No jobs found"
      pageSize={10}
      defaultSort={{ key: 'createdAt', direction: 'desc' }}
    />
  )
}