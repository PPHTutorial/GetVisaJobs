'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MapPin, Bookmark, GraduationCap, Search, Filter, X } from 'lucide-react'
import NavbarComponent from '@/components/ui/navbar'
import Footer from '@/components/footer'
import { formatSalary, getCompanyDisplayName, type Job } from '@/lib/homepage-data'

interface Category {
  id: string
  name: string
  slug: string
}

function JobsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State management
  const [jobs, setJobs] = useState<Job[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalJobs, setTotalJobs] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '')
  const [selectedJobType, setSelectedJobType] = useState(searchParams.get('jobType') || '')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState(searchParams.get('employmentType') || '')
  const [selectedSalaryRange, setSelectedSalaryRange] = useState(searchParams.get('salaryRange') || '')
  const [showFilters, setShowFilters] = useState(false)

  // Available filter options
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']
  const employmentTypes = ['Permanent', 'Temporary', 'Contract', 'Freelance']
  const salaryRanges = [
    '0-30000',
    '30000-50000',
    '50000-70000',
    '70000-100000',
    '100000+'
  ]
  const locations = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh', 'Bristol', 'Newcastle']

  // Fetch data
  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        status: 'active'
      })

      if (searchTerm) params.set('search', searchTerm)
      if (selectedCategory) params.set('categoryId', selectedCategory)
      if (selectedLocation) params.set('location', selectedLocation)
      if (selectedJobType) params.set('jobType', selectedJobType)
      if (selectedEmploymentType) params.set('employmentType', selectedEmploymentType)
      if (selectedSalaryRange) {
        const [min, max] = selectedSalaryRange.split('-')
        if (min) params.set('salaryMin', min)
        if (max && max !== '+') params.set('salaryMax', max)
      }

      const response = await fetch(`/api/dashboard/jobs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
        setTotalJobs(data.pagination?.total || 0)
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, selectedCategory, selectedLocation, selectedJobType, selectedEmploymentType, selectedSalaryRange])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  // Effects
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedLocation) params.set('location', selectedLocation)
    if (selectedJobType) params.set('jobType', selectedJobType)
    if (selectedEmploymentType) params.set('employmentType', selectedEmploymentType)
    if (selectedSalaryRange) params.set('salaryRange', selectedSalaryRange)

    const newUrl = params.toString() ? `/jobs?${params}` : '/jobs'
    router.replace(newUrl, { scroll: false })
  }, [searchTerm, selectedCategory, selectedLocation, selectedJobType, selectedEmploymentType, selectedSalaryRange, router])

  // Handlers
  const handleSearch = () => {
    setCurrentPage(1)
    fetchJobs()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedLocation('')
    setSelectedJobType('')
    setSelectedEmploymentType('')
    setSelectedSalaryRange('')
    setCurrentPage(1)
  }

  const handleJobClick = (jobId: string) => {
    router.push(`/jobs/${jobId}`)
  }

  const activeFiltersCount = [
    searchTerm,
    selectedCategory,
    selectedLocation,
    selectedJobType,
    selectedEmploymentType,
    selectedSalaryRange
  ].filter(Boolean).length

  return (
    <div className="min-h-screen">
      <NavbarComponent />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50/10 to-emerald-100/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
            <p className="text-xl text-gray-600 mb-8">Discover visa-sponsored opportunities across the globe</p>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                {/* Search Input */}
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium">Job Title or Keywords</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="e.g. Software Engineer, Marketing Manager"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="flex-1">
                  <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="flex-1">
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button */}
                <Button onClick={handleSearch} className="px-8">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                {activeFiltersCount > 0 && (
                  <Button variant="ghost" onClick={handleClearFilters} className="text-sm">
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Job Type */}
                  <div>
                    <Label className="text-sm font-medium">Job Type</Label>
                    <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Employment Type */}
                  <div>
                    <Label className="text-sm font-medium">Employment Type</Label>
                    <Select value={selectedEmploymentType} onValueChange={setSelectedEmploymentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <Label className="text-sm font-medium">Salary Range</Label>
                    <Select value={selectedSalaryRange} onValueChange={setSelectedSalaryRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any salary range" />
                      </SelectTrigger>
                      <SelectContent>
                        {salaryRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range === '100000+' ? '£100,000+' : `£${range.replace('-', ' - £')}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="text-center text-gray-600">
              <p>Showing {jobs.length} of {totalJobs} jobs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading jobs...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600">No jobs found matching your criteria.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleJobClick(job.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xl">⚡</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-orange-500 font-semibold mb-2">
                            {getCompanyDisplayName(job)}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <GraduationCap className="w-4 h-4 mr-1" />
                              {job.category?.name || 'Not specified'}
                            </div>
                            <div className="flex items-center">
                              <span>{formatSalary(job)}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {job.salaryType || 'Full-time'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <Bookmark className="w-5 h-5 text-neutral-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function JobsPageWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading jobs...</div>}>
      <JobsPageContent />
    </Suspense>
  )
}