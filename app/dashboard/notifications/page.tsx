'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, Column, Action } from '@/components/ui/data-table'
import { Bell, User, Calendar, Plus, Send, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface NotificationItem {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  data?: any
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    userId: '',
  })

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (_error) {
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/dashboard/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Notification sent successfully')
        setIsCreateDialogOpen(false)
        setFormData({
          title: '',
          message: '',
          type: 'info',
          userId: '',
        })
        fetchNotifications()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send notification')
      }
    } catch (_error) {
      toast.error('Failed to send notification')
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const columns: Column<NotificationItem>[] = [
    {
      key: 'user',
      header: 'Recipient',
      render: (notification) => (
        <div className="flex items-center space-x-3">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">
              {notification.user.firstName} {notification.user.lastName}
            </div>
            <div className="text-sm text-muted-foreground">
              {notification.user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (notification) => (
        <div className="max-w-xs">
          <div className="font-medium">{notification.title}</div>
          <div className="text-sm text-muted-foreground truncate">
            {notification.message}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (notification) => getTypeBadge(notification.type),
    },
    {
      key: 'isRead',
      header: 'Status',
      render: (notification) => (
        notification.isRead ? (
          <Badge className="bg-green-100 text-green-800">Read</Badge>
        ) : (
          <Badge className="bg-yellow-100 text-yellow-800">Unread</Badge>
        )
      ),
    },
    {
      key: 'createdAt',
      header: 'Sent Date',
      render: (notification) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
  ]

  const actions: Action<NotificationItem>[] = [
    {
      label: 'Mark as Read',
      icon: CheckCircle,
      onClick: async (notification) => {
        if (notification.isRead) return
        try {
          const response = await fetch(`/api/dashboard/notifications/${notification.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true }),
          })
          if (response.ok) {
            toast.success('Notification marked as read')
            fetchNotifications()
          } else {
            toast.error('Failed to update notification')
          }
        } catch (_error) {
          toast.error('Failed to update notification')
        }
      },
      disabled: (notification) => notification.isRead,
    },
    {
      label: 'Mark as Unread',
      icon: XCircle,
      onClick: async (notification) => {
        if (!notification.isRead) return
        try {
          const response = await fetch(`/api/dashboard/notifications/${notification.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: false }),
          })
          if (response.ok) {
            toast.success('Notification marked as unread')
            fetchNotifications()
          } else {
            toast.error('Failed to update notification')
          }
        } catch (_error) {
          toast.error('Failed to update notification')
        }
      },
      disabled: (notification) => !notification.isRead,
    },
    {
      label: 'Delete',
      icon: XCircle,
      onClick: async (notification) => {
        if (!confirm('Are you sure you want to delete this notification?')) return
        try {
          const response = await fetch(`/api/dashboard/notifications/${notification.id}`, {
            method: 'DELETE',
          })
          if (response.ok) {
            toast.success('Notification deleted')
            fetchNotifications()
          } else {
            toast.error('Failed to delete notification')
          }
        } catch (_error) {
          toast.error('Failed to delete notification')
        }
      },
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
          <h1 className="text-3xl font-bold">Notifications Management</h1>
          <p className="text-muted-foreground">Send and manage user notifications</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send New Notification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-input'>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user">Recipient</Label>
                  <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-input'>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="1">John Doe</SelectItem>
                      <SelectItem value="2">Jane Smith</SelectItem>
                      {/* TODO: Fetch actual users from API */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(notification => !notification.isRead).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notifications.filter(notification => notification.isRead).length}
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
              {notifications.filter(notification => {
                const notificationDate = new Date(notification.createdAt)
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                return notificationDate >= weekAgo
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={notifications}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search notifications..."
          />
        </CardContent>
      </Card>
    </div>
  )
}