'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { cn } from '../lib/utils'

interface BlurDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  title?: string
  description?: string
  className?: string
  contentClassName?: string
}

export function BlurDialog({
  children,
  open,
  onOpenChange,
  trigger,
  title,
  description,
  className,
  contentClassName,
}: BlurDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          // Enhanced blur and transparency effects
          'backdrop-blur-md bg-white/90 dark:bg-gray-900/90',
          'border border-white/20 dark:border-gray-700/50',
          'shadow-2xl shadow-black/10 dark:shadow-black/40',
          // Smooth animations
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          contentClassName
        )}
      >
        {(title || description) && (
          <DialogHeader>
            {title && (
              <DialogTitle className="text-emerald-800 dark:text-emerald-200">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className={cn('py-4', className)}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Specialized dialog for UK Visa Jobs forms
export function FormDialog({
  children,
  open,
  onOpenChange,
  trigger,
  title,
  description,
}: Omit<BlurDialogProps, 'className' | 'contentClassName'>) {
  return (
    <BlurDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      description={description}
      contentClassName="max-w-md"
    >
      {children}
    </BlurDialog>
  )
}

// Specialized dialog for confirmations
export function ConfirmDialog({
  children,
  open,
  onOpenChange,
  trigger,
  title = 'Confirm Action',
  description,
}: Omit<BlurDialogProps, 'className' | 'contentClassName'>) {
  return (
    <BlurDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      title={title}
      description={description}
      contentClassName="max-w-sm"
    >
      {children}
    </BlurDialog>
  )
}