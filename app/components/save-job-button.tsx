'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bookmark, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SaveJobButtonProps {
  jobId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function SaveJobButton({ jobId, variant = 'outline', size = 'default', className = '' }: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if job is saved
    const checkSavedStatus = async () => {
      try {
        const response = await fetch('/api/user/saved-jobs')
        if (response.ok) {
          const data = await response.json()
          setIsSaved(data.savedJobs.some((job: any) => job.id === jobId))
        }
      } catch (error) {
        console.error('Error checking saved status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSavedStatus()
  }, [jobId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = isSaved ? 'DELETE' : 'POST'
      const response = await fetch(`/api/user/saved-jobs?jobId=${jobId}`, {
        method,
      })

      if (response.ok) {
        setIsSaved(!isSaved)
        toast.success(isSaved ? 'Job removed from saved jobs' : 'Job saved successfully')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save job')
      }
    } catch (error) {
      console.error('Error saving job:', error)
      toast.error('Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSave}
      disabled={saving}
      className={`${className} ${isSaved ? 'text-primary hover:text-primary' : ''}`}
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      )}
      {size !== 'icon' && (
        <span className="ml-2">{isSaved ? 'Saved' : 'Save'}</span>
      )}
    </Button>
  )
}