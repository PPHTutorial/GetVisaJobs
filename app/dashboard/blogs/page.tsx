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
import { FileText, Eye, Plus, Edit2 as Edit, Trash2, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { DataTable } from '@/components/ui/data-table'
import { Column } from '@/components/ui/data-table'

interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  authorId: string
  imageUrl: string | null
  tags: string[]
  isPublished: boolean
  publishedAt: Date | null
  viewCount: number
  categoryId: string | null
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  category: {
    id: string
    name: string
  } | null
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    isPublished: false,
    categoryId: '',
    tags: '',
  })

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/dashboard/blogs')
      if (response.ok) {
        const data = await response.json()
        setBlogs(data.blogs)
      }
    } catch (_error) {
      toast.error('Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/dashboard/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        }),
      })

      if (response.ok) {
        toast.success('Blog created successfully')
        setIsCreateDialogOpen(false)
        setFormData({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          isPublished: false,
          categoryId: '',
          tags: '',
        })
        fetchBlogs()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create blog')
      }
    } catch (_error) {
      toast.error('Failed to create blog')
    }
  }

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBlog) return

    try {
      const response = await fetch(`/api/dashboard/blogs/${editingBlog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        }),
      })

      if (response.ok) {
        toast.success('Blog updated successfully')
        setEditingBlog(null)
        setFormData({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          isPublished: false,
          categoryId: '',
          tags: '',
        })
        fetchBlogs()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update blog')
      }
    } catch (_error) {
      toast.error('Failed to update blog')
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
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage blog posts for the platform</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBlog} className="space-y-4">
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
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-input'>
                      <SelectItem value="1">Career Advice</SelectItem>
                      <SelectItem value="2">Visa Information</SelectItem>
                      <SelectItem value="3">Company Culture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="published">Status</Label>
                  <Select value={formData.isPublished.toString()} onValueChange={(value) => setFormData({ ...formData, isPublished: value === 'true' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-input'>
                      <SelectItem value="false">Draft</SelectItem>
                      <SelectItem value="true">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Blog Post</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={blogs}
            columns={columns}
            searchPlaceholder="Search blog posts..."
            actions={getActions()}
          />
        </CardContent>
      </Card>

      {/* Edit Blog Dialog */}
      <Dialog open={!!editingBlog} onOpenChange={() => setEditingBlog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBlog} className="space-y-4">
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
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-excerpt">Excerpt</Label>
              <Textarea
                id="edit-excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className='bg-white border border-input'>
                    <SelectItem value="1">Career Advice</SelectItem>
                    <SelectItem value="2">Visa Information</SelectItem>
                    <SelectItem value="3">Company Culture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-published">Status</Label>
                <Select value={formData.isPublished.toString()} onValueChange={(value) => setFormData({ ...formData, isPublished: value === 'true' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-white border border-input'>
                    <SelectItem value="false">Draft</SelectItem>
                    <SelectItem value="true">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingBlog(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Blog Post</Button>
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
    onClick: (_blog: Blog) => {
      // TODO: Implement edit functionality
      toast('Edit functionality coming soon')
    },
    icon: Edit,
  },
  {
    label: 'Delete',
    onClick: (_blog: Blog) => {
      if (confirm('Are you sure you want to delete this blog post?')) {
        // TODO: Implement delete functionality
        toast('Delete functionality coming soon')
      }
    },
    icon: Trash2,
    variant: 'destructive' as const,
  },
]

const columns: Column<Blog>[] = [
  {
    key: 'title',
    header: 'Title',
    render: (blog) => (
      <div className="flex items-center">
        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
        <div>
          <div className="font-medium">{blog.title}</div>
          <div className="text-sm text-muted-foreground">{blog.slug}</div>
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'author',
    header: 'Author',
    render: (blog) => (
      <div className="font-medium">
        {`${blog.author.firstName} ${blog.author.lastName}`}
      </div>
    ),
    sortable: false,
  },
  {
    key: 'category',
    header: 'Category',
    render: (blog) => (
      <div className="font-medium">
        {blog.category?.name || 'Uncategorized'}
      </div>
    ),
    sortable: false,
  },
  {
    key: 'viewCount',
    header: 'Views',
    render: (blog) => (
      <div className="flex items-center">
        <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
        {blog.viewCount}
      </div>
    ),
    sortable: true,
  },
  {
    key: 'isPublished',
    header: 'Status',
    render: (blog) => (
      <Badge
        variant={blog.isPublished ? 'default' : 'secondary'}
      >
        {blog.isPublished ? 'Published' : 'Draft'}
      </Badge>
    ),
    sortable: true,
  },
  {
    key: 'publishedAt',
    header: 'Published Date',
    render: (blog) => (
      <div className="flex items-center">
        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
        {blog.publishedAt ? blog.publishedAt.toLocaleDateString() : 'Not published'}
      </div>
    ),
    sortable: true,
  },
]