// app/api/scraper/start/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { LinkedInScraperManager, createConfig, ScraperConfig } from '../../../../lib/scraper/linkedin-scraper'
import { scraperManager } from '../../../../lib/scraper/scraper-manager'

export async function POST(request: NextRequest) {
  try {
    if (scraperManager.isActive()) {
      return NextResponse.json({ error: 'Scraper is already running' }, { status: 400 })
    }

    const configData = await request.json()
    console.log('Configuration Data:', configData)

    // Validate required fields
    if (!configData.linkedinEmail || !configData.linkedinPassword) {
      return NextResponse.json({ error: 'LinkedIn email and password are required' }, { status: 400 })
    }

    // Create scraper configuration
    const scraperConfig: ScraperConfig = createConfig({
      linkedinEmail: configData.linkedinEmail,
      linkedinPassword: configData.linkedinPassword,
      locations: configData.locations || ['United States', 'United Kingdom'],
      scrapeTypes: configData.scrapeTypes || ['jobs', 'events', 'people', 'articles'],
      maxPages: configData.maxPages || 10,
      delayBetweenRequests: configData.delayBetweenRequests || 2000,
      headless: configData.headless !== undefined ? configData.headless : true,
      keywords: configData.keywords || {},
      datePostedFilter: configData.datePostedFilter || 'any',
      maxRetries: configData.maxRetries || 3,
      antiDetectionEnabled: configData.antiDetectionEnabled !== undefined ? configData.antiDetectionEnabled : true,
      sessionPersistence: configData.sessionPersistence !== undefined ? configData.sessionPersistence : true,
    })

    console.log('Starting scraper with config:', scraperConfig)

    // Create and start scraper
    const scraperInstance = new LinkedInScraperManager(scraperConfig)
    scraperManager.setScraper(scraperInstance)

    // Start scraping in background (don't await to avoid blocking the response)
    scraperInstance.start()
      .then(() => {
        console.log('Scraping completed successfully')
        scraperManager.setScraper(null)
      })
      .catch((error: any) => {
        console.error('Scraping failed:', error)
        scraperManager.setScraper(null)
      })

    return NextResponse.json({
      message: 'Scraper started successfully',
      config: {
        locations: scraperConfig.locations,
        scrapeTypes: scraperConfig.scrapeTypes,
        maxPages: scraperConfig.maxPages,
        headless: scraperConfig.headless
      }
    })
  } catch (error) {
    console.error('Error starting scraper:', error)
    scraperManager.setScraper(null)
    return NextResponse.json({ error: 'Failed to start scraper' }, { status: 500 })
  }
}

export async function GET() {
  const progress = scraperManager.getProgress();
  const verificationStatus = scraperManager.getVerificationStatus();

  return NextResponse.json({
    isRunning: scraperManager.isActive(),
    scraperActive: scraperManager.isActive(),
    verificationRequired: verificationStatus?.required || false,
    verificationUrl: verificationStatus?.url || null,
    verificationInstructions: verificationStatus?.instructions || null,
    progress: progress ? {
      jobs: progress.jobs,
      events: progress.events,
      people: progress.people,
      articles: progress.articles,
      companies: progress.companies,
      posts: progress.posts,
      completed: progress.completed,
      totalLocations: progress.totalLocations,
      completedLocations: progress.completedLocations,
      errors: progress.errors,
      currentLocation: progress.currentLocation,
      currentType: progress.currentType,
      currentActivity: progress.currentActivity,
      startTime: progress.startTime,
    } : null
  });
}

export async function DELETE() {
  try {
    if (!scraperManager.isActive()) {
      return NextResponse.json({ message: 'No scraper is currently running' })
    }

    await scraperManager.stop()

    return NextResponse.json({ message: 'Scraper stopped successfully' })
  } catch (error) {
    console.error('Error stopping scraper:', error)
    return NextResponse.json({ error: 'Failed to stop scraper' }, { status: 500 })
  }
}