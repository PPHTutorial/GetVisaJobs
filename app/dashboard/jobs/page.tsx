import { Suspense } from 'react'
import { Metadata } from 'next'
import { JobsTable } from './components/jobs-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Job Management | No Stress Visa Jobs',
  description: 'Manage job listings and applications',
}

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">
            Manage job listings, applications, and employer relationships
          </p>
        </div>
        <Button asChild>
          <Link className='flex items-center' href="/dashboard/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Job
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>
            View and manage all job listings in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading jobs...</div>}>
            <JobsTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}