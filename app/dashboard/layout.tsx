import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { DashboardSidebar } from './components/sidebar'
import { DashboardHeader } from './components/header'

interface DashboardLayoutProps {
    children: ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    const user = await getAuthUser()

    console.log('DashboardLayout session:', user)

    if (!user) {
        redirect('/signin')
    }

    // Check if user has admin role
    if (user.role !== 'ADMIN') {
        redirect('/')
    }

    return (
        <div className="flex h-full ">
            <div className="w-64 hidden lg:block">
                <DashboardSidebar />
            </div>
            <div className="flex-col flex-1">
                <DashboardHeader user={{
                    id: user.id,
                    name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                }} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}