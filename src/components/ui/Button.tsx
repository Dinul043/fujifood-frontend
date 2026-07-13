'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-primary text-white hover:brightness-110 active:brightness-95 shadow-sm hover:shadow-md',
  secondary:
    'bg-brand-secondary text-white hover:opacity-90 active:opacity-80',
  outline:
    'border-2 border-brand-primary text-brand-primary bg-transparent hover:bg-brand-primary/5 active:bg-brand-primary/10',
  ghost:
    'text-text-muted bg-transparent hover:bg-neutral-100 active:bg-neutral-200',
  danger:
    'bg-error text-white hover:brightness-110 active:brightness-95',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-[var(--r-md)]',
  md: 'h-10 px-4 text-sm gap-2 rounded-[var(--r-md)]',
  lg: 'h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base gap-2 rounded-[var(--r-lg)]',
  xl: 'h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-lg gap-2.5 rounded-[var(--r-lg)]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary',
          'disabled:opacity-50 disabled:pointer-events-none',
          'select-none whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    )
  }
)

Button.displayName = 'Button'
