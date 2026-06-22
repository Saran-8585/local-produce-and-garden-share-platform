# Local Produce & Garden Share Platform

A community platform for neighbourhood-based produce and garden sharing, built with the MERN stack (MongoDB + Express + React + Node).

## Setup & Run

### Option 1: Docker (Recommended)

**Prerequisites:** Docker and Docker Compose

```bash
# Build and start all services
docker compose up -d

# Seed the database with sample data
docker compose exec app node backend/db/seed.js

# Open http://localhost:5000
```

### Option 2: Local Development

**Prerequisites:** Node.js 20+, MongoDB 7+

```bash
# 1. Install MongoDB and ensure it's running on localhost:27017

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Seed the database
npm run seed

# 4. Start development servers (backend + frontend with HMR)
npm run dev
```

## Test Credentials

After seeding, use any of these accounts:

| Email | Password |
|---|---|
| priya@garden.com | garden123 |
| arjun@garden.com | garden123 |
| lakshmi@garden.com | garden123 |
| ravi@garden.com | garden123 |

## Project Structure

```
├── backend/
│   ├── controllers/     # Express route handlers
│   ├── db/              # Database connection + seed
│   ├── middleware/       # JWT auth middleware
│   ├── models/          # Mongoose schemas
│   └── routes/          # Express routes
├── frontend/
│   └── src/             # React app
└── docker-compose.yml   # Docker services
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/listings | List all listings (with filters) |
| GET | /api/listings/:id | Get listing details |
| POST | /api/listings | Create listing |
| PUT | /api/listings/:id | Update listing |
| DELETE | /api/listings/:id | Delete listing |
| GET | /api/listings/user/:userId | Get user's listings |
| PATCH | /api/listings/:id/toggle | Toggle availability |
| POST | /api/requests | Create exchange request |
| GET | /api/requests/sent | Get sent requests |
| GET | /api/requests/received | Get received requests |
| PATCH | /api/requests/:id/accept | Accept request |
| PATCH | /api/requests/:id/decline | Decline request |
| PATCH | /api/requests/:id/complete | Complete request |
| PATCH | /api/requests/:id/cancel | Cancel request |
| POST | /api/reviews | Create review |
| GET | /api/reviews/user/:userId | Get user reviews |
| GET | /api/profile/:id | Get user profile |
| PUT | /api/profile | Update own profile |
| GET | /api/dashboard/stats | Get dashboard stats |
| GET | /api/dashboard/history | Get exchange history |
