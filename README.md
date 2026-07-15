# FujiFood Frontend — White-Label Restaurant Storefront

A premium restaurant commerce platform built with Next.js 14, TypeScript, and Tailwind CSS. Features a customer storefront and a restaurant admin panel.

## Quick Setup (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/Dinul043/fujifood-frontend.git
cd fujifood-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your backend URL

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local` in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Inline styles (8px grid system)
- **HTTP Client:** Axios with JWT interceptors
- **Real-time:** WebSocket (native, custom hook)
- **Auth:** JWT cookies (access + refresh tokens)
- **Payment:** Razorpay checkout modal

## Folder Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (storefront)/             # Customer-facing pages (grouped route)
│   │   ├── layout.tsx            # Storefront layout (Header + Footer, fetches restaurant data)
│   │   ├── page.tsx              # Homepage (composes hero + bestsellers + offers + mobile page)
│   │   ├── cart/page.tsx         # Shopping cart
│   │   ├── checkout/page.tsx     # Checkout (address + payment + place order)
│   │   ├── menu/page.tsx         # Full menu with categories
│   │   ├── orders/page.tsx       # Customer order history (real-time WebSocket)
│   │   └── profile/page.tsx      # Customer profile & addresses
│   ├── login/page.tsx            # Customer login (email OTP)
│   ├── forgot-password/page.tsx  # Password reset flow
│   ├── manage/                   # Restaurant Admin Panel
│   │   ├── layout.tsx            # Admin layout (sidebar + global WebSocket notifications)
│   │   ├── page.tsx              # Dashboard (stats, recent orders, top items)
│   │   ├── orders/page.tsx       # Order management (accept/reject/prepare/deliver)
│   │   ├── menu/page.tsx         # Menu CRUD (categories + items + image upload)
│   │   ├── history/page.tsx      # Order history with date filtering (owner only)
│   │   ├── business/page.tsx     # Restaurant settings (address, delivery radius)
│   │   ├── account/page.tsx      # Profile + Staff management (owner only)
│   │   ├── reports/page.tsx      # Reports (coming soon, owner only)
│   │   ├── customers/page.tsx    # Customers (coming soon, owner only)
│   │   └── website/page.tsx      # Website Studio (coming soon, owner only)
│   ├── globals.css               # Global styles + Tailwind imports
│   └── layout.tsx                # Root layout (fonts, metadata)
│
├── components/                   # Reusable UI components
│   ├── layout/                   # Page structure components
│   │   ├── Header.tsx            # Desktop navigation bar (88px, dark theme)
│   │   ├── Footer.tsx            # Desktop footer (dynamic from API)
│   │   ├── Container.tsx         # Max-width wrapper
│   │   └── Section.tsx           # Section padding helper
│   ├── mobile/                   # Mobile-specific components (separate UI, not responsive shrink)
│   │   ├── MobileHeader.tsx      # Mobile nav (56px + location bar)
│   │   └── MobileHomePage.tsx    # Complete mobile homepage (different layout from desktop)
│   ├── storefront/               # Customer page sections
│   │   ├── hero/                 # HeroSection.tsx, WhyChooseUs.tsx (desktop homepage)
│   │   ├── menu/                 # BestsellersSection.tsx (homepage), MenuItemCard, CategoryNav
│   │   ├── promotions/           # OfferBanner.tsx (promo cards on homepage)
│   │   └── cart/                 # Cart components
│   ├── ui/                       # Generic UI primitives
│   │   ├── Button.tsx, Card.tsx, Input.tsx, Badge.tsx
│   │   ├── Toast.tsx, Skeleton.tsx
│   │   └── AuthGate.tsx          # Auth wrapper component
│   └── theme/
│       └── ThemeProvider.tsx      # Theme context (future: dynamic themes)
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts                # Authentication state
│   ├── useCart.ts                # Cart state (localStorage)
│   ├── useDevice.ts              # Device detection (mobile/desktop)
│   └── useWebSocket.ts           # WebSocket hook (auto-reconnect, heartbeat)
│
├── lib/                          # Core utilities
│   ├── api.ts                    # Axios instance (JWT attach, 401 refresh, token management)
│   ├── theme.ts                  # Theme utilities
│   └── utils.ts                  # General helpers
│
├── types/                        # TypeScript type definitions
│   ├── menu.ts                   # Menu item, category types
│   ├── order.ts                  # Order, order item types
│   ├── theme.ts                  # Theme configuration types
│   └── user.ts                   # User, auth types
│
└── config/
    └── themes/default.ts         # Default theme configuration
```

## Design System

- **Grid:** 8px spacing system (8, 16, 24, 32, 40, 48, 64, 80)
- **Colors:** Gold accent (#C8964B), Dark background (#1A1A1A), Cream admin bg (#FAFAF8)
- **Desktop Header:** 88px height, 48px horizontal padding, 1280px max-width
- **Mobile:** Completely separate UI blocks (not responsive shrink). Uses `hidden md:block` / `block md:hidden` pattern
- **Admin Panel:** Light theme — white sidebar (240px), cream content area

## Key Features

### Customer Storefront
- Homepage with hero, bestsellers (from API), how-it-works
- Full menu with categories and search
- Cart with persistent localStorage
- Checkout with geolocation (delivery radius check), COD + Razorpay
- Real-time order status via WebSocket
- Order success popup with redirect to orders page

### Restaurant Admin Panel
- Role-based access: Owner sees all, Staff sees Dashboard/Orders/Menu/Account
- Real-time new order notifications (WebSocket) on any page
- Pending order badge counter on sidebar
- Menu management with image file upload
- Order management with status transitions
- Staff management (owner adds/removes staff accounts)
- Business settings with "Detect Location" (reverse geocoding)
- History with date filtering and revenue breakdown (owner only)

## Authentication Flow

- **Customer:** Email OTP login → JWT tokens stored in cookies
- **Admin:** Phone + Password → Same JWT cookie system
- **Token refresh:** Automatic on 401 via Axios interceptor
- **Owner vs Staff:** `is_owner` boolean from `/auth/me` response

## WebSocket

- URL pattern: `ws://localhost:8000/ws/customer/{user_id}` or `ws://localhost:8000/ws/admin/{tenant_id}`
- Auto-reconnect every 3 seconds on disconnect
- Heartbeat ping every 25 seconds
- Events: `new_order`, `order_cancelled`, `order_status_updated`

## Scripts

```bash
npm run dev       # Start development server (port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Browser Support

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Chrome Android 90+
