import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-2 border-[var(--color-border)] bg-[var(--color-gold)] text-black hover:bg-[var(--color-gold-hover)] shadow-[3px_3px_0_0_var(--color-border)] hover:shadow-[4px_4px_0_0_var(--color-border)] hover:-translate-x-px hover:-translate-y-px active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
        destructive:
          'border-2 border-[var(--color-border)] bg-[var(--color-error)] text-white hover:opacity-90',
        outline:
          'border-2 border-[var(--color-border)] bg-transparent hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] text-[var(--color-text)]',
        secondary:
          'border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text)] hover:bg-[var(--color-border)] hover:text-[var(--color-bg)]',
        ghost:
          'hover:bg-[var(--color-bg-muted)] text-[var(--color-text)]',
        link: 'text-[var(--color-gold-hover)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
