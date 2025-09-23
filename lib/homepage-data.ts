// Homepage data fetching functions
export interface Job {
  id: string
  title: string
  company: string
  location: string
  salaryMin?: number
  salaryMax?: number
  description?: string
  requirements?: string
  benefits?: string
  salaryCurrency: string
  salaryType: string
  salaryMode: string
  isActive: boolean
  isFeatured: boolean
  postedAt: string
  applicationDeadline?: string
  about?: string
  logo?: string
  viewCount: number
  employmentType?: string
  jobType?: string
  experienceLevel: string
  employer?: {
    companyName: string
    user: {
      firstName: string
      lastName: string
    }
  }
  category?: {
    name: string
  }
}

export interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate?: string
  location?: string
  isVirtual: boolean
  virtualLink?: string
  category?: {
    name: string
  }
}

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  imageUrl?: string
  isPublished: boolean
  publishedAt?: string
  category?: {
    name: string
  }
}

// Parse salary string and extract numeric values
export function parseSalaryRange(salaryString: string): { min: number; max: number; currency: string } | null {
  if (!salaryString) return null

  // Remove all non-numeric characters except for common separators
  const cleaned = salaryString.replace(/[^\d\s\-.,]/g, '').trim()

  // Try to extract numbers
  const numbers = cleaned.match(/\d+(?:,\d{3})*(?:\.\d{2})?/g)

  if (!numbers || numbers.length === 0) return null

  // Convert to numbers
  const parsedNumbers = numbers.map(num => parseFloat(num.replace(/,/g, '')))

  if (parsedNumbers.length === 1) {
    // Single salary value
    return { min: parsedNumbers[0], max: parsedNumbers[0], currency: 'GBP' }
  } else if (parsedNumbers.length >= 2) {
    // Range of salaries
    return {
      min: Math.min(...parsedNumbers),
      max: Math.max(...parsedNumbers),
      currency: 'GBP'
    }
  }

  return null
}

// Fetch all jobs (raw data for local filtering)
export async function getAllJobs(): Promise<Job[]> {
  try {
    const response = await fetch(`/api/jobs`, {
      
    })

    if (!response.ok) {
      console.error('Failed to fetch all jobs')
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching all jobs:', error)
    return []
  }
}

// Fetch all events (raw data for local filtering)
export async function getAllEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`/api/events`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('Failed to fetch all events')
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching all events:', error)
    return []
  }
}

// Fetch all blogs (raw data for local filtering)
export async function getAllBlogs(): Promise<Blog[]> {
  try {
    const response = await fetch(`/api/blogs`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error('Failed to fetch all blogs')
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching all blogs:', error)
    return []
  }
}

// Local filtering functions

// Get featured jobs by filtering locally
export function getFeaturedJobsLocally(jobs: Job[], limit: number = 6): Job[] {
  return jobs
    .filter(job => job.isFeatured && job.isActive)
    .slice(0, limit)
}

// Get high salary jobs by filtering and sorting locally
export function getHighSalaryJobsLocally(jobs: Job[], limit: number = 6): Job[] {
  return jobs
    .filter(job => {
      const salary = job.salaryMin || job.salaryMax || 0
      return salary > 30000 // Only jobs with salary > £30k
    })
    .sort((a, b) => {
      const salaryA = a.salaryMax || a.salaryMin || 0
      const salaryB = b.salaryMax || b.salaryMin || 0
      return salaryB - salaryA // Sort by salary descending
    })
    .slice(0, limit)
}

// Get upcoming events by filtering and sorting locally
export function getUpcomingEventsLocally(events: Event[], limit: number = 4): Event[] {
  const now = new Date()
  return events
    .filter(event => new Date(event.startDate) > now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, limit)
}

// Get latest blogs by sorting locally
export function getLatestBlogsLocally(blogs: Blog[], limit: number = 4): Blog[] {
  return blogs
    .filter(blog => blog.isPublished)
    .sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0
      if (!a.publishedAt) return 1
      if (!b.publishedAt) return -1
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
    .slice(0, limit)
}

// Fetch featured jobs
export async function getFeaturedJobs(limit: number = 6): Promise<Job[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/jobs?featured=true&limit=${limit}&status=active`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Failed to fetch featured jobs')
      return []
    }

    const data = await response.json()
    return data.jobs || []
  } catch (error) {
    console.error('Error fetching featured jobs:', error)
    return []
  }
}

// Fetch high salary jobs
export async function getHighSalaryJobs(limit: number = 6): Promise<Job[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/jobs?sort=salary_desc&limit=${limit}&status=active`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Failed to fetch high salary jobs')
      return []
    }

    const data = await response.json()
    const jobs = data.jobs || []

    // Filter and sort by actual salary values
    return jobs
      .filter((job: Job) => job.salaryMin && job.salaryMin > 30000) // Only jobs with salary > £30k
      .sort((a: Job, b: Job) => (b.salaryMax || b.salaryMin || 0) - (a.salaryMax || a.salaryMin || 0))
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching high salary jobs:', error)
    return []
  }
}

// Fetch upcoming events
export async function getUpcomingEvents(limit: number = 4): Promise<Event[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/events?upcoming=true&limit=${limit}&status=active`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Failed to fetch upcoming events')
      return []
    }

    const data = await response.json()
    return data.events || []
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return []
  }
}

// Fetch latest blogs/articles
export async function getLatestBlogs(limit: number = 4): Promise<Blog[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/blogs?published=true&limit=${limit}&sort=latest`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('Failed to fetch latest blogs')
      return []
    }

    const data = await response.json()
    return data.blogs || []
  } catch (error) {
    console.error('Error fetching latest blogs:', error)
    return []
  }
}

// Format salary for display
export function formatSalary(job: Job): string {
  if (!job.salaryMin && !job.salaryMax) return 'Salary not specified'

  const currency = job.salaryCurrency || 'GBP'
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency

  if (job.salaryMode === 'RANGE' && job.salaryMin && job.salaryMax) {
    return `${symbol}${job.salaryMin.toLocaleString()} - ${symbol}${job.salaryMax.toLocaleString()} / ${job.salaryType || 'Yearly'}`
  } else if (job.salaryMin) {
    return `${symbol}${job.salaryMin.toLocaleString()} / ${job.salaryType || 'Yearly'}`
  } else if (job.salaryMax) {
    return `Up to ${symbol}${job.salaryMax.toLocaleString()} / ${job.salaryType || 'Yearly'}`
  }

  return 'Salary not specified'
}

// Get company display name
export function getCompanyDisplayName(job: Job): string {
  if (job.employer?.companyName) {
    return job.employer.companyName
  }
  return job.company || 'Company not specified'
}