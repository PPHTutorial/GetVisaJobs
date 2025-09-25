import { NextRequest, NextResponse } from 'next/server'
import {getAuthUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required').optional(),
  originalName: z.string().min(1, 'Original name is required').optional(),
  isPublic: z.boolean().optional(),
})

// GET /api/dashboard/files/[id] - Get single file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.json(file)

  } catch (error) {
    console.error('Error fetching file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/dashboard/files/[id] - Update file
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = updateFileSchema.parse(body)

    // Check if file exists
    const existingFile = await prisma.file.findUnique({
      where: { id },
    })

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const file = await prisma.file.update({
      where: { id },
      data: validatedData,
      include: {
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
    })

    return NextResponse.json(file)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/files/[id] - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Check if file exists
    const file = await prisma.file.findUnique({
      where: { id },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from database
    await prisma.file.delete({
      where: { id },
    })

    // TODO: Delete actual file from storage (S3, local, etc.)

    return NextResponse.json({ message: 'File deleted successfully' })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}