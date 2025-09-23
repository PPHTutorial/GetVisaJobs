// lib/scraper/scraper-manager.ts
import { LinkedInScraperManager } from './linkedin-scraper'

class ScraperManager {
  private static instance: ScraperManager
  private scraperInstance: LinkedInScraperManager | null = null

  private constructor() {}

  static getInstance(): ScraperManager {
    if (!ScraperManager.instance) {
      ScraperManager.instance = new ScraperManager()
    }
    return ScraperManager.instance
  }

  setScraper(scraper: LinkedInScraperManager | null) {
    this.scraperInstance = scraper
  }

  getScraper(): LinkedInScraperManager | null {
    return this.scraperInstance
  }

  getProgress() {
    return this.scraperInstance ? this.scraperInstance.getProgress() : null
  }

  getStatus() {
    return this.scraperInstance ? this.scraperInstance.getStatus() : null
  }

  getVerificationStatus() {
    return this.scraperInstance ? this.scraperInstance.getVerificationStatus() : { required: false, url: '' }
  }

  isActive(): boolean {
    return this.scraperInstance !== null
  }

  async stop() {
    if (this.scraperInstance) {
      await this.scraperInstance.stop()
      this.scraperInstance = null
    }
  }
}

export const scraperManager = ScraperManager.getInstance()