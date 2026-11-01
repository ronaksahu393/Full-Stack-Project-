# HotelPro — Hotel Booking & Management System

> **Contemporary Luxury Boutique Hospitality & Management Platform**  
> Designed with an editorial aesthetic, refined typography, and full-stack MERN architecture.

---

## ✦ Brand Identity & Design System

- **Deep Forest Green** (`#173F35`): Primary brand anchor, confident & timeless.
- **Warm Ivory** (`#F8F6F0`): Main architectural canvas & soft background.
- **Muted Champagne Gold** (`#C4A46B`): Subtle accents, badges & fine borders.
- **Charcoal** (`#252923`): High-contrast, legible editorial text.
- **Soft Stone** (`#E7E3D9`): Structural dividers, input backgrounds & cards.
- **Pure White** (`#FFFFFF`): Deliberate card highlights & popovers.
- **Typography**: *Playfair Display* (Editorial Serif) paired with *Plus Jakarta Sans* (Clean Modern Sans).

---

## ✦ Architecture Overview

```
HotelPro/
├── server/
│   ├── controllers/        # Auth, Hotel, Room, Booking, Staff & Admin controllers
│   ├── middleware/         # JWT verification, Role authorization, Rate limiter, Error handler
│   ├── models/             # Mongoose schemas: Hotel, Room, Booking, User, Housekeeping
│   ├── routes/             # RESTful API routes (/api/auth, /api/hotels, /api/rooms, /api/bookings, /api/staff, /api/admin)
│   ├── scripts/            # Non-destructive database migration script (migrate.js)
│   ├── seeds/              # India-wide hotel directory (indiaSeedData.js) & boutique seed data (seedData.js)
│   ├── services/           # Provider adapters (demoProvider.js, liveProviderInterface.js)
│   ├── tests/              # Automated verification suites (securityAndIntegrity.test.js, indiaHotelDiscovery.test.js)
│   ├── utils/              # Destination normalizer, Indian GST tax calculator, Bayesian ranking engine
│   ├── server.js           # Express server entry point with hybrid resilient DB session fallback
│   ├── package.json
│   └── .env.example
├── client/
│   ├── public/             # Favicon and static brand assets
│   ├── src/
│   │   ├── components/     # Editorial Navbar, Footer, Modals, Search Bar, HotelCard, Room Cards, etc.
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Home, ExploreStaysPage, HotelDetailPage, Dashboards (Guest, Staff, Admin)
│   │   ├── services/       # Resilient API service with distinct HTTP error & network handling
│   │   ├── utils/          # Indian Rupee currency formatting (formatINR via Intl.NumberFormat)
│   │   ├── App.jsx         # Routes & Role-based protected routes
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json            # Root workspace scripts (run both with concurrently)
└── README.md
```

---

## ✦ Quick Start Guide

### 1. Install Dependencies
```bash
# From root directory:
npm run install:all

# Or install root dependencies:
npm install
```

### 2. Configure Server Environment
Copy `server/.env.example` to `server/.env` (or root `.env.example` to `server/.env`):
```bash
# On Linux/macOS:
cp server/.env.example server/.env

# On Windows (PowerShell):
Copy-Item server\.env.example server\.env
```

Key environment configuration variables:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hotelpro
JWT_SECRET=your_secure_random_jwt_secret_here_minimum_32_chars
NODE_ENV=development

# Optional data store override (defaults to mongodb with dev in-memory fallback):
ALLOW_IN_MEMORY_DB=true

# Inventory provider mode: "demo" (default) or "live"
HOTEL_INVENTORY_PROVIDER=demo

# Optional external live provider credentials (server-side only):
LIVE_HOTEL_API_KEY=
LIVE_HOTEL_API_SECRET=
LIVE_HOTEL_API_ENDPOINT=https://api.amadeus.com/v1
LIVE_HOTEL_TIMEOUT_MS=6000

# Optional payment gateway secrets (server-side only):
STRIPE_SECRET_KEY=
RAZORPAY_KEY_SECRET=
```
> **Security Note**: Never commit `.env` files, production database connection strings, or private keys to source control. The repository `.gitignore` automatically excludes all `.env` and `.env.*` files while tracking `.env.example` templates. All secrets remain strictly on the backend and are never bundled into client-facing code.
*(Note: The backend includes built-in in-memory fallback persistence so it functions immediately even if MongoDB is not locally running!)*

### 3. Safe Database Migration & Seeding (Optional)
```bash
# Run migration from root:
npm run migrate

# Run idempotent seeder from root:
npm run seed
```
*Applies schemas, Hotel-Room references, and search indexes without dropping existing user records or reservations.*

### 4. Run Application
```bash
# Run both server & client concurrently from root:
npm run dev

# Or run services independently from root:
# Terminal 1 (Server API on port 5000):
npm run server    # or: npm run dev:server

# Terminal 2 (Client UI on port 5173):
npm run client    # or: npm run dev:client
```

- **Client (Web Application)**: `http://localhost:5173`  
- **Server (Backend API)**: `http://localhost:5000`

### 5. Automated Testing
```bash
# Execute all server and client automated tests from root:
npm test

# Run server test suites only (all 9 suites, 120 tests):
npm run test:server    # or: npm run test:backend

# Run client API error handling and fallback tests only:
npm run test:client    # or: npm run test:frontend

# Run individual server suites standalone:
npm --prefix server run test:security
npm --prefix server run test:discovery
npm --prefix server run test:payment
npm --prefix server run test:refund
npm --prefix server run test:pricing
npm --prefix server run test:mongo
npm --prefix server run test:analytics
npm --prefix server run test:provider
npm --prefix server run test:seed
```

### 6. Production Build
```bash
# Build client for production from root:
npm run build
```

### 7. Clean Source Packaging
Create a clean source distribution archive that safely excludes `node_modules`, build output (`dist/`), secret files (`.env`), caches, logs, and temporary files:
```bash
# Package clean source archive to hotelpro-source.zip:
npm run archive

# Or using the alias:
npm run package:source
```
The resulting archive includes package manifests, lockfiles, configuration templates (`.env.example`), tests, seeds, and source code ready for immediate deployment and dependency restoration using `npm run install:all`.

---

## ✦ Built-in Demonstration Accounts

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Guest** | `guest@hotelpro.com` | `guest123` | Book stays, explore Indian hotels, cancel bookings, view receipts |
| **Staff** | `staff@hotelpro.com` | `staff123` | Housekeeping task supervisor, room cleaning status updates |
| **Admin** | `admin@hotelpro.com` | `admin123` | Verified revenue metrics, real-time occupancy, user roles, Indian hotel directory |

---

## ✦ Core Features & Security Standards

1. **Strict Authentication & Role Authorization**:
   - Cryptographic JWT signing using environment variables (fallback secrets strictly disallowed in production).
   - Passwords strictly hashed with `bcrypt` (zero plain-text comparisons).
   - Public registration strictly restricted to Guest role; privilege escalation attempts discarded.
   - Ownership checks on all reservation, payment, and profile operations.

2. **India-Wide Hotel Discovery & Search**:
   - Structured property location: Country, State, City, Locality, and Postal Code.
   - Historical and colloquial alias resolution (e.g. *Bombay* &rarr; *Mumbai*, *Banaras* &rarr; *Varanasi*).
   - Composite locality matching (e.g. "Vijay Nagar, Indore", "Candolim, Goa") with locality ranking boost.
   - Transparent Bayesian rating smoothing and distance-to-center weighting.

3. **Booking & Concurrency Integrity**:
   - Concurrency mutex lock on room reservations preventing race-condition double bookings.
   - Server-side price recalculation overriding any client tampering.
   - Clear distinction between demo test-mode simulated payments and verified merchant gateway transactions.
   - Accurate refund reporting: only claims refund initiated if payment was captured.

4. **Executive Admin & Operations Telemetry**:
   - Revenue computed strictly from verified `paymentStatus === "Paid"` records.
   - Occupancy rate calculated from active reservations spanning current date against room inventory.
   - Check-in arrivals and check-out departures accurately derived from stay dates.

5. **Indian Currency & Taxation**:
   - Indian Rupee currency formatting using `Intl.NumberFormat('en-IN')` (`formatINR`).
   - Standard Indian accommodation GST calculation (12% for rates < ₹7,500; 18% for rates ≥ ₹7,500).
