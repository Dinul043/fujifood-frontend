# FujiFood — Product Roadmap & Development Plan

> Last updated: 2026-07-18  
> Architecture: Multi-tenant white-label restaurant platform  
> Stack: FastAPI (Python) + Next.js 14 (TypeScript) + MySQL

---

## Architecture Principle (Non-Negotiable)

FujiFood is a **software product**, not a data hosting service.  
- Each restaurant gets their own deployment with their own database  
- No hardcoded restaurant/customer data in the codebase  
- All tenant config via environment variables  
- All DB changes via numbered Alembic migrations  
- New restaurant = clone repo + fresh DB + `alembic upgrade head` + `seed_demo.py`  

---

## What's Already Built ✅

### Customer Storefront
- [x] Homepage (hero, bestsellers from API, promotions, reviews, how-it-works)
- [x] Desktop + mobile separate UI (not responsive shrink)
- [x] Header with location detection (saved in localStorage)
- [x] Menu page with categories, search, item ratings
- [x] Cart (DB-backed, persists across devices/sessions)
- [x] Guest cart → login → auto-sync to DB
- [x] Checkout with address fields + saved address suggestions
- [x] Contact number required in checkout (visible to restaurant)
- [x] Delivery address validation against restaurant radius (coordinate + text-based geocoding)
- [x] COD + Razorpay online payment
- [x] Order success popup after placement
- [x] Customer order history with status
- [x] Cancel order (pending/confirmed) with confirmation modal
- [x] Real-time order status updates via WebSocket
- [x] Review after delivery (star rating + comment per-item)
- [x] Auto-review popup after delivery
- [x] Public review display on homepage (3 initially, expand)

### Authentication
- [x] Customer: Email OTP login (Mailtrap sandbox)
- [x] Customer: Email + password (Sign In tab)
- [x] Admin: Phone + password
- [x] JWT with 15-min access token + 30-day refresh
- [x] Signup blocks duplicate email
- [x] Forgot password / reset via OTP
- [x] Profile page: edit name/phone/password
- [x] Saved addresses: add/edit/delete with detect location

### Restaurant Admin Panel
- [x] Dashboard with real-time stats (today's orders, revenue for owners)
- [x] Order management: Accept / Reject / Cancel / Prepare / Ready / Deliver
- [x] Customer phone + name + delivery address visible on order card
- [x] Real-time new order notifications (all admin pages via WebSocket)
- [x] Pending order badge on sidebar
- [x] Menu management: categories CRUD, items CRUD
- [x] Image upload for menu items (local uploads/)
- [x] Bestseller toggle per item
- [x] Per-item ratings (updated when customers review)
- [x] History page with date filtering and revenue (owner only)
- [x] Business settings with delivery radius, address, detect location
- [x] Reviews management (view + delete)
- [x] Staff management (owner adds/disables staff)
- [x] Owner vs Staff access control (is_owner flag)
- [x] Account page with profile editing

### Technical Infrastructure
- [x] WebSocket: admin ← new orders, customer ← status changes
- [x] DB-backed cart (cart_items table, syncs across devices)
- [x] Per-item ratings on menu_items (avg_rating, rating_count)
- [x] Address CRUD API
- [x] Image upload endpoint + static file serving
- [x] Delivery radius check (coordinate + address geocoding)
- [x] 20 Alembic migrations (clean, numbered)
- [x] Deployment-ready architecture (slug-based tenancy)

---

## Sprint 1 — Customer Experience (NEXT)

### 1.1 Proactive Location Check on Homepage
**Status:** 🔴 Not started  
**What:** When customer opens site, auto-detect location. Show modal if outside radius.  
**Flow:**
```
Open website
  ↓ Request location (non-blocking, optional)
  ↓ Check against delivery radius
  ↓ If outside → Premium modal: "You're outside our delivery zone"
               → Buttons: [Change Location] [Continue Browsing]
  ↓ If inside → Show "Delivering to: Vandalur, Chennai" in header
```
**UI:** Premium dark modal (matches gold theme), not browser alert  
**Files to touch:** storefront layout, Header.tsx, new `DeliveryZoneModal` component  

### 1.2 In-Zone Delivery Confirmation
**Status:** 🔴 Not started  
**What:** After location verified in-zone, show subtle banner: "Delivering to: X"  
**UI:** Gold accent bar below header (replacing current static delivery bar)  

### 1.3 Order Again Button
**Status:** 🔴 Not started  
**What:** In customer order history, each delivered order has "Order Again" button  
**Flow:** Adds all items from that order back to cart, redirects to cart  
**Files:** `(storefront)/orders/page.tsx`  

### 1.4 Order Status Timeline (Visual)
**Status:** 🟡 Partial (shows label only)  
**What:** Visual step-by-step progress like a stepper:
```
✓ Placed → ✓ Confirmed → ○ Preparing → ○ Ready → ○ Delivered
```
**Files:** `(storefront)/orders/page.tsx`  

---

## Sprint 2 — Delivery & Staff Workflow

### 2.1 Delivery Staff Role
**Status:** 🟡 Partial (is_owner exists, but no delivery_staff role)  
**What:** Add `delivery_staff` role to User model  
**Access:** Assigned orders only, mark delivered, customer contact  
**No access to:** Revenue, reports, staff management, restaurant config  

### 2.2 Assign Delivery Staff to Order
**Status:** 🔴 Not started  
**What:** Admin sees "Assign Staff" dropdown on ready orders  
**Flow:** Admin → selects staff member → assigns → staff sees order in their view  

### 2.3 Delivery Staff App View
**Status:** 🔴 Not started  
**What:** Simplified panel for delivery staff (not full admin)  
**Shows:** Assigned orders, customer phone, address, mark delivered  

### 2.4 Customer Sees Delivery Person
**Status:** 🔴 Not started  
**What:** After assignment, customer sees assigned staff name + phone  

---

## Sprint 3 — Live Delivery Tracking

### 3.1 Staff Location Broadcasting
**Status:** 🔴 Not started  
**What:** When staff starts delivery, GPS → backend → WebSocket → customer  
**Tech:** Browser Geolocation API (free), WebSocket channel  

### 3.2 Customer Live Map
**Status:** 🔴 Not started  
**What:** Customer sees map with delivery person's location + ETA  
**Tech:** Leaflet.js (free, OpenStreetMap) — no Google Maps needed  

### 3.3 Tracking Auto-Stop
**Status:** 🔴 Not started  
**What:** Stop location tracking when order marked delivered  

---

## Sprint 4 — Restaurant Management (Theme + Profile)

### 4.1 Restaurant Profile Management
**Status:** 🟡 Partial (business settings exist, logo/banner not implemented)  
**What:** Admin can upload logo, banner, favicon from admin panel  
**Files:** Business page, upload endpoint already exists  

### 4.2 Business Hours Management
**Status:** 🔴 Not started (business_hours table exists, no API/UI)  
**What:** Admin sets Mon-Sun opening/closing times  
**Shows:** On storefront and in footer  

### 4.3 Offers & Promotions
**Status:** 🔴 Not started  
**What:** Admin creates time-based offers (% discount, flat discount)  
**Shows:** As banner/promo card on homepage  

### 4.4 Website Studio / Theme Config
**Status:** 🔴 Not started (theme table + service exists)  
**What:** Admin customizes colors, fonts, hero image via UI  
**Note:** Theme engine already built in backend, just needs admin UI  

---

## Sprint 5 — Analytics

### 5.1 Owner Dashboard Analytics
**Status:** 🟡 Partial (today's stats on dashboard)  
**What:** Full analytics page for owners:
- Sales: daily/weekly/monthly revenue
- Products: best/least selling items
- Customers: new vs returning
- Cancellation rate + reasons
- Avg delivery time  

### 5.2 Cancellation Reason Collection
**Status:** 🔴 Not started  
**What:** When customer cancels, show reason selector (dropdown)  
**Options:** Taking too long / Changed mind / Ordered by mistake / Other  
**Store:** In cancellation metadata  

---

## Sprint 6 — Reorder & Promotions

### 6.1 Order Again / Reorder
**Status:** 🔴 Not started (planned in Sprint 1)  

### 6.2 Customer Retention Insights
**Status:** 🔴 Not started  
**What:** Owner sees returning vs new customers, repeat order rate  

---

## Sprint 7 — AI Features (Future)

> **Prerequisite:** Sprint 5 analytics must be complete first — AI needs clean structured data

### 7.1 AI Business Insights
**What:** Explain cancellation spikes, peak hours, trends in plain language  

### 7.2 Product Recommendations
**What:** "Customers who order X also order Y" → combo offers  

### 7.3 Demand Forecasting
**What:** Predict busy periods based on historical data  

### 7.4 AI Customer Support
**What:** Answer delivery zone questions using restaurant's own config  

---

## Deployment Architecture (Future)

```
Restaurant signs contract
  ↓
Clone FujiFood repo
  ↓
Configure .env (slug, DB, Razorpay, SMTP)
  ↓
mysql → create database restaurant_name
  ↓
alembic upgrade head (creates all tables)
  ↓
python seed_demo.py (creates tenant + admin)
  ↓
Deploy to restaurant's own server (VPS/cloud)
  ↓
FujiFood has no access to production DB
  ↓
Restaurant owns their data
```

---

## UI Standards (Non-Negotiable)

- **8px grid system** — all spacing multiples of 8 (8, 16, 24, 32, 48, 64, 80)
- **Gold accent:** `#C8964B` — primary action, highlights
- **Dark background:** `#1A1A1A` — header, footer
- **Cream admin:** `#FAFAF8` — admin panel background
- **No emojis** — SVG icons only
- **No browser `confirm()` or `alert()`** — always custom modals
- **Mobile = separate UI** — not just responsive shrink. Use `hidden md:block` / `block md:hidden`
- **Max width 1280px** with `margin: '0 auto'` — centers at any zoom level
- **Admin max width 1600px** — sidebar + content centered together

---

## Current Known Issues (To Fix)

| Issue | Priority | Status |
|-------|----------|--------|
| Homepage location detection doesn't show in-zone confirmation | High | Sprint 1 |
| No visual order status timeline for customer | Medium | Sprint 1 |
| No Order Again button | Medium | Sprint 1 |
| Delivery staff role not implemented | High | Sprint 2 |
| Business hours not wired up | Medium | Sprint 4 |
| Reports page still "Coming Soon" | Medium | Sprint 5 |

---

## Notes from Founder

- Every feature must be **mobile responsive** (separate mobile UI, not shrink)
- UI must be **premium** — gold/dark theme, proper spacing, no clutter
- **All confirmations** must be proper modals, never browser dialogs
- The platform must be **white-labelable** — no hardcoded restaurant names in code
- Focus on **customer experience first**, then admin operations, then analytics
- Keep code **clean and deployable** for future restaurants
