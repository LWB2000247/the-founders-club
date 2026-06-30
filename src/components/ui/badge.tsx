import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--color-gold)] text-black',
        secondary: 'border-transparent bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]',
        destructive: 'border-transparent bg-red-600 text-white',
        outline: 'text-[var(--color-text)] border-[var(--color-border)]',
        success: 'border-transparent bg-green-700 text-green-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
