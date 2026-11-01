# Full-Stack-Project — HotelPro

A production-grade Boutique Hotel Booking & Management System built with the MERN stack (MongoDB, Express, React, Node.js), featuring real-time room discovery, dual payment gateways (Razorpay & Stripe), booking lifecycle management, staff operations, and an administrative analytics engine.

---

## 📁 Repository Structure

This repository is organized into the complete application codebase and project documentation:

```text
Full-Stack-Project-/
├── HotelPro/                                      # Complete HotelPro Full-Stack Application
│   ├── client/                                    # Frontend Application (React 18, Vite, Tailwind CSS, MUI)
│   │   ├── public/images/                         # High-resolution web-optimized local assets
│   │   ├── src/                                   # Components, Pages, Contexts, Hooks, Services
│   │   ├── package.json                           # Frontend package manifest
│   │   ├── vite.config.js                         # Vite build and dev configuration
│   │   └── .gitignore                             # Client-level Git exclusions
│   ├── server/                                    # Backend Application (Node.js, Express, MongoDB/Mongoose)
│   │   ├── config/                                # Database & environment configuration
│   │   ├── controllers/                           # Auth, Booking, Hotel, Room, Admin, Staff controllers
│   │   ├── middleware/                            # JWT authentication, role verification, error handlers
│   │   ├── models/                                # Mongoose schemas (User, Hotel, Room, Booking, Task)
│   │   ├── routes/                                # REST API endpoints
│   │   ├── seeds/                                 # Idempotent seed catalogs and discovery data
│   │   ├── services/                              # Payment (Razorpay/Stripe), Email, Seeder services
│   │   ├── tests/                                 # Automated integration & security test suites
│   │   ├── server.js                              # Main application entry point
│   │   ├── package.json                           # Backend package manifest
│   │   ├── .env.example                           # Sanitized environment variable template
│   │   └── .gitignore                             # Server-level Git exclusions
│   ├── scripts/                                   # Maintenance, asset downloads & clean packaging scripts
│   ├── .env.example                               # Application root environment template
│   ├── .gitignore                                 # Application-level Git exclusions
│   ├── package.json                               # Root workspace script orchestrator (concurrently)
│   ├── package-lock.json                          # Root dependency lockfile
│   └── README.md                                  # In-depth HotelPro technical documentation
├── Full Stack Project Documention/                # Master Project Documentation
│   └── HotelPro_Project_Documentation .pdf        # Comprehensive project architecture & specification PDF
└── phase Wise Documentation/                      # Phase-Wise Project Lifecycle Documentation
    ├── Ideation Phase/                            # Brainstorming, Problem Statements & Empathy Maps
    ├── requirement analysis/                      # Data Flow Diagrams, Tech Stack & Solution Requirements
    ├── Project Design Phase/                      # Solution Architecture & Problem-Solution Fit
    ├── Project Planning/                          # Project Execution & Milestone Planning
    └── Performance Testing/                       # User Acceptance Testing (UAT) & Performance Reports
```

---

## 🚀 Quick Start (Running HotelPro)

To run the application locally:

```bash
# 1. Navigate into the application directory
cd HotelPro

# 2. Install all dependencies (root, server, and client)
npm run install:all

# 3. Configure environment variables
# Copy server/.env.example to server/.env and fill in your local or test credentials
cp server/.env.example server/.env

# 4. Start both server and client in development mode
npm run dev
```

* **Frontend Client:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

For detailed API documentation, security safeguards, environment configurations, and testing guides, please refer to [HotelPro/README.md](HotelPro/README.md).
