import { Suspense } from 'react'
import {
    AlertCircle,
    CheckCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { DashboardStats } from './components/dashboard-stats'
import { QuickActions } from './components/quick-actions'
import { RecentActivity } from './components/recent-activity'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your UK Visa Jobs platform
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        System Online
                    </Badge>
                </div>
            </div>

            {/* Stats Cards */}
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                            <Spinner size="sm" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>}>
                <DashboardStats />
            </Suspense>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <QuickActions />
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <Suspense fallback={
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Loading recent activities...</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                            <div className="flex-1 space-y-1">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    }>
                        <RecentActivity />
                    </Suspense>
                </div>
            </div>

            {/* System Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        System Status
                    </CardTitle>
                    <CardDescription>
                        Current system health and performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Database Connection</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">API Services</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">File Storage</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}