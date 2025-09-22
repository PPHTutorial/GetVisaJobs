// app/api/scraper/start/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { writeFileSync } from 'fs'
import path from 'path'

let scraperProcess: any = null

export async function POST(request: NextRequest) {
  try {
    if (scraperProcess) {
      return NextResponse.json({ error: 'Scraper already running' }, { status: 400 })
    }

    const config = await request.json()

    // Save config to temp file
    const configPath = path.join(process.cwd(), 'temp-scraper-config.json')
    writeFileSync(configPath, JSON.stringify(config))

    // Start scraper process
    const scriptPath = path.join(process.cwd(), 'lib', 'scraper', 'linkedin-scraper.ts')
    scraperProcess = spawn('node', [scriptPath], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        SCRAPER_CONFIG: configPath,
        LINKEDIN_EMAIL: config.linkedinEmail,
        LINKEDIN_PASSWORD: config.linkedinPassword
      }
    })

    scraperProcess.on('exit', () => {
      scraperProcess = null
    })

    return NextResponse.json({ message: 'Scraper started' })
  } catch (error) {
    console.error('Error starting scraper:', error)
    return NextResponse.json({ error: 'Failed to start scraper' }, { status: 500 })
  }
}