import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import {
  UserPlus,
  Briefcase,
  FileText,
  Calendar,
  Clock
} from 'lucide-react'

// Mock data - replace with actual API calls
const activities = [
  {
    id: 1,
    type: 'user_registered',
    title: 'New user registered',
    description: 'John Smith joined the platform',
    time: '2 minutes ago',
    icon: UserPlus,
    color: 'text-blue-600',
  },
  {
    id: 2,
    type: 'job_posted',
    title: 'New job posted',
    description: 'Senior Software Engineer position at TechCorp',
    time: '15 minutes ago',
    icon: Briefcase,
    color: 'text-green-600',
  },
  {
    id: 3,
    type: 'application_submitted',
    title: 'Job application submitted',
    description: 'Sarah Johnson applied for Frontend Developer',
    time: '1 hour ago',
    icon: FileText,
    color: 'text-purple-600',
  },
  {
    id: 4,
    type: 'event_created',
    title: 'New event created',
    description: 'Graduate Job Hunting Workshop scheduled',
    time: '2 hours ago',
    icon: Calendar,
    color: 'text-orange-600',
  },
  {
    id: 5,
    type: 'blog_published',
    title: 'Blog post published',
    description: 'UK Graduate Job Market Analysis 2025',
    time: '3 hours ago',
    icon: FileText,
    color: 'text-indigo-600',
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest actions and updates on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.description}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}