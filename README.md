<div align="center">

# 🏨 HotelPro — Boutique Hotel Booking & Management System

> **A comprehensive, full-featured MERN stack hospitality platform engineered for luxury boutique hotel reservations, automated regional room discovery, multi-tier operations, and business telemetry.**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Material UI](https://img.shields.io/badge/Material--UI-v5-007FFF?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/)
[![Tests Passing](https://img.shields.io/badge/Automated_Tests-156_Passed-success?style=for-the-badge&logo=checkmarx&logoColor=white)](https://github.com/ronaksahu393/Full-Stack-Project-)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](https://opensource.org/licenses/ISC)

[Repository Structure](#-repository-structure) • [Core Features](#-core-features-verified-in-code) • [Quick Start](#-quick-start-guide) • [Architecture](#-system-architecture) • [API Overview](#-rest-api-overview-56-endpoints) • [Verified Test Matrix](#-automated-testing--verified-results)

---

</div>

## 📌 Project Overview & Problem Statement

Independent boutique hotels, luxury heritage properties, and hospitality chains often struggle with fragmented software stacks: booking frontends disconnected from operational housekeeping, race conditions in room availability causing embarrassing double-bookings, rigid legacy payment workflows, and nonexistent real-time telemetry for operational and financial decision-making.

**HotelPro** is an end-to-end hospitality management and reservation system engineered to solve these operational bottlenecks:
* **For Guests:** Instant stay discovery across Indian destinations, transparent GST accommodation tax breakdowns, interactive room modaling, and self-service reservation management with policy-compliant cancellation workflows.
* **For Staff:** Operational housekeeping queues, real-time room cleaning status updates, guest check-in/check-out lifecycle tracking, and maintenance duty coordination.
* **For Administrators:** Real-time occupancy analytics, verified realized revenue telemetry, automated staff account provisioning, and hotel property inventory management.

---

## ✨ Core Features (Verified in Code)

### 1. 🔍 India-Wide Hotel Discovery & Smart Normalizer
* **Colloquial & Historical Alias Resolution:** Handles colloquial city names automatically (e.g., *Bombay* &rarr; *Mumbai*, *Banaras* / *Kashi* &rarr; *Varanasi*, *Cochin* &rarr; *Kochi*, *Poona* &rarr; *Pune*).
* **Locality-Aware Search:** Composite matching on city, locality, and state (e.g., "Candolim, Goa", "Banjara Hills, Hyderabad") with dynamic ranking boosts.
* **Bayesian Rating Engine:** Implements evidence-based Bayesian weighted score smoothing:
  $$\text{WR} = \left(\frac{v}{v + m}\right) \times R + \left(\frac{m}{v + m}\right) \times C$$
  where $v$ = review count, $m = 10$ (minimum confidence threshold), $R$ = property rating, and $C = 3.8$ (prior mean). This prevents a property with a single 5-star review from artificially outranking established luxury stays with hundreds of verified reviews.

### 2. 🛡️ Concurrency-Safe Reservation Lifecycle
* **Double-Booking Mutex Lock:** In-flight room reservation mutex locks (`roomLocks`) with automatic expiration (`LOCK_TIMEOUT_MS = 8000`) and MongoDB date-overlap validation queries:
  $$\text{Overlap} \iff (\text{checkIn} < \text{requestedCheckOut}) \land (\text{checkOut} > \text{requestedCheckIn})$$
* **Server-Side Price Auditing:** Recalculates total room-nights, applicable GST tiers, and overrides any client-submitted price tampering.
* **Full Cancellation & Refund Workflow:** Policy-checked cancellations with automated refund state progression (`Pending` &rarr; `Completed` or `Not_Applicable` for unpaid bookings).

### 3. 💳 Payment Processing Architecture
* **Integrated Razorpay & Stripe Gateway Adapters:** Clean server-side service layer supporting Indian UPI / NetBanking / Cards via Razorpay and international payments via Stripe.
* **Cryptographic Signature Verification:** Enforces timing-safe HMAC-SHA256 signature verification (`verifyRazorpaySignature`) and Stripe PaymentIntent status checks.
* **Simulated Development Mode:** When running locally without external merchant API keys, HotelPro activates a built-in development simulator to enable full end-to-end checkout and reservation testing without charging real cards.

### 4. 👥 Role-Based Portals & Dashboards
* **Guest Portal:** Browse high-resolution room galleries, book stays, inspect invoice receipts, and cancel reservations.
* **Staff Portal:** Housekeeping queues, cleaning status updates (`Clean`, `Dirty`, `In Progress`), and guest check-in / check-out recording.
* **Admin Executive Dashboard:** Key business metrics including total verified revenue, room occupancy rates, upcoming check-ins, user administration, and hotel catalog CRUD.

### 5. 🖼️ Multi-Tier Resilient Asset Pipeline
* **Zero-Network Image Resilience:** Tri-tier image loading (`Remote CDN` &rarr; `Web-Optimized Local Asset` &rarr; `Inline Vector SVG Data URI`), guaranteeing that hotel and room cards never show broken image icons, even in offline or ad-blocked environments.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Material UI (MUI v5), Lucide Icons, Concurrently |
| **Backend** | Node.js (v18.0.0+ / v20+ recommended), Express.js 4, Mongoose 8, Bcrypt.js, JSON Web Tokens (JWT) |
| **Database** | MongoDB (Primary) + Built-in In-Memory Development Fallback Store |
| **Security** | Express Rate Limit (Sensitive Auth & OTP limiters), Cryptographic JWT Signing, CORS |
| **Testing** | Node.js Test Runner, Automated Integration & Concurrency Test Suites |

---

## 📸 Application Interface Showcase (Screenshot Placeholder)

> *The UI is crafted with an editorial hospitality aesthetic featuring deep forest green (`#173F35`), muted champagne gold (`#C4A46B`), and clean ivory canvas (`#F8F6F0`).*

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  HOTELPRO APPLICATION INTERFACE                               │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│   [ Homepage & Live Search ]          [ Explore Stays & Discovery ]     [ Room Booking Modal ] │
│   Hero Carousel & Filter Engine       Locality & Price Range Filtering  Live Pricing & Taxes   │
│                                                                                                │
│   [ Guest Dashboard ]                 [ Staff Operations Board ]        [ Admin Analytics ]    │
│   Active Stays & Receipts             Housekeeping & Room Statuses      Revenue & Occupancy    │
│                                                                                                │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

> ⚠️ **Screenshot Placeholder:**
> This section is reserved for genuine browser screenshots of the running application. Stock UI mockups and simulated frames are strictly avoided.
> To populate this showcase with your real browser captures:
> 1. Start the app locally: `npm run dev`
> 2. Capture views and save them to `docs/screenshots/`:
>    - `docs/screenshots/home.png` — Hero section and booking search panel
>    - `docs/screenshots/explore.png` — Hotel discovery with locality filters
>    - `docs/screenshots/dashboard.png` — Admin executive analytics telemetry
> 3. Reference them in markdown: `![Home View](docs/screenshots/home.png)`

---

## 📁 Repository Structure

```text
Full-Stack-Project-/
├── HotelPro/                                      # Full-Stack Application Codebase
│   ├── client/                                    # Frontend Application (React 18 + Vite)
│   │   ├── public/images/                         # High-res local asset catalog (Hotels, Rooms, Hero)
│   │   ├── src/
│   │   │   ├── components/                        # Navbar, Footer, HotelCard, RoomCard, SearchPanel
│   │   │   ├── context/                           # AuthContext, NotificationContext
│   │   │   ├── pages/                             # Home, ExploreStays, HotelDetail, Dashboards
│   │   │   ├── services/                          # Resilient Axios/Fetch API client
│   │   │   └── utils/                             # Tax calculation, Indian Rupee formatter (INR)
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── server/                                    # Backend Application (Node.js + Express)
│   │   ├── config/                                # MongoDB connection & resilience configuration
│   │   ├── controllers/                           # Auth, Hotel, Room, Booking, Staff, Admin
│   │   ├── middleware/                            # JWT authentication, role verification, rate limiters
│   │   ├── models/                                # User, Hotel, Room, Booking, Task, Housekeeping
│   │   ├── routes/                                # Express REST API endpoints (56 verified routes)
│   │   ├── seeds/                                 # Idempotent Indian hotel catalog seeder
│   │   ├── services/                              # Razorpay, Stripe, Email, and Seeder services
│   │   ├── tests/                                 # 10 automated integration test suites (156 tests)
│   │   ├── utils/                                 # Destination normalizer, tax calculator, ranking
│   │   ├── server.js                              # Main server entrypoint
│   │   ├── package.json
│   │   └── .env.example                           # Sanitized backend environment template
│   ├── scripts/                                   # Clean source archive packager & asset fetcher
│   ├── .env.example                               # Root application environment template
│   ├── .gitignore                                 # Application Git exclusions
│   ├── package.json                               # Workspace orchestrator (concurrently)
│   ├── package-lock.json
│   └── README.md                                  # Detailed application technical guide
├── Full Stack Project Documention/                # Master System Documentation
│   └── HotelPro_Project_Documentation.pdf         # Comprehensive architecture & specification PDF
├── phase Wise Documentation/                      # Phase-Wise Project Lifecycle Documentation
│   └── HotelPro_Booking And Management System/
│       ├── Ideation Phase/                        # Brainstorming, Problem Statements & Empathy Maps
│       ├── requirement analysis/                  # Data Flow Diagrams, Tech Stack & Requirements
│       ├── Project Design Phase/                  # Solution Architecture & Fit Analysis
│       ├── Project Planning/                      # Project Execution & Milestone Planning
│       └── Performance Testing/                   # User Acceptance Testing (UAT) & Performance
├── .gitignore                                     # Multi-tier root protection rules
└── README.md                                      # Repository landing page (this document)
```

---

## 🏛️ System Architecture

```text
 ┌────────────────────────────────────────────────────────┐
 │                   GUEST / CLIENT BROWSER               │
 │    React 18  •  Vite  •  Tailwind CSS  •  MUI v5       │
 └───────────────────────────┬────────────────────────────┘
                             │  HTTPS / REST JSON
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │                     EXPRESS BACKEND                    │
 │  • Auth & OTP Rate Limiters   • JWT Verification       │
 │  • Role Authorization (RBAC)  • Destination Normalizer │
 │  • Tax Calculation (GST)      • Mutex Booking Lock     │
 └─────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
 ┌───────────────────────────┐   ┌────────────────────────┐
 │     DATABASE LAYER        │   │    PAYMENT GATEWAYS    │
 │  MongoDB Atlas / Local    │   │  Razorpay (UPI/Cards)  │
 │  (With In-Memory Fallback)│   │  Stripe (Credit Cards) │
 └───────────────────────────┘   └────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
* **npm**: v9.0.0 or higher
* **MongoDB**: Local MongoDB instance or MongoDB Atlas URI *(Optional: backend includes built-in in-memory fallback store for zero-setup evaluation)*

### 1. Clone & Enter Application
```bash
git clone https://github.com/ronaksahu393/Full-Stack-Project-.git
cd Full-Stack-Project-/HotelPro
```

### 2. Install Dependencies
```bash
# Installs root orchestrator, backend, and frontend packages simultaneously:
npm run install:all
```

### 3. Configure Environment Variables
Create your local server environment file from the provided template:
```bash
# On Windows (PowerShell):
Copy-Item server\.env.example server\.env

# On Linux / macOS:
cp server/.env.example server/.env
```

Open `server/.env` and review the development configuration:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hotelpro
JWT_SECRET=your_secure_random_jwt_secret_here_minimum_32_chars
NODE_ENV=development
ALLOW_IN_MEMORY_DB=true
```
*(No external database or API keys are required to run immediately; development defaults work out-of-the-box!)*

### 4. Run Development Servers
```bash
# Starts both Express API (:5000) and Vite Client (:5173) concurrently:
npm run dev
```

* **Client UI:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

### 5. Account Setup & Seeding
* You can self-register a new guest account directly in the UI at `http://localhost:5173/register`.
* To optionally populate the hotel catalog with boutique properties, run from `HotelPro/`:
  ```bash
  npm run seed
  ```

---

## 🧪 Automated Testing & Verified Results

The application includes 10 automated integration test suites executed using Node.js's native test runner, validating data integrity, pricing formulas, authentication, and concurrency locks:

```bash
cd HotelPro

# Execute all backend test suites:
npm run test:server
```

### Actual Test Execution Matrix (Verified 100% Passing)

```text
================================================================================
  HOTELPRO TEST EXECUTION MATRIX
================================================================================
Suite Name                                    Status    Passed  Failed   Time
--------------------------------------------------------------------------------
Security, Booking & Data Integrity            PASSED        33       0   2.16s
India Hotel Search & Discovery                PASSED        27       0   1.01s
Hotel Provider Mode & Integration             PASSED         9       0   1.03s
Booking Price & Tax Accuracy (GST)            PASSED        10       0   0.50s
MongoDB Connection & Store Mode Resilience    PASSED        11       0   6.41s
Payment Verification & Gateway Integration    PASSED        25       0   2.50s
Cancellation & Refund Workflow                PASSED        10       0   1.44s
Booking Lifecycle & Concurrency Locks         PASSED        15       0   1.60s
Admin Dashboard Analytics & Telemetry         PASSED         8       0   4.69s
Idempotent Seeder & Relationship Repair       PASSED         8       0   4.46s
================================================================================
Total Suites: 10 Passed, 0 Failed | Total Subtests: 156 Passed, 0 Failed
================================================================================
```

---

## 🌐 REST API Summary (Overview of 56 Endpoints)

> **Note:** The table below summarizes key routes across the 6 core modules. For the complete parameter-by-parameter specification of all 56 endpoints, request payloads, and response structures, see the dedicated [HotelPro Technical Manual](HotelPro/README.md#-complete-rest-api-specification-56-endpoints).

| Module | Endpoints Count | Key Routes | Auth Scope |
| :--- | :---: | :--- | :---: |
| **Auth** | **12** | `POST /register`, `POST /login`, `POST /verify-email`, `GET /me`, `PUT /profile` | Public / Bearer JWT |
| **Hotels** | **6** | `GET /search`, `GET /autocomplete`, `GET /featured`, `GET /destinations`, `GET /:id` | Public |
| **Rooms** | **5** | `GET /`, `GET /:id`, `POST /` (Admin), `PUT /:id` (Admin), `DELETE /:id` (Admin) | Public / Admin |
| **Bookings**| **12** | `POST /`, `POST /:id/verify-payment`, `PUT /:id/cancel`, `GET /my`, `GET /:id` | Bearer JWT / Staff |
| **Staff** | **7** | `GET /overview`, `PUT /rooms/:id/cleaning`, `PUT /bookings/:id/check-in` | Staff / Admin |
| **Admin** | **14** | `GET /metrics`, `GET /users`, `PUT /users/:id/role`, `POST /hotels`, `POST /staff` | Admin Only |

---

## 🔮 Future Roadmap

- [ ] **Multi-Language Support (i18n):** Hindi, Bengali, Tamil, and Marathi localization.
- [ ] **Calendar Synchronization:** 2-way iCal integration for OTA channel synchronization.
- [ ] **Dynamic Pricing Engine:** High-demand and seasonal surge automated tariff adjustments.
- [ ] **Progressive Web App (PWA):** Offline housekeeping check-in support for staff in low-connectivity areas.

---

## 👨‍💻 Author & Acknowledgments

* **Developer:** [Ronak Sahu](https://github.com/ronaksahu393)
* **Repository:** [https://github.com/ronaksahu393/Full-Stack-Project-](https://github.com/ronaksahu393/Full-Stack-Project-)
* **Design & Inspiration:** Luxury boutique hospitality aesthetics, Playfair Display & Plus Jakarta Sans typography.
* **License:** This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
