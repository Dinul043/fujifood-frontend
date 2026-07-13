'use client'

import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
  background?: 'default' | 'surface' | 'muted' | 'primary'
}

const spacingStyles = {
  sm: 'py-8 sm:py-12',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-24',
  xl: 'py-20 sm:py-32',
}

const backgroundStyles = {
  default: 'bg-background',
  surface: 'bg-surface',
  muted:   'bg-neutral-50',
  primary: 'bg-brand-primary/5',
}

export function Section({
  className,
  spacing = 'lg',
  background = 'default',
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(spacingStyles[spacing], backgroundStyles[background], className)}
      {...props}
    >
      {children}
    </section>
  )
}
