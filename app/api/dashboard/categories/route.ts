import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['job', 'event', 'blog']),
  isActive: z.boolean().default(true),
})

// GET /api/dashboard/categories - List categories with optional type filter
export async function GET(request: NextRequest) {
  try {
     const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'job', 'blog', 'event', or null for all

    const where: any = { isActive: true }

    if (type) {
      where.type = type
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            jobs: true,
            blogs: true,
            events: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      type: category.type,
      isActive: category.isActive,
      _count: {
        jobs: category._count.jobs,
        blogs: category._count.blogs,
        events: category._count.events,
      },
      createdAt: category.createdAt.toISOString(),
    }))

    return NextResponse.json({
      categories: transformedCategories,
    })
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
     const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    // Generate slug from name
    const baseSlug = generateSlug(validatedData.name)
    let uniqueSlug = baseSlug
    let counter = 1

    // Ensure slug uniqueness
    while (await prisma.category.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`
      counter++
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: uniqueSlug,
        description: validatedData.description,
        type: validatedData.type,
        isActive: validatedData.isActive,
      },
      include: {
        _count: {
          select: {
            jobs: true,
            blogs: true,
            events: true,
          },
        },
      },
    })

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}