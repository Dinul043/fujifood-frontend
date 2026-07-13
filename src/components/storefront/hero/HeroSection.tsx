'use client'

/**
 * HeroSection — Premium restaurant hero.
 *
 * Specs (8px grid):
 *   Container: max-width 1280px, padding 48px horizontal
 *   Top padding after header (88px): 32px
 *   Bottom padding: 80px
 *   Badge → Heading gap: 24px
 *   Heading → Description gap: 28px (rounded to 32px)
 *   Description → Buttons gap: 40px
 *   Left content → Image gap: 80px
 *   Heading size: 72px, weight 700, line-height 82px
 *   Description: 22px, line-height 36px
 *   Button height: 56px, padding 24px 32px
 */
export function HeroSection() {
  return (
    <section className="bg-[#FAF9F6]" style={{ marginTop: '88px' }}>
      <div
        className="mx-auto"
        style={{
          maxWidth: '1280px',
          paddingLeft: '48px',
          paddingRight: '48px',
          paddingTop: '32px',
          paddingBottom: '80px',
        }}
      >
        <div className="flex items-center" style={{ gap: '80px' }}>

          {/* ─── Left Content ──────────────────────────────────── */}
          <div className="flex-1">
            {/* Tagline with decorative lines */}
            <div className="flex items-center" style={{ gap: '16px', marginBottom: '24px' }}>
              <span className="block h-[1px] bg-[#C8964B]" style={{ width: '32px' }} />
              <span className="text-[12px] font-semibold uppercase text-[#C8964B]" style={{ letterSpacing: '0.2em' }}>
                Delivering Happiness Since 2002
              </span>
              <span className="block h-[1px] bg-[#C8964B]" style={{ width: '32px' }} />
            </div>

            {/* Main heading */}
            <h1 style={{ marginBottom: '32px' }}>
              <span
                className="block font-heading font-bold text-[#2A2A2A]"
                style={{ fontSize: '72px', lineHeight: '82px', letterSpacing: '-0.02em' }}
              >
                Authentic Taste.
              </span>
              <span
                className="block font-heading font-bold text-[#C8964B]"
                style={{ fontSize: '72px', lineHeight: '82px', letterSpacing: '-0.02em' }}
              >
                Timeless Tradition.
              </span>
            </h1>

            {/* Decorative divider */}
            <div className="flex items-center" style={{ gap: '12px', marginBottom: '32px' }}>
              <span className="block h-[1px] bg-[#DDD]" style={{ width: '64px' }} />
              <svg className="text-[#C8964B]" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.5 4.3 12.4l.7-4.1-3-2.9 4.2-.8L8 1z" />
              </svg>
              <span className="block h-[1px] bg-[#DDD]" style={{ width: '64px' }} />
            </div>

            {/* Description */}
            <p
              className="text-[#666]"
              style={{
                fontSize: '16px',
                lineHeight: '28px',
                maxWidth: '400px',
                marginBottom: '40px',
              }}
            >
              Experience the rich flavors of South India, crafted
              with love and the finest ingredients.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center" style={{ gap: '16px' }}>
              {/* Primary button */}
              <a
                href="/menu"
                className="inline-flex items-center justify-center font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] active:bg-[#A07335] transition-all duration-200"
                style={{
                  height: '56px',
                  paddingLeft: '32px',
                  paddingRight: '32px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  gap: '10px',
                  boxShadow: '0 4px 16px rgba(200,150,75,0.25)',
                }}
              >
                Order Now
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>

              {/* Secondary button */}
              <a
                href="/menu"
                className="inline-flex items-center justify-center font-semibold text-[#2A2A2A] border-[1.5px] border-[#2A2A2A] hover:bg-[#2A2A2A] hover:text-white active:bg-[#111] transition-all duration-200"
                style={{
                  height: '56px',
                  paddingLeft: '32px',
                  paddingRight: '32px',
                  borderRadius: '12px',
                  fontSize: '15px',
                }}
              >
                View Menu
              </a>
            </div>
          </div>

          {/* ─── Right: Arch-framed food image ─────────────────── */}
          <div className="flex-shrink-0" style={{ width: '480px' }}>
            <div className="relative" style={{ width: '480px', height: '560px' }}>
              {/* Gold arch border */}
              <div
                className="absolute inset-0 border-2 border-[#C8964B]/50"
                style={{ borderRadius: '240px 240px 24px 24px' }}
                aria-hidden="true"
              />
              {/* Image (arch clipped) */}
              <div
                className="absolute overflow-hidden"
                style={{
                  top: '8px',
                  left: '8px',
                  right: '8px',
                  bottom: '8px',
                  borderRadius: '236px 236px 20px 20px',
                }}
              >
                <img
                  src="/images/food/dish-1.png"
                  alt="Premium South Indian cuisine"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
