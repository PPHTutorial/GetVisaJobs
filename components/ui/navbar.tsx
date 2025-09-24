import { BriefcaseBusiness, Search, User, X, LogOut, LayoutDashboard, User2, Mail } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import { Button } from './button'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { useSession } from '@/lib/hooks/session-provider'

const NavbarComponent = () => {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { user, isLoading } = useSession()

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Jobs', href: '/jobs' },
        { name: 'Events', href: '/events' },
        { name: 'Resources', href: '/resources' },
        //{ name: 'Pricing', href: '/pricing' },
        { name: 'FAQs', href: '/faqs' },
    ]

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/'
        }
        return pathname.startsWith(href)
    }

    useEffect(() => {
        // No need for manual user fetching - useSession handles this
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-br from-emerald-50/10 to-emerald-100/20 backdrop-blur-2xl border-b border-input">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-end h-16">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 block lg:hidden mr-4"
                    >
                        <div className="group w-5 h-6 flex flex-col justify-center space-y-1">
                            <div className={`w-full h-0.5 bg-gray-600 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                            <div className={`w-full h-0.5 bg-gray-600 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                            <div className={`w-full h-0.5 bg-gray-600 transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                        </div>
                    </button>
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 mr-auto">
                        <div className="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <BriefcaseBusiness className="w-6 h-6 text-primary-foreground" />
                            <Search className="absolute right-2 bottom-1 w-4 h-4 text-emerald-300" />
                        </div>
                        <span className="text-2xl font-extrabold text-black">Get Visa Jobs</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center space-x-12 mr-16">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`font-extrabold text-lg transition-colors ${isActive(item.href)
                                    ? 'text-primary'
                                    : 'text-gray-700 hover:text-emerald-600'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center space-x-2">
                        {isLoading ? (
                            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                        ) : user ? (
                            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="group h-8 w-8 p-0 hover:bg-none rounded-full">
                                            <User className="w-4 h-4 text-white group-hover:text-primary" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className=' bg-white dark:bg-gray-800 border-input'>
                                        <DropdownMenuItem>
                                            <User className="w-4 h-4 text-gray-600 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {user.firstName} {user.lastName}
                                            </span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Mail className="w-4 h-4 text-gray-600 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {user.email}
                                            </span>
                                        </DropdownMenuItem>
                                        {user.role === 'ADMIN' && <DropdownMenuItem>
                                            <Link href="/dashboard" className="flex items-center space-x-2">
                                                <LayoutDashboard className="w-4 h-4 text-gray-600 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">Dashboard</span>
                                            </Link>
                                        </DropdownMenuItem>}
                                        <DropdownMenuItem>
                                            <Link href="/user-dashboard" className="flex items-center space-x-2">
                                                <User2 className="w-4 h-4 text-gray-600 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">User Account</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <Separator className='border border-input/10' />
                                        <DropdownMenuItem>
                                            <button
                                                onClick={async () => {
                                                    await fetch('/api/signin', { method: 'DELETE', credentials: 'include' })
                                                    window.location.href = '/'
                                                }}
                                                className="flex items-center space-x-2 w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4 text-red-600 mr-2" />
                                                <span className="text-sm font-medium text-red-600">Sign out</span>
                                            </button>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <Link href="/signin">
                                <Button variant="default" size="sm" className="bg-primary hover:bg-emerald-700 text-white">
                                    Sign In
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`lg:hidden fixed h-screen inset-0 transform transition-transform duration-300 ease-in-out z-40 backdrop-blur-md ${isMobileMenuOpen ? 'w-full' : 'w-0'}`}>
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-50' : 'opacity-0'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className={`absolute  top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}>
                        <div className="flex items-center justify-between p-4 border-b border-input">
                            <Link href="/" className="flex items-center space-x-2 mr-auto">
                                <div className="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                    <BriefcaseBusiness className="w-6 h-6 text-primary-foreground" />
                                    <Search className="absolute right-2 bottom-1 w-4 h-4 text-emerald-300" />
                                </div>
                                <span className="text-2xl font-extrabold text-black">Get Visa Jobs</span>
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <nav className="px-4 py-6 space-y-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-4 py-1 text-base font-extrabold rounded-md transition-colors ${isActive(item.href)
                                        ? 'text-primary bg-emerald-50'
                                        : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}


                            <div className="border-t border-input pt-4 mt-4">
                                {user ? (
                                    <>
                                        <div className="px-4 py-2 text-sm text-gray-600">
                                            {user.firstName} {user.lastName}
                                        </div>
                                        <div className="px-4 py-2 text-sm text-gray-600">
                                            {user.firstName} {user.email}
                                        </div>
                                        <Link
                                            href="/user-dashboard"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-4 py-3 text-lg font-extrabold rounded-md transition-colors text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                await fetch('/api/signin', { method: 'DELETE', credentials: 'include' })
                                                window.location.href = '/'
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="block w-full text-left px-4 py-3 text-lg font-extrabold rounded-md transition-colors text-red-600 hover:bg-red-50"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/signin"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-lg font-extrabold rounded-md transition-colors bg-primary text-white hover:bg-emerald-700"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default NavbarComponent