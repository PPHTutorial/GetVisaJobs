
import { Suspense } from 'react'
import { Metadata } from 'next'
import { getAuthUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserApplications } from './components/user-applications'
import { UserProfile } from './components/user-profile'
import { SavedJobs } from './components/saved-jobs'
import { ApplicationStats } from './components/application-stats'
import { FileText, Heart, User, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import UserDashboardComponent from './components/userdashboard-comoponent'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'My Dashboard | No Stress Visa Jobs',
  description: 'Track your job applications and manage your profile',
}

export default async function UserDashboardPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/signin')
  }

  // Only allow USER and EMPLOYER roles
  if (user.role === 'ADMIN') {
    //redirect('/dashboard')
  }

  return (
    <div>
      <UserDashboardComponent />
      <div className="max-w-7xl space-y-6 mx-auto mt-2 lg:mt-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className='flex items-center gap-4'>
              <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
              <Badge variant="outline" className="capitalize ">
                {user.role?.toLowerCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Track your job applications and manage your profile
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild>
              <Link href="/jobs" className='flex items-center'>
                <FileText className="mr-2 h-4 w-4" />
                Browse Jobs
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <Suspense fallback={<div>Loading stats...</div>}>
          <ApplicationStats />
        </Suspense>

        {/* Main Content */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Saved Jobs
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Job Applications</CardTitle>
                <CardDescription>
                  Track the status of all your job applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading applications...</div>}>
                  <UserApplications />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Jobs</CardTitle>
                <CardDescription>
                  Jobs you&apos;ve saved for later application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading saved jobs...</div>}>
                  <SavedJobs />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Update your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading profile...</div>}>
                  <UserProfile />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Success Rate</CardTitle>
                  <CardDescription>
                    Your application conversion statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">0%</div>
                  <p className="text-sm text-muted-foreground">
                    No applications yet
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                  <CardDescription>
                    Complete your profile for better opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">45%</div>
                  <p className="text-sm text-muted-foreground">
                    Add resume, skills, and experience
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}