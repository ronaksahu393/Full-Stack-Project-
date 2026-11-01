# HotelPro — Application Technical Manual

> **Engineering Documentation, Component Architecture & Technical Reference for HotelPro MERN Application**

---

## 📑 Table of Contents
- [Architecture & Design System](#-architecture--design-system)
- [Frontend Architecture (`client/`)](#-frontend-architecture-client)
- [Backend Architecture (`server/`)](#-backend-architecture-server)
- [Dependencies & Tooling](#-dependencies--tooling)
- [Environment Configuration Guide](#-environment-configuration-guide)
- [Database Configuration & Resilience](#-database-configuration--resilience)
- [Development & Build Commands](#-development--build-commands)
- [Automated Testing Suite (156 Tests)](#-automated-testing-suite-156-tests)
- [Complete REST API Specification (56 Endpoints)](#-complete-rest-api-specification-56-endpoints)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🎨 Architecture & Design System

HotelPro departs from generic SaaS dashboard styling by utilizing an editorial boutique hospitality aesthetic.

### Curated Color Palette
* **Deep Forest Green** (`#173F35`): Primary brand anchor, confident, calm, and grounded.
* **Warm Ivory** (`#F8F6F0`): Primary background canvas; provides warmth without clinical starkness.
* **Muted Champagne Gold** (`#C4A46B`): Accents, star ratings, premium tier badges, and fine borders.
* **Charcoal Slate** (`#252923`): High-contrast editorial typography and dark button accents.
* **Soft Stone** (`#E7E3D9`): Input outlines, card borders, and subtle structural dividers.

### Typography
* **Primary Editorial Display:** *Playfair Display* (Serif) — Used for headings, brand storytelling, and hero copy.
* **Interface & Body:** *Plus Jakarta Sans* (Sans-serif) — Clean, legible modern font for numbers, filters, and UI labels.

---

## 💻 Frontend Architecture (`client/`)

The frontend is an SPA built with React 18, Vite 5, Tailwind CSS, and Material UI v5.

```text
client/
├── public/
│   ├── images/
│   │   ├── destinations/       # Web-optimized destination photography (Goa, Jaipur, Munnar, etc.)
│   │   ├── hero/               # Carousel slides for the homepage hero section
│   │   ├── hotels/             # Verified boutique hotel property photography
│   │   ├── rooms/              # Curated room suites (Deluxe, Presidential, Heritage)
│   │   └── fallback-hotel.svg  # Zero-network SVG fallback vector
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/             # Navbar, Footer, Notifications
│   │   ├── home/               # HeroSection, BookingSearchPanel, FeaturedStays, FeaturedDestinations
│   │   ├── hotels/             # HotelCard, AmenityBadges, RatingDisplay
│   │   └── rooms/              # RoomCard, RoomFilters, BookingModal
│   ├── context/
│   │   ├── AuthContext.jsx     # User authentication state, token storage, login/logout actions
│   │   └── NotificationContext.jsx # Toast alerts and operational feedback
│   ├── pages/
│   │   ├── HomePage.jsx        # Landing page with hero carousel and search
│   │   ├── ExploreStaysPage.jsx# Hotel search with destination normalizer and locality filters
│   │   ├── HotelDetailPage.jsx # Individual property showcase and room listings
│   │   ├── RoomDetailPage.jsx  # Room-specific amenities, price calculation, and booking
│   │   ├── CheckoutPage.jsx    # Reservation confirmation and payment modal
│   │   ├── AboutPage.jsx       # Brand history, hospitality philosophy, and team
│   │   ├── ContactPage.jsx     # Inquiry submission and contact details
│   │   ├── LoginPage.jsx       # User login portal
│   │   ├── RegisterPage.jsx    # Guest self-registration portal
│   │   ├── ForgotPasswordPage.jsx # Password reset via OTP
│   │   └── dashboards/
│   │       ├── GuestDashboard.jsx # Guest bookings, receipts, and cancellation
│   │       ├── StaffDashboard.jsx # Housekeeping tasks and check-in/out logging
│   │       └── AdminDashboard.jsx # Financial telemetry, occupancy, user management
│   ├── services/
│   │   └── api.js              # Centralized Axios client with token interceptor and resilient retries
│   ├── utils/
│   │   ├── currency.js         # formatINR (Intl.NumberFormat('en-IN'))
│   │   ├── imageFallback.js    # Tri-tier fallback asset loader
│   │   ├── phoneValidation.js  # International E.164 phone validator
│   │   ├── pricing.js          # Client-side preview of room-nights and GST
│   │   └── countries.js        # Country code dataset
│   ├── App.jsx                 # Route definitions and RoleRoute guards
│   ├── main.jsx                # Application root mount
│   └── index.css               # Tailwind CSS directives and custom font imports
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Tri-Tier Image Fallback Pipeline (`imageFallback.js`)
To guarantee that images never render broken icons on user devices:
1. **Tier 1 (Remote CDN):** High-speed WebP image served from Unsplash CDN.
2. **Tier 2 (Local Asset Mirror):** If remote CDN fails or is blocked by client adblockers, the image handler swaps the `src` to `client/public/images/...`.
3. **Tier 3 (Zero-Network Inline SVG):** If the local file is unavailable, an inline vector SVG placeholder with the hotel branding renders instantly without network activity.

---

## ⚙️ Backend Architecture (`server/`)

The backend is a RESTful API built on Node.js and Express.js, using Mongoose for MongoDB schema modeling.

```text
server/
├── config/
│   └── database.js             # Mongoose connection with resilient in-memory fallback
├── controllers/
│   ├── authController.js       # Register, login, OTP verification, password reset
│   ├── hotelController.js      # Search, autocomplete, property retrieval, Bayesian ranking
│   ├── roomController.js       # Room listing, filtering, capacity check
│   ├── bookingController.js    # Concurrency lock, price calculation, Razorpay/Stripe, refunds
│   ├── staffController.js      # Housekeeping tasks, room cleaning status, check-in/out
│   └── adminController.js      # Revenue metrics, occupancy telemetry, user provisioning
├── middleware/
│   ├── authMiddleware.js       # JWT extraction and verification
│   ├── roleMiddleware.js       # RBAC role guards (guest, staff, admin)
│   └── errorHandler.js         # Unified JSON error formatter
├── models/
│   ├── User.js                 # Accounts with hashed passwords, roles, and status
│   ├── Hotel.js                # Properties with geolocation, localities, and amenities
│   ├── Room.js                 # Rooms bound to hotels with pricing, capacity, and bed types
│   ├── Booking.js              # Reservations with lifecycle states, payments, and timestamps
│   ├── Task.js                 # Operational staff assignments
│   └── Housekeeping.js         # Room cleaning records
├── routes/
│   ├── authRoutes.js           # /api/auth (12 endpoints)
│   ├── hotelRoutes.js          # /api/hotels (6 endpoints)
│   ├── roomRoutes.js           # /api/rooms (5 endpoints)
│   ├── bookingRoutes.js        # /api/bookings (12 endpoints)
│   ├── staffRoutes.js          # /api/staff (7 endpoints)
│   └── adminRoutes.js          # /api/admin (14 endpoints)
├── seeds/
│   ├── indiaSeedData.js        # Comprehensive Indian boutique properties across 15+ states
│   └── seeder.js               # Idempotent database seeder (skips duplicates safely)
├── services/
│   ├── paymentService.js       # Dual Razorpay & Stripe integration adapter
│   ├── emailService.js         # Nodemailer SMTP notification service
│   ├── seederService.js        # Seeder engine and relation validation
│   └── providers/              # Inventory catalog providers (demo vs live)
├── tests/                      # Automated test suites
├── utils/
│   ├── destinationNormalizer.js# Indian alias matching (Bombay -> Mumbai, etc.)
│   ├── rankingEngine.js        # Bayesian review score smoothing
│   └── taxCalculator.js        # Indian GST rate tiers (12% / 18%)
├── server.js                   # Application bootstrap and server listener
└── package.json
```

---

## 📦 Dependencies & Tooling

### Workspace Orchestrator (`HotelPro/package.json`)
* **`concurrently` (`^8.2.2`)**: Runs frontend and backend servers simultaneously within a single terminal session.

### Frontend Dependencies (`client/package.json`)
* **Core:** `react` (`^18.3.1`), `react-dom` (`^18.3.1`), `react-router-dom` (`^6.22.3`)
* **UI Components:** `@mui/material` (`^5.15.14`), `@emotion/react`, `@emotion/styled`, `lucide-react` (`^0.359.0`)
* **Networking:** `axios` (`^1.6.8`)
* **Styling & Build:** `vite` (`^5.1.6`), `tailwindcss` (`^3.4.1`), `autoprefixer` (`^10.4.19`), `postcss` (`^8.4.38`)

### Backend Dependencies (`server/package.json`)
* **Framework:** `express` (`^4.19.2`), `cors` (`^2.8.5`), `helmet` (`^7.1.0`), `morgan` (`^1.10.0`)
* **Database:** `mongoose` (`^8.2.4`)
* **Security & Auth:** `jsonwebtoken` (`^9.0.2`), `bcryptjs` (`^2.4.3`), `express-rate-limit` (`^7.2.0`)
* **Payments & Mail:** `razorpay` (`^2.9.2`), `stripe` (`^14.22.0`), `nodemailer` (`^6.9.13`)
* **Dev Tools:** `nodemon` (`^3.1.0`), `dotenv` (`^16.4.5`)

---

## 🔐 Environment Configuration Guide

Environment variables are configured in `server/.env`. A pre-configured template is provided in `server/.env.example`:

| Variable Name | Required | Default in Dev | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `5000` | Port for the Express backend server |
| `MONGODB_URI` | **Required** | `mongodb://127.0.0.1:27017/hotelpro` | MongoDB connection string (Local or Atlas) |
| `JWT_SECRET` | **Required** | *Must be ≥32 characters* | Cryptographic key used to sign and verify auth tokens |
| `NODE_ENV` | Optional | `development` | Environment mode (`development` or `production`) |
| `ALLOW_IN_MEMORY_DB` | Optional | `true` | Allows in-memory fallback store if local MongoDB is stopped |
| `DATA_STORE` | Optional | `mongodb` | Explicit data store selector (`mongodb` or `memory`) |
| `HOTEL_INVENTORY_PROVIDER` | Optional | `demo` | Provider engine (`demo` for seed catalog, `live` for APIs) |
| `LIVE_HOTEL_API_KEY` | Optional | `""` | API key for external live hotel inventory |
| `LIVE_HOTEL_API_SECRET` | Optional | `""` | API secret for external live hotel inventory |
| `LIVE_HOTEL_API_ENDPOINT` | Optional | `https://api.amadeus.com/v1` | Live hotel endpoint |
| `LIVE_HOTEL_TIMEOUT_MS` | Optional | `6000` | Timeout threshold in milliseconds for external APIs |
| `RAZORPAY_KEY_ID` | Optional | `""` (Demo simulated) | Public API Key for Razorpay checkout |
| `RAZORPAY_KEY_SECRET` | Optional | `""` (Demo simulated) | Private Secret for Razorpay payment captures |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | `""` | Secret for HMAC webhook verification |
| `STRIPE_SECRET_KEY` | Optional | `""` (Demo simulated) | Secret API Key for Stripe Card payments |
| `STRIPE_WEBHOOK_SECRET` | Optional | `""` | Secret for Stripe webhook signature verification |
| `STRIPE_LIVE_VERIFIED` | Optional | `false` | Enable live Stripe server-to-server settlement |
| `CORS_ORIGIN` | Optional | `localhost:5173,localhost:5000` | Allowed CORS origins for browser security |

---

## 🗄️ Database Configuration & Resilience

HotelPro features a **Dual-Mode Resilient Database Layer**:

1. **Primary Mode (Persistent MongoDB):** Connects to any local MongoDB instance or MongoDB Atlas cluster via `MONGODB_URI`. Supports replica sets, connection pools, and automatic indexing.
2. **Development Fallback Mode (In-Memory Store):** If `NODE_ENV === "development"` and local MongoDB is unreachable, the server logs a clear diagnostic notice and falls back to an in-memory document store (`ALLOW_IN_MEMORY_DB=true`). This enables immediate evaluation without installing external database software.
3. **Production Fail-Fast Guard:** In `production` mode, the in-memory fallback is strictly disabled. The server will fail fast with a fatal exit code if MongoDB is unreachable, preventing accidental data loss in live environments.

---

## 💻 Development & Build Commands

All operations can be orchestrated from the `HotelPro/` workspace root:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs both backend API and frontend client concurrently with colored prefixes |
| `npm run server` | Runs backend only (`npm --prefix server run dev` with nodemon) |
| `npm run client` | Runs frontend only (`npm --prefix client run dev` with Vite HMR) |
| `npm run install:all` | Installs root orchestrator, server, and client npm dependencies |
| `npm run build` | Compiles production-optimized frontend bundle into `client/dist/` |
| `npm test` | Runs both backend and frontend test suites |
| `npm run test:server` | Executes all 10 automated backend test suites (156 subtests) |
| `npm run seed` | Seeds Indian boutique hotel and room catalog idempotently |
| `npm run migrate` | Executes safe schema migration script |
| `npm run archive` | Creates a clean source zip package excluding `node_modules` and secrets |

---

## 🧪 Automated Testing Suite (156 Tests)

The backend contains 10 comprehensive automated integration test suites executed using Node.js's native test runner:

```bash
cd HotelPro
npm run test:server
```

### Test Coverage Breakdown

| Test Suite | File Location | Key Verifications | Subtests |
| :--- | :--- | :--- | :---: |
| **Security & Integrity** | `tests/securityAndIntegrity.test.js` | JWT auth, role escalation denial, password hashing | 33 |
| **Search & Discovery** | `tests/indiaHotelDiscovery.test.js` | Alias resolution, locality matching, rating sorting | 27 |
| **Provider Modes** | `tests/hotelProvider.test.js` | Demo catalog isolation and live provider adapter | 9 |
| **Pricing & GST** | `tests/bookingPriceAndTax.test.js` | Night calculations, 12% vs 18% GST tier rules | 10 |
| **Database Resilience** | `tests/mongoAndStoreMode.test.js` | Production fail-fast and dev in-memory fallback | 11 |
| **Payment Verification** | `tests/bookingPaymentVerification.test.js`| Razorpay orders, HMAC signatures, replay attack prevention | 25 |
| **Cancellation & Refund** | `tests/cancellationAndRefund.test.js` | Policy windows, refund state changes, idempotency | 10 |
| **Lifecycle & Concurrency** | `tests/bookingLifecycleAndConcurrency.test.js`| Mutex reservation lock, overlapping date conflict rejection | 15 |
| **Admin Analytics** | `tests/adminAnalytics.test.js` | Occupancy rates, realized revenue, date range queries | 8 |
| **Idempotent Seeder** | `tests/idempotentSeeder.test.js` | Duplicate detection, orphan room repair, slug integrity | 8 |
| **Total Verified** | | | **156 Passed (0 Failed)** |

---

## 📡 Complete REST API Specification (56 Endpoints)

### 1. Authentication Endpoints (`/api/auth`) — 12 Routes
* `POST /api/auth/register` — Register a new guest user account.
* `POST /api/auth/verify-email` — Verify email address via 6-digit OTP code.
* `POST /api/auth/resend-verification-otp` — Request a fresh email verification code.
* `POST /api/auth/login` — Authenticate credentials and receive a signed JWT token.
* `POST /api/auth/forgot-password` — Request a password reset OTP code.
* `POST /api/auth/verify-reset-otp` — Validate reset OTP code.
* `POST /api/auth/reset-password` — Submit new password with validated reset code.
* `POST /api/auth/social-login` — Federated login adapter endpoint.
* `POST /api/auth/change-password` *(Protected)* — Change password for authenticated session.
* `POST /api/auth/logout` *(Protected)* — Invalidate user session.
* `GET  /api/auth/me` *(Protected)* — Retrieve currently logged-in user profile.
* `PUT  /api/auth/profile` *(Protected)* — Update user profile details.

### 2. Hotel Discovery Endpoints (`/api/hotels`) — 6 Routes
* `GET /api/hotels/provider-status` — Retrieve inventory provider status.
* `GET /api/hotels/search` — Search hotels by destination, locality, price, amenities, rating.
* `GET /api/hotels/autocomplete` — Real-time destination query suggestions.
* `GET /api/hotels/featured` — Curated luxury boutique stays for homepage showcase.
* `GET /api/hotels/destinations` — Top featured travel destinations with property counts.
* `GET /api/hotels/:id` — Retrieve full hotel profile, room listings, and reviews.

### 3. Room Management Endpoints (`/api/rooms`) — 5 Routes
* `GET    /api/rooms` — Query all active rooms with optional hotel ID filter.
* `GET    /api/rooms/:id` — Retrieve room specifications, pricing, and amenities.
* `POST   /api/rooms` *(Admin)* — Create a new room type for a hotel.
* `PUT    /api/rooms/:id` *(Admin)* — Update room details, rates, or max guest capacity.
* `DELETE /api/rooms/:id` *(Admin)* — Remove room listing.

### 4. Booking & Payment Endpoints (`/api/bookings`) — 12 Routes
* `GET  /api/bookings/payment-telemetry` — Retrieve public payment gateway availability.
* `POST /api/bookings/payment-webhook` — Receive signed payment gateway webhooks.
* `POST /api/bookings` *(Protected)* — Create a reservation with date-overlap mutex lock.
* `POST /api/bookings/:id/create-razorpay-order` *(Protected)* — Generate a Razorpay order in paise.
* `POST /api/bookings/:id/verify-payment` *(Protected)* — Verify payment signature and mark booking `Confirmed`.
* `GET  /api/bookings/my` *(Protected)* — Retrieve guest's personal reservation history.
* `GET  /api/bookings/:id` *(Protected)* — Retrieve detailed reservation receipt.
* `PUT  /api/bookings/:id/cancel` *(Protected)* — Cancel reservation and initiate refund workflow.
* `POST /api/bookings/:id/refund` *(Protected)* — Process refund settlement.
* `GET  /api/bookings/:id/refund` *(Protected)* — Query refund transaction details.
* `GET  /api/bookings` *(Staff/Admin)* — Query all bookings across properties.
* `PUT  /api/bookings/:id/status` *(Staff/Admin)* — Update reservation operational status.

### 5. Staff Operations Endpoints (`/api/staff`) — 7 Routes
* `GET /api/staff/overview` — Operations dashboard showing active housekeeping queues and check-ins.
* `PUT /api/staff/rooms/:id/cleaning` — Update room cleaning status (`Clean`, `Dirty`, `In Progress`).
* `PUT /api/staff/housekeeping/:id` — Update housekeeping record.
* `GET /api/staff/tasks` — List assigned operational duties.
* `PUT /api/staff/tasks/:id/status` — Mark task `In Progress` or `Completed`.
* `PUT /api/staff/bookings/:id/check-in` — Record physical guest check-in arrival.
* `PUT /api/staff/bookings/:id/check-out` — Record guest departure and flag room for cleaning.

### 6. Administrative Telemetry Endpoints (`/api/admin`) — 14 Routes
* `GET    /api/admin/metrics` — Aggregate metrics: occupancy rate, realized revenue, total stays.
* `GET    /api/admin/users` — List registered platform users.
* `PUT    /api/admin/users/:id/role` — Update user access level (`guest`, `staff`, `admin`).
* `PUT    /api/admin/users/:id/status` — Update user account status (`active`, `suspended`).
* `DELETE /api/admin/users/:id` — Remove user account.
* `POST   /api/admin/staff` — Provision staff member credentials.
* `GET    /api/admin/staff` — List staff accounts and departments.
* `POST   /api/admin/tasks` — Assign operational task to staff member.
* `GET    /api/admin/tasks` — List all organization tasks.
* `GET    /api/admin/bookings` — View audit history of all reservations.
* `GET    /api/admin/hotels` — List managed hotel properties.
* `POST   /api/admin/hotels` — Create a new hotel property listing.
* `PUT    /api/admin/hotels/:id` — Edit hotel property details.
* `POST   /api/admin/hotels/:id/rooms` — Provision additional room type to a hotel property.

---

## 🛠️ Troubleshooting & FAQs

### Q1: Port 5000 or 5173 is already in use
**Solution:** Stop lingering Node processes using PowerShell:
```powershell
Get-Process -Name node | Stop-Process -Force
```
Or customize the backend port by setting `PORT=5001` in `server/.env`.

### Q2: MongoDB connection fails (`ECONNREFUSED 127.0.0.1:27017`)
**Solution:** HotelPro is configured to seamlessly support in-memory development mode. In `server/.env`, verify that `ALLOW_IN_MEMORY_DB=true` is set. The server will launch immediately with local simulated persistence. For production persistence, ensure MongoDB Community Server is started or supply a MongoDB Atlas connection string in `MONGODB_URI`.

### Q3: Server fails with `JWT_SECRET must be at least 32 characters in production`
**Solution:** In production mode (`NODE_ENV=production`), HotelPro enforces high-entropy JWT secrets to prevent brute-force token forgery. Ensure `JWT_SECRET` in your deployment environment has at least 32 characters.

### Q4: Images are not loading or showing broken icons
**Solution:** HotelPro includes a tri-tier fallback pipeline. If remote Unsplash images are blocked by adblockers, the application automatically falls back to local images stored in `client/public/images/`. Run `node scripts/downloadLocalImages.js` from `HotelPro/` to refresh local image assets.
