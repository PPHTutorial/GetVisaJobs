'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, Column, Action } from '@/components/ui/data-table'
import { Shield, User, Calendar, Activity, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminActionItem {
  id: string
  adminId: string
  action: string
  details?: string
  targetType?: string
  targetId?: string
  createdAt: string
  admin: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export default function AdminActionsPage() {
  const [adminActions, setAdminActions] = useState<AdminActionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchAdminActions = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/dashboard/admin-actions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAdminActions(data.adminActions)
      }
    } catch (_error) {
      toast.error('Failed to fetch admin actions')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchAdminActions()
  }, [fetchAdminActions])

  const getActionIcon = (action: string) => {
    if (action.includes('delete') || action.includes('remove')) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (action.includes('create') || action.includes('add')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (action.includes('update') || action.includes('edit')) {
      return <Activity className="h-4 w-4 text-blue-500" />
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }

  const columns: Column<AdminActionItem>[] = [
    {
      key: 'action',
      header: 'Action',
      render: (adminAction) => (
        <div className="flex items-center space-x-3">
          {getActionIcon(adminAction.action)}
          <span className="font-medium capitalize">
            {adminAction.action.replace(/_/g, ' ')}
          </span>
        </div>
      ),
    },
    {
      key: 'admin',
      header: 'Admin',
      render: (adminAction) => (
        <div className="flex items-center space-x-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">
              {adminAction.admin.firstName} {adminAction.admin.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {adminAction.admin.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (adminAction) => (
        <div className="max-w-xs">
          <div className="text-sm">
            {adminAction.details || 'No details available'}
          </div>
          {adminAction.targetType && adminAction.targetId && (
            <div className="text-xs text-muted-foreground mt-1">
              Target: {adminAction.targetType} ({adminAction.targetId})
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (adminAction) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date(adminAction.createdAt).toLocaleString()}
          </span>
        </div>
      ),
    },
  ]

  const actions: Action<AdminActionItem>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (adminAction) => {
        toast(`Action details for ${adminAction.action}`)
        // TODO: Open action details modal
      },
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
          <h1 className="text-3xl font-bold">Admin Actions Audit</h1>
          <p className="text-muted-foreground">Monitor and review administrative activities</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className='bg-white border border-input'>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="success">Successful</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminActions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Create Actions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminActions.filter(action => action.action.includes('create') || action.action.includes('add')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delete Actions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminActions.filter(action => action.action.includes('delete') || action.action.includes('remove')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminActions.filter(action => {
                const actionDate = new Date(action.createdAt)
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                return actionDate >= weekAgo
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Action Log</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={adminActions}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search admin actions..."
          />
        </CardContent>
      </Card>
    </div>
  )
}