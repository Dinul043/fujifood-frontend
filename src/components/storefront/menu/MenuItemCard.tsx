'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface MenuItemProps {
  id: string
  name: string
  description?: string
  price: number
  discountPrice?: number
  imageUrl?: string
  foodType: 'veg' | 'non_veg' | 'egg'
  isBestseller?: boolean
  isRecommended?: boolean
  isAvailable?: boolean
  onAddToCart?: (id: string) => void
}

export function MenuItemCard({
  id,
  name,
  description,
  price,
  discountPrice,
  imageUrl,
  foodType,
  isBestseller = false,
  isRecommended = false,
  isAvailable = true,
  onAddToCart,
}: MenuItemProps) {
  const displayPrice = discountPrice || price
  const hasDiscount = discountPrice && discountPrice < price

  return (
    <div
      className={cn(
        'group flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-[var(--r-lg)] border border-border/60',
        'bg-surface hover:shadow-md transition-all duration-200',
        !isAvailable && 'opacity-60'
      )}
    >
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        {/* Food type indicator + badges */}
        <div className="flex items-center gap-2 mb-1.5">
          {/* Veg/Non-veg dot */}
          <span
            className={cn(
              'w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0',
              foodType === 'veg' ? 'border-success' : 'border-error'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                foodType === 'veg' ? 'bg-success' : 'bg-error'
              )}
            />
          </span>
          {isBestseller && <Badge variant="warning" size="sm">Bestseller</Badge>}
          {isRecommended && <Badge variant="primary" size="sm">Recommended</Badge>}
        </div>

        {/* Name */}
        <h3 className="font-heading font-semibold text-text text-sm sm:text-base leading-tight mb-1">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm sm:text-base font-bold text-text">
            ₹{displayPrice}
          </span>
          {hasDiscount && (
            <span className="text-xs text-text-muted line-through">
              ₹{price}
            </span>
          )}
          {hasDiscount && (
            <Badge variant="success" size="sm">
              {Math.round(((price - discountPrice) / price) * 100)}% off
            </Badge>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Right: image + add button */}
      <div className="relative flex flex-col items-center shrink-0">
        {imageUrl ? (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[var(--r-md)] overflow-hidden bg-neutral-100">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[var(--r-md)] bg-neutral-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        )}

        {/* Add button */}
        {isAvailable ? (
          <Button
            size="sm"
            variant="outline"
            className="absolute -bottom-3 shadow-sm bg-surface"
            onClick={() => onAddToCart?.(id)}
          >
            ADD
          </Button>
        ) : (
          <span className="absolute -bottom-3 px-3 py-1 bg-neutral-100 text-text-muted text-xs font-medium rounded-[var(--r-md)]">
            Unavailable
          </span>
        )}
      </div>
    </div>
  )
}
