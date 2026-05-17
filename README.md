# Local Produce & Garden Share Platform

A community platform where home gardeners can list surplus fruits, vegetables, herbs, and plants for free or swap with neighbours in Bangalore.

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS + Leaflet
- **Backend**: Node.js + Express + SQLite (better-sqlite3)
- **Auth**: JWT (JSON Web Tokens)
- **Maps**: Leaflet.js + React Leaflet (free, no API key)

## Project Structure

```
├── backend/           # Express API server
│   ├── controllers/   # Route handlers
│   ├── routes/        # API routes
│   ├── middleware/     # JWT auth middleware
│   ├── db/            # Database + seed script
│   └── index.js       # Entry point
├── frontend/          # React + Vite app
│   └── src/
│       ├── components/ # Shared UI components
│       ├── pages/      # Page components
│       ├── context/    # Auth context
│       ├── hooks/      # Custom hooks
│       └── utils/      # Axios instance & helpers
├── data/              # Reserved directory
└── package.json       # Root scripts
```

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Seed the database

```bash
npm run seed
```

### 3. Start development servers

```bash
npm run dev
```

This starts both:
- Backend API on `http://localhost:5000`
- Frontend dev server on `http://localhost:5173`

### 4. Open the app

Navigate to **http://localhost:5173** in your browser.

## Test Credentials

| Email | Password |
|---|---|
| priya@garden.com | garden123 |
| arjun@garden.com | garden123 |

Additional users: lakshmi, ravi, ananya, vikram, meera, suresh, divya, karthik, pooja, rajeshwari (all @garden.com / garden123)

## Seed Data

- 12 users (Indian names, Bangalore neighbourhoods)
- 35 produce/plant listings across all categories
- 20 exchange requests in various statuses
- 10 completed reviews

## Features

- Browse produce listings with filters (category, exchange type, neighbourhood, availability)
- Search listings with debounced input
- Map view with colour-coded markers
- User registration & JWT-based login
- Create/edit/delete listings with location picker
- Request produce (Free / Swap / Both exchange types)
- Manage sent and received exchange requests
- Accept, decline, cancel, and complete exchanges
- Leave reviews after completed exchanges
- Personal garden dashboard with stats
- Grower profiles with ratings and reviews
- Seasonal availability calendar (Bangalore region)
- Responsive design (desktop + tablet)

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get current user |
| GET | /api/listings | No | List all listings (with filters) |
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
| GET | /api/reviews/user/:userId | No | Get user's reviews |
| GET | /api/profile/:id | No | Get public profile |
| PUT | /api/profile | Yes | Update own profile |
| GET | /api/dashboard/stats | Yes | Get dashboard stats |
| GET | /api/dashboard/history | Yes | Get exchange history |
