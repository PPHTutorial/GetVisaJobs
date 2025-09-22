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
import { generateSlug } from '@/lib/utils'
import { RichTextEditor } from '@/components/ui/rich-text-editor'

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
interface Category {
    id: string
    name: string
}

export default function BlogsPage() {
    const [user, setUser] = useState<{ id: string; firstName: string; lastName: string; email: string } | null>(null);
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
    const [categorySlugPreview, setCategorySlugPreview] = useState('')
    const [titleSlugPreview, setTitleSlugPreview] = useState('')
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        authorId: '',
        imageUrl: '',
        tags: [],
        isPublished: false,
        publishedAt: null,
        categoryId: '',
    })

    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        description: '',
        type: 'blog' as 'job' | 'event' | 'blog',
        isActive: true,
    })

    useEffect(() => {
        fetchBlogs()
        fetchCategories()
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
                    publishedAt: new Date(),
                    slug: formData.slug || generateSlug(formData.title),
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
                    tags: [],
                    imageUrl: '',
                    authorId: '',
                    publishedAt: null,
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
                    publishedAt: new Date(),
                    slug: formData.slug || generateSlug(formData.title),
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
                    tags: [],
                    imageUrl: '',
                    authorId: '',
                    publishedAt: null,
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
            const response = await fetch('/api/dashboard/categories?type=blog')
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
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Create New Blog Post</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateBlog} className="space-y-4">
                            <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-scroll p-4 -mx-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            placeholder='Blog Title'
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                        {titleSlugPreview && (
                                            <p className="text-sm text-muted-foreground">
                                                Slug: <code className="bg-gray-100 px-1 rounded">{titleSlugPreview}</code>
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Excerpt</Label>
                                        <Textarea
                                            placeholder="Short summary or excerpt of the blog post"
                                            rows={2}
                                            id="excerpt"
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
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
                                    <Label htmlFor="content">Blog Content</Label>
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(value) => setFormData({ ...formData, content: value })}
                                        placeholder="Write your blog content here..."
                                        maxLength={10000000}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isPublished"
                                            checked={formData.isPublished}
                                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                            className="rounded border-gray-300 accent-accent"
                                        />
                                        <Label htmlFor="isPublished">Published</Label>
                                    </div>

                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags</Label>
                                        <Input
                                            id="tags"
                                            placeholder='Tags: technology, web development, programming'
                                            value={formData.tags.join(', ')}
                                            onChange={(e) => setFormData({ ...formData, tags: (e.target.value.includes(',') ? e.target.value.split(',') : [e.target.value]) as any })}

                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="categoryId">Category</Label>
                                        <div className="flex gap-2">
                                            <Select onValueChange={(value) => setFormData({ ...formData, categoryId: value })} required>
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
                        <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-scroll p-4 -mx-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder='Blog Title'
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Excerpt</Label>
                                    <Textarea
                                        placeholder="Short summary or excerpt of the blog post"
                                        rows={2}
                                        id="excerpt"
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
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
                                <Label htmlFor="content">Blog Content</Label>
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(value) => setFormData({ ...formData, content: value })}
                                    placeholder="Write your blog content here..."
                                    maxLength={10000000}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isPublished"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                        className="rounded border-gray-300 accent-accent"
                                    />
                                    <Label htmlFor="isPublished">Published</Label>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags</Label>
                                    <Input
                                        id="tags"
                                        placeholder='Tags: technology, web development, programming'
                                        value={formData.tags.join(', ')}
                                        onChange={(e) => setFormData({ ...formData, tags: (e.target.value.includes(',') ? e.target.value.split(',') : [e.target.value]) as any })}

                                    />
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
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
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
        render: (_, blog) => (
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
        render: (_, blog) => (
            <div className="font-medium">
                {`${blog.author.firstName} ${blog.author.lastName}`}
            </div>
        ),
        sortable: false,
    },
    {
        key: 'category',
        header: 'Category',
        render: (_, blog) => (
            <div className="font-medium">
                {blog.category?.name || 'Uncategorized'}
            </div>
        ),
        sortable: false,
    },
    {
        key: 'viewCount',
        header: 'Views',
        render: (_, blog) => (
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
        render: (_, blog) => (
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
        render: (_, blog) => (
            <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Not published'}
            </div>
        ),
        sortable: true,
    },
]

