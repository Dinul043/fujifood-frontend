'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface FeaturedItem {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  foodType: 'veg' | 'non_veg' | 'egg'
  category?: string
}

interface FeaturedItemsProps {
  items: FeaturedItem[]
  title?: string
  subtitle?: string
  onAddToCart?: (id: string) => void
}

export function FeaturedItems({
  items,
  title = 'Popular Dishes',
  subtitle = 'Most loved by our customers',
  onAddToCart,
}: FeaturedItemsProps) {
  if (!items.length) return null

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text">{title}</h2>
        <p className="text-text-muted text-sm sm:text-base mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map((item) => (
          <Card
            key={item.id}
            variant="elevated"
            padding="none"
            hover
            className="group overflow-hidden"
          >
            {/* Image */}
            <div className="relative h-40 sm:h-48 overflow-hidden bg-neutral-100">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-neutral-300" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
              )}

              {/* Category pill */}
              {item.category && (
                <div className="absolute top-3 left-3">
                  <Badge variant="default" className="bg-white/90 backdrop-blur-sm text-text">
                    {item.category}
                  </Badge>
                </div>
              )}

              {/* Food type */}
              <div className="absolute top-3 right-3">
                <span className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center bg-white ${item.foodType === 'veg' ? 'border-success' : 'border-error'}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${item.foodType === 'veg' ? 'bg-success' : 'bg-error'}`} />
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-heading font-semibold text-text text-base mb-1 line-clamp-1">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-xs text-text-muted line-clamp-2 mb-3">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-text">
                  ₹{item.price}
                </span>
                <Button
                  size="sm"
                  onClick={() => onAddToCart?.(item.id)}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
