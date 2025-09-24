import { PrismaClient, JobType, ApplicationStatus, PaymentStatus, EventType, FileType, SalaryMode, ApplicationMethod, SubscriptionStatus } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

// Helper functions for generating random data
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min
const randomFloat = (min: number, max: number): number => Math.random() * (max - min) + min
const randomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

// Sample data arrays
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Maria', 'William', 'Anna', 'Richard', 'Jennifer', 'Charles', 'Linda', 'Daniel', 'Susan', 'Matthew', 'Karen']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']

// Countries and their cities
const countries = [
  { name: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh', 'Cardiff', 'Belfast', 'Brighton', 'Cambridge', 'Oxford'] },
  { name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte'] },
  { name: 'Canada', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Halifax', 'Victoria', 'Windsor', 'Saskatoon'] },
  { name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Logan City', 'Geelong', 'Hobart', 'Townsville', 'Ipswich', 'Cairns'] },
  { name: 'Germany', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg'] },
  { name: 'France', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon'] },
  { name: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen', 'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Amersfoort'] },
  { name: 'Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Linköping', 'Örebro', 'Västerås', 'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 'Umeå', 'Gävle', 'Borås', 'Södertälje'] },
  { name: 'Denmark', cities: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Frederiksberg', 'Esbjerg', 'Randers', 'Kolding', 'Vejle', 'Roskilde', 'Herning', 'Hørsholm', 'Helsingør', 'Silkeborg', 'Næstved'] },
  { name: 'Norway', cities: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen', 'Fredrikstad', 'Kristiansand', 'Sandnes', 'Tromsø', 'Bodø', 'Arendal', 'Ålesund', 'Tønsberg', 'Moss', 'Skien'] }
]

const universities = ['University of London', 'University of Manchester', 'University of Birmingham', 'University of Leeds', 'University of Glasgow', 'University of Liverpool', 'University of Edinburgh', 'University of Cambridge', 'University of Oxford', 'Imperial College London', 'Harvard University', 'Stanford University', 'MIT', 'University of Toronto', 'McGill University', 'University of British Columbia', 'University of Sydney', 'University of Melbourne', 'Technical University of Munich', 'Sorbonne University', 'Delft University of Technology', 'KTH Royal Institute of Technology', 'University of Copenhagen', 'University of Oslo']
const degrees = ['Bachelor of Science', 'Bachelor of Arts', 'Master of Science', 'Master of Business Administration', 'Doctor of Philosophy', 'Bachelor of Engineering', 'Master of Engineering']
const skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git']
const jobTitles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'QA Engineer', 'Technical Lead']
const companies = ['TechCorp', 'InnovateLabs', 'DigitalSolutions', 'CloudTech', 'DataDriven', 'WebWorks', 'CodeMasters', 'AppDevelopers', 'SysAdmin', 'NetSolutions']
const eventTitles = ['Tech Conference 2024', 'Developer Meetup', 'Job Fair', 'Networking Event', 'Workshop: React Best Practices', 'Career Development Seminar', 'Industry Insights', 'Startup Pitch Night']
const blogTitles = ['The Future of Remote Work', 'Top 10 Programming Languages in 2024', 'How to Ace Your Technical Interview', 'Building Scalable Applications', 'Career Tips for Junior Developers', 'The Rise of AI in Software Development']

// Helper function to get random country and city
const getRandomLocation = () => {
  const country = randomChoice(countries)
  const city = randomChoice(country.cities)
  return { country: country.name, city }
}

async function main() {
  console.log('Starting comprehensive database seeding...')

  // Clear existing data (uncomment to reset database)
  console.log('Clearing existing data...')
  await prisma.jobApplication.deleteMany()
  await prisma.savedJob.deleteMany()
  await prisma.review.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.userSubscription.deleteMany()
  await prisma.eventRegistration.deleteMany()
  await prisma.blog.deleteMany()
  await prisma.event.deleteMany()
  await prisma.job.deleteMany()
  await prisma.employerProfile.deleteMany()
  await prisma.file.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.adminAction.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.category.deleteMany()
  await prisma.statistic.deleteMany()

  console.log('Creating subscription plans...')
  const plans = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { type: 'BASIC' },
      update: {},
      create: {
        name: 'Basic',
        type: 'BASIC',
        description: 'Perfect for getting started with your job search',
        price: 5.99,
        features: ['Up to 50 job applications per month', 'Basic job search and filtering', 'Email notifications', 'Resume storage'],
        maxApplications: 50,
        isPopular: false,
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { type: 'PROFESSIONAL' },
      update: {},
      create: {
        name: 'Professional',
        type: 'PROFESSIONAL',
        description: 'Advanced features for serious job seekers',
        price: 14.99,
        features: ['Up to 200 job applications per month', 'AI job matching', 'Priority support', 'Resume optimization'],
        maxApplications: 200,
        isPopular: true,
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { type: 'PREMIUM' },
      update: {},
      create: {
        name: 'Premium',
        type: 'PREMIUM',
        description: 'Complete solution for career advancement',
        price: 24.99,
        features: ['Unlimited applications', 'AI matching', '24/7 support', 'Career coaching', 'Company insights'],
        maxApplications: -1,
        isPopular: false,
      },
    }),
  ])

  console.log('Creating categories...')
  const categories = []
  const categoryNames = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales', 'Engineering', 'Design', 'Operations', 'HR']
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `${name} job opportunities and career development`,
        type: 'job',
      }
    })
    categories.push(category)
  }

  console.log('Creating users (800 records)...')
  const users = []
  const hashedPassword = await hash('password123', 10)

  for (let i = 0; i < 800; i++) {
    const firstName = randomChoice(firstNames)
    const lastName = randomChoice(lastNames)
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: `+44${randomInt(7000000000, 7999999999)}`,
        role: i < 10 ? 'ADMIN' : i < 100 ? 'EMPLOYER' : 'USER',
        bio: `Experienced professional in ${randomChoice(skills)} with ${randomInt(1, 15)} years of experience.`,
        linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        currentLocation: getRandomLocation().city,
        preferredLocation: getRandomLocation().city,
        experienceYears: randomInt(0, 20),
        degree: randomChoice(degrees),
        university: randomChoice(universities),
        graduationYear: randomInt(2000, 2024),
        skills: Array.from({ length: randomInt(3, 8) }, () => randomChoice(skills)),
        isActive: Math.random() > 0.1, // 90% active
        emailVerified: Math.random() > 0.2, // 80% verified
        phoneVerified: Math.random() > 0.3, // 70% verified
        lastLoginAt: randomDate(new Date(2024, 0, 1), new Date()),
        subscriptionStatus: randomChoice(['ACTIVE', 'INACTIVE', 'EXPIRED'] as SubscriptionStatus[]),
      }
    })
    users.push(user)
  }

  console.log('Creating employer profiles (100 records)...')
  const employers = []
  const employerUsers = users.filter(u => u.role === 'EMPLOYER')

  for (let i = 0; i < Math.min(100, employerUsers.length); i++) {
    const user = employerUsers[i]
    const employer = await prisma.employerProfile.create({
      data: {
        userId: user.id,
        companyName: randomChoice(companies) + ' Ltd',
        companySize: randomChoice(['1-10', '11-50', '51-200', '201-500', '500+']),
        industry: randomChoice(['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing']),
        website: `https://www.${randomChoice(companies).toLowerCase()}.com`,
        description: `Leading company in ${randomChoice(['technology', 'healthcare', 'finance', 'education'])} sector.`,
        logo: `https://via.placeholder.com/150x150?text=${randomChoice(companies).substring(0, 3)}`,
        address: `${randomInt(1, 999)} ${randomChoice(['Main St', 'High St', 'Church Rd', 'Park Ave'])}, ${getRandomLocation().city}`,
        followerCount: randomInt(100, 10000),
        employeeCount: randomInt(10, 1000),
        foundedYear: randomInt(1990, 2020),
        specialties: Array.from({ length: randomInt(2, 5) }, () => randomChoice(skills)),
        verified: Math.random() > 0.3,
      }
    })
    employers.push(employer)
  }

  console.log('Creating jobs (600 records)...')
  const jobs = []
  for (let i = 0; i < 600; i++) {
    const employer = randomChoice(employers)
    const category = randomChoice(categories)
    const location = getRandomLocation()
    const job = await prisma.job.create({
      data: {
        title: randomChoice(jobTitles),
        description: `We are looking for a talented ${randomChoice(jobTitles).toLowerCase()} to join our team. This is an exciting opportunity to work on cutting-edge projects.`,
        requirements: `Bachelor's degree in Computer Science or related field. ${randomInt(2, 5)} years of experience required.`,
        responsibilities: 'Develop and maintain software applications, collaborate with cross-functional teams, participate in code reviews.',
        benefits: 'Competitive salary, health insurance, flexible working hours, professional development opportunities.',
        company: employer.companyName,
        logo: employer.logo,
        location: location.city,
        country: location.country,
        state: location.country === 'United States' ? 'CA' : location.country === 'Canada' ? 'ON' : 'England',
        city: location.city,
        jobType: randomChoice(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as JobType[]),
        employmentType: randomChoice(['Full-time', 'Part-time', 'Contract']),
        experienceLevel: randomChoice(['Entry Level', 'Mid Level', 'Senior Level']),
        salaryMin: randomInt(25000, 80000),
        salaryMax: randomInt(35000, 120000),
        salaryCurrency: 'GBP',
        salaryType: 'Yearly',
        salaryMode: randomChoice(['RANGE', 'COMPETITIVE'] as SalaryMode[]),
        degreeRequired: randomChoice(degrees),
        skillsRequired: Array.from({ length: randomInt(3, 8) }, () => randomChoice(skills)),
        applicationUrl: `https://careers.${employer.companyName.toLowerCase().replace(/\s+/g, '')}.com/jobs/${i}`,
        applicationEmail: `careers@${employer.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        applicationDeadline: randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        applicationMethod: randomChoice(['INTERNAL', 'EXTERNAL'] as ApplicationMethod[]),
        isActive: Math.random() > 0.2, // 80% active
        isFeatured: Math.random() > 0.9, // 10% featured
        viewCount: randomInt(0, 1000),
        applicationCount: randomInt(0, 50),
        employerId: employer.id,
        categoryId: category.id,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }
    })
    jobs.push(job)
  }

  console.log('Creating job applications (1000 records)...')
  const applications = []
  const activeUsers = users.filter(u => u.isActive)
  const existingApplications = new Set<string>()

  for (let i = 0; i < 1000; i++) {
    let user, job, key
    let attempts = 0
    do {
      user = randomChoice(activeUsers)
      job = randomChoice(jobs.filter(j => j.isActive))
      key = `${user.id}-${job.id}`
      attempts++
      if (attempts > 50) break // Prevent infinite loop
    } while (existingApplications.has(key))

    if (existingApplications.has(key)) continue

    existingApplications.add(key)

    const application = await prisma.jobApplication.create({
      data: {
        userId: user.id,
        jobId: job.id,
        status: randomChoice(['PENDING', 'REVIEWED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED'] as ApplicationStatus[]),
        coverLetter: `I am excited to apply for the ${job.title} position at ${job.company}. With my background in ${randomChoice(skills)}, I believe I would be a great fit for your team.`,
        resumeUrl: `https://storage.example.com/resumes/${user.id}.pdf`,
        appliedAt: randomDate(job.createdAt, new Date()),
        reviewedAt: Math.random() > 0.5 ? randomDate(job.createdAt, new Date()) : null,
        notes: Math.random() > 0.7 ? 'Strong candidate with relevant experience.' : null,
      }
    })
    applications.push(application)
  }

  console.log('Creating saved jobs (500 records)...')
  const existingSavedJobs = new Set<string>()

  for (let i = 0; i < 500; i++) {
    let user, job, key
    let attempts = 0
    do {
      user = randomChoice(activeUsers)
      job = randomChoice(jobs)
      key = `${user.id}-${job.id}`
      attempts++
      if (attempts > 50) break // Prevent infinite loop
    } while (existingSavedJobs.has(key))

    if (existingSavedJobs.has(key)) continue

    existingSavedJobs.add(key)

    await prisma.savedJob.upsert({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId: job.id,
        }
      },
      update: {},
      create: {
        userId: user.id,
        jobId: job.id,
        savedAt: randomDate(job.createdAt, new Date()),
      }
    })
  }

  console.log('Creating events (200 records)...')
  const events = []
  for (let i = 0; i < 200; i++) {
    const category = randomChoice(categories)
    const event = await prisma.event.create({
      data: {
        title: randomChoice(eventTitles),
        description: `Join us for an exciting ${randomChoice(['conference', 'meetup', 'workshop', 'seminar'])} focused on ${randomChoice(['career development', 'industry trends', 'technical skills', 'networking'])}.`,
        eventType: randomChoice(['WEBINAR', 'WORKSHOP', 'SEMINAR', 'NETWORKING', 'CONFERENCE', 'MEETUP'] as EventType[]),
        startDate: randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
        endDate: Math.random() > 0.5 ? randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) : null,
        location: getRandomLocation().city,
        isVirtual: Math.random() > 0.3,
        virtualLink: Math.random() > 0.3 ? `https://meet.example.com/event-${i}` : null,
        capacity: randomInt(50, 500),
        registeredCount: randomInt(0, 100),
        isActive: Math.random() > 0.2,
        isFeatured: Math.random() > 0.8,
        imageUrl: `https://via.placeholder.com/400x200?text=Event+${i}`,
        categoryId: category.id,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }
    })
    events.push(event)
  }

  console.log('Creating event registrations (800 records)...')
  const existingEventRegistrations = new Set<string>()

  for (let i = 0; i < 800; i++) {
    let user, event, key
    let attempts = 0
    do {
      user = randomChoice(activeUsers)
      event = randomChoice(events.filter(e => e.isActive))
      key = `${user.id}-${event.id}`
      attempts++
      if (attempts > 50) break // Prevent infinite loop
    } while (existingEventRegistrations.has(key))

    if (existingEventRegistrations.has(key)) continue

    existingEventRegistrations.add(key)

    await prisma.eventRegistration.upsert({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: event.id,
        }
      },
      update: {},
      create: {
        userId: user.id,
        eventId: event.id,
        registeredAt: randomDate(event.createdAt, new Date()),
        attended: Math.random() > 0.4,
      }
    })
  }

  console.log('Creating blogs (150 records)...')
  const blogs = []
  const blogAuthors = users.filter(u => u.role === 'ADMIN' || u.role === 'EMPLOYER')

  for (let i = 0; i < 150; i++) {
    const author = randomChoice(blogAuthors)
    const category = randomChoice(categories)
    const blog = await prisma.blog.create({
      data: {
        title: randomChoice(blogTitles),
        slug: `blog-post-${i}`,
        content: `This is a comprehensive article about ${randomChoice(['technology', 'career development', 'industry trends', 'best practices'])}. It covers various aspects and provides valuable insights for professionals.`,
        excerpt: `Learn about the latest trends and best practices in ${randomChoice(['software development', 'career growth', 'industry insights'])}.`,
        authorId: author.id,
        imageUrl: `https://via.placeholder.com/800x400?text=Blog+${i}`,
        tags: Array.from({ length: randomInt(3, 6) }, () => randomChoice(skills)),
        isPublished: Math.random() > 0.2,
        publishedAt: Math.random() > 0.2 ? randomDate(new Date(2024, 0, 1), new Date()) : null,
        viewCount: randomInt(0, 2000),
        readTime: `${randomInt(3, 15)} min read`,
        claps: randomInt(0, 500),
        comments: randomInt(0, 50),
        shares: randomInt(0, 100),
        categoryId: category.id,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }
    })
    blogs.push(blog)
  }

  console.log('Creating reviews (300 records)...')
  for (let i = 0; i < 300; i++) {
    const user = randomChoice(activeUsers)
    const job = randomChoice(jobs)
    const rating = randomInt(1, 5)

    await prisma.review.create({
      data: {
        userId: user.id,
        jobId: job.id,
        rating,
        title: rating >= 4 ? 'Great experience!' : rating >= 3 ? 'Decent opportunity' : 'Not satisfied',
        content: `My experience with this position was ${rating >= 4 ? 'excellent' : rating >= 3 ? 'good' : 'disappointing'}. The company culture and work environment were ${rating >= 4 ? 'outstanding' : rating >= 3 ? 'adequate' : 'poor'}.`,
        isVerified: Math.random() > 0.3,
        createdAt: randomDate(job.createdAt, new Date()),
      }
    })
  }

  console.log('Creating payments (400 records)...')
  for (let i = 0; i < 400; i++) {
    const user = randomChoice(activeUsers)
    const amount = randomFloat(5.99, 24.99)

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount,
        currency: 'GBP',
        status: randomChoice(['COMPLETED', 'PENDING', 'FAILED'] as PaymentStatus[]),
        paymentMethod: randomChoice(['Credit Card', 'PayPal', 'Bank Transfer']),
        transactionId: `txn_${randomInt(100000, 999999)}`,
        description: `Subscription payment - ${randomChoice(['Basic', 'Professional', 'Premium'])} Plan`,
        metadata: {
          planType: randomChoice(['BASIC', 'PROFESSIONAL', 'PREMIUM']),
          billingCycle: 'monthly'
        },
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }
    })
  }

  console.log('Creating user subscriptions (200 records)...')
  const subscribedUsers = activeUsers.slice(0, 200) // First 200 active users

  for (let i = 0; i < 200; i++) {
    const user = subscribedUsers[i]
    const plan = randomChoice(plans)

    await prisma.userSubscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        planId: plan.id,
        status: randomChoice(['ACTIVE', 'INACTIVE', 'EXPIRED'] as SubscriptionStatus[]),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        applicationsUsed: randomInt(0, plan.maxApplications === -1 ? 100 : plan.maxApplications),
        stripeSubscriptionId: `sub_${randomInt(1000000, 9999999)}`,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }
    })
  }

  console.log('Creating files (100 records)...')
  for (let i = 0; i < 100; i++) {
    const uploader = randomChoice(users)

    await prisma.file.create({
      data: {
        filename: `document_${i}.pdf`,
        originalName: `Resume_${uploader.firstName}_${uploader.lastName}.pdf`,
        mimeType: 'application/pdf',
        size: randomInt(100000, 5000000), // 100KB to 5MB
        url: `https://storage.example.com/files/${i}.pdf`,
        fileType: randomChoice(['IMAGE', 'DOCUMENT'] as FileType[]),
        uploadedBy: uploader.id,
        isPublic: Math.random() > 0.5,
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }
    })
  }

  console.log('Creating notifications (600 records)...')
  for (let i = 0; i < 600; i++) {
    const user = randomChoice(activeUsers)

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: randomChoice([
          'New job matches available',
          'Application status updated',
          'Interview scheduled',
          'Job deadline approaching',
          'Profile viewed by employer',
          'New message received'
        ]),
        message: `You have a new notification regarding your job search activities.`,
        type: randomChoice([
          'application_update',
          'job_alert',
          'event_reminder',
          'profile_view',
          'message'
        ]),
        isRead: Math.random() > 0.6,
        data: {
          jobId: randomChoice(jobs).id,
          applicationId: randomChoice(applications).id
        },
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }
    })
  }

  console.log('Creating admin actions (150 records)...')
  const adminUsers = users.filter(u => u.role === 'ADMIN')

  for (let i = 0; i < 150; i++) {
    const admin = randomChoice(adminUsers)
    const targetUser = randomChoice(users)

    await prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: randomChoice(['create', 'update', 'delete', 'approve', 'reject']),
        resourceType: randomChoice(['user', 'job', 'event', 'blog', 'application']),
        resourceId: targetUser.id,
        details: {
          reason: 'Routine maintenance and content moderation',
          previousStatus: 'pending',
          newStatus: 'approved'
        },
        ipAddress: `192.168.1.${randomInt(1, 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: randomDate(new Date(2024, 0, 1), new Date()),
      }
    })
  }

  console.log('Creating statistics (365 records - one per day for the year)...')
  for (let i = 0; i < 365; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    await prisma.statistic.create({
      data: {
        type: randomChoice([
          'jobs_posted',
          'applications_received',
          'users_registered',
          'events_created',
          'blogs_published'
        ]),
        value: randomInt(1, 50),
        date,
        metadata: {
          source: 'daily_cron',
          category: randomChoice(['jobs', 'users', 'applications', 'events'])
        },
        createdAt: date,
      }
    })
  }

  console.log('Seeding completed successfully!')
  console.log(`
📊 Database seeded with:
- 3 Subscription Plans
- 10 Categories
- 800 Users (including 10 admins, 90 employers)
- 100 Employer Profiles
- 600 Jobs
- 1000 Job Applications
- 500 Saved Jobs
- 200 Events
- 800 Event Registrations
- 150 Blogs
- 300 Reviews
- 400 Payments
- 200 User Subscriptions
- 100 Files
- 600 Notifications
- 150 Admin Actions
- 365 Statistics Records

Total records: ~6,000+
  `)
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })