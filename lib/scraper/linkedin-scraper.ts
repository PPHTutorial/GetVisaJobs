// lib/scraper/linkedin-scraper.ts
import puppeteer, { Browser, launch, Page } from 'puppeteer';
import { PrismaClient, Job, Event, User, Blog } from '@prisma/client';

// Types
interface ScraperConfig {
  linkedinEmail: string;
  linkedinPassword: string;
  locations: string[];
  scrapeTypes: string[];
  maxPages: number;
  delayBetweenRequests: number;
}

interface JobData {
  title: string;
  description: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: string;
  employmentType: string;
  isActive: boolean;
}

interface EventData {
  title: string;
  description: string;
  startDate: Date;
  location?: string;
  isVirtual: boolean;
  eventType: string;
  isActive: boolean;
}

interface PersonData {
  firstName: string;
  lastName: string;
  currentLocation?: string;
  bio?: string;
  linkedinUrl: string;
}

interface ArticleData {
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: Date;
  authorId: string;
}

// Configuration
const CONFIG: ScraperConfig = {
  linkedinEmail: process.env.LINKEDIN_EMAIL || 'otengs16@gmail.com',
  linkedinPassword: process.env.LINKEDIN_PASSWORD || '123@Beatbacklist',
  locations: process.env.SCRAPER_LOCATIONS ? JSON.parse(process.env.SCRAPER_LOCATIONS) : ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
    'Netherlands', 'Sweden', 'Norway', 'Denmark', "Ghana", "Nigeria", "India", "Singapore", "United Arab Emirates", "Saudi Arabia", "Qatar", "Hong Kong", "Japan", "South Korea"],
  scrapeTypes: process.env.SCRAPER_TYPES ? JSON.parse(process.env.SCRAPER_TYPES) : ['jobs', 'events', 'people', 'articles'],
  maxPages: parseInt(process.env.SCRAPER_MAX_PAGES || '100'),
  delayBetweenRequests: parseInt(process.env.SCRAPER_DELAY || '2000'),
};

// Track scraped pages to avoid duplicates
const scrapedPages = new Set<string>();

const prisma = new PrismaClient();

async function loginToLinkedIn(page: Page) {
  await page.goto('https://www.linkedin.com/login');
  await page.type('#username', CONFIG.linkedinEmail);
  await page.type('#password', CONFIG.linkedinPassword);
  await page.click('[data-litms-control-urn="login-submit"]');
  await page.waitForNavigation();
}

async function scrapeJobs(page: { goto: (arg0: string, arg1: { waitUntil: string; }) => any; waitForSelector: (arg0: string, arg1: { timeout: number; }) => any; $$: (arg0: string) => any; evaluate: (arg0: (el: any) => { title: any; company: any; location: any; url: any; postedTime: any; }, arg1: any) => any; waitForTimeout: (arg0: number) => any; }, location: string | number | boolean, startPage = 1) {
  const jobs = [];
  let pageNum = startPage;

  while (pageNum <= CONFIG.maxPages) {
    const pageKey = `jobs-${location}-${pageNum}`;
    if (scrapedPages.has(pageKey)) {
      console.log(`Skipping already scraped page: ${pageKey}`);
      pageNum++;
      continue;
    }

    try {
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=visa%20jobs&location=${encodeURIComponent(location)}&start=${(pageNum - 1) * 25}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      // Wait for job cards to load
      await page.waitForSelector('.job-card-container', { timeout: 10000 });

      const jobElements = await page.$$('.job-card-container');
      if (jobElements.length === 0) break;

      for (const jobEl of jobElements) {
        try {
          const jobData = await page.evaluate((el: { querySelector: (arg0: string) => any; }) => {
            const titleEl = el.querySelector('.job-card-list__title');
            const companyEl = el.querySelector('.job-card-container__company-name');
            const locationEl = el.querySelector('.job-card-container__metadata-item');
            const linkEl = el.querySelector('a');
            const timeEl = el.querySelector('.job-card-container__listed-time');

            return {
              title: titleEl?.textContent?.trim(),
              company: companyEl?.textContent?.trim(),
              location: locationEl?.textContent?.trim(),
              url: linkEl?.href,
              postedTime: timeEl?.textContent?.trim(),
            };
          }, jobEl);

          // Check for duplicate in DB
          const existingJob = await prisma.job.findFirst({
            where: { title: jobData.title, company: jobData.company, location: jobData.location }
          });

          if (!existingJob) {
            // Get full job details
            const fullJobData = await scrapeJobDetails(page, jobData.url);
            if (fullJobData) {
              jobs.push(fullJobData);
            }
          }
        } catch (error) {
          console.error('Error scraping job:', error);
        }
      }

      scrapedPages.add(pageKey);
      pageNum++;
      await page.waitForTimeout(CONFIG.delayBetweenRequests);
    } catch (error) {
      console.error(`Error scraping jobs page ${pageNum}:`, error);
      break;
    }
  }

  return jobs;
}

async function scrapeJobDetails(page: Page, jobUrl: any) {
  try {
    await page.goto(jobUrl, { waitUntil: 'networkidle2' });

    const jobDetails = await page.evaluate(() => {
      const title = document.querySelector('.job-details-jobs-unified-top-card__job-title')?.textContent?.trim();
      const company = document.querySelector('.job-details-jobs-unified-top-card__company-name a')?.textContent?.trim();
      const location = document.querySelector('.job-details-jobs-unified-top-card__primary-description')?.textContent?.trim();
      const description = document.querySelector('.jobs-description__content')?.textContent?.trim();
      const salary = document.querySelector('.salary')?.textContent?.trim();

      return {
        title,
        company,
        location,
        description,
        salary,
      };
    });

    // Map to schema
    return {
      title: jobDetails.title,
      description: jobDetails.description || '',
      company: jobDetails.company || '',
      location: jobDetails.location || '',
      salaryMin: parseSalary(jobDetails.salary)?.min,
      salaryMax: parseSalary(jobDetails.salary)?.max,
      jobType: 'FULL_TIME', // Default, can be improved
      employmentType: 'Full-time',
      isActive: true,
      // Add other fields as needed
    };
  } catch (error) {
    console.error('Error scraping job details:', error);
    return null;
  }
}

function parseSalary(salaryText: string) {
  if (!salaryText) return null;
  const matches = salaryText.match(/\$?(\d+(?:,\d+)?(?:\.\d+)?)/g);
  if (matches && matches.length >= 2) {
    return {
      min: parseInt(matches[0].replace(/[$,]/g, '')),
      max: parseInt(matches[1].replace(/[$,]/g, '')),
    };
  }
  return null;
}

async function scrapeEvents(page: { goto: (arg0: string, arg1: { waitUntil: string; }) => any; waitForSelector: (arg0: string, arg1: { timeout: number; }) => any; $$: (arg0: string) => any; evaluate: (arg0: (el: any) => { title: any; date: any; location: any; url: any; }, arg1: any) => any; waitForTimeout: (arg0: number) => any; }, location: string | number | boolean, startPage = 1) {
  const events = [];
  let pageNum = startPage;

  while (pageNum <= CONFIG.maxPages) {
    const pageKey = `events-${location}-${pageNum}`;
    if (scrapedPages.has(pageKey)) {
      pageNum++;
      continue;
    }

    try {
      const searchUrl = `https://www.linkedin.com/search/results/events/?keywords=visa&location=${encodeURIComponent(location)}&start=${(pageNum - 1) * 10}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      await page.waitForSelector('.entity-result__item', { timeout: 10000 });

      const eventElements = await page.$$('.entity-result__item');
      if (eventElements.length === 0) break;

      for (const eventEl of eventElements) {
        try {
          const eventData = await page.evaluate((el: { querySelector: (arg0: string) => any; }) => {
            const titleEl = el.querySelector('.entity-result__title-text a');
            const dateEl = el.querySelector('.entity-result__secondary-subtitle');
            const locationEl = el.querySelector('.entity-result__primary-subtitle');

            return {
              title: titleEl?.textContent?.trim(),
              date: dateEl?.textContent?.trim(),
              location: locationEl?.textContent?.trim(),
              url: titleEl?.href,
            };
          }, eventEl);

          // Check duplicate
          const existingEvent = await prisma.event.findFirst({
            where: { title: eventData.title, startDate: parseDate(eventData.date) }
          });

          if (!existingEvent) {
            const fullEventData = await scrapeEventDetails(page, eventData.url);
            if (fullEventData) {
              events.push(fullEventData);
            }
          }
        } catch (error) {
          console.error('Error scraping event:', error);
        }
      }

      scrapedPages.add(pageKey);
      pageNum++;
      await page.waitForTimeout(CONFIG.delayBetweenRequests);
    } catch (error) {
      console.error(`Error scraping events page ${pageNum}:`, error);
      break;
    }
  }

  return events;
}

async function scrapeEventDetails(page: Page, eventUrl: any) {
  try {
    await page.goto(eventUrl, { waitUntil: 'networkidle2' });

    const eventDetails = await page.evaluate(() => {
      const title = document.querySelector('.event-details__title')?.textContent?.trim();
      const description = document.querySelector('.event-details__description')?.textContent?.trim();
      const date = document.querySelector('.event-details__date')?.textContent?.trim();
      const location = document.querySelector('.event-details__location')?.textContent?.trim();

      return { title, description, date, location };
    });

    return {
      title: eventDetails.title,
      description: eventDetails.description || '',
      startDate: parseDate(eventDetails.date),
      location: eventDetails.location,
      isVirtual: !eventDetails.location || eventDetails.location.toLowerCase().includes('virtual'),
      eventType: 'NETWORKING', // Default
      isActive: true,
    };
  } catch (error) {
    console.error('Error scraping event details:', error);
    return null;
  }
}

function parseDate(dateText: string | number | Date) {
  // Simple date parsing - improve as needed
  return new Date(dateText);
}

async function scrapePeople(page: { goto: (arg0: string, arg1: { waitUntil: string; }) => any; waitForSelector: (arg0: string, arg1: { timeout: number; }) => any; $$: (arg0: string) => any; evaluate: (arg0: (el: any) => { name: any; title: any; location: any; url: any; }, arg1: any) => any; waitForTimeout: (arg0: number) => any; }, location: string | number | boolean, startPage = 1) {
  const people = [];
  let pageNum = startPage;

  while (pageNum <= CONFIG.maxPages) {
    const pageKey = `people-${location}-${pageNum}`;
    if (scrapedPages.has(pageKey)) {
      pageNum++;
      continue;
    }

    try {
      const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=visa%20professional&location=${encodeURIComponent(location)}&start=${(pageNum - 1) * 10}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      await page.waitForSelector('.entity-result__item', { timeout: 10000 });

      const personElements = await page.$$('.entity-result__item');
      if (personElements.length === 0) break;

      for (const personEl of personElements) {
        try {
          const personData = await page.evaluate((el: { querySelector: (arg0: string) => any; }) => {
            const nameEl = el.querySelector('.entity-result__title-text a');
            const titleEl = el.querySelector('.entity-result__primary-subtitle');
            const locationEl = el.querySelector('.entity-result__secondary-subtitle');

            return {
              name: nameEl?.textContent?.trim(),
              title: titleEl?.textContent?.trim(),
              location: locationEl?.textContent?.trim(),
              url: nameEl?.href,
            };
          }, personEl);

          // Check duplicate
          const [firstName, ...lastNameParts] = personData.name.split(' ');
          const lastName = lastNameParts.join(' ');

          const existingUser = await prisma.user.findFirst({
            where: { firstName, lastName, currentLocation: personData.location }
          });

          if (!existingUser) {
            const fullPersonData = await scrapePersonDetails(page, personData.url);
            if (fullPersonData) {
              people.push(fullPersonData);
            }
          }
        } catch (error) {
          console.error('Error scraping person:', error);
        }
      }

      scrapedPages.add(pageKey);
      pageNum++;
      await page.waitForTimeout(CONFIG.delayBetweenRequests);
    } catch (error) {
      console.error(`Error scraping people page ${pageNum}:`, error);
      break;
    }
  }

  return people;
}

async function scrapePersonDetails(page: Page, personUrl: any) {
  try {
    await page.goto(personUrl, { waitUntil: 'networkidle2' });

    const personDetails = await page.evaluate(() => {
      const name = document.querySelector('.pv-text-details__left-panel h1')?.textContent?.trim();
      const title = document.querySelector('.pv-text-details__left-panel .text-body-medium')?.textContent?.trim();
      const location = document.querySelector('.pv-text-details__left-panel .text-body-small')?.textContent?.trim();
      const about = document.querySelector('.pv-about__summary-text')?.textContent?.trim();

      return { name, title, location, about };
    });

    const [firstName, ...lastNameParts] = personDetails.name.split(' ');
    const lastName = lastNameParts.join(' ');

    return {
      firstName,
      lastName,
      currentLocation: personDetails.location,
      bio: personDetails.about,
      linkedinUrl: personUrl,
      // Add other fields as needed
    };
  } catch (error) {
    console.error('Error scraping person details:', error);
    return null;
  }
}

async function scrapeArticles(page: { goto: (arg0: string, arg1: { waitUntil: string; }) => any; waitForSelector: (arg0: string, arg1: { timeout: number; }) => any; $$: (arg0: string) => any; evaluate: (arg0: (el: any) => { title: any; author: any; content: any; url: any; }, arg1: any) => any; waitForTimeout: (arg0: number) => any; }, location: string | number | boolean, startPage = 1) {
  const articles = [];
  let pageNum = startPage;

  while (pageNum <= CONFIG.maxPages) {
    const pageKey = `articles-${location}-${pageNum}`;
    if (scrapedPages.has(pageKey)) {
      pageNum++;
      continue;
    }

    try {
      const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=visa%20jobs&location=${encodeURIComponent(location)}&start=${(pageNum - 1) * 10}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      await page.waitForSelector('.feed-shared-update-v2', { timeout: 10000 });

      const articleElements = await page.$$('.feed-shared-update-v2');
      if (articleElements.length === 0) break;

      for (const articleEl of articleElements) {
        try {
          const articleData = await page.evaluate((el: { querySelector: (arg0: string) => any; }) => {
            const titleEl = el.querySelector('.feed-shared-text-view__text a');
            const authorEl = el.querySelector('.feed-shared-actor__name');
            const contentEl = el.querySelector('.feed-shared-text-view__text');

            return {
              title: titleEl?.textContent?.trim(),
              author: authorEl?.textContent?.trim(),
              content: contentEl?.textContent?.trim(),
              url: titleEl?.href,
            };
          }, articleEl);

          // Check duplicate
          const existingBlog = await prisma.blog.findFirst({
            where: { title: articleData.title }
          });

          if (!existingBlog) {
            articles.push({
              title: articleData.title,
              content: articleData.content || '',
              excerpt: articleData.content?.substring(0, 200),
              tags: ['visa', 'jobs'], // Default tags
              isPublished: true,
              publishedAt: new Date(),
              // authorId will need to be set or created
            });
          }
        } catch (error) {
          console.error('Error scraping article:', error);
        }
      }

      scrapedPages.add(pageKey);
      pageNum++;
      await page.waitForTimeout(CONFIG.delayBetweenRequests);
    } catch (error) {
      console.error(`Error scraping articles page ${pageNum}:`, error);
      break;
    }
  }

  return articles;
}

async function saveToDatabase(data: string | any[], type: string) {
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
        // Need to handle authorId - create a default author or find existing
        const defaultAuthor = await prisma.user.findFirst();
        if (defaultAuthor) {
          await prisma.blog.create({ data: { ...article, authorId: defaultAuthor.id } });
        }
      }
    }
    console.log(`Saved ${data.length} ${type} to database`);
  } catch (error) {
    console.error(`Error saving ${type} to database:`, error);
  }
}

async function runScraper() {
  const browser = await launch({ headless: false }); // Set to true for production
  const page = await browser.newPage();

  try {
    await loginToLinkedIn(page);

    for (const location of CONFIG.locations) {
      console.log(`Scraping location: ${location}`);

      for (const type of CONFIG.scrapeTypes) {
        console.log(`Scraping ${type} for ${location}`);

        let data;
        if (type === 'jobs') {
          data = await scrapeJobs(page, location);
        } else if (type === 'events') {
          data = await scrapeEvents(page, location);
        } else if (type === 'people') {
          data = await scrapePeople(page, location);
        } else if (type === 'articles') {
          data = await scrapeArticles(page, location);
        }

        if (data && data.length > 0) {
          await saveToDatabase(data, type);
        }
      }
    }
  } catch (error) {
    console.error('Scraper error:', error);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

// Export for use in other files
export default { runScraper };

// Run if called directly
if (require.main === module) {
  runScraper();
}