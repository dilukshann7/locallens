# LocalLens

![Status](https://img.shields.io/badge/status-active%20development-0f766e)
![Next.js](https://img.shields.io/badge/Next.js-16.1.7-000000?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-06b6d4?logo=tailwindcss&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-c5f74f?logo=drizzle&logoColor=black)
![Better Auth](https://img.shields.io/badge/Better_Auth-Email%2FPassword-111827)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169e1?logo=postgresql&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?logo=leaflet&logoColor=white)

LocalLens is a location-focused trip planning app for the Beragala and Ella region of Sri Lanka. The codebase combines a public attraction explorer, an itinerary planner with guest and account persistence, and a protected admin dashboard for managing destination content.

## Overview

The current implementation includes:

- Public attraction explorer with category filtering, keyword search, map view, and detail sheets
- Leaflet-powered map experience with category-colored markers and attraction popups
- Day planner with add/remove, drag reorder, manual timing adjustments, notes, and trip metadata
- `localStorage` persistence for guests and database-backed trip persistence for signed-in users
- Better Auth email/password authentication with role-based admin access
- Admin CRUD for attractions, including image upload support via Vercel Blob
- Seed data for 5 categories and 10 regional attractions

## Tech Stack

- Framework: Next.js 16 App Router
- Language: TypeScript
- UI: Tailwind CSS 4, shadcn/ui, Lucide icons
- Data: PostgreSQL with Drizzle ORM and Neon serverless driver
- Authentication: Better Auth
- Maps: Leaflet + React Leaflet
- Object storage: Vercel Blob
- Tooling: ESLint, Prettier, TSX, Drizzle Kit

## Architecture

### Application layers

- Server-rendered routes fetch attraction and category data in App Router pages
- Client interactivity lives in focused components and hooks, especially [`hooks/use-day-planner.ts`](/D:/Programming/Nextjs/locallens/hooks/use-day-planner.ts)
- Database access is centralized in [`lib/db.ts`](/D:/Programming/Nextjs/locallens/lib/db.ts), [`lib/attractions.ts`](/D:/Programming/Nextjs/locallens/lib/attractions.ts), and [`lib/planner.ts`](/D:/Programming/Nextjs/locallens/lib/planner.ts)
- Auth/session helpers are kept in [`lib/auth.ts`](/D:/Programming/Nextjs/locallens/lib/auth.ts) and [`lib/auth/session.ts`](/D:/Programming/Nextjs/locallens/lib/auth/session.ts)

### Main directories

```text
app/
  admin/                  Admin UI, protected by role checks
  api/                    Route handlers for auth, planner, trips, uploads, CRUD
  attractions/[id]/       Public attraction detail page
  planner/                Full itinerary planning experience
  login/ signup/          Tourist authentication flows
  admin-signup/           First-admin bootstrap flow
components/
  admin/                  Admin forms and actions
  explorer/               Browse page cards, filters, map, search
  planner/                Planner UI, itinerary editor, planner map
  shared/                 Shared app-level UI such as theme handling
  ui/                     Base shadcn-style primitives
db/
  seed.ts                 Idempotent seed script for categories + attractions
drizzle/
  *.sql                   Generated SQL migrations and metadata snapshots
hooks/
  use-day-planner.ts      Guest/account planner state orchestration
lib/
  db/schema.ts            Drizzle schema
  planner-types.ts        Shared planner domain types
  blob.ts                 Vercel Blob helpers
```

## Local Development

### Prerequisites

- Node.js 20+
- npm
- A reachable PostgreSQL database
- A Better Auth secret and local auth base URL
- A Vercel Blob token if you want admin image upload to work

### Installation

```bash
npm install
```

Create a local `.env` file with the variables below.

### Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Drizzle and the seed script |
| `BETTER_AUTH_SECRET` | Yes | Better Auth signing secret |
| `BETTER_AUTH_URL` | Yes | Base URL for Better Auth, typically `http://localhost:3000` in local dev |
| `BLOB_READ_WRITE_TOKEN` | For admin uploads | Enables image upload and deletion through Vercel Blob |
| `ADMIN_SECRET` | For admin bootstrap | Shared secret used by `/admin-signup` to create the first admin |

### Run the app

```bash
npm run dev
```

The app starts on [http://localhost:3000](http://localhost:3000).

### Seed the database

```bash
npm run db:seed
```

The seed script in [`db/seed.ts`](/D:/Programming/Nextjs/locallens/db/seed.ts) is idempotent and upserts:

- 5 attraction categories
- 10 starter attractions around Beragala and Ella

### Bootstrap the first admin

1. Set `ADMIN_SECRET` in `.env`
2. Start the app locally
3. Open [http://localhost:3000/admin-signup](http://localhost:3000/admin-signup)
4. Create the initial admin account using the shared secret
5. Sign in at [http://localhost:3000/login](http://localhost:3000/login)
6. Manage content under [http://localhost:3000/admin](http://localhost:3000/admin)

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server with Turbopack |
| `npm run build` | Build the production app |
| `npm run start` | Run the production server |
| `npm test` | Run the lightweight automated test suite for validation and planner utilities |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript in no-emit mode |
| `npm run format` | Format `ts` and `tsx` files with Prettier |
| `npm run db:seed` | Seed categories and attractions |

## Route Map

### App routes

| Route | Purpose |
| --- | --- |
| `/` | Public attraction explorer with search, category filters, planner drawer, and map/grid switch |
| `/attractions/[id]` | Public attraction detail page |
| `/planner` | Full itinerary planner experience |
| `/login` | Tourist/admin login |
| `/signup` | Tourist account registration |
| `/admin-signup` | Admin bootstrap form guarded by `ADMIN_SECRET` |
| `/admin` | Admin dashboard landing page |
| `/admin/attractions` | Attraction management list |
| `/admin/attractions/new` | Create attraction form |
| `/admin/attractions/[id]` | Edit attraction form |

### API routes

| Route | Methods | Notes |
| --- | --- | --- |
| `/api/auth/[...all]` | `GET`, `POST` | Better Auth handler |
| `/api/admin-signup` | `POST` | Creates the first admin account using `ADMIN_SECRET` |
| `/api/check-admin` | `GET` | Returns current admin status |
| `/api/attractions` | `POST` | Admin-only attraction creation |
| `/api/attractions/[id]` | `GET`, `PUT`, `DELETE` | Attraction read/update/delete; writes are admin-only |
| `/api/blob` | `POST` | Admin-only image upload to Vercel Blob |
| `/api/planner` | `GET`, `PUT`, `DELETE` | Current signed-in user's working planner |
| `/api/trips` | `GET`, `POST` | List saved trips or create a new saved trip |
| `/api/trips/[id]` | `GET`, `PUT` | Read or update a specific saved trip |

## Planner Behavior

- Guests keep planner state in browser `localStorage`
- Signed-in users can save trips to PostgreSQL and reopen them later
- `useDayPlanner` handles local state, account synchronization, active trip selection, and autosave behavior
- Planner items support:
  - reorder by drag-and-drop or up/down controls
  - per-stop visit duration
  - per-leg transport mode and travel minutes
  - trip name, date, start point, end point, and notes

## Data Model

The main Drizzle schema lives in [`lib/db/schema.ts`](/D:/Programming/Nextjs/locallens/lib/db/schema.ts).

Core tables:

- Auth: `user`, `session`, `account`, `verification`
- Content: `category`, `attraction`
- Planning: `itinerary`, `itinerary_item`

Notable schema choices:

- `user.role` is a PostgreSQL enum with `admin` and `tourist`
- Attractions store geolocation, operational notes, popularity, and an image URL array
- Itineraries and itinerary items are normalized for multi-trip account persistence

## Operational Notes

- Admin protection is enforced in both route layout logic and API guards
- Attraction images are expected from Vercel Blob, with Next.js remote image support also configured for Unsplash
- SQL migrations are committed under [`drizzle/`](/D:/Programming/Nextjs/locallens/drizzle)
- A lightweight automated test suite is available via `npm test`; `npm run lint` and `npm run typecheck` remain useful baseline verification steps

## Scope

Included in this project:

- Attraction discovery
- Day-trip planning
- Account-based trip persistence
- Admin content management

Explicitly out of scope:

- Hotel reservations
- Transport booking
- Ticket purchases
- Payment processing
