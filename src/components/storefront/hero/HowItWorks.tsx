'use client'

/**
 * HowItWorks — Premium step-by-step ordering guide.
 *
 * Specs (8px grid):
 *   Section padding: 80px top, 80px bottom
 *   Background: white
 *   Container: max-width 1280px, padding 48px horizontal
 *   Title → Steps gap: 64px
 *   Title: 32px, weight 700, centered
 *   4 columns, 48px gap
 *   Icon circle: 72px, gold/10 bg
 *   Step number badge: 24px circle, gold bg, positioned top-right of icon
 *   Icon → Title gap: 24px
 *   Title → Description gap: 8px
 *   Title: 16px, weight 600
 *   Description: 14px, muted, line-height 22px
 */

const steps = [
  {
    number: 1,
    title: 'Choose Your Food',
    description: 'Explore our wide range of delicious South Indian dishes.',
    icon: (
      <svg className="w-[28px] h-[28px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Place Your Order',
    description: 'Add to cart and place your order easily in seconds.',
    icon: (
      <svg className="w-[28px] h-[28px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'We Prepare',
    description: 'Our chefs prepare your food fresh and hygienic.',
    icon: (
      <svg className="w-[28px] h-[28px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.048 8.287 8.287 0 0 0 9 9.6a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Get It Delivered',
    description: 'Enjoy your meal delivered fresh at your doorstep.',
    icon: (
      <svg className="w-[28px] h-[28px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.375c0-.621-.504-1.125-1.125-1.125h-2.25M16.5 12V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25" />
      </svg>
    ),
  },
]

export function HowItWorks() {
  return (
    <section className="bg-white" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="mx-auto" style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px' }}>

        {/* Title */}
        <h2
          className="font-heading font-bold text-[#1A1A1A] text-center"
          style={{ fontSize: '32px', lineHeight: '40px', marginBottom: '64px', letterSpacing: '-0.02em' }}
        >
          How It Works
        </h2>

        {/* Steps grid */}
        <div className="grid grid-cols-4" style={{ gap: '48px' }}>
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              {/* Icon with number badge */}
              <div className="relative" style={{ marginBottom: '24px' }}>
                <div
                  className="flex items-center justify-center rounded-full bg-[#C8964B]/10 text-[#C8964B]"
                  style={{ width: '72px', height: '72px' }}
                >
                  {step.icon}
                </div>
                <span
                  className="absolute flex items-center justify-center rounded-full bg-[#C8964B] text-white font-bold"
                  style={{ width: '24px', height: '24px', fontSize: '11px', top: '-4px', right: '-4px' }}
                >
                  {step.number}
                </span>
              </div>

              {/* Text */}
              <h3
                className="font-semibold text-[#1A1A1A]"
                style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '8px' }}
              >
                {step.title}
              </h3>
              <p className="text-[#888]" style={{ fontSize: '14px', lineHeight: '22px' }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
