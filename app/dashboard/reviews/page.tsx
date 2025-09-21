'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, Column, Action } from '@/components/ui/data-table'
import { Star, User, Briefcase, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReviewItem {
  id: string
  userId: string
  jobId?: string
  companyId?: string
  rating: number
  title: string
  content: string
  isVerified: boolean
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  job?: {
    id: string
    title: string
    company: string
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [verificationFilter, setVerificationFilter] = useState<string>('all')

  const fetchReviews = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (verificationFilter !== 'all') {
        params.append('verified', verificationFilter === 'verified' ? 'true' : 'false')
      }

      const response = await fetch(`/api/dashboard/reviews?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (_error) {
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }, [verificationFilter])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleVerificationUpdate = async (reviewId: string, isVerified: boolean) => {
    try {
      const response = await fetch(`/api/dashboard/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified }),
      })

      if (response.ok) {
        toast.success(`Review ${isVerified ? 'verified' : 'unverified'} successfully`)
        fetchReviews()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update review verification')
      }
    } catch (_error) {
      toast.error('Failed to update review verification')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    )
  }

  const columns: Column<ReviewItem>[] = [
    {
      key: 'user',
      header: 'Reviewer',
      render: (review) => (
        <div className="flex items-center space-x-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">
              {review.user.firstName} {review.user.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {review.user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'job',
      header: 'Job',
      render: (review) => (
        <div className="flex items-center space-x-3">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <div>
            {review.job ? (
              <>
                <div className="font-medium">{review.job.title}</div>
                <div className="text-sm text-muted-foreground">{review.job.company}</div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">General Review</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (review) => renderStars(review.rating),
    },
    {
      key: 'title',
      header: 'Review',
      render: (review) => (
        <div className="max-w-xs">
          <div className="font-medium text-sm">{review.title}</div>
          <div className="text-sm text-muted-foreground truncate">
            {review.content}
          </div>
        </div>
      ),
    },
    {
      key: 'isVerified',
      header: 'Status',
      render: (review) => (
        review.isVerified ? (
          <Badge className="bg-green-100 text-green-800">Verified</Badge>
        ) : (
          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
        )
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (review) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
  ]

  const actions: Action<ReviewItem>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (review) => {
        toast(`Review details for ${review.id}`)
        // TODO: Open review details modal
      },
    },
    {
      label: 'Verify',
      icon: CheckCircle,
      onClick: async (review) => {
        if (review.isVerified) return
        await handleVerificationUpdate(review.id, true)
      },
      disabled: (review) => review.isVerified,
    },
    {
      label: 'Unverify',
      icon: XCircle,
      onClick: async (review) => {
        if (!review.isVerified) return
        await handleVerificationUpdate(review.id, false)
      },
      disabled: (review) => !review.isVerified,
    },
  ]

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
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground">Manage and verify user reviews</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={verificationFilter} onValueChange={setVerificationFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by verification" />
            </SelectTrigger>
            <SelectContent className='bg-white border border-input'>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Reviews</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(review => review.isVerified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(review => !review.isVerified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.length > 0
                ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                : '0.0'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={reviews}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search reviews..."
          />
        </CardContent>
      </Card>
    </div>
  )
}