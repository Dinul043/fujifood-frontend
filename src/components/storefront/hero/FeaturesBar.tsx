'use client'

/**
 * FeaturesBar — Trust indicators strip.
 *
 * Specs (8px grid):
 *   Container: max-width 1280px, padding 48px horizontal
 *   Height: 80px
 *   4 equal columns with 1px vertical dividers
 *   Icon: 40px circle with gold background
 *   Icon → Text gap: 16px
 *   Title: 14px, weight 600
 *   Subtitle: 12px, muted color
 *   Border top and bottom: 1px #E8E4DE
 *   Background: white
 */
export function FeaturesBar() {
  const features = [
    {
      title: 'Pure Vegetarian',
      subtitle: '100% Pure veg food',
      icon: (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: 'Hygienic Kitchen',
      subtitle: 'Safe & clean cooking',
      icon: (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Fast Delivery',
      subtitle: 'On-time at your door',
      icon: (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.375c0-.621-.504-1.125-1.125-1.125h-2.25M16.5 12V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25" />
        </svg>
      ),
    },
    {
      title: 'Best Quality',
      subtitle: 'Always fresh ingredients',
      icon: (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0l-4.725 2.885a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="bg-white border-y border-[#E8E4DE] w-full">
      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingLeft: '48px', paddingRight: '48px' }}>
        <div className="grid grid-cols-4" style={{ height: '80px' }}>
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-center"
              style={{
                gap: '16px',
                paddingLeft: index === 0 ? '0' : '32px',
                paddingRight: '32px',
                borderLeft: index === 0 ? 'none' : '1px solid #E8E4DE',
              }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full bg-[#C8964B]/10 text-[#C8964B]"
                style={{ width: '40px', height: '40px' }}
              >
                {feature.icon}
              </div>
              <div>
                <p className="font-semibold text-[#1A1A1A]" style={{ fontSize: '14px', lineHeight: '20px' }}>
                  {feature.title}
                </p>
                <p className="text-[#888]" style={{ fontSize: '12px', lineHeight: '16px' }}>
                  {feature.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
