import { BriefcaseBusiness, Search, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const NavbarComponent =  () => {
    
    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-neutral-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-end h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 mr-auto">
                        <div className="relative w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <BriefcaseBusiness className="w-6 h-6 text-primary-foreground" />
                            <Search className="absolute right-2 bottom-1 w-4 h-4 text-emerald-300" />
                        </div>
                        <span className="text-2xl font-extrabold text-black">Get Visa Jobs</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-12 mr-16">
                        <Link href="/" className="text-primary font-extrabold text-lg hover:text-emerald-800 transition-colors">
                            Home
                        </Link>
                        <Link href="/jobs" className="text-gray-700 font-extrabold text-lg hover:text-emerald-600 transition-colors">
                            Jobs
                        </Link>
                        <Link href="/events" className="text-gray-700 font-extrabold text-lg hover:text-emerald-600 transition-colors">
                            Events
                        </Link>
                        <Link href="/resources" className="text-gray-700 font-extrabold text-lg hover:text-emerald-600 transition-colors">
                            Resources
                        </Link>
                        <Link href="/faqs" className="text-gray-700 font-extrabold text-lg hover:text-emerald-600 transition-colors">
                            FAQs
                        </Link>
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center space-x-2">
                        <button className="p-2">
                            <div className="group w-5 h-6 flex flex-col justify-center space-y-1">
                                <div className="w-full h-0.5 bg-gray-600"></div>
                                <div className="w-full h-0.5 bg-gray-600 group-hover:-translate-x-3 transition-transform ease-in-out duration-500"></div>
                                <div className="w-full h-0.5 bg-gray-600"></div>
                            </div>
                        </button>
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default NavbarComponent