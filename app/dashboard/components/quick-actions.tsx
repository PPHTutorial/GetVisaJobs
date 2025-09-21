import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import Link from 'next/link'
import {
  Users,
  Briefcase,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react'

const quickActions = [
  {
    title: 'Add New User',
    description: 'Create a new user account',
    href: '/dashboard/users/new',
    icon: Users,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    title: 'Post New Job',
    description: 'Create a new job listing',
    href: '/dashboard/jobs/new',
    icon: Briefcase,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    title: 'Create Event',
    description: 'Schedule a new event',
    href: '/dashboard/events/new',
    icon: Calendar,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    title: 'Write Blog Post',
    description: 'Publish a new article',
    href: '/dashboard/blogs/new',
    icon: FileText,
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    title: 'View Analytics',
    description: 'Check platform statistics',
    href: '/dashboard/statistics',
    icon: BarChart3,
    color: 'bg-indigo-500 hover:bg-indigo-600',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common administrative tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}