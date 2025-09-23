'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Eye, ArrowLeft, Share2, Clock } from 'lucide-react'
import Image from 'next/image'
import NavbarComponent from '@/components/ui/navbar'
import Footer from '@/components/footer'

interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  authorId: string
  author: {
    firstName: string
    lastName: string
    email: string
  }
  imageUrl?: string
  tags: string[]
  isPublished: boolean
  publishedAt?: string
  viewCount: number
  categoryId?: string
  category?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function BlogDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const blogId = params.id as string

  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogDetails = async () => {
      if (!blogId) return

      setLoading(true)
      try {
        const response = await fetch(`/api/blogs/${blogId}`)
        if (response.ok) {
          const data = await response.json()
          setBlog(data.data)
        } else {
          setError('Blog post not found')
        }
      } catch (error) {
        console.error('Failed to fetch blog details:', error)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    fetchBlogDetails()
  }, [blogId])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: blog?.excerpt || blog?.content.substring(0, 150),
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAuthorName = (blog: Blog) => {
    return `${blog.author.firstName} ${blog.author.lastName}`
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return `${minutes} min read`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Getting Data</p>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-full">
        <NavbarComponent />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Article not found'}</p>
            <Button onClick={() => router.push('/resources')}>
              Back to Resources
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-full">
      <NavbarComponent />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-green-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              {blog.category && (
                <Badge variant="secondary" className="text-sm">
                  {blog.category.name}
                </Badge>
              )}
              {blog.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>{getAuthorName(blog)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{getReadingTime(blog.content)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                <span>{blog.viewCount} views</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Image */}
              {blog.imageUrl && (
                <div className="mb-8">
                  <Image
                    src={blog.imageUrl}
                    alt={blog.title}
                    width={800}
                    height={400}
                    className="w-full h-auto rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Article Content */}
              <Card>
                <CardContent className="p-4">
                  <div className="prose prose-lg max-w-none">
                    {blog.excerpt && (
                      <p className="text-base text-gray-600 mb-6">
                        {blog.excerpt}
                      </p>
                    )}
                    <div
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: blog.content.replace(/\n/g, '<br />')
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Share Section */}
              <Card className="mt-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Share this article</h3>
                      <p className="text-gray-600 text-sm">
                        Help others discover this valuable resource
                      </p>
                    </div>
                    <Button onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Info */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{getAuthorName(blog)}</p>
                      <p className="text-sm text-gray-600">{blog.author.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {blog.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Article Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Article Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Views: </span>
                    <span className="font-semibold">{blog.viewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Published: </span>
                    <span className="font-semibold text-sm text-right">
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reading Time: </span>
                    <span className="font-semibold text-sm">
                      {getReadingTime(blog.content)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}