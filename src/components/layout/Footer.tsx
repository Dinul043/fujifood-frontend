'use client'

/**
 * Footer — Premium restaurant footer.
 *
 * Specs (8px grid):
 *   Background: #141414
 *   Top section padding: 80px top, 64px bottom
 *   Container: max-width 1280px, padding 48px horizontal
 *   4 columns: Brand (wider) + Quick Links + Legal + Hours
 *   Column gap: 64px
 *   Bottom bar: border-top #2A2A2A, padding 24px vertical
 *   Logo: 24px, white
 *   Subtitle: gold
 *   Link: 14px, #999 hover white
 *   Link gap: 16px
 *   Section title: 12px uppercase, tracking wide, #666
 */

interface FooterProps {
  restaurantName?: string
  restaurantPhone?: string
  restaurantEmail?: string
  restaurantAddress?: string
}

export function Footer({
  restaurantName = 'A2B Veg Restaurant',
  restaurantPhone = '+91 98765 43210',
  restaurantEmail = 'hello@a2b.com',
  restaurantAddress = '123, Marina Beach Road, Anna Nagar, Chennai, Tamil Nadu 600001',
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#141414]">
      {/* Main content */}
      <div
        className="mx-auto"
        style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px', paddingTop: '80px', paddingBottom: '64px' }}
      >
        <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '64px' }}>

          {/* Brand column */}
          <div>
            <a href="/" className="inline-block" style={{ marginBottom: '24px' }}>
              <span className="block font-heading font-bold text-white" style={{ fontSize: '24px' }}>
                A2B
              </span>
              <span className="block uppercase font-semibold text-[#C8964B]" style={{ fontSize: '9px', letterSpacing: '0.2em' }}>
                Veg Restaurant
              </span>
            </a>
            <p className="text-[#888]" style={{ fontSize: '14px', lineHeight: '24px', marginBottom: '24px', maxWidth: '280px' }}>
              {restaurantAddress}
            </p>
            <div className="flex flex-col" style={{ gap: '8px' }}>
              <a href={`tel:${restaurantPhone}`} className="text-[#999] hover:text-white transition-colors duration-200" style={{ fontSize: '14px' }}>
                {restaurantPhone}
              </a>
              <a href={`mailto:${restaurantEmail}`} className="text-[#999] hover:text-white transition-colors duration-200" style={{ fontSize: '14px' }}>
                {restaurantEmail}
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="uppercase font-semibold text-[#666]"
              style={{ fontSize: '11px', letterSpacing: '0.15em', marginBottom: '24px' }}
            >
              Quick Links
            </h4>
            <ul className="flex flex-col" style={{ gap: '16px' }}>
              {['Menu', 'Cart', 'My Orders', 'About Us'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[#999] hover:text-white transition-colors duration-200" style={{ fontSize: '14px' }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="uppercase font-semibold text-[#666]"
              style={{ fontSize: '11px', letterSpacing: '0.15em', marginBottom: '24px' }}
            >
              Legal
            </h4>
            <ul className="flex flex-col" style={{ gap: '16px' }}>
              {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Cookie Policy'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-[#999] hover:text-white transition-colors duration-200" style={{ fontSize: '14px' }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4
              className="uppercase font-semibold text-[#666]"
              style={{ fontSize: '11px', letterSpacing: '0.15em', marginBottom: '24px' }}
            >
              Opening Hours
            </h4>
            <ul className="flex flex-col" style={{ gap: '16px' }}>
              <li className="flex justify-between" style={{ fontSize: '14px' }}>
                <span className="text-[#999]">Mon — Fri</span>
                <span className="text-[#CCC] font-medium">10:00 — 22:00</span>
              </li>
              <li className="flex justify-between" style={{ fontSize: '14px' }}>
                <span className="text-[#999]">Saturday</span>
                <span className="text-[#CCC] font-medium">10:00 — 23:00</span>
              </li>
              <li className="flex justify-between" style={{ fontSize: '14px' }}>
                <span className="text-[#999]">Sunday</span>
                <span className="text-[#CCC] font-medium">11:00 — 22:00</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #2A2A2A' }}>
        <div
          className="mx-auto flex items-center justify-between"
          style={{ maxWidth: '1280px', paddingLeft: '48px', paddingRight: '48px', paddingTop: '24px', paddingBottom: '24px' }}
        >
          <p className="text-[#666]" style={{ fontSize: '13px' }}>
            &copy; {currentYear} {restaurantName}. All rights reserved.
          </p>
          <p className="text-[#555]" style={{ fontSize: '12px' }}>
            Powered by{' '}
            <a
              href="https://www.fujisakuratech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#888] hover:text-[#C8964B] transition-colors duration-200"
            >
              Fuji Sakura Tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
