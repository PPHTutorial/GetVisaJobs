'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateSlug } from '@/lib/utils'

type JobFormData = {
  title: string
  description: string
  requirements?: string
  responsibilities?: string
  benefits?: string
  company: string
  location: string
  country?: string
  state?: string
  city?: string
  jobType: string
  employmentType: string
  experienceLevel?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  salaryType: string
  salaryMode: string
  degreeRequired?: string
  skillsRequired: string[]
  applicationUrl?: string
  applicationEmail?: string
  applicationDeadline?: string
  applicationMethod: string
  isActive: boolean
  isFeatured: boolean
  employerId?: string
  categoryId?: string
  logo?: string
}

interface Employer {
  id: string
  companyName: string
  user: {
    firstName: string
    lastName: string
  }
}

interface Category {
  id: string
  name: string
}

export function JobForm() {
  const [loading, setLoading] = useState(false)
  const [employers, setEmployers] = useState<Employer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoInputType, setLogoInputType] = useState<'url' | 'storage'>('url')
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    type: 'job' as 'job' | 'event' | 'blog',
    isActive: true,
  })
  const [categorySlugPreview, setCategorySlugPreview] = useState('')
  const [isEmployerDialogOpen, setIsEmployerDialogOpen] = useState(false)
  const [employerFormData, setEmployerFormData] = useState({
    companyName: '',
    companySize: '',
    industry: '',
    website: '',
    description: '',
    logo: '',
    address: '',
    verified: false,
  })
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormData>({
    defaultValues: {
      skillsRequired: [],
      salaryCurrency: 'GBP',
      salaryType: 'Yearly',
      salaryMode: 'RANGE',
      applicationMethod: 'INTERNAL',
      isActive: true,
      isFeatured: false,
    },
  })

  const skillsRequired = watch('skillsRequired')

  useEffect(() => {
    fetchEmployers()
    fetchCategories()
  }, [])

  // Clean up logo preview URL on unmount
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl)
      }
    }
  }, [logoPreviewUrl])

  // Handle logo input type change
  const handleLogoInputTypeChange = (type: 'url' | 'storage') => {
    setLogoInputType(type)
    // Clear previous values when switching
    if (type === 'url') {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl)
        setLogoPreviewUrl(null)
      }
      setSelectedLogoFile(null)
      setValue('logo', logoUrl)
    } else {
      setLogoUrl('')
      setValue('logo', selectedLogoFile?.name || '')
    }
  }

  // Handle file selection for storage option
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, or WebP only)')
        e.target.value = '' // Clear the input
        return
      }

      // Clean up previous preview URL
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl)
      }

      // Create new preview URL
      const previewUrl = URL.createObjectURL(file)
      setSelectedLogoFile(file)
      setLogoPreviewUrl(previewUrl)
      setValue('logo', file.name)
    }
  }

  const fetchEmployers = async () => {
    try {
      const response = await fetch('/api/dashboard/employers')
      if (response.ok) {
        const data = await response.json()
        setEmployers(data.employers || [])
      }
    } catch (error) {
      console.error('Failed to fetch employers:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/dashboard/categories?type=job')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !skillsRequired.includes(skillInput.trim())) {
      setValue('skillsRequired', [...skillsRequired, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setValue('skillsRequired', skillsRequired.filter(s => s !== skill))
  }

  const handleCategoryNameChange = (name: string) => {
    setCategoryFormData({ ...categoryFormData, name })
    if (name) {
      setCategorySlugPreview(generateSlug(name))
    } else {
      setCategorySlugPreview('')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/dashboard/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData),
      })

      if (response.ok) {
        const newCategory = await response.json()
        setCategories([...categories, newCategory.category])
        setCategoryFormData({
          name: '',
          description: '',
          type: 'job',
          isActive: true,
        })
        setCategorySlugPreview('')
        setIsCategoryDialogOpen(false)
        toast.success('Category created successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create category')
      }
    } catch (_error) {
      toast.error('Failed to create category')
    }
  }

  const handleCreateEmployer = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/dashboard/employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employerFormData),
      })

      if (response.ok) {
        const newEmployer = await response.json()
        setEmployers([...employers, newEmployer.employer])
        setEmployerFormData({
          companyName: '',
          companySize: '',
          industry: '',
          website: '',
          description: '',
          logo: '',
          address: '',
          verified: false,
        })
        setIsEmployerDialogOpen(false)
        toast.success('Employer created successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create employer')
      }
    } catch (_error) {
      toast.error('Failed to create employer')
    }
  }

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSkillInput(value)

    // Check if the input contains commas (indicating pasted text with multiple skills)
    if (value.includes(',')) {
      const skills = value.split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0 && !skillsRequired.includes(skill))

      if (skills.length > 0) {
        setValue('skillsRequired', [...skillsRequired, ...skills])
        setSkillInput('') // Clear the input after processing
      }
    }
  }

  const handleSkillPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')

    // If pasted text contains commas, process it immediately
    if (pastedText.includes(',')) {
      e.preventDefault() // Prevent the default paste behavior

      const skills = pastedText.split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0 && !skillsRequired.includes(skill))

      if (skills.length > 0) {
        setValue('skillsRequired', [...skillsRequired, ...skills])
        setSkillInput('') // Clear the input after processing
      }
    }
  }

  const onSubmit = async (data: JobFormData) => {
    console.log('Form data to submit:', data)
    setLoading(true)
    try {
      const response = await fetch('/api/dashboard/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline).toISOString() : null,
        }),
      })

      if (response.ok) {
        toast.success('Job created successfully')
        router.push('/dashboard/jobs')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create job')
      }
    } catch (error) {
      console.error('Failed to create job:', error)
      toast.error('Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
        <CardDescription>
          Fill in the job information below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g. Senior Software Engineer"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="e.g. Tech Corp Ltd"
              />
              {errors.company && (
                <p className="text-sm text-red-600">{errors.company.message}</p>
              )}

            </div>
            {/* Company Logo */}
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={logoInputType === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLogoInputTypeChange('url')}
                  >
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={logoInputType === 'storage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLogoInputTypeChange('storage')}
                  >
                    From Storage
                  </Button>

                </div>
              </div>
            </div>
            {logoInputType === 'url' ? (
              <div className="flex w-full md:col-span-2 items-center gap-4">
                <Input
                  value={logoUrl}
                  className='w-full'
                  onChange={(e) => {
                    setLogoUrl(e.target.value)
                    setValue('logo', e.target.value)
                  }}
                  placeholder="https://example.com/logo.png"
                />
                {logoUrl && (
                  <div className="flex items-center gap-2">
                    <Image
                      src={logoUrl}
                      alt="Logo preview"
                      width={38}
                      height={38}
                      className="object-contain border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoFileChange}
                    className="flex-1"
                  />
                  {logoPreviewUrl && (
                    <div className="flex items-center gap-2">
                      <Image
                        src={logoPreviewUrl}
                        alt="Logo preview"
                        width={38}
                        height={38}
                        className="object-contain border rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Select an image file from your local storage
                </p>
                {selectedLogoFile && (
                  <p className="text-sm text-green-600">
                    Selected: {selectedLogoFile.name} ({(selectedLogoFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            )}

          </div>



          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <RichTextEditor
              value={watch('description')}
              onChange={(value) => setValue('description', value)}
              placeholder="Describe the job role, responsibilities, and requirements..."
              height="200px"
              maxLength={5000}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <RichTextEditor
                value={watch('requirements') || ''}
                onChange={(value) => setValue('requirements', value)}
                placeholder="List the job requirements..."
                height="150px"
                maxLength={3000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <RichTextEditor
                value={watch('responsibilities') || ''}
                onChange={(value) => setValue('responsibilities', value)}
                placeholder="List the key responsibilities..."
                height="150px"
                maxLength={3000}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits</Label>
            <RichTextEditor
              value={watch('benefits') || ''}
              onChange={(value) => setValue('benefits', value)}
              placeholder="List the benefits and perks..."
              height="120px"
              maxLength={2000}
            />
          </div>

          {/* Location and Type */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country')}
                placeholder="e.g. United Kingdom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Region</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="e.g. England"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="e.g. London"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Full Location *</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="e.g. London, England, UK"
              />
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select onValueChange={(value) => setValue('jobType', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent className='bg-white border border-input'>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="GRADUATE">Graduate</SelectItem>
                  <SelectItem value="EXPERIENCED">Experienced</SelectItem>
                  <SelectItem value="INTERNSHIP">Internship</SelectItem>
                  <SelectItem value="APPRENTICESHIP">Apprenticeship</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="TEMPORARY">Temporary</SelectItem>
                  <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="ON_SITE">On Site</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="FREELANCE">Freelance</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type *</Label>
              <Input
                id="employmentType"
                {...register('employmentType')}
                placeholder="e.g. Full-time, Part-time"
              />
              {errors.employmentType && (
                <p className="text-sm text-red-600">{errors.employmentType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Input
                id="experienceLevel"
                {...register('experienceLevel')}
                placeholder="e.g. 2-5 years"
              />
            </div>
          </div>

          {/* Salary Information */}
          <div className="space-y-4">
            <Label className='font-bold text-lg'>Salary Information</Label>

            {/* Salary Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMode">Salary Type</Label>
                <Select onValueChange={(value) => setValue('salaryMode', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select salary type" />
                  </SelectTrigger>
                  <SelectContent className='bg-white border border-input'>
                    <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                    <SelectItem value="FIXED">Fixed Salary</SelectItem>
                    <SelectItem value="RANGE">Salary Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Salary Inputs */}
              {watch('salaryMode') === 'FIXED' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Salary Amount</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      {...register('salaryMin', { valueAsNumber: true })}
                      placeholder="30000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryCurrency">Currency</Label>
                    <Select onValueChange={(value) => setValue('salaryCurrency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="GBP" />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-input'>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {watch('salaryMode') === 'RANGE' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum Salary</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      {...register('salaryMin', { valueAsNumber: true })}
                      placeholder="25000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum Salary</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      {...register('salaryMax', { valueAsNumber: true })}
                      placeholder="35000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryCurrency">Currency</Label>
                    <Select onValueChange={(value) => setValue('salaryCurrency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="GBP" />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-input'>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Salary Type (only show for FIXED and RANGE modes) */}
              {(watch('salaryMode') === 'FIXED' || watch('salaryMode') === 'RANGE') && (
                <div className="space-y-2">
                  <Label htmlFor="salaryType">Payment Period</Label>
                  <Select onValueChange={(value) => setValue('salaryType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Yearly" />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-input'>
                      <SelectItem value="Hourly">Hourly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Skills Required</Label>
              <div className="flex space-x-2">
                <Input
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  onPaste={handleSkillPaste}
                  placeholder="Add a skill... (or paste multiple skills separated by commas)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="col-span-2 flex flex-wrap gap-2 mt-6">
              {skillsRequired.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1 h-max">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Application Method */}
          <div className="space-y-3">
            <Label>Application Method *</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="applicationMethodInternal"
                  value="INTERNAL"
                  {...register('applicationMethod')}
                  className="w-4 h-4 text-accent-600 bg-gray-100 border-gray-300 focus:ring-accent-500 accent-accent"
                />
                <Label htmlFor="applicationMethodInternal" className="text-sm font-normal">
                  Apply on this platform
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="applicationMethodExternal"
                  value="EXTERNAL"
                  {...register('applicationMethod')}
                  className="w-4 h-4 text-accent-600 bg-gray-100 border-gray-300 focus:ring-accent-500 accent-accent"
                />
                <Label htmlFor="applicationMethodExternal" className="text-sm font-normal">
                  Apply on employer&apos;s website
                </Label>
              </div>
            </div>
            {errors.applicationMethod && (
              <p className="text-sm text-red-600">{errors.applicationMethod.message}</p>
            )}
          </div>

          {/* Application Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicationUrl">Application URL</Label>
              <Input
                id="applicationUrl"
                {...register('applicationUrl')}
                placeholder="https://company.com/apply"
              />
              {errors.applicationUrl && (
                <p className="text-sm text-red-600">{errors.applicationUrl.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationEmail">Application Email</Label>
              <Input
                id="applicationEmail"
                type="email"
                {...register('applicationEmail')}
                placeholder="jobs@company.com"
              />
              {errors.applicationEmail && (
                <p className="text-sm text-red-600">{errors.applicationEmail.message}</p>
              )}
            </div>
          </div>



          {/* Employer and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employerId">Employer</Label>
              <div className="flex gap-2">
                <Select onValueChange={(value) => setValue('employerId', value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select employer" />
                  </SelectTrigger>
                  <SelectContent className='bg-white border border-input'>
                    {employers.map((employer) => (
                      <SelectItem key={employer.id} value={employer.id}>
                        {employer.companyName} ({employer.user.firstName} {employer.user.lastName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isEmployerDialogOpen} onOpenChange={setIsEmployerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Employer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateEmployer} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="employerCompanyName">Company Name *</Label>
                          <Input
                            id="employerCompanyName"
                            value={employerFormData.companyName}
                            onChange={(e) => setEmployerFormData({ ...employerFormData, companyName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employerIndustry">Industry</Label>
                          <Input
                            id="employerIndustry"
                            value={employerFormData.industry}
                            onChange={(e) => setEmployerFormData({ ...employerFormData, industry: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="employerDescription">Company Description</Label>
                        <Textarea
                          id="employerDescription"
                          value={employerFormData.description}
                          onChange={(e) => setEmployerFormData({ ...employerFormData, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="employerWebsite">Website</Label>
                          <Input
                            id="employerWebsite"
                            type="url"
                            value={employerFormData.website}
                            onChange={(e) => setEmployerFormData({ ...employerFormData, website: e.target.value })}
                            placeholder="https://company.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employerAddress">Address</Label>
                          <Input
                            id="employerAddress"
                            value={employerFormData.address}
                            onChange={(e) => setEmployerFormData({ ...employerFormData, address: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="employerCompanySize">Company Size</Label>
                          <Select value={employerFormData.companySize} onValueChange={(value) => setEmployerFormData({ ...employerFormData, companySize: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent className='bg-white border border-input'>
                              <SelectItem value="STARTUP_1_10">Startup (1-10 employees)</SelectItem>
                              <SelectItem value="SMALL_11_50">Small (11-50 employees)</SelectItem>
                              <SelectItem value="MEDIUM_51_200">Medium (51-200 employees)</SelectItem>
                              <SelectItem value="LARGE_201_1000">Large (201-1000 employees)</SelectItem>
                              <SelectItem value="ENTERPRISE_1000_PLUS">Enterprise (1000+ employees)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employerLogo">Logo URL</Label>
                          <Input
                            id="employerLogo"
                            type="url"
                            value={employerFormData.logo}
                            onChange={(e) => setEmployerFormData({ ...employerFormData, logo: e.target.value })}
                            placeholder="https://company.com/logo.png"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="employerVerified"
                          checked={employerFormData.verified}
                          onChange={(e) => setEmployerFormData({ ...employerFormData, verified: e.target.checked })}
                          className="rounded border-gray-300 accent-accent"
                        />
                        <Label htmlFor="employerVerified">Verified Employer</Label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsEmployerDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Create Employer
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <div className="flex gap-2">
                <Select onValueChange={(value) => setValue('categoryId', value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className='bg-white border border-input'>
                    {categories.map((category) => (
                      <SelectItem key={category?.id || Date.now().toLocaleString()} value={category?.id || Date.now().toLocaleString()}>
                        {category?.name || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryName">Name *</Label>
                        <Input
                          id="categoryName"
                          value={categoryFormData.name}
                          onChange={(e) => handleCategoryNameChange(e.target.value)}
                          required
                        />
                        {categorySlugPreview && (
                          <p className="text-sm text-muted-foreground">
                            Slug: <code className="bg-gray-100 px-1 rounded">{categorySlugPreview}</code>
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoryDescription">Description</Label>
                        <Textarea
                          id="categoryDescription"
                          value={categoryFormData.description}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoryType">Type *</Label>
                        <Select value={categoryFormData.type} onValueChange={(value) => setCategoryFormData({ ...categoryFormData, type: value as any })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className='bg-white border border-input'>
                            <SelectItem value="job">Jobs</SelectItem>
                            <SelectItem value="event">Events</SelectItem>
                            <SelectItem value="blog">Blogs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="categoryIsActive"
                          checked={categoryFormData.isActive}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                          className="rounded accent-accent"
                        />
                        <Label htmlFor="categoryIsActive">Active</Label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Create Category</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                type="datetime-local"
                {...register('applicationDeadline')}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked as boolean)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFeatured"
                checked={watch('isFeatured')}
                onCheckedChange={(checked) => setValue('isFeatured', checked as boolean)}
              />
              <Label htmlFor="isFeatured">Featured</Label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/jobs')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Job'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}