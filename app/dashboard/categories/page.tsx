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
import { FolderOpen, Plus, Edit2 as Edit, Trash2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateSlug } from '@/lib/utils'
import { DataTable } from '@/components/ui/data-table'
import { Column } from '@/components/ui/data-table'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  type: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    jobs: number
    events: number
    blogs: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'job' as 'job' | 'event' | 'blog',
    isActive: true,
  })
  const [slugPreview, setSlugPreview] = useState('')

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/categories')
      if (response.ok) {
        const data = await response.json()
        console.log(data.categories)
        setCategories(data.categories)
      }
    } catch (_error) {
      toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Update slug preview when name changes
  useEffect(() => {
    if (formData.name) {
      setSlugPreview(generateSlug(formData.name))
    } else {
      setSlugPreview('')
    }
  }, [formData.name])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/dashboard/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Category created successfully')
        setIsCreateDialogOpen(false)
        setFormData({
          name: '',
          description: '',
          type: 'job',
          isActive: true,
        })
        setSlugPreview('')
        fetchCategories()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create category')
      }
    } catch (_error) {
      toast.error('Failed to create category')
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    try {
      const response = await fetch(`/api/dashboard/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Category updated successfully')
        setEditingCategory(null)
        setFormData({
          name: '',
          description: '',
          type: 'job',
          isActive: true,
        })
        setSlugPreview('')
        fetchCategories()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update category')
      }
    } catch (_error) {
      toast.error('Failed to update category')
    }
  }

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
          <h1 className="text-3xl font-bold">Categories Management</h1>
          <p className="text-muted-foreground">Organize content with categories for jobs, events, and blogs</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                {slugPreview && (
                  <p className="text-sm text-muted-foreground">
                    Slug: <code className="bg-gray-100 px-1 rounded">{slugPreview}</code>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
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
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded accent-accent"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Category</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter(cat => cat.type === 'job').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter(cat => cat.type === 'event').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter(cat => cat.type === 'blog').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={categories}
            columns={columns}
            searchPlaceholder="Search categories..."
            actions={getActions()}
          />
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              {slugPreview && (
                <p className="text-sm text-muted-foreground">
                  Slug: <code className="bg-gray-100 px-1 rounded">{slugPreview}</code>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
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
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded accent-accent"
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Category</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const getActions = () => [
  {
    label: 'Edit',
    onClick: (_category: Category) => {
      // TODO: Implement edit functionality
      toast('Edit functionality coming soon')
    },
    icon: Edit,
  },
  {
    label: 'Delete',
    onClick: (_category: Category) => {
      // TODO: Implement delete functionality
      toast('Delete functionality coming soon')
    },
    icon: Trash2,
    variant: 'destructive' as const,
  },
]

const columns: Column<Category>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (category, item) => (
      <div className="flex items-center">
        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-muted-foreground">{item.slug}</div>
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'type',
    header: 'Type',
    render: (category, item) => {
        console.log(item.type)
      const typeColors = {
        job: 'bg-blue-100 text-blue-800',
        event: 'bg-green-100 text-green-800',
        blog: 'bg-purple-100 text-purple-800',
      }
      return (
        <Badge className={typeColors[item.type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Badge>
      )
    },
    sortable: true,
  },
  {
    key: 'description',
    header: 'Description',
    render: (category, item) => (
      <div className="max-w-xs truncate">
        {item.description || 'No description'}
      </div>
    ),
    sortable: false,
  },
  {
    key: '_count',
    header: 'Usage',
    render: (category, item) => {
      const count = item.type === 'job' ? item._count.jobs :
                   item.type === 'event' ? item._count.events :
                   item._count.blogs
      return (
        <div className="flex items-center">
          <span className="font-medium">{count}</span>
          <span className="text-sm text-muted-foreground ml-1">
            {item.type === 'job' ? 'jobs' : item.type === 'event' ? 'events' : 'blogs'}
          </span>
        </div>
      )
    },
    sortable: false,
  },
  {
    key: 'isActive',
    header: 'Status',
    render: (category, item) => (
      <Badge className={item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
        {item.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
    sortable: true,
  },
]