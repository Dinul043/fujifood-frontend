'use client'

/**
 * WhyChooseUs — Social proof section.
 *
 * Specs (8px grid):
 *   Section padding: 80px top, 96px bottom
 *   Background: #FAF9F6
 *   Container: max-width 1280px, padding 48px horizontal
 *   Two columns: 50/50, gap 80px
 *   Left: heading + description + reasons list
 *   Right: tall restaurant image with border-radius 24px
 *   Heading: 32px, weight 700
 *   Heading → Description gap: 16px
 *   Description → List gap: 40px
 *   List item gap: 24px
 *   Icon circle: 48px
 *   Icon → Text gap: 16px
 *   Reason title: 15px, weight 600
 *   Reason subtitle: 13px, muted
 */

const reasons = [
  {
    title: '20+ Years of Trust',
    description: 'Serving happiness since 2002.',
    icon: (
      <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: '100% Pure Vegetarian',
    description: 'No onion, no garlic. Pure sattvic food.',
    icon: (
      <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    ),
  },
  {
    title: 'Premium Ingredients',
    description: 'Sourced fresh daily from local farms.',
    icon: (
      <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0l-4.725 2.885a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
  },
  {
    title: 'Happy Customers',
    description: 'Loved by thousands across the city.',
    icon: (
      <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
    ),
  },
]

export function WhyChooseUs() {
  return (
    <section className="bg-[#FAF9F6]" style={{ paddingTop: '80px', paddingBottom: '96px' }}>
      <div className="mx-auto" style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px' }}>
        <div className="grid grid-cols-2 items-center" style={{ gap: '80px' }}>

          {/* Left: Content */}
          <div>
            <h2
              className="font-heading font-bold text-[#1A1A1A]"
              style={{ fontSize: '32px', lineHeight: '40px', letterSpacing: '-0.02em', marginBottom: '16px' }}
            >
              Why Choose A2B?
            </h2>
            <p className="text-[#666]" style={{ fontSize: '15px', lineHeight: '24px', marginBottom: '40px' }}>
              For over 20 years, we have been serving delicious, high-quality vegetarian food with love and care.
            </p>

            {/* Reasons list */}
            <div className="flex flex-col" style={{ gap: '24px' }}>
              {reasons.map((reason) => (
                <div key={reason.title} className="flex items-start" style={{ gap: '16px' }}>
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full bg-[#C8964B]/10 text-[#C8964B]"
                    style={{ width: '48px', height: '48px' }}
                  >
                    {reason.icon}
                  </div>
                  <div style={{ paddingTop: '4px' }}>
                    <h3 className="font-semibold text-[#1A1A1A]" style={{ fontSize: '15px', marginBottom: '4px' }}>
                      {reason.title}
                    </h3>
                    <p className="text-[#888]" style={{ fontSize: '13px', lineHeight: '20px' }}>
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div>
            <div className="overflow-hidden" style={{ borderRadius: '24px', aspectRatio: '4/5' }}>
              <img
                src="/images/food/dish-7.png"
                alt="A2B restaurant premium dining experience"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
