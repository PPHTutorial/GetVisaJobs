'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '../../../lib/utils'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Tag,
  Calendar,
  FileText,
  Bell,
  Shield,
  BarChart3,
  UserCheck,
  Star,
  DollarSign,
  FolderOpen
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'Employers', href: '/dashboard/employers', icon: Building2 },
  { name: 'Categories', href: '/dashboard/categories', icon: Tag },
  { name: 'Events', href: '/dashboard/events', icon: Calendar },
  { name: 'Blogs', href: '/dashboard/blogs', icon: FileText },
  { name: 'Applications', href: '/dashboard/applications', icon: UserCheck },
  { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
  { name: 'Files', href: '/dashboard/files', icon: FolderOpen },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Admin Actions', href: '/dashboard/admin-actions', icon: Shield },
  { name: 'Statistics', href: '/dashboard/statistics', icon: BarChart3 },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center h-15 flex-shrink-0 px-4 bg-emerald-600 dark:bg-emerald-700">
          <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive
                        ? 'text-emerald-500 dark:text-emerald-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}