'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, Column, Action } from '@/components/ui/data-table'
import { CreditCard, DollarSign, Calendar, User, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface PaymentItem {
  id: string
  userId: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  paymentMethod?: string
  transactionId?: string
  description?: string
  metadata?: any
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/dashboard/payments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (_error) {
      toast.error('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/dashboard/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Payment status updated successfully')
        fetchPayments()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update payment status')
      }
    } catch (_error) {
      toast.error('Failed to update payment status')
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'REFUNDED':
        return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const columns: Column<PaymentItem>[] = [
    {
      key: 'user',
      header: 'User',
      render: (payment) => (
        <div className="flex items-center space-x-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">
              {payment.user.firstName} {payment.user.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {payment.user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (payment) => (
        <div className="font-medium">
          {formatCurrency(payment.amount, payment.currency)}
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (payment) => (
        <div className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span>{payment.paymentMethod || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (payment) => getStatusBadge(payment.status),
    },
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (payment) => (
        <div className="font-mono text-sm">
          {payment.transactionId || 'N/A'}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (payment) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
  ]

  const actions: Action<PaymentItem>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (payment) => {
        toast(`Payment details for ${payment.id}`)
        // TODO: Open payment details modal
      },
    },
    {
      label: 'Refund',
      icon: XCircle,
      onClick: async (payment) => {
        if (payment.status !== 'COMPLETED') {
          toast.error('Only completed payments can be refunded')
          return
        }
        if (!confirm('Are you sure you want to refund this payment?')) return
        await handleStatusUpdate(payment.id, 'REFUNDED')
      },
      disabled: (payment) => payment.status !== 'COMPLETED',
      variant: 'destructive',
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
          <h1 className="text-3xl font-bold">Payments Management</h1>
          <p className="text-muted-foreground">Monitor and manage payment transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className='bg-white border border-input'>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="REFUNDED">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(payment => payment.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payments.filter(payment => payment.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                payments
                  .filter(payment => payment.status === 'COMPLETED')
                  .reduce((sum, payment) => sum + payment.amount, 0),
                'USD'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={payments}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search payments..."
          />
        </CardContent>
      </Card>
    </div>
  )
}