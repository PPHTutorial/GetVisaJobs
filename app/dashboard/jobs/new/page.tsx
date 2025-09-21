import { Metadata } from 'next'
import { JobForm } from '../components/job-form'

export const metadata: Metadata = {
  title: 'Create New Job | No Stress Visa Jobs',
  description: 'Create a new job listing',
}

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
        <p className="text-muted-foreground">
          Add a new job listing to the platform
        </p>
      </div>

      <JobForm />
    </div>
  )
}