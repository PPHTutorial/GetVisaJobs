// app/api/scraper/stop/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { scraperManager } from '../../../../lib/scraper/scraper-manager'

export async function POST(_request: NextRequest) {
  try {
    if (!scraperManager.isActive()) {
      return NextResponse.json({ message: 'No scraper is currently running' })
    }

    await scraperManager.stop()
    return NextResponse.json({ message: 'Scraper stop requested' })
  } catch (error) {
    console.error('Error stopping scraper:', error)
    return NextResponse.json({ error: 'Failed to stop scraper' }, { status: 500 })
  }
}