import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '../../../../lib/prisma'
import { z } from 'zod'

const blogSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    content: z.string().min(1, 'Content is required'),
    excerpt: z.string().optional(),
    authorId: z.string().min(1, 'Author is required'),
    imageUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
    isPublished: z.boolean().default(false),
    publishedAt: z.string().optional(),
    categoryId: z.string().optional(),
})

// GET /api/dashboard/blogs - List all blogs
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }



        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status')

        const skip = (page - 1) * limit

        const where: any = {}

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (status === 'published') {
            where.isPublished = true
        } else if (status === 'draft') {
            where.isPublished = false
        }

        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                where,
                include: {
                    author: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    },
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
                //skip,
                //take: limit,
            }),
            prisma.blog.count({ where })
        ])

        return NextResponse.json({
            blogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Error fetching blogs:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST /api/dashboard/blogs - Create a new blog
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }



        const body = await request.json()
        body.authorId = user.id
        const validatedData = blogSchema.parse(body)

        // Check if slug already exists
        const existingBlog = await prisma.blog.findUnique({
            where: { slug: validatedData.slug }
        })

        if (existingBlog) {
            return NextResponse.json(
                { error: 'Blog with this slug already exists' },
                { status: 400 }
            )
        }

        const blog = await prisma.blog.create({
            data: {
                title: validatedData.title,
                slug: validatedData.slug,
                content: validatedData.content,
                excerpt: validatedData.excerpt || null,
                authorId: validatedData.authorId || user.id,
                imageUrl: validatedData.imageUrl || null,
                tags: validatedData.tags,
                isPublished: validatedData.isPublished,
                publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : null,
                categoryId: validatedData.categoryId || null,

            },
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                category: true,
            }
        })

        return NextResponse.json(blog, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error creating blog:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}