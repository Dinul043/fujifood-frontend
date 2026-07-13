'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: boolean
}

export function Skeleton({ className, width, height, rounded = false }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        rounded ? 'rounded-full' : 'rounded-[var(--r-md)]',
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
