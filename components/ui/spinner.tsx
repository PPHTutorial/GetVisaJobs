import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-gray-300 border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      color: {
        default: 'border-gray-300 border-t-gray-600',
        primary: 'border-emerald-200 border-t-emerald-600',
        white: 'border-white/30 border-t-white',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'default',
    },
  }
)

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, color, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, color }), className)}
        {...props}
      />
    )
  }
)
Spinner.displayName = 'Spinner'

export { Spinner, spinnerVariants }