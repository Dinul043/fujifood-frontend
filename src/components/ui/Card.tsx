'use client'

import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'elevated' | 'outline' | 'ghost'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantStyles: Record<CardVariant, string> = {
  default:  'bg-surface border border-border shadow-xs',
  elevated: 'bg-surface shadow-md hover:shadow-lg',
  outline:  'bg-transparent border border-border',
  ghost:    'bg-transparent',
}

const paddingStyles = {
  none: 'p-0',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--r-lg)] transition-all duration-200 overflow-hidden',
          variantStyles[variant],
          hover && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

/* Card sub-components for compound pattern */
export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center pt-3', className)} {...props}>
      {children}
    </div>
  )
}
