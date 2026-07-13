'use client'

import { cn } from '@/lib/utils'

interface Offer {
  id: string
  title: string
  subtitle: string
  code?: string
  bgColor?: string
  textColor?: string
}

interface OfferBannerProps {
  offers: Offer[]
}

export function OfferBanner({ offers }: OfferBannerProps) {
  if (!offers.length) return null

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex items-stretch gap-4 px-4 sm:px-0 min-w-max sm:min-w-0 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={cn(
              'relative flex flex-col justify-center min-w-[260px] sm:min-w-0 p-5 rounded-[var(--r-xl)] overflow-hidden',
              'border border-brand-primary/10'
            )}
            style={{
              backgroundColor: offer.bgColor || 'var(--brand-primary)',
              color: offer.textColor || '#fff',
            }}
          >
            {/* Decorative circle */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

            <p className="text-lg font-heading font-bold leading-tight mb-1 relative z-10">
              {offer.title}
            </p>
            <p className="text-sm opacity-80 relative z-10">
              {offer.subtitle}
            </p>
            {offer.code && (
              <div className="mt-3 relative z-10">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-[var(--r-md)] text-xs font-mono font-bold tracking-wider border border-white/20">
                  {offer.code}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
