// app/api/scraper/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // In a real implementation, you'd read progress from a shared store or file
    // For now, return mock progress
    const progress = {
      jobs: Math.floor(Math.random() * 100),
      events: Math.floor(Math.random() * 100),
      people: Math.floor(Math.random() * 100),
      articles: Math.floor(Math.random() * 100),
      completed: Math.random() > 0.8
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error getting progress:', error)
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 })
  }
}