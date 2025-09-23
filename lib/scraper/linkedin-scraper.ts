// lib/scraper/linkedin-scraper.ts - Advanced LinkedIn Scraper with API-based approach
import axios from 'axios'
import * as cheerio from 'cheerio'
import prisma from '../prisma'
import { JobType, EventType, SalaryMode, ApplicationMethod } from '@prisma/client'

// Advanced Exported Types matching Prisma Schema
export interface ScraperConfig {
  linkedinEmail?: string; // Optional for API approach
  linkedinPassword?: string; // Optional for API approach
  locations: string[];
  scrapeTypes: ('jobs' | 'events' | 'people' | 'articles' | 'companies' | 'posts')[];
  maxPages: number;
  delayBetweenRequests: number;
  maxRetries: number;
  useProxy?: boolean;
  proxyList?: string[];
  headless?: boolean; // Not needed for API approach
  userAgent?: string;
  viewport?: { width: number; height: number }; // Not needed for API approach
  antiDetectionEnabled?: boolean; // Not needed for API approach
  sessionPersistence?: boolean; // Not needed for API approach
  // Configurable keywords for different content types
  keywords?: {
    jobs?: string;
    events?: string;
    people?: string;
    articles?: string;
    companies?: string;
    posts?: string;
  };
  // Date posted filtering for jobs
  datePostedFilter?: 'any' | 'past-24h' | 'past-week' | 'past-month' | 'past-3months' | 'past-6months' | 'past-year';
}

export interface JobData {
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  company: string;
  logo?: string;
  location: string;
  country?: string;
  state?: string;
  city?: string;
  jobType: JobType;
  employmentType: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryType: string;
  salaryMode: SalaryMode;
  degreeRequired?: string;
  skillsRequired: string[];
  applicationUrl?: string;
  applicationEmail?: string;
  applicationDeadline?: Date;
  applicationMethod: ApplicationMethod;
  isActive: boolean;
  isFeatured?: boolean;
  viewCount?: number;
  applicationCount?: number;
  employerId?: string;
  categoryId?: string;
  linkedinJobUrl: string;
}

export interface EventData {
  title: string;
  description: string;
  eventType: EventType;
  startDate: Date;
  endDate?: Date;
  location?: string;
  isVirtual: boolean;
  virtualLink?: string;
  capacity?: number;
  registeredCount?: number;
  isActive: boolean;
  isFeatured?: boolean;
  imageUrl?: string;
  categoryId?: string;
  linkedinEventUrl: string;
}

export interface PersonData {
  email?: string;
  firstName: string;
  otherNames?: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  linkedinUrl: string;
  currentLocation?: string;
  preferredLocation?: string;
  experienceYears?: number;
  degree?: string;
  university?: string;
  graduationYear?: number;
  skills: string[];
  isActive: boolean;
  experience?: PersonExperience[];
  education?: PersonEducation[];
}

export interface PersonExperience {
  title: string;
  company: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  isCurrent?: boolean;
}

export interface PersonEducation {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ArticleData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId?: string;
  imageUrl?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: Date;
  linkedinArticleUrl: string;
  readTime?: number;
  claps?: number;
  comments?: number;
  shares?: number;
  hashtags?: string[];
  mentions?: string[];
  categoryId?: string;
}

export interface CompanyData {
  companyName: string;
  companySize?: string;
  industry?: string;
  website?: string;
  description?: string;
  logo?: string;
  address?: string;
  linkedinUrl: string;
  followerCount?: number;
  employeeCount?: number;
  foundedYear?: number;
  specialties?: string[];
  companyType?: string;
  revenue?: string;
  verified: boolean;
}

export interface PostData {
  content: string;
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  publishedAt: Date;
  linkedinPostUrl: string;
  likes?: number;
  comments?: number;
  shares?: number;
  postType: 'text' | 'image' | 'video' | 'article' | 'poll';
  hashtags?: string[];
  mentions?: string[];
}

export interface ScraperProgress {
  jobs: number;
  events: number;
  people: number;
  articles: number;
  companies: number;
  posts: number;
  currentLocation?: string;
  currentType?: string;
  isRunning: boolean;
  completed: boolean;
  totalLocations: number;
  completedLocations: number;
  errors: number;
  retries: number;
  startTime: Date;
  estimatedTimeRemaining?: number;
  currentActivity?: string;
  lastError?: string;
}

export interface ScraperStatus {
  isRunning: boolean;
  progress: ScraperProgress;
  lastError?: string;
  currentActivity?: string;
  sessionInfo?: {
    loggedIn: boolean;
    lastActivity: Date;
    rateLimitHits: number;
  };
}

export interface ScrapingResult {
  success: boolean;
  data: any[];
  errors: string[];
  metadata: {
    scrapedAt: Date;
    duration: number;
    pagesProcessed: number;
    itemsFound: number;
  };
}

// Enhanced Configuration with defaults
const DEFAULT_CONFIG: Partial<ScraperConfig> = {
  maxPages: 100,
  delayBetweenRequests: 2000,
  maxRetries: 3,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locations: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'],
  scrapeTypes: ['jobs', 'events', 'people', 'articles'],
  datePostedFilter: 'any',
};

// const prisma = new PrismaClient();

// Advanced Utility Functions
export function createConfig(overrides: Partial<ScraperConfig>): ScraperConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
  } as ScraperConfig;
}

export function parseSalary(salaryText: string | undefined): { min?: number; max?: number; currency?: string; type?: string; mode?: SalaryMode } | null {
  if (!salaryText) return null;

  // Enhanced salary parsing with comprehensive currency and format detection
  const currencySymbols = ['$', '€', '£', '¥', '₹', '₽', '₩', '₦', '₵', '₺'];
  const currencyNames = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'RUB', 'KRW', 'NGN', 'GHS', 'TRY'];
  const salaryTypes = ['yearly', 'monthly', 'hourly', 'daily', 'weekly'];

  let currency = 'GBP'; // Default for UK jobs
  let type = 'Yearly';
  let mode: SalaryMode = 'RANGE';

  // Detect currency
  for (const symbol of currencySymbols) {
    if (salaryText.includes(symbol)) {
      currency = symbol === '$' ? 'USD' : symbol === '€' ? 'EUR' : symbol === '£' ? 'GBP' :
        symbol === '¥' ? 'JPY' : symbol === '₹' ? 'INR' : symbol === '₽' ? 'RUB' :
          symbol === '₩' ? 'KRW' : symbol === '₦' ? 'NGN' : symbol === '₵' ? 'GHS' : 'TRY';
      break;
    }
  }

  for (const name of currencyNames) {
    if (salaryText.toUpperCase().includes(name)) {
      currency = name;
      break;
    }
  }

  // Detect salary type
  for (const salaryType of salaryTypes) {
    if (salaryText.toLowerCase().includes(salaryType)) {
      type = salaryType.charAt(0).toUpperCase() + salaryType.slice(1);
      break;
    }
  }

  // Remove currency symbols and names for parsing
  let cleanText = salaryText.replace(/[$€£¥₹₽₩₦₵₺]/g, '').replace(/\b(USD|EUR|GBP|JPY|INR|RUB|KRW|NGN|GHS|TRY)\b/gi, '').trim();

  // Remove salary type words
  cleanText = cleanText.replace(/\b(yearly|monthly|hourly|daily|weekly|per year|per month|per hour|per day|per week)\b/gi, '').trim();

  // Handle different formats
  const patterns = [
    // Range formats: "50,000 - 70,000", "£30k-£40k", "$50K - $70K"
    /(\d+(?:[,.]\d+)*)\s*[-–—]\s*(\d+(?:[,.]\d+)*)/i,
    // Single values: "£50,000", "$60k", "70000"
    /(\d+(?:[,.]\d+)*)/,
    // Text ranges: "Competitive", "DOE" (Depends on Experience)
    /\b(competitive|doe|negotiable|market rate)\b/i
  ];

  for (const pattern of patterns) {
    const match = cleanText.match(pattern);
    if (match) {
      if (match[0].toLowerCase().includes('competitive') || match[0].toLowerCase().includes('doe')) {
        mode = 'COMPETITIVE';
        return { currency, type, mode };
      }

      const numbers = match.slice(1).filter(n => n).map(num => {
        // Handle K notation and European formatting
        let normalized = num.replace(/,/g, '').toLowerCase();
        if (normalized.includes('k')) {
          normalized = normalized.replace('k', '');
          return parseFloat(normalized) * 1000;
        }
        return parseFloat(normalized.replace(/\./g, ''));
      });

      if (numbers.length === 2) {
        mode = 'RANGE';
        return { min: Math.min(...numbers), max: Math.max(...numbers), currency, type, mode };
      } else if (numbers.length === 1) {
        mode = 'FIXED';
        return { min: numbers[0], max: numbers[0], currency, type, mode };
      }
    }
  }

  return null;
}

export function parseDate(dateText: string): Date {
  if (!dateText) return new Date();

  const now = new Date();
  const text = dateText.toLowerCase().trim();

  // Handle relative dates
  if (text.includes('hour') || text.includes('minute')) {
    return now;
  }

  if (text.includes('day')) {
    const days = parseInt(text.match(/\d+/)?.[0] || '1');
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  }

  if (text.includes('week')) {
    const weeks = parseInt(text.match(/\d+/)?.[0] || '1');
    const date = new Date(now);
    date.setDate(date.getDate() - (weeks * 7));
    return date;
  }

  if (text.includes('month')) {
    const months = parseInt(text.match(/\d+/)?.[0] || '1');
    const date = new Date(now);
    date.setMonth(date.getMonth() - months);
    return date;
  }

  // Try to parse as absolute date
  try {
    return new Date(dateText);
  } catch {
    return now;
  }
}

export function parseJobType(jobTitle: string, description: string): JobType {
  const text = (jobTitle + ' ' + description).toLowerCase();

  if (text.includes('student') || text.includes('entry level')) return 'STUDENT';
  if (text.includes('graduate') || text.includes('junior')) return 'GRADUATE';
  if (text.includes('experienced') || text.includes('senior') || text.includes('lead')) return 'EXPERIENCED';
  if (text.includes('intern')) return 'INTERNSHIP';
  if (text.includes('apprentice')) return 'APPRENTICESHIP';
  if (text.includes('contract') || text.includes('freelance')) return 'CONTRACT';
  if (text.includes('temporary') || text.includes('temp')) return 'TEMPORARY';
  if (text.includes('volunteer')) return 'VOLUNTEER';
  if (text.includes('part time') || text.includes('part-time')) return 'PART_TIME';
  if (text.includes('remote')) return 'REMOTE';
  if (text.includes('on site') || text.includes('on-site') || text.includes('office')) return 'ON_SITE';
  if (text.includes('hybrid')) return 'HYBRID';

  return 'FULL_TIME'; // Default
}

export function parseEventType(title: string, description: string): EventType {
  const text = (title + ' ' + description).toLowerCase();

  if (text.includes('webinar')) return 'WEBINAR';
  if (text.includes('workshop')) return 'WORKSHOP';
  if (text.includes('seminar')) return 'SEMINAR';
  if (text.includes('networking') || text.includes('meetup')) return 'NETWORKING';
  if (text.includes('conference')) return 'CONFERENCE';
  if (text.includes('job fair') || text.includes('career fair')) return 'JOB_FAIR';
  if (text.includes('job hunting') || text.includes('recruitment')) return 'JOB_HUNTING';

  return 'MEETUP'; // Default
}

export function extractSkills(text: string): string[] {
  if (!text) return [];

  // Comprehensive skills patterns
  const skillPatterns = [
    /\b(javascript|python|java|c\+\+|c#|php|ruby|go|rust|typescript|swift|kotlin|dart|scala|node|react|vue|angular)\b/gi,
    /\b(html|css|sass|scss|tailwind|bootstrap|material-ui|styled-components)\b/gi,
    /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch|cassandra|dynamodb)\b/gi,
    /\b(aws|azure|gcp|docker|kubernetes|jenkins|gitlab|github|terraform|ansible)\b/gi,
    /\b(machine learning|ai|data science|analytics|tensorflow|pytorch|scikit-learn|pandas|numpy)\b/gi,
    /\b(agile|scrum|kanban|devops|ci\/cd|microservices|rest|graphql|api)\b/gi, ,
    /\b(leadership|management|communication|problem solving|teamwork|creativity)\b/gi,
  ];

  const skills = new Set<string>();

  for (const pattern of skillPatterns) {
    if (pattern) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => skills.add(match.toLowerCase()));
      }
    }
  }

  return Array.from(skills);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractLocationDetails(locationText: string): { country?: string; state?: string; city?: string } {
  if (!locationText) return {};

  // Common location patterns
  const parts = locationText.split(',').map(p => p.trim());

  if (parts.length >= 3) {
    return {
      city: parts[0],
      state: parts[1],
      country: parts[2]
    };
  } else if (parts.length === 2) {
    return {
      city: parts[0],
      country: parts[1]
    };
  } else if (parts.length === 1) {
    return {
      country: parts[0]
    };
  }

  return {};
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
  const delayTime = Math.random() * (max - min) + min;
  return delay(delayTime);
}

export function parseCompanySize(employeeText: string): string {
  if (!employeeText) return '';

  const text = employeeText.toLowerCase();
  const employees = parseInt(text.replace(/\D/g, ''));

  if (employees <= 10) return '1-10';
  if (employees <= 50) return '11-50';
  if (employees <= 200) return '51-200';
  if (employees <= 500) return '201-500';
  if (employees <= 1000) return '501-1000';
  if (employees <= 5000) return '1001-5000';
  if (employees <= 10000) return '5001-10000';

  return '10000+';
}

// Advanced ScraperManager class - API-based approach
export class LinkedInScraperManager {
  private isRunning = false;
  private config: ScraperConfig;
  private progress: ScraperProgress;
  private scrapedPages = new Set<string>();
  private sessionInfo = {
    loggedIn: false,
    lastActivity: new Date(),
    rateLimitHits: 0,
  };

  constructor(config: ScraperConfig) {
    // Set default keywords if not provided
    this.config = {
      ...config,
      keywords: {
        jobs: config.keywords?.jobs || '',
        events: config.keywords?.events || '',
        people: config.keywords?.people || '',
        articles: config.keywords?.articles || '',
        companies: config.keywords?.companies || '',
        posts: config.keywords?.posts || '',
        ...config.keywords
      }
    };

    this.progress = {
      jobs: 0,
      events: 0,
      people: 0,
      articles: 0,
      companies: 0,
      posts: 0,
      isRunning: false,
      completed: false,
      totalLocations: config.locations.length,
      completedLocations: 0,
      errors: 0,
      retries: 0,
      startTime: new Date(),
    };
  }

  async initialize(): Promise<void> {
    // No browser initialization needed for API approach
    console.log('🔧 Initializing LinkedIn API scraper...');
  }

  private validateJobData(data: JobData): boolean {
    return !!(
      data.title?.trim() &&
      data.description?.trim() &&
      data.company?.trim() &&
      data.location?.trim() &&
      data.jobType &&
      data.employmentType &&
      data.linkedinJobUrl
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Scraper is already running');
    }

    this.isRunning = true;
    this.progress.isRunning = true;
    this.progress.completed = false;
    this.progress.startTime = new Date();

    try {
      console.log('🚀 Initializing LinkedIn API scraper...');
      await this.initialize();

      // Skip login for API-based scraping - using public endpoints
      console.log('🔗 Using LinkedIn public API endpoints (no login required)');

      console.log('🎯 Starting data collection...');

      for (const location of this.config.locations) {
        this.progress.currentLocation = location;

        for (const type of this.config.scrapeTypes) {
          this.progress.currentType = type;
          this.progress.currentActivity = `Scraping ${type} in ${location}`;

          let result: ScrapingResult;

          switch (type) {
            case 'jobs':
              result = await this.scrapeJobs(location);
              this.progress.jobs += result.metadata.itemsFound;
              break;
            case 'events':
              // Skip events scraping - not converted to API yet
              console.log(`⏭️  Skipping events scraping (Puppeteer-based)`);
              result = { success: true, data: [], errors: [], metadata: { scrapedAt: new Date(), duration: 0, pagesProcessed: 0, itemsFound: 0 } };
              break;
            case 'people':
              // Skip people scraping - not converted to API yet
              console.log(`⏭️  Skipping people scraping (Puppeteer-based)`);
              result = { success: true, data: [], errors: [], metadata: { scrapedAt: new Date(), duration: 0, pagesProcessed: 0, itemsFound: 0 } };
              break;
            case 'articles':
              // Skip articles scraping - not converted to API yet
              console.log(`⏭️  Skipping articles scraping (Puppeteer-based)`);
              result = { success: true, data: [], errors: [], metadata: { scrapedAt: new Date(), duration: 0, pagesProcessed: 0, itemsFound: 0 } };
              break;
            case 'companies':
              // Skip companies scraping - not converted to API yet
              console.log(`⏭️  Skipping companies scraping (Puppeteer-based)`);
              result = { success: true, data: [], errors: [], metadata: { scrapedAt: new Date(), duration: 0, pagesProcessed: 0, itemsFound: 0 } };
              break;
            case 'posts':
              // Skip posts scraping - not converted to API yet
              console.log(`⏭️  Skipping posts scraping (Puppeteer-based)`);
              result = { success: true, data: [], errors: [], metadata: { scrapedAt: new Date(), duration: 0, pagesProcessed: 0, itemsFound: 0 } };
              break;
          }

          if (!result.success) {
            this.progress.errors += result.errors.length;
            console.error(`Errors during ${type} scraping:`, result.errors);
          }

          // Save successful data
          if (result.data.length > 0) {
            await this.saveToDatabase(result.data, type);
          }

          // Rate limiting delay with randomization
          await randomDelay(this.config.delayBetweenRequests, this.config.delayBetweenRequests * 1.5);
        }

        this.progress.completedLocations++;
      }

      this.progress.completed = true;
      console.log('Scraping completed successfully');

    } catch (error) {
      console.error('Scraper error:', error);
      this.progress.lastError = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      await this.stop();
    }
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping LinkedIn API scraper...');
    this.isRunning = false;
    this.progress.isRunning = false;
  }

  getProgress(): ScraperProgress {
    return { ...this.progress };
  }

  getStatus(): ScraperStatus {
    return {
      isRunning: this.isRunning,
      progress: { ...this.progress },
      currentActivity: this.progress.currentActivity,
      sessionInfo: { ...this.sessionInfo },
    };
  }

  isVerificationRequired(): boolean {
    // No verification needed for API-based scraping
    return false;
  }

  getVerificationStatus(): { required: boolean; url: string; instructions?: string } {
    // No verification needed for API-based scraping
    return { required: false, url: '' };
  }

  private async scrapeJobs(location: string): Promise<ScrapingResult> {
    const startTime = Date.now();
    const data: JobData[] = [];
    const errors: string[] = [];
    let pagesProcessed = 0;

    try {
      const keywords = this.config.keywords?.jobs || 'Frontend Developer';
      let start = 0;
      const pageSize = 10;
      let hasMorePages = true;

      while (hasMorePages && pagesProcessed < this.config.maxPages) {
        try {
          // Use the LinkedIn jobs API endpoint
          const searchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&geoId=&trk=public_jobs-sarch-bar_search-submit&start=${start}`;

          console.log(`🔍 Fetching jobs from: ${searchUrl}`);

          const response = await axios.get(searchUrl, {
            headers: {
              'User-Agent': this.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
              'DNT': '1',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
            },
            timeout: 30000,
          });

          const $ = cheerio.load(response.data);

          // Debug: Log the response to see what we're getting
          console.log(`🔍 Response length: ${response.data.length}`);

          // Updated selector to match LinkedIn's current HTML structure
          const jobElements = $('.job-search-card, .base-search-card.job-search-card');

          console.log(`🔍 Found ${jobElements.length} job elements with selector '.job-search-card, .base-search-card.job-search-card'`);

          // Try alternative selectors if the main one doesn't work
          if (jobElements.length === 0) {
            const altSelectors = [
              '.job-card-container',
              '.jobs-search-results__list-item',
              '[data-entity-urn*="jobPosting"]',
              '.base-card'
            ];

            for (const selector of altSelectors) {
              const altElements = $(selector);
              console.log(`� Alternative selector '${selector}' found ${altElements.length} elements`);
              if (altElements.length > 0) {
                break;
              }
            }
          }

          // Extract job IDs from the HTML
          const jobIds: string[] = [];
          jobElements.each((_, element) => {
            const $el = $(element);
            // Try multiple ways to extract job ID
            let jobId = $el.attr('data-job-id') ||
              $el.attr('data-entity-urn')?.split(':').pop();

            // If not found, try extracting from href
            if (!jobId) {
              const href = $el.find('a').attr('href') ||
                $el.attr('href');
              if (href) {
                const match = href.match(/\/jobs\/view\/(\d+)/);
                jobId = match ? match[1] : undefined;
              }
            }

            if (jobId) {
              jobIds.push(jobId);
              console.log(`🔍 Found job ID: ${jobId}`);
            }
          });

          // Fetch detailed job data for each job
          for (const jobId of jobIds) {
            if (!this.isRunning) break;

            try {
              const jobData = await this.scrapeJobDetails(jobId);
              console.log(`🔍 Scraped job data for ID ${jobId}:`, jobData);
              if (jobData && this.validateJobData(jobData)) {
                data.push(jobData);
                console.log(`✅ Scraped job: ${jobData.title} at ${jobData.company}`);
              }
            } catch (error) {
              console.error(`❌ Error scraping job ${jobId}:`, error);
              errors.push(`Failed to scrape job ${jobId}: ${error}`);
            }

            // Rate limiting delay
            await randomDelay(this.config.delayBetweenRequests, this.config.delayBetweenRequests * 1.5);
          }

          pagesProcessed++;
          start += pageSize;

          // Check if we should continue (LinkedIn typically returns 25 jobs per page)
          if (jobElements.length < pageSize) {
            hasMorePages = false;
          }

          // Additional delay between pages
          console.log(`⏳ Waiting before next page...`, data);
          await randomDelay(2000, 5000);

        } catch (error) {
          console.error(`❌ Error on page ${pagesProcessed + 1}:`, error);
          errors.push(`Page ${pagesProcessed + 1} error: ${error}`);
          pagesProcessed++;
          break;
        }
      }

      return {
        success: errors.length === 0,
        data,
        errors,
        metadata: {
          scrapedAt: new Date(),
          duration: Date.now() - startTime,
          pagesProcessed,
          itemsFound: data.length,
        },
      };

    } catch (error) {
      errors.push(`Critical error in scrapeJobs: ${error}`);
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      metadata: {
        scrapedAt: new Date(),
        duration: Date.now() - startTime,
        pagesProcessed,
        itemsFound: data.length,
      },
    };
  }

  private async scrapeJobDetails(jobId: string): Promise<JobData | null> {
    try {
      // Use the LinkedIn job details API endpoint
      const jobDetailsUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;

      console.log(`🔍 Fetching job details from: ${jobDetailsUrl}`);

      const response = await axios.get(jobDetailsUrl, {
        headers: {
          'User-Agent': this.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);

      // Extract job details from the HTML
      const title = $('.top-card-layout__title')?.text()?.trim() ||
        $('h2.top-card-layout__title')?.text()?.trim() ||
        $('h1')?.first()?.text()?.trim();

      const company = $('.topcard__org-name-link')?.text()?.trim() ||
        $('.top-card-layout__second-subline a')?.first()?.text()?.trim();

      const location = $('.topcard__flavor--bullet')?.text()?.trim() ||
        $('.top-card-layout__second-subline span')?.first()?.text()?.trim();

      const description = $('.jobs-description-content')?.text()?.trim() ||
        $('.jobs-description__content')?.text()?.trim();

      const salary = $('.salary')?.text()?.trim() ||
        $('.compensation__salary-range')?.text()?.trim() ||
        $('.job-details-jobs-unified-top-card__salary')?.text()?.trim();

      // Enhanced selectors for comprehensive data extraction
      const requirements = $('.jobs-description__requirements')?.text()?.trim();
      const responsibilities = $('.jobs-description__responsibilities')?.text()?.trim();
      const benefits = $('.jobs-description__benefits')?.text()?.trim();

      // Employment details
      const employmentType = $('.job-criteria__item')?.filter((_, el) => $(el).find('.job-criteria__subheader').text().includes('Employment type'))?.find('.job-criteria__text')?.text()?.trim() ||
        $('.job-details-jobs-unified-top-card__job-insight-text-button')?.text()?.trim();

      const experienceLevel = $('.job-criteria__item')?.filter((_, el) => $(el).find('.job-criteria__subheader').text().includes('Seniority level'))?.find('.job-criteria__text')?.text()?.trim() ||
        $('.job-details-jobs-unified-top-card__job-insight')?.text()?.trim();

      const companyLogo = $('.top-card-layout__card img')?.attr('src') ||
        $('.job-details-jobs-unified-top-card__company-logo img')?.attr('src') ||
        $('.job-details-jobs-unified-top-card__company-logo')?.attr('data-src');

      // Application details
      const applicationUrl = $('.jobs-apply-button')?.attr('href') ||
        $('.jobs-apply-button a')?.attr('href') ||
        $('.apply-button')?.attr('href');

      const applicationDeadline = $('.job-criteria__item')?.filter((_, el) => $(el).find('.job-criteria__subheader').text().includes('Application deadline'))?.find('.job-criteria__text')?.text()?.trim() ||
        $('.job-details-jobs-unified-top-card__deadline')?.text()?.trim();

      // Extract application email from various possible locations
      const applicationEmail = $('.jobs-description__content a[href^="mailto:"]')?.attr('href')?.replace('mailto:', '') ||
        $('.job-details-jobs-unified-top-card__contact-info a[href^="mailto:"]')?.attr('href')?.replace('mailto:', '') ||
        description?.match(/[\w\.-]+@[\w\.-]+\.\w+/)?.[0];

      // Enhanced skills extraction from multiple sources
      const skillsElements = $('.job-criteria__item')?.filter((_, el) => $(el).find('.job-criteria__subheader').text().includes('Skills'))?.find('.job-criteria__text')?.text()?.split(',')?.map(s => s.trim()) || [];
      const skillsFromElements: string[] = Array.isArray(skillsElements) ? skillsElements : [];

      // Extract skills from job description using advanced pattern matching
      const descriptionText = description || '';
      const skillsFromDescription = extractSkills(descriptionText);

      // Combine and deduplicate skills
      const allSkills = Array.from(new Set([...skillsFromElements, ...skillsFromDescription]));

      // Enhanced degree requirements extraction
      const degreeRequired = $('.job-criteria__item')?.filter((_, el) => $(el).find('.job-criteria__subheader').text().includes('Degree'))?.find('.job-criteria__text')?.text()?.trim() ||
        descriptionText.match(/(?:bachelor|master|phd|degree|qualification)(?:\s+requirements?\s*:?\s*)([^.\n]+)/i)?.[1]?.trim();

      if (!title) {
        console.warn(`⚠️  No title found for job ${jobId}`);
        return null;
      }

      console.log(`✅ Extracted job details: ${title} at ${company}`);

      // Parse salary information
      const salaryInfo = parseSalary(salary);

      // Parse location details
      const locationDetails = extractLocationDetails(location || '');

      // Determine job type from title and description
      const jobType = parseJobType(title, descriptionText);

      // Determine application method
      const applicationMethod: ApplicationMethod = applicationUrl ? 'EXTERNAL' : 'INTERNAL';

      // Find or create category
      let categoryId: string | undefined;
      try {
        const categoryName = jobType === 'STUDENT' || jobType === 'GRADUATE' ? 'Entry Level' :
          jobType === 'EXPERIENCED' ? 'Experienced' :
            jobType === 'INTERNSHIP' ? 'Internship' :
              jobType === 'REMOTE' ? 'Remote' : 'General';

        let category = await prisma.category.findFirst({
          where: {
            name: categoryName,
            type: 'job'
          }
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: categoryName,
              slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
              type: 'job',
              description: `${categoryName} job opportunities`
            }
          });
        }
        categoryId = category.id;
      } catch (error) {
        console.warn('Could not create/find category:', error);
      }

      // Find or create employer
      let employerId: string | undefined;
      try {
        if (company) {
          let employer = await prisma.employerProfile.findFirst({
            where: {
              companyName: company
            }
          });

          if (!employer) {
            // Create a placeholder user for the employer
            const placeholderUser = await prisma.user.create({
              data: {
                email: `employer-${company.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}@scraped.local`,
                firstName: company,
                lastName: 'Employer',
                role: 'EMPLOYER',
                emailVerified: false
              }
            });

            employer = await prisma.employerProfile.create({
              data: {
                userId: placeholderUser.id,
                companyName: company,
                logo: companyLogo,
                website: '',
                industry: '',
                companySize: '',
                address: location || '',
                description: `Employer profile for ${company}`,
                followerCount: null,
                employeeCount: null,
                foundedYear: null,
                specialties: [],
                companyType: '',
                revenue: '',
                verified: false
              }
            });
          }
          employerId = employer.id;
        }
      } catch (error) {
        console.warn('Could not create/find employer:', error);
      }

      return {
        title,
        description: descriptionText,
        requirements,
        responsibilities,
        benefits,
        company: company || '',
        logo: companyLogo,
        location: location || '',
        country: locationDetails.country,
        state: locationDetails.state,
        city: locationDetails.city,
        jobType,
        employmentType: employmentType || 'Full-time',
        experienceLevel,
        salaryMin: salaryInfo?.min,
        salaryMax: salaryInfo?.max,
        salaryCurrency: salaryInfo?.currency || 'GBP',
        salaryType: salaryInfo?.type || 'Yearly',
        salaryMode: salaryInfo?.mode || 'RANGE',
        degreeRequired,
        skillsRequired: allSkills,
        applicationUrl,
        applicationEmail,
        applicationDeadline: applicationDeadline ? parseDate(applicationDeadline) : undefined,
        applicationMethod,
        isActive: true,
        isFeatured: false,
        viewCount: 0,
        applicationCount: 0,
        employerId,
        categoryId,
        linkedinJobUrl: `https://www.linkedin.com/jobs/view/${jobId}`,
      };
    } catch (error) {
      console.error(`❌ Error scraping job details for ${jobId}:`, error);
      return null;
    }
  }

  private async scrapeEvents(_location: string): Promise<ScrapingResult> {
    // Commented out - not converted to API yet
    return {
      success: true,
      data: [],
      errors: [],
      metadata: {
        scrapedAt: new Date(),
        duration: 0,
        pagesProcessed: 0,
        itemsFound: 0,
      },
    };
  }

  private async scrapeEventDetails(_eventUrl: string): Promise<EventData | null> {
    // Commented out - not converted to API yet
    return null;
  }

  private async scrapePeople(_location: string): Promise<ScrapingResult> {
    // Commented out - not converted to API yet
    return {
      success: true,
      data: [],
      errors: [],
      metadata: {
        scrapedAt: new Date(),
        duration: 0,
        pagesProcessed: 0,
        itemsFound: 0,
      },
    };
  }

  private async scrapePersonDetails(_personUrl: string): Promise<PersonData | null> {
    // Commented out - not converted to API yet
    return null;
  }

  private async scrapeArticles(_location: string): Promise<ScrapingResult> {
    // Commented out - not converted to API yet
    return {
      success: true,
      data: [],
      errors: [],
      metadata: {
        scrapedAt: new Date(),
        duration: 0,
        pagesProcessed: 0,
        itemsFound: 0,
      },
    };
  }

  private async scrapeArticleDetails(_articleUrl: string): Promise<ArticleData | null> {
    // Commented out - not converted to API yet
    return null;
  }

  private async scrapeCompanies(_location: string): Promise<ScrapingResult> {
    // Commented out - not converted to API yet
    return {
      success: true,
      data: [],
      errors: [],
      metadata: {
        scrapedAt: new Date(),
        duration: 0,
        pagesProcessed: 0,
        itemsFound: 0,
      },
    };
  }

  private async scrapeCompanyDetails(_companyUrl: string): Promise<CompanyData | null> {
    // Commented out - not converted to API yet
    return null;
  }

  private async scrapePosts(_location: string): Promise<ScrapingResult> {
    // Commented out - not converted to API yet
    return {
      success: true,
      data: [],
      errors: [],
      metadata: {
        scrapedAt: new Date(),
        duration: 0,
        pagesProcessed: 0,
        itemsFound: 0,
      },
    };
  }

  private async waitForSelectorWithRetry(_selector: string, _timeout: number = 10000, _retries: number = 3): Promise<void> {
    // Commented out - not needed for API-based scraping
  }

  private async saveToDatabase(data: any[], type: string): Promise<void> {
    try {
      if (type === 'jobs') {
        for (const job of data) {
          await prisma.job.create({ data: job });
        }
      } else if (type === 'events') {
        for (const event of data) {
          await prisma.event.create({ data: event });
        }
      } else if (type === 'people') {
        for (const person of data) {
          await prisma.user.create({ data: person });
        }
      } else if (type === 'articles') {
        for (const article of data) {
          const defaultAuthor = await prisma.user.findFirst();
          if (defaultAuthor) {
            await prisma.blog.create({ data: { ...article, authorId: defaultAuthor.id } });
          }
        }
      } else if (type === 'companies') {
        for (const company of data) {
          // Create or find user for employer profile
          const employerUser = await prisma.user.findFirst({
            where: { firstName: company.companyName }
          });

          if (employerUser) {
            await prisma.employerProfile.create({
              data: {
                userId: employerUser.id,
                companyName: company.companyName,
                companySize: company.companySize,
                industry: company.industry,
                website: company.website,
                description: company.description,
                logo: company.logoUrl,
                address: company.address,
                verified: company.verified,
              }
            });
          }
        }
      }
      console.log(`Saved ${data.length} ${type} to database`);
    } catch (error) {
      console.error(`Error saving ${type} to database:`, error);
    }
  }
}

// Legacy functions for backward compatibility
export async function runScraper(): Promise<void> {
  const config = createConfig({
    linkedinEmail: process.env.LINKEDIN_EMAIL || '',
    linkedinPassword: process.env.LINKEDIN_PASSWORD || '',
  });

  const scraper = new LinkedInScraperManager(config);
  await scraper.start();
}

