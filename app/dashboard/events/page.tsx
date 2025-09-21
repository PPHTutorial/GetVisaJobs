'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, Column, Action } from '@/components/ui/data-table'
import { MapPin, Users, Plus, Edit, Trash2, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateSlug } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string
  eventType: 'WEBINAR' | 'WORKSHOP' | 'SEMINAR' | 'NETWORKING'
  startDate: string
  endDate?: string
  location?: string
  isVirtual: boolean
  virtualLink?: string
  capacity?: number
  registeredCount: number
  isActive: boolean
  isFeatured: boolean
  imageUrl?: string
  categoryId?: string
  category?: {
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [categorySlugPreview, setCategorySlugPreview] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'WEBINAR' as 'WEBINAR' | 'WORKSHOP' | 'SEMINAR' | 'NETWORKING' | 'JOB_HUNTING' | 'JOB_FAIR' | 'CONFERENCE' | 'MEETUP',
    startDate: '',
    endDate: '',
    location: '',
    isVirtual: true,
    virtualLink: '',
    capacity: '',
    categoryId: '',
    imageUrl: '',
    isActive: true,
    isFeatured: false,
  })
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    type: 'event' as 'job' | 'event' | 'blog',
    isActive: true,
  })


  useEffect(() => {
    fetchEvents()
    fetchCategories()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/dashboard/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (_error) {
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/dashboard/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
        }),
      })

      if (response.ok) {
        toast.success('Event created successfully')
        setIsCreateDialogOpen(false)
        setFormData({
          title: '',
          description: '',
          eventType: 'WEBINAR',
          startDate: '',
          endDate: '',
          location: '',
          isVirtual: true,
          virtualLink: '',
          capacity: '',
          categoryId: '',
          imageUrl: '',
          isActive: true,
          isFeatured: false,
        })
        fetchEvents()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create event')
      }
    } catch (_error) {
      toast.error('Failed to create event')
    }
  }

  const handleCategoryNameChange = (name: string) => {
    setCategoryFormData({ ...categoryFormData, name })
    if (name) {
      setCategorySlugPreview(generateSlug(name))
    } else {
      setCategorySlugPreview('')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/dashboard/categories?type=event')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }


  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/dashboard/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData),
      })

      if (response.ok) {
        const newCategory = await response.json()
        setCategories([...categories, newCategory.category])
        await fetchCategories()
        setCategoryFormData({
          name: '',
          description: '',
          type: 'event',
          isActive: true,
        })
        setCategorySlugPreview('')
        setIsCategoryDialogOpen(false)
        toast.success('Category created successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create category')
      }
    } catch (_error) {
      toast.error('Failed to create category')
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEvent) return

    try {
      const response = await fetch(`/api/dashboard/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
        }),
      })

      if (response.ok) {
        toast.success('Event updated successfully')
        setEditingEvent(null)
        setFormData({
          title: '',
          description: '',
          eventType: 'WEBINAR',
          startDate: '',
          endDate: '',
          location: '',
          isVirtual: true,
          virtualLink: '',
          capacity: '',
          categoryId: '',
          imageUrl: '',
          isActive: true,
          isFeatured: false,
        })
        fetchEvents()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update event')
      }
    } catch (_error) {
      toast.error('Failed to update event')
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/dashboard/events/${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Event deleted successfully')
        fetchEvents()
      } else {
        toast.error('Failed to delete event')
      }
    } catch (_error) {
      toast.error('Failed to delete event')
    }
  }

  const openEditDialog = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      eventType: event.eventType,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event.location || '',
      isVirtual: event.isVirtual,
      virtualLink: event.virtualLink || '',
      capacity: event.capacity ? event.capacity.toString() : '',
      categoryId: event.categoryId || '',
      imageUrl: event.imageUrl || '',
      isActive: event.isActive,
      isFeatured: event.isFeatured,
    })
  }



  const columns: Column<Event>[] = [
    {
      key: 'title',
      header: 'Event',
      render: (_, event) => (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium">{event.title}</div>
            <div className="text-sm text-muted-foreground">
              {event.eventType} • {event.category?.name || 'No category'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (_, event) => (
        <div className="flex items-center text-sm">
          {event.isVirtual ? (
            <>
              <Globe className="h-3 w-3 mr-1" />
              Virtual Event
            </>
          ) : (
            <>
              <MapPin className="h-3 w-3 mr-1" />
              {event.location || 'TBD'}
            </>
          )}
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Date & Time',
      render: (_, event) => (
        <div className="text-sm">
          <div>{new Date(event.startDate).toLocaleDateString()}</div>
          <div className="text-muted-foreground">
            {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </div>
        </div>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (_, event) => (
        <div className="text-sm">
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {event.registeredCount}/{event.capacity || '∞'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, event) => (
        <div className="flex flex-col space-y-1">
          {event.isActive ? (
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
          )}
          {event.isFeatured && (
            <Badge className="bg-blue-100 text-blue-800">Featured</Badge>
          )}
        </div>
      ),
    },
  ]

  const actions: Action<Event>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (event) => openEditDialog(event),
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (event) => handleDeleteEvent(event.id),
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
          <h1 className="text-3xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">Manage job fairs, webinars, and networking events</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder='Image URL: https://example.com/banner.jpg'
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Virtual Link</Label>
                <Input
                  id="virtualLink"
                  placeholder='Virtual Link: https://example.com/virtual-event'
                  value={formData.virtualLink}
                  onChange={(e) => setFormData({ ...formData, virtualLink: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isVirtual"
                    checked={formData.isVirtual}
                    onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                    className="rounded border-gray-300 accent-accent"
                  />
                  <Label htmlFor="isVirtual">Fully Virtual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-gray-300 accent-accent"
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 accent-accent"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 lg:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-input'>
                      <SelectItem value="1">Job Fair</SelectItem>
                      <SelectItem value="2">Webinar</SelectItem>
                      <SelectItem value="3">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
                <div className="space-y-2 ">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select value={formData.eventType} onValueChange={(value) => setFormData({ ...formData, eventType: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Event Type" />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-input'>
                      <SelectItem value="JOB_FAIR">Job Fair</SelectItem>
                      <SelectItem value="WEBINAR">Webinar</SelectItem>
                      <SelectItem value="NETWORKING">Networking</SelectItem>
                      <SelectItem value="JOB_HUNTING">Job Hunting</SelectItem>
                      <SelectItem value="CONFERENCE">Conference</SelectItem>
                      <SelectItem value="MEETUP">Meetup</SelectItem>
                      <SelectItem value="SEMINAR">Seminar</SelectItem>
                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2 lg:col-span-1">
                  <Label htmlFor="categoryId">Category</Label>
                  <div className="flex gap-2">
                    <Select onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-input'>
                        {categories.map((category) => (
                          <SelectItem key={category?.id || Date.now().toLocaleString()} value={category?.id || Date.now().toLocaleString()}>
                            {category?.name || ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create New Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="categoryName">Name *</Label>
                            <Input
                              id="categoryName"
                              value={categoryFormData.name}
                              onChange={(e) => handleCategoryNameChange(e.target.value)}
                              required
                            />
                            {categorySlugPreview && (
                              <p className="text-sm text-muted-foreground">
                                Slug: <code className="bg-gray-100 px-1 rounded">{categorySlugPreview}</code>
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="categoryDescription">Description</Label>
                            <Textarea
                              id="categoryDescription"
                              value={categoryFormData.description}
                              onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="categoryType">Type *</Label>
                            <Select value={categoryFormData.type} onValueChange={(value) => setCategoryFormData({ ...categoryFormData, type: value as any })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className='bg-white border border-input'>
                                <SelectItem value="job">Jobs</SelectItem>
                                <SelectItem value="event">Events</SelectItem>
                                <SelectItem value="blog">Blogs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="categoryIsActive"
                              checked={categoryFormData.isActive}
                              onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                              className="rounded accent-accent"
                            />
                            <Label htmlFor="categoryIsActive">Active</Label>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Create Category</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Event</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={events}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search events..."
            emptyMessage="No events found"
          />
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEvent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date & Time</Label>
                <Input
                  id="edit-startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date & Time</Label>
                <Input
                  id="edit-endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className='bg-white border border-input'>
                    <SelectItem value="1">Job Fair</SelectItem>
                    <SelectItem value="2">Webinar</SelectItem>
                    <SelectItem value="3">Networking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingEvent(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Event</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}