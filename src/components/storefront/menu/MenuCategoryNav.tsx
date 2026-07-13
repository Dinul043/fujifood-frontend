'use client'

import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  itemCount?: number
}

interface MenuCategoryNavProps {
  categories: Category[]
  activeCategory?: string
  onCategoryChange?: (categoryId: string) => void
}

export function MenuCategoryNav({ categories, activeCategory, onCategoryChange }: MenuCategoryNavProps) {
  return (
    <nav className="sticky top-16 z-30 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 px-4 sm:px-6 py-3 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange?.(cat.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                activeCategory === cat.id
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-neutral-100'
              )}
            >
              {cat.name}
              {cat.itemCount !== undefined && (
                <span className={cn(
                  'ml-1.5 text-xs',
                  activeCategory === cat.id ? 'text-white/70' : 'text-text-muted/60'
                )}>
                  ({cat.itemCount})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
