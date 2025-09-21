import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { generateSlug } from '@/lib/utils'

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  type: z.enum(['job', 'event', 'blog']).optional(),
  isActive: z.boolean().optional(),
})

// PATCH /api/dashboard/categories/[id] - Update a category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const updateData: any = { ...validatedData }

    // If name is being updated, regenerate slug
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const baseSlug = generateSlug(validatedData.name)
      let uniqueSlug = baseSlug
      let counter = 1

      // Ensure slug uniqueness (excluding current category)
      while (await prisma.category.findFirst({
        where: {
          slug: uniqueSlug,
          id: { not: id }
        }
      })) {
        uniqueSlug = `${baseSlug}-${counter}`
        counter++
      }

      updateData.slug = uniqueSlug
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(category)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Check if category exists and get usage count
    const category = await prisma.category.findUnique({
      where: { id },
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

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category is being used
    const totalUsage = category._count.jobs + category._count.blogs + category._count.events
    if (totalUsage > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used by jobs, blogs, or events' },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Category deleted successfully' })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}