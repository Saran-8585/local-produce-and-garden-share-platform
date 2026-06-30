# Local Produce & Garden Share Platform

A community platform where home gardeners can list surplus fruits, vegetables, herbs, and plants for free or swap with neighbours in Bangalore.

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Backend**: Node.js + Express + SQLite (better-sqlite3)
- **Auth**: JWT (JSON Web Tokens)
- **Icons**: Lucide React

## Features

- Browse produce listings with filters (category, exchange type, neighbourhood, availability)
- Search listings with debounced input
- User registration & JWT-based login
- Create/edit/delete listings with neighbourhood location
- Request produce (Free / Swap / Both exchange types)
- Manage sent and received exchange requests
- Accept, decline, cancel, and complete exchanges
- Leave reviews after completed exchanges
- Personal garden dashboard with stats
- Grower profiles with ratings and reviews
- Seasonal availability calendar (Bangalore region)
- Responsive design (desktop + tablet)

## Setup

**Prerequisites:** Node.js 20+

```bash
# 1. Install dependencies
npm run install:all

# 2. Seed the database
npm run seed

# 3. Start development servers (backend + frontend with HMR)
npm run dev
```

> No external database required — SQLite is embedded.

The backend API runs on `http://localhost:5000` and the frontend dev server on `http://localhost:5173`. Open `http://localhost:5173` in your browser. The Vite dev server proxies `/api/*` requests to the backend.

## Project Structure

```
├── backend/
│   ├── controllers/     # Express route handlers
│   ├── data/            # SQLite database file (auto-created)
│   ├── db/              # Database connection + seed script
│   ├── middleware/       # JWT auth middleware
│   ├── models/          # SQLite query modules (User, Listing, ExchangeRequest, Review)
│   ├── routes/          # Express route definitions
│   ├── .env             # Environment variables
│   └── index.js         # Express entry point
├── frontend/
│   └── src/
│       ├── components/  # Shared UI components (ListingCard, Navbar, etc.)
│       ├── pages/       # Page components (Browse, ListingDetail, Login, etc.)
│       ├── context/     # Auth context provider
│       ├── hooks/       # Custom hooks (useAuth)
│       └── utils/       # Axios config, helper functions
└── package.json         # Root scripts (dev, seed, install)
```

## Environment Variables

Backend environment variables are in `backend/.env`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend server port |
| `JWT_SECRET` | *(required)* | Secret key for JWT signing |
| `SQLITE_PATH` | `./data/database.sqlite` | SQLite database file path |

## Test Credentials

After seeding, use any of these accounts:

| Email | Password |
|---|---|
| priya@garden.com | garden123 |
| arjun@garden.com | garden123 |
| lakshmi@garden.com | garden123 |
| ravi@garden.com | garden123 |

Additional users: ananya, vikram, meera, suresh, divya, karthik, pooja, rajeshwari (all @garden.com / garden123)

## Seed Data

- 30 users across Bangalore neighbourhoods
- 60 produce/plant listings across all categories
- 40 exchange requests in various statuses
- 40 completed reviews

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/listings | No | List listings (with filters) |
| GET | /api/listings/:id | No | Get listing details |
| POST | /api/listings | Yes | Create listing |
| PUT | /api/listings/:id | Yes | Update listing |
| DELETE | /api/listings/:id | Yes | Delete listing |
| GET | /api/listings/user/:userId | No | Get user's listings |
| PATCH | /api/listings/:id/status | Yes | Toggle availability |
| POST | /api/requests | Yes | Create exchange request |
| GET | /api/requests/sent | Yes | Get sent requests |
| GET | /api/requests/received | Yes | Get received requests |
| PATCH | /api/requests/:id/accept | Yes | Accept request |
| PATCH | /api/requests/:id/decline | Yes | Decline request |
| PATCH | /api/requests/:id/complete | Yes | Complete request |
| PATCH | /api/requests/:id/cancel | Yes | Cancel request |
| POST | /api/reviews | Yes | Create review |
| GET | /api/reviews/user/:userId | No | Get user reviews |
| GET | /api/profile/:id | No | Get public profile |
| PUT | /api/profile | Yes | Update own profile |
| GET | /api/dashboard/stats | Yes | Get dashboard stats |
| GET | /api/dashboard/history | Yes | Get exchange history |
