import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JobDetailView } from '../components/job-detail-view'

interface JobPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jobs/${params.id}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return {
        title: 'Job Not Found | No Stress Visa Jobs'
      }
    }

    const data = await response.json()
    const job = data.data

    return {
      title: `${job.title} at ${job.company} | No Stress Visa Jobs`,
      description: job.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Apply for ${job.title} position at ${job.company}`,
      keywords: [job.title, job.company, job.location, 'visa sponsored job', 'work visa'],
      openGraph: {
        title: `${job.title} at ${job.company}`,
        description: job.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Apply for ${job.title} position at ${job.company}`,
        type: 'article',
      }
    }
  } catch (error) {
    return {
      title: 'Job Details | No Stress Visa Jobs'
    }
  }
}

export default async function JobPage({ params }: JobPageProps) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/jobs/${params.id}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      notFound()
    }

    const data = await response.json()
    const job = data.data

    return <JobDetailView job={job} />
  } catch (error) {
    console.error('Failed to fetch job:', error)
    notFound()
  }
}