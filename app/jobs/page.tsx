'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { MapPin, Bookmark, GraduationCap, Search, X, SlidersHorizontal } from 'lucide-react'
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
    const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '')
    const [selectedState, setSelectedState] = useState(searchParams.get('state') || '')
    const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '')
    const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(searchParams.get('jobTypes')?.split(',') || [])
    const [selectedEmploymentType, setSelectedEmploymentType] = useState(searchParams.get('employmentType') || '')
    const [selectedExperienceLevel, setSelectedExperienceLevel] = useState(searchParams.get('experienceLevel') || '')
    const [salaryMin, setSalaryMin] = useState(searchParams.get('salaryMin') || '')
    const [salaryMax, setSalaryMax] = useState(searchParams.get('salaryMax') || '')
    const [selectedDegreeRequired, setSelectedDegreeRequired] = useState(searchParams.get('degreeRequired') || '')
    const [selectedSkills, setSelectedSkills] = useState<string[]>(searchParams.get('skills')?.split(',') || [])
    const [selectedApplicationMethod, setSelectedApplicationMethod] = useState(searchParams.get('applicationMethod') || '')
    const [isFeatured, setIsFeatured] = useState(searchParams.get('isFeatured') === 'true')
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc')
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    // Available filter options
    const jobTypes = [
        'STUDENT', 'GRADUATE', 'EXPERIENCED', 'INTERNSHIP', 'APPRENTICESHIP',
        'CONTRACT', 'TEMPORARY', 'VOLUNTEER', 'PART_TIME', 'FULL_TIME',
        'REMOTE', 'ON_SITE', 'HYBRID', 'FREELANCE', 'OTHER'
    ]
    const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Freelance']
    const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive', 'Not Specified']
    const degreeRequirements = ['None', 'High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Not Specified']
    const applicationMethods = ['INTERNAL', 'EXTERNAL']
    const sortOptions = [
        { value: 'createdAt', label: 'Date Posted' },
        { value: 'salaryMin', label: 'Salary (Low to High)' },
        { value: 'salaryMax', label: 'Salary (High to Low)' },
        { value: 'title', label: 'Job Title' },
        { value: 'company', label: 'Company Name' }
    ]
    const countries = ['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 'Ireland']
    const commonSkills = [
        'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Java', 'C#', '.NET',
        'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'Agile',
        'Project Management', 'Data Analysis', 'Machine Learning', 'DevOps', 'UI/UX Design'
    ]

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
            if (selectedCountry) params.set('country', selectedCountry)
            if (selectedState) params.set('state', selectedState)
            if (selectedCity) params.set('city', selectedCity)
            if (selectedJobTypes.length > 0) params.set('jobTypes', selectedJobTypes.join(','))
            if (selectedEmploymentType) params.set('employmentType', selectedEmploymentType)
            if (selectedExperienceLevel) params.set('experienceLevel', selectedExperienceLevel)
            if (salaryMin) params.set('salaryMin', salaryMin)
            if (salaryMax) params.set('salaryMax', salaryMax)
            if (selectedDegreeRequired) params.set('degreeRequired', selectedDegreeRequired)
            if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','))
            if (selectedApplicationMethod) params.set('applicationMethod', selectedApplicationMethod)
            if (isFeatured) params.set('isFeatured', 'true')
            if (sortBy) params.set('sortBy', sortBy)
            if (sortOrder) params.set('sortOrder', sortOrder)

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
    }, [currentPage, searchTerm, selectedCategory, selectedLocation, selectedCountry, selectedState, selectedCity, selectedJobTypes, selectedEmploymentType, selectedExperienceLevel, salaryMin, salaryMax, selectedDegreeRequired, selectedSkills, selectedApplicationMethod, isFeatured, sortBy, sortOrder])

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
        if (selectedCountry) params.set('country', selectedCountry)
        if (selectedState) params.set('state', selectedState)
        if (selectedCity) params.set('city', selectedCity)
        if (selectedJobTypes.length > 0) params.set('jobTypes', selectedJobTypes.join(','))
        if (selectedEmploymentType) params.set('employmentType', selectedEmploymentType)
        if (selectedExperienceLevel) params.set('experienceLevel', selectedExperienceLevel)
        if (salaryMin) params.set('salaryMin', salaryMin)
        if (salaryMax) params.set('salaryMax', salaryMax)
        if (selectedDegreeRequired) params.set('degreeRequired', selectedDegreeRequired)
        if (selectedSkills.length > 0) params.set('skills', selectedSkills.join(','))
        if (selectedApplicationMethod) params.set('applicationMethod', selectedApplicationMethod)
        if (isFeatured) params.set('isFeatured', 'true')
        if (sortBy !== 'createdAt') params.set('sortBy', sortBy)
        if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)

        const newUrl = params.toString() ? `/jobs?${params}` : '/jobs'
        router.replace(newUrl, { scroll: false })
    }, [searchTerm, selectedCategory, selectedLocation, selectedCountry, selectedState, selectedCity, selectedJobTypes, selectedEmploymentType, selectedExperienceLevel, salaryMin, salaryMax, selectedDegreeRequired, selectedSkills, selectedApplicationMethod, isFeatured, sortBy, sortOrder, router])

    // Handlers
    const handleSearch = () => {
        setCurrentPage(1)
        fetchJobs()
    }

    const handleClearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('')
        setSelectedLocation('')
        setSelectedCountry('')
        setSelectedState('')
        setSelectedCity('')
        setSelectedJobTypes([])
        setSelectedEmploymentType('')
        setSelectedExperienceLevel('')
        setSalaryMin('')
        setSalaryMax('')
        setSelectedDegreeRequired('')
        setSelectedSkills([])
        setSelectedApplicationMethod('')
        setIsFeatured(false)
        setSortBy('createdAt')
        setSortOrder('desc')
        setCurrentPage(1)
    }

    const handleJobClick = (jobId: string) => {
        router.push(`/jobs/${jobId}`)
    }

    const activeFiltersCount = [
        searchTerm,
        selectedCategory,
        selectedLocation,
        selectedCountry,
        selectedState,
        selectedCity,
        ...selectedJobTypes,
        selectedEmploymentType,
        selectedExperienceLevel,
        salaryMin,
        salaryMax,
        selectedDegreeRequired,
        ...selectedSkills,
        selectedApplicationMethod,
        isFeatured ? 'featured' : ''
    ].filter(Boolean).length

    return (
        <div className="min-h-screen">
            <NavbarComponent />

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-28">
                <div className="flex gap-8 pt-8">
                    {/* Vertical Filter Sidebar - Hidden on mobile/tablet */}
                    <div className={`w-80 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden'} lg:block transition-all duration-500 ease-in-out`}>
                        <div className="bg-white rounded-lg shadow-sm border border-input p-4 sticky top-8 h-screen overflow-y-auto">
                            <div className="flex items-center justify-between mb-4 w-full">
                                <h3 className="text-lg font-semibold">Filters</h3>
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="hidden lg:block w-5 h-5 text-gray-400" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowMobileFilters(false)}
                                        className="lg:hidden"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        {/* Sort Options */}
                        <>
                            <div className="mb-6">
                                <Label className="text-sm font-medium mb-3 block">Sort By</Label>
                                <div className="space-y-2">
                                    {sortOptions.map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id={`sort-${option.value}`}
                                                name="sort"
                                                value={option.value}
                                                checked={sortBy === option.value}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="text-emerald-600 focus:ring-emerald-500 accent-accent"
                                            />
                                            <Label htmlFor={`sort-${option.value}`} className="text-sm cursor-pointer">
                                                {option.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center space-x-2 mt-2">
                                    <input
                                        type="radio"
                                        id="sort-asc"
                                        name="sortOrder"
                                        value="asc"
                                        checked={sortOrder === 'asc'}
                                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                        className="text-emerald-600 focus:ring-emerald-500 accent-accent"
                                    />
                                    <Label htmlFor="sort-asc" className="text-sm cursor-pointer">Ascending</Label>
                                    <input
                                        type="radio"
                                        id="sort-desc"
                                        name="sortOrder"
                                        value="desc"
                                        checked={sortOrder === 'desc'}
                                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                        className="text-emerald-600 focus:ring-emerald-500 ml-4 accent-accent"
                                    />
                                    <Label htmlFor="sort-desc" className="text-sm cursor-pointer">Descending</Label>
                                </div>
                            </div>

                            {/* Job Types */}
                            <div className="mb-6">
                                <Label className="text-sm font-medium mb-3 block">Job Type</Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {jobTypes.slice(0, 8).map((type) => (
                                        <div key={type} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`jobtype-${type}`}
                                                checked={selectedJobTypes.includes(type)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedJobTypes([...selectedJobTypes, type])
                                                    } else {
                                                        setSelectedJobTypes(selectedJobTypes.filter(t => t !== type))
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`jobtype-${type}`} className="text-sm cursor-pointer">
                                                {type.replace('_', ' ')}
                                            </Label>
                                        </div>
                                    ))}
                                    {jobTypes.length > 8 && (
                                        <Button variant="ghost" size="sm" className="text-xs w-full mt-2">
                                            View More ({jobTypes.length - 8} more)
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex-1 mb-6">
                                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {countries.map((country) => (
                                            <SelectItem key={country} value={country}>
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Category */}
                            <div className="flex-1 mb-6">
                                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Employment Type */}
                            <div className="mb-6">
                                <Label className="text-sm font-medium mb-3 block">Employment Type</Label>
                                <Select value={selectedEmploymentType} onValueChange={setSelectedEmploymentType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any employment type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {employmentTypes.map((type) => (
                                            <SelectItem key={type} value={type || ""}>
                                                {type || ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Experience Level */}
                            <div className="mb-6">
                                <Label className="text-sm font-medium mb-3 block">Experience Level</Label>
                                <Select value={selectedExperienceLevel} onValueChange={setSelectedExperienceLevel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any experience level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">

                                        {experienceLevels.map((level) => (
                                            <SelectItem key={level} value={level}>
                                                {level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Salary Range */}
                            <div className="mb-6">
                                <Label className="text-sm font-medium mb-3 block">Salary Range (GBP)</Label>
                                <div className="space-y-2">
                                    <div>
                                        <Label htmlFor="salaryMin" className="text-xs text-gray-600">Minimum</Label>
                                        <Input
                                            id="salaryMin"
                                            type="number"
                                            placeholder="0"
                                            value={salaryMin}
                                            onChange={(e) => setSalaryMin(e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="salaryMax" className="text-xs text-gray-600">Maximum</Label>
                                        <Input
                                            id="salaryMax"
                                            type="number"
                                            placeholder="No limit"
                                            value={salaryMax}
                                            onChange={(e) => setSalaryMax(e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Degree Required */}
                            <div className="mb-6">
                                <Label className="text-sm font-medium mb-3 block">Degree Required</Label>
                                <Select value={selectedDegreeRequired} onValueChange={setSelectedDegreeRequired}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any degree requirement" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">

                                        {degreeRequirements.map((degree) => (
                                            <SelectItem key={degree} value={degree}>
                                                {degree}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Skills */}
                            <div className="mb-6">
                                <Label className="text-sm font-medium mb-3 block">Required Skills</Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {commonSkills.slice(0, 10).map((skill) => (
                                        <div key={skill} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`skill-${skill}`}
                                                checked={selectedSkills.includes(skill)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedSkills([...selectedSkills, skill])
                                                    } else {
                                                        setSelectedSkills(selectedSkills.filter(s => s !== skill))
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`skill-${skill}`} className="text-sm cursor-pointer">
                                                {skill}
                                            </Label>
                                        </div>
                                    ))}
                                    {commonSkills.length > 10 && (
                                        <Button variant="ghost" size="sm" className="text-xs w-full mt-2">
                                            View More ({commonSkills.length - 10} more)
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Application Method */}
                            <div className="mb-6">
                                <Label className="text-sm font-medium mb-3 block">Application Method</Label>
                                <Select value={selectedApplicationMethod} onValueChange={setSelectedApplicationMethod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any application method" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">

                                        {applicationMethods.map((method) => (
                                            <SelectItem key={method} value={method}>
                                                {method}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Featured Only */}
                            <div className="mb-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="featured"
                                        checked={isFeatured}
                                        onCheckedChange={(checked) => setIsFeatured(checked === true)}
                                    />
                                    <Label htmlFor="featured" className="text-sm cursor-pointer">
                                        Featured jobs only
                                    </Label>
                                </div>
                            </div>

                            {/* Apply Filters Button */}
                            <Button onClick={handleSearch} className="w-full">
                                Apply Filters
                            </Button>
                        </>
                        </div>

                    </div>
                {/* Right Side Content */}
                <div className="flex-1 min-w-0">
                    {/* Search Bar - Above Job Listings */}
                    <div className="bg-white rounded-lg  mb-6">
                        <div className="flex  gap-4 items-end">
                            {/* Search Input */}
                            <div className="flex-1">
                                <Label htmlFor="search" className="sticky hidden lg:block text-sm font-medium">Job Title or Keywords</Label>
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

                            {/* Search Button */}
                            <Button onClick={handleSearch} className="px-4 lg:px-8">
                                <Search className="w-4 h-4 " />
                                Search
                            </Button>

                            {/* Mobile Filter Button */}
                            <Button
                                variant="ghost"
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden"
                            >
                                <SlidersHorizontal className="w-4 h-4 " />
                                
                                {activeFiltersCount > 0 && (
                                    <Badge variant="secondary" className="">
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                            </Button>
                        </div>

                        {/* Active Filters Display */}
                        {activeFiltersCount > 0 && (
                            <div className="flex items-center gap-2 pt-4 border-t mt-4">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                <div className="flex flex-wrap gap-2">
                                    {searchTerm && (
                                        <Badge variant="secondary" className="text-xs">
                                            Search: {searchTerm}
                                            <X
                                                className="w-3 h-3 ml-1 cursor-pointer"
                                                onClick={() => setSearchTerm('')}
                                            />
                                        </Badge>
                                    )}
                                    {selectedCategory && (
                                        <Badge variant="secondary" className="text-xs">
                                            Category: {categories.find(c => c.id === selectedCategory)?.name}
                                            <X
                                                className="w-3 h-3 ml-1 cursor-pointer"
                                                onClick={() => setSelectedCategory('')}
                                            />
                                        </Badge>
                                    )}
                                    {selectedLocation && (
                                        <Badge variant="secondary" className="text-xs">
                                            Location: {selectedLocation}
                                            <X
                                                className="w-3 h-3 ml-1 cursor-pointer"
                                                onClick={() => setSelectedLocation('')}
                                            />
                                        </Badge>
                                    )}
                                    {selectedJobTypes.length > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                            Job Types: {selectedJobTypes.length}
                                            <X
                                                className="w-3 h-3 ml-1 cursor-pointer"
                                                onClick={() => setSelectedJobTypes([])}
                                            />
                                        </Badge>
                                    )}
                                    {selectedEmploymentType && (
                                        <Badge variant="secondary" className="text-xs">
                                            Employment: {selectedEmploymentType}
                                            <X
                                                className="w-3 h-3 ml-1 cursor-pointer"
                                                onClick={() => setSelectedEmploymentType('')}
                                            />
                                        </Badge>
                                    )}
                                    {(salaryMin || salaryMax) && (
                                        <Badge variant="secondary" className="text-xs">
                                            Salary: {salaryMin || '0'} - {salaryMax || '∞'}
                                            <X
                                                className="w-3 h-3 ml-1 cursor-pointer"
                                                onClick={() => { setSalaryMin(''); setSalaryMax(''); }}
                                            />
                                        </Badge>
                                    )}
                                    {isFeatured && (
                                        <Badge variant="secondary" className="text-xs">
                                            Featured Only
                                            <X
                                                className="w-3 h-3 ml-1 cursor-pointer"
                                                onClick={() => setIsFeatured(false)}
                                            />
                                        </Badge>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs ml-auto">
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Jobs List */}
                    <div>
                        {/* Results Summary */}
                        <div className="mb-6">
                            <p className="text-gray-600">
                                Showing {jobs.length} of {totalJobs} jobs
                                {activeFiltersCount > 0 && ` (${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied)`}
                            </p>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="text-gray-600">Loading jobs...</div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-600">No jobs found matching your criteria.</div>
                                {activeFiltersCount > 0 && (
                                    <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                                        Clear all filters
                                    </Button>
                                )}
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
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                                    {job.title}
                                                                </h3>
                                                                <p className="text-orange-500 font-semibold mb-2">
                                                                    {getCompanyDisplayName(job)}
                                                                </p>
                                                            </div>
                                                            {job.isFeatured && (
                                                                <Badge className="bg-orange-500 text-white ml-4">Featured</Badge>
                                                            )}
                                                        </div>
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
                                                                {job.employmentType || 'Full-time'}
                                                            </Badge>
                                                            {job.jobType && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {job.jobType.replace('_', ' ')}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="ml-4">
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
                </div>
                </div>

            </div>

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