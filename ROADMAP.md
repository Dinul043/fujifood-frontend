# FujiFood — Product Roadmap & Development Plan

> Last updated: 2026-08-05  
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
- [x] Header location detection with dropdown (saved addresses + Use My Location)
- [x] **Out-of-zone premium modal** — shows when location is outside delivery radius
- [x] **In-zone confirmation** — "Delivering to: X" in header
- [x] **Delivery info bar on homepage** — radius, ETA, free delivery threshold (all from API)
- [x] Menu page with categories, search, item ratings
- [x] Cart (DB-backed, persists across devices/sessions)
- [x] Guest cart → login → auto-sync to DB
- [x] Checkout with address fields + saved address suggestions (Home/Work/Other)
- [x] Contact number required in checkout (visible to restaurant)
- [x] Delivery address validation against restaurant radius (coordinate + text geocoding with pincode fallback)
- [x] COD + Razorpay online payment
- [x] Order success popup after placement
- [x] Customer order history with **visual status timeline** (desktop + mobile)
- [x] **Order Again button** on delivered orders
- [x] Cancel order (pending/confirmed) with confirmation modal + error text
- [x] Real-time order status updates via WebSocket
- [x] **Delivery Partner card** — shows assigned staff name + phone when order is ready/out
- [x] Review after delivery (star rating + comment per-item)
- [x] Auto-review popup after delivery (inline, no redirect)
- [x] Public review display on homepage (3 initially, expand)

### Authentication
- [x] Customer: Email OTP login (Mailtrap sandbox)
- [x] Customer: Email + password (Sign In tab)
- [x] Admin + Staff: Phone + password
- [x] JWT with 15-min access token + 30-day refresh
- [x] Signup blocks duplicate email
- [x] Forgot password / reset via OTP
- [x] Profile page: edit name/phone/password + saved addresses (add/edit/delete + detect location)

### Restaurant Admin Panel
- [x] Dashboard with real-time stats (today's orders, revenue for owners)
- [x] Order management: Accept / Reject / Cancel / Prepare / Ready / Deliver
- [x] Customer phone + name + delivery address visible on order card
- [x] Real-time new order notifications (all admin pages via WebSocket)
- [x] Pending order badge on sidebar
- [x] **Assign delivery staff dropdown** (owner only) on order cards
- [x] **Self-assign button** for staff on ready orders ("Take Delivery")
- [x] **Mark Picked Up** button for assigned staff
- [x] Menu management: categories CRUD, items CRUD
- [x] Image upload for menu items (local uploads/)
- [x] Bestseller toggle per item
- [x] Per-item ratings (updated when customers review)
- [x] History page with date filtering and revenue (owner only)
- [x] Business settings with delivery radius, address, detect location
- [x] Reviews management (view + delete)
- [x] Staff management — Restaurant Staff + Delivery Staff (owner adds/disables/role-toggle)
- [x] Owner vs Staff access control (is_owner flag)
- [x] Account page with profile editing

### Delivery Staff
- [x] `delivery_staff` role — logs into same /manage panel
- [x] Sees all orders, can self-assign on ready orders
- [x] "Take Delivery" + "Mark Picked Up" buttons on assigned orders
- [x] Customer notified via WebSocket when staff assigned or picked up

### Technical Infrastructure
- [x] WebSocket: admin ← new orders, customer ← status + staff assignment changes
- [x] DB-backed cart (cart_items table, syncs across devices)
- [x] Per-item ratings on menu_items (avg_rating, rating_count)
- [x] Address CRUD API
- [x] Image upload endpoint + static file serving
- [x] Delivery radius check (coordinate + address geocoding with pincode fallback)
- [x] 21 Alembic migrations (clean, numbered)
- [x] Deployment-ready architecture (slug-based tenancy)

---

## Sprint 1 — Customer Experience ✅ COMPLETE

- [x] 1.1 Auto location detect on homepage (once per session)
- [x] 1.2 Out-of-zone premium popup (desktop + mobile)
- [x] 1.3 Saved address dropdown in header
- [x] 1.4 In-zone confirmation ("Delivering to: X")
- [x] 1.5 Order Again button
- [x] 1.6 Order status visual timeline (desktop + mobile)

---

## Sprint 2 — Delivery Staff ✅ COMPLETE

- [x] 2.1 `delivery_staff` role
- [x] 2.2 Staff sees orders, can self-assign
- [x] 2.3 Owner can assign staff from order card
- [x] 2.4 Customer sees delivery partner card (name + phone)
- [x] 2.5 Mark Picked Up → customer notified

---

## Sprint 3 — Live Delivery Tracking 🔴 NOT STARTED

> **After Sprint 2 is stable and demo-proven**

- [ ] 3.1 Staff shares GPS location when delivering
- [ ] 3.2 Customer sees delivery person on map (Leaflet.js, free)
- [ ] 3.3 ETA displayed live
- [ ] 3.4 Tracking stops when delivered

---

## Sprint 4 — Restaurant Management

### 4.1 Business Hours
**Status:** 🔴 Not started (table exists, no UI)  
**What:** Admin sets Mon-Sun open/close times → shown in footer

### 4.2 Logo/Banner Upload
**Status:** 🟡 Partial (upload endpoint exists, no UI in admin)  
**What:** Admin uploads restaurant logo, banner image

### 4.3 Offers & Promotions
**Status:** 🔴 Not started  
**What:** Time-based offers (% or flat discount), shown on homepage promo banner

### 4.4 Theme / Website Studio
**Status:** 🔴 Not started (backend exists)  
**What:** Admin changes primary color, hero image, homepage sections

---

## Sprint 5 — Analytics (Owner Only)

- [ ] 5.1 Full revenue analytics (daily/weekly/monthly)
- [ ] 5.2 Product performance (best/least sellers)
- [ ] 5.3 Customer analytics (new vs returning)
- [ ] 5.4 Cancellation rate + reasons
- [ ] 5.5 Average delivery time tracking

---

## Sprint 6 — Reorder & Promotions

- [x] Reorder / Order Again — done
- [ ] Offer creation by admin (% off, flat off, free delivery above X)
- [ ] Promo banner management (image + text + CTA + dates)

---

## Sprint 7 — AI Features (Future)

> Requires Sprint 5 analytics data first

- [ ] AI business insights (explain cancellation spikes, peak hours)
- [ ] Product recommendations ("customers also buy X")
- [ ] Demand forecasting
- [ ] AI customer support (delivery zone, FAQs)

---

## Deployment Architecture

```
Restaurant agrees to deployment
  ↓ Clone FujiFood repo (application only)
  ↓ Configure .env (slug, DB, Razorpay, SMTP)
  ↓ Create fresh MySQL database
  ↓ alembic upgrade head (21 migrations)
  ↓ python seed_demo.py (creates tenant + admin)
  ↓ Deploy to restaurant's own server
  ↓ FujiFood has NO access to their production DB
```

---

## UI Standards (Non-Negotiable)

- **8px grid system** — all spacing multiples of 8
- **Gold accent:** `#C8964B` — primary action, highlights
- **Dark background:** `#1A1A1A` — header, footer
- **Cream admin:** `#FAFAF8` — admin panel background
- **No emojis** — SVG icons only
- **No browser `confirm()` or `alert()`** — always custom modals
- **Mobile = separate UI** — `hidden md:block` / `block md:hidden`
- **Max width 1280px** with `margin: '0 auto'` — centers at any zoom level
- **Admin max width 1600px** — sidebar + content centered together
- **Every feature must be responsive** — 320px to 4K

---

## Current Known Issues / Pending

| Issue | Priority | Status |
|-------|----------|--------|
| Business hours not wired up | Medium | Sprint 4 |
| Reports page still "Coming Soon" | Medium | Sprint 5 |
| Logo/banner upload in admin UI | Low | Sprint 4 |
| Offers/promotions system | Medium | Sprint 6 |
| Live delivery tracking | High (demo) | Sprint 3 |

---

## Manager Improvement Notes (To be filled in)

*Your manager's feedback will be added here for each sprint iteration.*

---

## Notes

- Location check: Nominatim (OpenStreetMap) for geocoding — pincode fallback if address fails
- Session-based zone check: re-checks delivery zone on each new browser session
- Geocode "fail closed": if address can't be found, popup shows (not silent allow)
- Staff login: both `restaurant_admin` and `delivery_staff` use phone + password
- All staff see same /manage orders page; delivery staff have limited nav access
