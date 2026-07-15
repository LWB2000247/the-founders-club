import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-[var(--color-border)] bg-[var(--color-gold)] text-black',
        secondary: 'border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-muted)]',
        destructive: 'border-[var(--color-border)] bg-[var(--color-error)] text-white',
        outline: 'text-[var(--color-text)] border-[var(--color-border)] bg-transparent',
        success: 'border-[var(--color-border)] bg-[var(--color-success)] text-white',
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
