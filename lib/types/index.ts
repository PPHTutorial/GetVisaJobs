// UK Visa Jobs - Core Type Definitions

import {
  User,
  EmployerProfile,
  Job,
  Event,
  Blog,
  JobApplication,
  SavedJob,
  Category,
  Review,
  Payment,
  File,
  Notification,
  AdminAction,
  EventRegistration,
  Statistic as _Statistic,
  UserRole,
  JobType,
  ApplicationStatus,
  PaymentStatus,
  EventType,
  FileType
} from '@prisma/client'

// Re-export Prisma enums
export { UserRole, JobType, ApplicationStatus, PaymentStatus, EventType, FileType }

// Basic authentication types
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  isVerified: boolean
}

export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
  type?: 'access' | 'refresh'
  iat: number
  exp: number
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Extended types with relations
export interface ExtendedUser extends User {
  employerProfile?: EmployerProfile
  applications?: JobApplication[]
  savedJobs?: SavedJob[]
  notifications?: Notification[]
  reviews?: Review[]
  payments?: Payment[]
  adminActions?: AdminAction[]
  eventRegistrations?: EventRegistration[]
  authoredBlogs?: Blog[]
  uploadedFiles?: File[]
}

export interface ExtendedJob extends Job {
  employer?: EmployerProfile & { user: User }
  category?: Category
  applications?: JobApplication[]
  reviews?: Review[]
  savedBy?: SavedJob[]
}

export interface ExtendedEvent extends Event {
  category?: Category
  registrations?: EventRegistration[]
}

export interface ExtendedBlog extends Blog {
  author?: User
  category?: Category
}

// Form types
export interface SignInForm {
  email: string
  password: string
}

export interface SignUpForm {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}

export interface JobForm {
  title: string
  description: string
  company: string
  location: string
  jobType: JobType
  salaryMin?: number
  salaryMax?: number
  currency?: string
  categoryId: string
  requirements?: string
  benefits?: string
  applicationDeadline?: Date
  contactEmail?: string
  contactPhone?: string
  isRemote?: boolean
  experienceLevel?: string
}

export interface JobApplicationForm {
  coverLetter?: string
  resumeUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  expectedSalary?: number
  availableFrom?: Date
  additionalInfo?: string
}

export interface EmployerProfileForm {
  companyName: string
  companyDescription?: string
  companyWebsite?: string
  companySize?: string
  industry?: string
  location?: string
  contactEmail?: string
  contactPhone?: string
  linkedinUrl?: string
  twitterUrl?: string
}

export interface EventForm {
  title: string
  description: string
  eventType: EventType
  startDate: Date
  endDate: Date
  location?: string
  isVirtual?: boolean
  virtualLink?: string
  maxAttendees?: number
  categoryId: string
  registrationDeadline?: Date
  cost?: number
  currency?: string
}

export interface BlogForm {
  title: string
  content: string
  excerpt?: string
  categoryId: string
  tags?: string[]
  featuredImage?: string
  isPublished?: boolean
  publishedAt?: Date
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
}

export interface CategoryForm {
  name: string
  description?: string
  slug: string
  color?: string
  icon?: string
  isActive?: boolean
}

// Filter and search types
export interface JobFilters {
  search?: string
  location?: string
  jobType?: JobType
  categoryId?: string
  salaryMin?: number
  salaryMax?: number
  isRemote?: boolean
  experienceLevel?: string
  postedWithin?: number // days
  sortBy?: 'createdAt' | 'salaryMin' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface EventFilters {
  search?: string
  eventType?: EventType
  categoryId?: string
  startDate?: Date
  endDate?: Date
  isVirtual?: boolean
  location?: string
  costMax?: number
  sortBy?: 'startDate' | 'title' | 'cost'
  sortOrder?: 'asc' | 'desc'
}

export interface BlogFilters {
  search?: string
  categoryId?: string
  authorId?: string
  tags?: string[]
  isPublished?: boolean
  publishedAfter?: Date
  publishedBefore?: Date
  sortBy?: 'publishedAt' | 'title' | 'views'
  sortOrder?: 'asc' | 'desc'
}

// Dashboard and analytics types
export interface DashboardStats {
  totalJobs: number
  totalApplications: number
  totalUsers: number
  totalEvents: number
  totalBlogs: number
  recentApplications: JobApplication[]
  recentJobs: Job[]
  recentEvents: Event[]
  monthlyStats?: {
    jobs: number
    applications: number
    users: number
    events: number
  }
}

export interface UserDashboard {
  user: ExtendedUser
  recentApplications: (JobApplication & { job: Job })[]
  savedJobs: (SavedJob & { job: Job })[]
  upcomingEvents: (EventRegistration & { event: Event })[]
  notifications: Notification[]
  stats: {
    totalApplications: number
    activeApplications: number
    savedJobs: number
    eventRegistrations: number
  }
}

export interface EmployerDashboard {
  employer: EmployerProfile & { user: User }
  activeJobs: Job[]
  recentApplications: (JobApplication & { user: User; job: Job })[]
  jobStats: {
    totalJobs: number
    activeJobs: number
    totalApplications: number
    applicationsThisMonth: number
  }
  companyStats: {
    profileViews: number
    averageResponseTime: number
    hireRate: number
  }
}

// Admin types
export interface AdminDashboard {
  stats: DashboardStats
  recentUsers: User[]
  recentJobs: Job[]
  recentEvents: Event[]
  recentBlogs: Blog[]
  pendingReviews: Review[]
  systemHealth: {
    database: 'healthy' | 'warning' | 'error'
    api: 'healthy' | 'warning' | 'error'
    storage: 'healthy' | 'warning' | 'error'
  }
}

export interface AdminActionForm {
  actionType: string
  targetType: 'user' | 'job' | 'event' | 'blog' | 'application'
  targetId: string
  reason: string
  notes?: string
}

// File upload types
export interface FileUploadResponse {
  success: boolean
  file: File
  url: string
  message?: string
}

export interface FileUploadOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  folder?: string
  public?: boolean
}

// Payment types
export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: PaymentStatus
}

export interface StripePaymentData {
  amount: number
  currency: string
  paymentMethodId: string
  description?: string
  metadata?: Record<string, string>
}

// Notification types
export interface NotificationData {
  type: 'application' | 'job' | 'event' | 'blog' | 'system'
  title: string
  message: string
  actionUrl?: string
  actionText?: string
  priority?: 'low' | 'medium' | 'high'
}

// Search and pagination types
export interface SearchParams {
  q?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Error types
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ApiError {
  message: string
  code?: string
  statusCode: number
  errors?: ValidationError[]
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Component prop types
export interface ComponentWithChildren {
  children: React.ReactNode
}

export interface ComponentWithClassName {
  className?: string
}

export interface ComponentWithId {
  id: string
}

// Theme types
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
}

export interface ThemeConfig {
  colors: {
    light: ThemeColors
    dark: ThemeColors
  }
  fonts: {
    sans: string
    mono: string
  }
}