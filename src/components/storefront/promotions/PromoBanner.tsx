'use client'

/**
 * PromoBanner — Today's Special Offer.
 *
 * Specs (8px grid):
 *   Section padding: 0 top (flows from prev section), 80px bottom
 *   Container: max-width 1280px, padding 48px horizontal
 *   Banner: dark bg #1A1A1A, border-radius 24px
 *   Internal padding: 64px horizontal, 56px vertical
 *   Badge → Title gap: 16px
 *   Title → Subtitle gap: 8px
 *   Subtitle → Code gap: 8px
 *   Code → Button gap: 32px
 *   Button: height 48px, padding 24px, radius 12px
 */
export function PromoBanner() {
  return (
    <section className="bg-[#FAFAF8]" style={{ paddingBottom: '80px' }}>
      <div className="mx-auto" style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px' }}>
        <div
          className="relative overflow-hidden bg-[#1A1A1A]"
          style={{ borderRadius: '24px', padding: '56px 64px' }}
        >
          {/* Decorative circles */}
          <div
            className="absolute rounded-full bg-[#C8964B]/8"
            style={{ width: '320px', height: '320px', top: '-120px', right: '-80px' }}
            aria-hidden="true"
          />
          <div
            className="absolute rounded-full bg-[#C8964B]/5"
            style={{ width: '200px', height: '200px', bottom: '-80px', left: '40%' }}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10" style={{ maxWidth: '480px' }}>
            <p
              className="font-semibold uppercase text-[#D4A853]"
              style={{ fontSize: '11px', letterSpacing: '0.18em', marginBottom: '16px' }}
            >
              Today&apos;s Special Offer
            </p>
            <h2
              className="font-heading font-extrabold text-white"
              style={{ fontSize: '48px', lineHeight: '56px', marginBottom: '8px' }}
            >
              20% OFF
            </h2>
            <p className="text-[#CCC]" style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '8px' }}>
              On All Orders Above &#8377;249
            </p>
            <p className="text-[#888]" style={{ fontSize: '14px', marginBottom: '32px' }}>
              Use Code: <span className="font-bold text-[#D4A853]">A2BSPECIAL</span>
            </p>
            <a
              href="/menu"
              className="inline-flex items-center justify-center font-semibold text-white bg-[#C8964B] hover:bg-[#B5843F] transition-all duration-200"
              style={{
                height: '48px',
                paddingLeft: '24px',
                paddingRight: '24px',
                borderRadius: '12px',
                fontSize: '14px',
                gap: '8px',
              }}
            >
              Order Now
              <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
