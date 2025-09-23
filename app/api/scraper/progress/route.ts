// app/api/scraper/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { scraperManager } from '../../../../lib/scraper/scraper-manager'

export async function GET(_request: NextRequest) {
  try {
    const progress = scraperManager.getProgress();
    const verificationStatus = scraperManager.getVerificationStatus();

    if (!progress) {
      return NextResponse.json({
        isRunning: false,
        completed: false,
        jobs: 0,
        events: 0,
        people: 0,
        articles: 0,
        companies: 0,
        posts: 0,
        verificationRequired: false,
        verificationUrl: null,
        verificationInstructions: null
      })
    }

    return NextResponse.json({
      isRunning: !progress.completed && scraperManager.isActive(),
      completed: progress.completed,
      jobs: progress.jobs,
      events: progress.events,
      people: progress.people,
      articles: progress.articles,
      companies: progress.companies,
      posts: progress.posts,
      totalLocations: progress.totalLocations,
      completedLocations: progress.completedLocations,
      errors: progress.errors,
      currentLocation: progress.currentLocation,
      currentType: progress.currentType,
      currentActivity: progress.currentActivity,
      startTime: progress.startTime,
      verificationRequired: verificationStatus?.required || false,
      verificationUrl: verificationStatus?.url || null,
      verificationInstructions: verificationStatus?.instructions || null
    })
  } catch (error) {
    console.error('Error getting progress:', error)
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 })
  }
}